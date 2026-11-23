import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

const fallbackIds = new Map();

function createId() {
  return globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function getStoredId(storageName, key) {
  try {
    const storage = window[storageName];
    let value = storage.getItem(key);
    if (!value) {
      value = createId();
      storage.setItem(key, value);
    }
    return value;
  } catch (error) {
    console.warn('Penyimpanan ID analitik tidak tersedia:', error.message);
    if (!fallbackIds.has(key)) fallbackIds.set(key, createId());
    return fallbackIds.get(key);
  }
}

function publicPath(pathname) {
  if (pathname === '/' || pathname === '/pendaftaran') return pathname;
  if (/^\/peserta\/[^/]+$/.test(pathname)) return '/peserta';
  return null;
}

function referrerHost() {
  if (!document.referrer) return 'direct';
  try {
    const referrer = new URL(document.referrer);
    return referrer.origin === window.location.origin ? 'internal' : referrer.hostname;
  } catch {
    return 'direct';
  }
}

function deviceType() {
  const userAgent = navigator.userAgent;
  if (/ipad|tablet|playbook|silk/i.test(userAgent)) return 'tablet';
  if (/mobile|iphone|ipod|android/i.test(userAgent)) return 'mobile';
  return 'desktop';
}

export default function AnalyticsTracker() {
  const location = useLocation();
  const lastTrackedLocation = useRef('');

  useEffect(() => {
    const path = publicPath(location.pathname);
    if (!path) return;
    const key = `${location.key}:${path}`;
    if (lastTrackedLocation.current === key) return;
    const isNavigation = Boolean(lastTrackedLocation.current);
    lastTrackedLocation.current = key;

    const event = {
      visitor_id: getStoredId('localStorage', 'lpk_site_visitor_id'),
      session_id: getStoredId('sessionStorage', 'lpk_site_session_id'),
      path,
      referrer_host: isNavigation ? 'internal' : referrerHost(),
      device: deviceType()
    };

    fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
      keepalive: true
    }).then((response) => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
    }).catch((error) => {
      console.error('Mencatat kunjungan website gagal:', error.message);
    });
  }, [location.key, location.pathname]);

  return null;
}
