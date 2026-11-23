import { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '../api.js';
import AdminLogin from '../components/admin/AdminLogin.jsx';
import AdminHeader from '../components/admin/AdminHeader.jsx';
import StatCards from '../components/admin/StatCards.jsx';
import RegistrationControl from '../components/admin/RegistrationControl.jsx';
import ReportPanel from '../components/admin/ReportPanel.jsx';
import StatusTabs from '../components/admin/StatusTabs.jsx';
import ArchiveHint from '../components/admin/ArchiveHint.jsx';
import RegistrationTable from '../components/admin/RegistrationTable.jsx';

const DEFAULT_RULES = { failed: 12, paid: 720, default: 24, pendingExpire: 24 };

// Halaman admin: data dan login
export default function Admin() {
  const [token, setToken] = useState(() => localStorage.getItem('admin_token'));
  const [tab, setTab] = useState('paid');
  const [all, setAll] = useState([]);
  const [rules, setRules] = useState(DEFAULT_RULES);
  const [settings, setSettings] = useState(null);
  const [error, setError] = useState('');

  const logout = useCallback(() => {
    localStorage.removeItem('admin_token');
    setToken(null);
  }, []);

  const load = useCallback(async () => {
    try {
      setError('');
      const data = await api('/admin/registrations', { token });
      setAll(data.rows);
      setRules(data.rules);
      setSettings(data.settings);
    } catch (e) {
      if (e.status === 401) logout();
      else setError(e.message);
    }
  }, [token, logout]);

  useEffect(() => { if (token) load(); }, [token, load]);

  // Muat ulang tiap 5 menit
  useEffect(() => {
    if (!token) return;
    const t = setInterval(load, 5 * 60 * 1000);
    return () => clearInterval(t);
  }, [token, load]);

  const active = useMemo(() => all.filter((r) => !r.archived_at), [all]);
  const archived = useMemo(() => all.filter((r) => r.archived_at), [all]);

  const rows = useMemo(() => {
    if (tab === 'archive') return archived;
    return tab ? active.filter((r) => r.status === tab) : active;
  }, [tab, active, archived]);

  const counts = useMemo(() => ({
    paid: active.filter((r) => r.status === 'paid').length,
    pending: active.filter((r) => r.status === 'pending').length,
    failed: active.filter((r) => r.status === 'failed').length,
    '': active.length,
    archive: archived.length,
  }), [active, archived]);

  // Ringkasan dari semua data, termasuk arsip
  const stats = useMemo(() => {
    const paid = all.filter((r) => r.status === 'paid');
    return {
      total: all.length,
      paid: paid.length,
      todo: active.filter((r) => r.status === 'paid' && !r.contacted).length,
      revenue: paid.reduce((s, r) => s + r.amount, 0),
    };
  }, [all, active]);

  async function act(fn) {
    try {
      setError('');
      await fn();
      await load();
    } catch (e) {
      setError(e.message);
    }
  }

  const markContacted = (r) =>
    api(`/admin/registrations/${r.id}/contacted`, { method: 'PATCH', token }).then(() =>
      setAll((rs) => rs.map((x) => (x.id === r.id ? { ...x, contacted: 1 } : x)))
    );
  const archive = (r) => act(() => api(`/admin/registrations/${r.id}/archive`, { method: 'PATCH', token }));
  const restore = (r) => act(() => api(`/admin/registrations/${r.id}/restore`, { method: 'PATCH', token }));
  const remove = (r) => act(() => api(`/admin/registrations/${r.id}`, { method: 'DELETE', token }));
  const saveSettings = (patch) => act(() => api('/admin/settings', { method: 'PATCH', body: patch, token }));

  if (!token) return <AdminLogin onLogin={setToken} />;

  return (
    <div className="min-h-screen">
      <AdminHeader onRefresh={load} onLogout={logout} />
      <div className="mx-auto -mt-14 max-w-6xl px-5 pb-12">
        <StatCards stats={stats} />
        {settings && <RegistrationControl settings={settings} onChange={saveSettings} />}
        <ReportPanel token={token} onUnauthorized={logout} />
        <StatusTabs value={tab} onChange={setTab} counts={counts} />
        <ArchiveHint archiveView={tab === 'archive'} rules={rules} />
        {error && <p role="alert" className="mt-4 text-red-700">{error}</p>}
        <RegistrationTable
          rows={rows}
          archived={tab === 'archive'}
          rules={rules}
          programs={settings?.programs}
          onContacted={markContacted}
          onArchive={archive}
          onRestore={restore}
          onDelete={remove}
        />
      </div>
    </div>
  );
}
