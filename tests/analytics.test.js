import assert from 'node:assert/strict';
import test from 'node:test';
import adminHandler from '../api/admin.js';
import analyticsHandler from '../api/analytics.js';
import { buildAnalyticsReport, createAnalyticsWindow } from '../lib/analytics.js';

function createResponse() {
  return {
    statusCode: 0,
    headers: {},
    status(statusCode) { this.statusCode = statusCode; return this; },
    setHeader(name, value) { this.headers[name] = value; },
    json(body) { this.body = body; return this; }
  };
}

test('creates consecutive reporting periods in Jakarta time', () => {
  const range = createAnalyticsWindow(7, new Date('2026-11-23T02:30:00.000Z'));

  assert.deepEqual(
    [range.from, range.to, range.previous_from, range.previous_to, range.query_from, range.query_to],
    ['2026-11-17', '2026-11-23', '2026-11-10', '2026-11-16', '2026-11-09T17:00:00.000Z', '2026-11-23T17:00:00.000Z']
  );
});

test('aggregates views, unique visitors, registrations and breakdowns by period', () => {
  const range = createAnalyticsWindow(7, new Date('2026-11-23T02:30:00.000Z'));
  const events = [
    { created_at: '2026-11-17T18:30:00.000Z', visitor_id: 'visitor-a', session_id: 'session-a', path: '/', referrer_host: 'direct', device: 'mobile' },
    { created_at: '2026-11-17T21:30:00.000Z', visitor_id: 'visitor-a', session_id: 'session-a', path: '/pendaftaran', referrer_host: 'direct', device: 'mobile' },
    { created_at: '2026-11-22T08:00:00.000Z', visitor_id: 'visitor-b', session_id: 'session-b', path: '/', referrer_host: 'google.com', device: 'desktop' },
    { created_at: '2026-11-10T18:00:00.000Z', visitor_id: 'visitor-old', session_id: 'session-old', path: '/', referrer_host: 'direct', device: 'tablet' },
    { created_at: '2026-11-01T12:00:00.000Z', visitor_id: 'visitor-ancient', session_id: 'session-ancient', path: '/', referrer_host: 'direct', device: 'desktop' }
  ];
  const registrants = [
    { created_at: '2026-11-21T06:00:00.000Z' },
    { created_at: '2026-11-12T06:00:00.000Z' },
    { created_at: '2026-11-01T12:00:00.000Z' }
  ];

  const report = buildAnalyticsReport(events, registrants, range);

  assert.deepEqual(report.summary, {
    page_views: 3,
    unique_visitors: 2,
    sessions: 2,
    registrations: 1,
    registration_rate: 50,
    pages_per_session: 1.5
  });
  assert.equal(report.previous.page_views, 1);
  assert.equal(report.previous.registrations, 1);
  assert.equal(report.daily.length, 7);
  assert.equal(report.daily.reduce((sum, day) => sum + day.page_views, 0), 3);
  assert.deepEqual(report.top_pages.map(({ path, page_views }) => [path, page_views]), [['/', 2], ['/pendaftaran', 1]]);
  assert.deepEqual(report.top_sources.map(({ source, page_views }) => [source, page_views]), [['direct', 2], ['google.com', 1]]);
  assert.equal(report.devices.find(({ device }) => device === 'mobile').page_views, 2);
  assert.equal(report.hours[1].page_views, 1);
  assert.equal(report.hours[4].page_views, 1);
  assert.equal(report.hours[15].page_views, 1);
});

test('rejects disallowed public paths and protects analytics reports behind admin auth', async () => {
  const trackingResponse = createResponse();
  await analyticsHandler({
    method: 'POST',
    body: {
      visitor_id: 'visitor-id-1234567890',
      session_id: 'session-id-1234567890',
      path: '/admin',
      referrer_host: 'direct',
      device: 'mobile'
    }
  }, trackingResponse);
  assert.equal(trackingResponse.statusCode, 422);

  const adminResponse = createResponse();
  await adminHandler({ method: 'GET', query: { action: 'analytics' }, headers: {} }, adminResponse);
  assert.equal(adminResponse.statusCode, 401);
});
