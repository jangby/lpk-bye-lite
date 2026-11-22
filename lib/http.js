export function send(res, status, body) {
  return res.status(status).json(body);
}

export function methodNotAllowed(res) {
  res.setHeader('Allow', 'GET, POST, PATCH');
  return send(res, 405, { success: false, message: 'Metode permintaan tidak didukung.' });
}
