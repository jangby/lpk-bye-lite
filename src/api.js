async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(path, {
      ...options,
      headers: { ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...options.headers }
    });
  } catch {
    throw new Error('Server tidak dapat dijangkau. Coba lagi beberapa saat.');
  }
  const data = await response.json().catch(() => null);
  if (response.status === 401 && path.startsWith('/api/admin?') && !path.includes('action=login')) {
    localStorage.removeItem('lpk_admin_token');
    localStorage.removeItem('lpk_lite_admin_token');
    if (window.location.pathname.startsWith('/admin') && window.location.pathname !== '/admin/login') {
      window.location.assign('/admin/login');
    }
  }
  if (!response.ok || data?.success === false) {
    throw new Error(data?.message || 'Permintaan gagal.');
  }
  return data;
}

export const getBatches = () => request('/api/public');
export const register = (values) => request('/api/public', { method: 'POST', body: JSON.stringify(values) });
export const getPortal = (token) => request(`/api/public?token=${encodeURIComponent(token)}`);
export const getContent = () => request('/api/public?action=content');
export function publicApi(path) {
  if (path === '/batch-active') return getBatches();
  if (path === '/site-content') return getContent();
  const portal = path.match(/^\/portal\/([^/]+)$/);
  if (portal) return getPortal(decodeURIComponent(portal[1]));
  throw new Error('Endpoint publik tidak dikenali.');
}
export const submitPayment = (values) => request('/api/public?action=payment', { method: 'POST', body: JSON.stringify(values) });

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Berkas gagal dibaca.'));
    reader.readAsDataURL(file);
  });
}

export async function registerParticipant(formData) {
  if (!(formData instanceof FormData)) {
    return register(formData);
  }
  const answers = JSON.parse(String(formData.get('answers') || '{}'));
  const values = {
    batch_id: String(formData.get('batch_id') || ''),
    full_name: String(formData.get('full_name') || ''),
    whatsapp: String(formData.get('whatsapp') || ''),
    email: String(formData.get('email') || ''),
    answers
  };
  for (const [fieldName, file] of formData.entries()) {
    if (!(file instanceof File) || !file.name) continue;
    if (file.size > 2.5 * 1024 * 1024) {
      throw new Error('Ukuran berkas maksimal 2,5 MB.');
    }
    values.answers[fieldName] = {
      name: file.name,
      mimeType: file.type || 'application/octet-stream',
      base64: await fileToBase64(file)
    };
  }
  return register(values);
}
export const login = (values) => request('/api/admin?action=login', { method: 'POST', body: JSON.stringify(values) });

export function adminRequest(action, options = {}) {
  const { query = {}, ...fetchOptions } = options;
  const params = new URLSearchParams({ action });
  Object.entries(query).forEach(([key, value]) => {
    if (value !== '' && value != null) params.set(key, String(value));
  });
  const token = localStorage.getItem('lpk_lite_admin_token');
  return request(`/api/admin?${params.toString()}`, {
    ...fetchOptions,
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers }
  });
}

function adminToken() {
  return localStorage.getItem('lpk_admin_token') || localStorage.getItem('lpk_lite_admin_token');
}

function adminAction(action, options = {}) {
  const { query = {}, ...fetchOptions } = options;
  const params = new URLSearchParams({ action });
  Object.entries(query).forEach(([key, value]) => {
    if (value !== '' && value != null) params.set(key, String(value));
  });
  const token = adminToken();
  return request(`/api/admin?${params.toString()}`, {
    ...fetchOptions,
    headers: {
      ...(fetchOptions.body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    }
  });
}

async function formDataValues(formData) {
  const values = {};
  for (const [key, value] of formData.entries()) {
    if (value instanceof File) {
      if (!value.name) continue;
      if (value.size > 2.5 * 1024 * 1024) throw new Error('Ukuran berkas maksimal 2,5 MB.');
      values[key === 'image' || key === 'logo' ? 'image_file' : key] = {
        name: value.name,
        mimeType: value.type || 'application/octet-stream',
        base64: await fileToBase64(value)
      };
    } else {
      values[key] = value;
    }
  }
  return values;
}

async function bodyValues(body) {
  if (body instanceof FormData) return formDataValues(body);
  if (typeof body === 'string') return body ? JSON.parse(body) : {};
  return body || {};
}

function newFieldId() {
  return globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

async function saveBatchFields(batchId, fields) {
  const result = await adminAction('batches');
  const batch = result.data.find((item) => String(item.id) === String(batchId));
  if (!batch) throw new Error('Gelombang tidak ditemukan.');
  return adminAction('batch', {
    method: 'PATCH',
    body: JSON.stringify({ ...batch, fields })
  });
}

async function contentRequest(path, method, body, query) {
  const match = path.match(/^\/(landing-slides|landing-gallery|landing-faqs)(?:\/([^/]+))?$/);
  const type = path === '/site-content/logo' ? 'logo'
    : match?.[1] === 'landing-slides' ? 'slide'
      : match?.[1] === 'landing-gallery' ? 'gallery'
        : match?.[1] === 'landing-faqs' ? 'faq'
          : null;
  const id = match?.[2];
  if (!type) throw new Error('Endpoint konten tidak dikenali.');

  if (method === 'DELETE') {
    let contentId = id || query.get('id');
    if (type === 'logo' && !contentId) {
      const current = await adminAction('content');
      contentId = current.data.logo?.[0]?.id;
    }
    if (!contentId) return { success: true };
    return adminAction('content', { method: 'DELETE', query: { id: contentId } });
  }

  const values = await bodyValues(body);
  if (type === 'faq') {
    values.title = values.title ?? values.question ?? '';
    values.caption = values.caption ?? values.answer ?? '';
  }
  values.type = type;
  values.is_active = values.is_active === undefined ? true : values.is_active === true || values.is_active === 'true';
  if (method === 'PUT') method = 'POST';
  if (method === 'PATCH') values.id = id;
  return adminAction('content', { method, body: JSON.stringify(values) });
}

export async function adminApi(path, options = {}) {
  const url = new URL(path, window.location.origin);
  const method = String(options.method || 'GET').toUpperCase();
  const pathname = url.pathname;
  const body = await bodyValues(options.body);
  const batchRegistrants = pathname.match(/^\/batches\/([^/]+)\/registrants$/);
  const batchFields = pathname.match(/^\/batches\/([^/]+)\/fields$/);
  const fieldDelete = pathname.match(/^\/fields\/([^/]+)$/);
  const batch = pathname.match(/^\/batches\/([^/]+)$/);
  const registrantStatus = pathname.match(/^\/registrants\/([^/]+)\/status$/);
  const registrantNotify = pathname.match(/^\/registrants\/([^/]+)\/notify$/);
  const paymentReview = pathname.match(/^\/payments\/([^/]+)\/review$/);
  const paymentNotify = pathname.match(/^\/payments\/([^/]+)\/notify$/);

  if (pathname === '/auth/login') {
    return adminAction('login', { method, body: JSON.stringify(body) });
  }
  if (pathname === '/dashboard') return adminAction('dashboard');
  if (pathname === '/batches') {
    if (method === 'GET') return adminAction('batches');
    return adminAction('batch', { method, body: JSON.stringify(body) });
  }
  if (batch) {
    if (method === 'DELETE') return adminAction('batch', { method, query: { id: batch[1] } });
    return adminAction('batch', { method, body: JSON.stringify({ ...body, id: batch[1] }) });
  }
  if (batchRegistrants && method === 'GET') {
    const result = await adminAction('registrants');
    return { ...result, data: result.data.filter((item) => String(item.batch_id) === batchRegistrants[1]) };
  }
  if (batchFields) {
    if (method === 'GET') {
      const result = await adminAction('batches');
      const selected = result.data.find((item) => String(item.id) === batchFields[1]);
      return { success: true, data: (selected?.fields || []).map((field, index) => ({
        ...field,
        id: field.id ?? field.field_name,
        order_index: Number(field.order_index ?? index + 1)
      })) };
    }
    if (method === 'POST') {
      const result = await adminAction('batches');
      const selected = result.data.find((item) => String(item.id) === batchFields[1]);
      if (!selected) throw new Error('Gelombang tidak ditemukan.');
      const fields = [...(selected.fields || []), { ...body, id: newFieldId(), order_index: Number(body.order_index || 0) }];
      return saveBatchFields(batchFields[1], fields);
    }
  }
  if (fieldDelete && method === 'DELETE') {
    const result = await adminAction('batches');
    const owner = result.data.find((item) => (item.fields || []).some((field) => String(field.id ?? field.field_name) === fieldDelete[1]));
    if (!owner) throw new Error('Field formulir tidak ditemukan.');
    const fields = owner.fields.filter((field) => String(field.id ?? field.field_name) !== fieldDelete[1]);
    return saveBatchFields(owner.id, fields);
  }
  if (registrantStatus) return adminAction('status', { method, body: JSON.stringify({ ...body, id: registrantStatus[1] }) });
  if (registrantNotify) return adminAction('notify', { method, body: JSON.stringify({ ...body, id: registrantNotify[1] }) });
  if (pathname === '/payments') return adminAction('payments', { query: Object.fromEntries(url.searchParams.entries()) });
  if (paymentReview) return adminAction('payment', { method, body: JSON.stringify({ ...body, id: paymentReview[1] }) });
  if (paymentNotify) return adminAction('payment-notify', { method, body: JSON.stringify({ id: paymentNotify[1] }) });
  if (pathname === '/fonnte/status') return adminAction('fonnte-status');
  if (pathname === '/site-content') {
    const result = await adminAction('content');
    const normalizeItems = (items = []) => items.map((item) => ({
      ...item,
      is_active: ['true', '1'].includes(String(item.is_active).toLowerCase()),
      sort_order: Number(item.sort_order || 0)
    }));
    return {
      ...result,
      data: {
        ...result.data,
        logo: normalizeItems(result.data.logo),
        slides: normalizeItems(result.data.slides),
        gallery: normalizeItems(result.data.gallery),
        faqs: normalizeItems(result.data.faqs)
      }
    };
  }
  if (pathname === '/site-content/logo' || pathname.startsWith('/landing-slides')
    || pathname.startsWith('/landing-gallery') || pathname.startsWith('/landing-faqs')) {
    return contentRequest(pathname, method, body, url.searchParams);
  }
  throw new Error(`Endpoint admin tidak dikenali: ${pathname}`);
}

export const loginAdmin = (email, password) => adminApi('/auth/login', {
  method: 'POST',
  body: JSON.stringify({ email, password })
});
