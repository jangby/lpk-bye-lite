const TIME_ZONE = 'Asia/Jakarta';
const dateFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit'
});
const hourFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: TIME_ZONE,
  hour: '2-digit',
  hourCycle: 'h23'
});

function dateKey(value) {
  const date = value instanceof Date ? value : new Date(value);
  if (!Number.isFinite(date.getTime())) return '';
  const parts = Object.fromEntries(dateFormatter.formatToParts(date).map(({ type, value: part }) => [type, part]));
  return `${parts.year}-${parts.month}-${parts.day}`;
}

function addDays(value, days) {
  const date = new Date(`${value}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function jakartaMidnight(value) {
  return new Date(`${value}T00:00:00+07:00`).toISOString();
}

function eventDate(event) {
  return dateKey(event.created_at);
}

function countDistinct(events, field) {
  return new Set(events.map((event) => event[field]).filter(Boolean)).size;
}

function summarize(events, registrations) {
  const visitors = countDistinct(events, 'visitor_id');
  const sessions = countDistinct(events, 'session_id');
  return {
    page_views: events.length,
    unique_visitors: visitors,
    sessions,
    registrations,
    registration_rate: visitors ? Math.round((registrations / visitors) * 1000) / 10 : 0,
    pages_per_session: sessions ? Math.round((events.length / sessions) * 10) / 10 : 0
  };
}

export function createAnalyticsWindow(days = 30, now = new Date()) {
  const selectedDays = [7, 30, 90].includes(Number(days)) ? Number(days) : 30;
  const to = dateKey(now);
  const from = addDays(to, 1 - selectedDays);
  const previousFrom = addDays(from, -selectedDays);
  const previousTo = addDays(from, -1);
  const queryTo = addDays(to, 1);
  return {
    days: selectedDays,
    from,
    to,
    previous_from: previousFrom,
    previous_to: previousTo,
    query_from: jakartaMidnight(previousFrom),
    query_to: jakartaMidnight(queryTo)
  };
}

export function buildAnalyticsReport(events, registrants, range) {
  const validEvents = events.filter((event) => eventDate(event));
  const currentEvents = validEvents.filter((event) => {
    const date = eventDate(event);
    return date >= range.from && date <= range.to;
  });
  const previousEvents = validEvents.filter((event) => {
    const date = eventDate(event);
    return date >= range.previous_from && date <= range.previous_to;
  });
  const currentRegistrations = registrants.filter((registrant) => {
    const date = eventDate(registrant);
    return date >= range.from && date <= range.to;
  }).length;
  const previousRegistrations = registrants.filter((registrant) => {
    const date = eventDate(registrant);
    return date >= range.previous_from && date <= range.previous_to;
  }).length;
  const dailyMap = new Map();
  for (let index = 0; index < range.days; index += 1) {
    dailyMap.set(addDays(range.from, index), { date: addDays(range.from, index), page_views: 0, visitorIds: new Set(), sessionIds: new Set() });
  }

  const pageMap = new Map();
  const sourceMap = new Map();
  const deviceMap = new Map();
  const hours = Array.from({ length: 24 }, (_, hour) => ({ hour, page_views: 0 }));
  for (const event of currentEvents) {
    const day = dailyMap.get(eventDate(event));
    if (day) {
      day.page_views += 1;
      if (event.visitor_id) day.visitorIds.add(event.visitor_id);
      if (event.session_id) day.sessionIds.add(event.session_id);
    }

    const page = pageMap.get(event.path) || { path: event.path, page_views: 0, visitorIds: new Set() };
    page.page_views += 1;
    if (event.visitor_id) page.visitorIds.add(event.visitor_id);
    pageMap.set(event.path, page);

    const source = event.referrer_host || 'direct';
    const sourceRow = sourceMap.get(source) || { source, page_views: 0, sessionIds: new Set() };
    sourceRow.page_views += 1;
    if (event.session_id) sourceRow.sessionIds.add(event.session_id);
    sourceMap.set(source, sourceRow);

    const device = ['mobile', 'tablet', 'desktop'].includes(event.device) ? event.device : 'unknown';
    const deviceRow = deviceMap.get(device) || { device, page_views: 0, visitorIds: new Set() };
    deviceRow.page_views += 1;
    if (event.visitor_id) deviceRow.visitorIds.add(event.visitor_id);
    deviceMap.set(device, deviceRow);

    const date = new Date(event.created_at);
    const hour = Number(hourFormatter.format(date));
    if (Number.isInteger(hour) && hour >= 0 && hour < hours.length) hours[hour].page_views += 1;
  }

  const daily = [...dailyMap.values()].map((day) => ({
    date: day.date,
    page_views: day.page_views,
    visitors: day.visitorIds.size,
    sessions: day.sessionIds.size
  }));
  const summary = summarize(currentEvents, currentRegistrations);
  const previous = summarize(previousEvents, previousRegistrations);
  const busiestDay = daily.reduce((best, day) => day.page_views > best.page_views ? day : best, daily[0] || null);
  const busiestHour = hours.reduce((best, hour) => hour.page_views > best.page_views ? hour : best, hours[0]);

  return {
    period: { days: range.days, from: range.from, to: range.to },
    summary,
    previous,
    daily,
    top_pages: [...pageMap.values()]
      .map((page) => ({ path: page.path, page_views: page.page_views, visitors: page.visitorIds.size }))
      .sort((a, b) => b.page_views - a.page_views)
      .slice(0, 8),
    top_sources: [...sourceMap.values()]
      .map((source) => ({ source: source.source, page_views: source.page_views, sessions: source.sessionIds.size }))
      .sort((a, b) => b.page_views - a.page_views)
      .slice(0, 8),
    devices: [...deviceMap.values()]
      .map((device) => ({ device: device.device, page_views: device.page_views, visitors: device.visitorIds.size }))
      .sort((a, b) => b.page_views - a.page_views),
    hours,
    insights: {
      busiest_day: busiestDay ? { date: busiestDay.date, page_views: busiestDay.page_views } : null,
      busiest_hour: { hour: busiestHour.hour, page_views: busiestHour.page_views }
    }
  };
}
