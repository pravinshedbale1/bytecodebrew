import { useEffect, useState } from 'react';
import { loadFirebase } from './firebase';

/**
 * Whether new purchases are open: settings/sales { open, message } in Firestore, switched on /admin.
 * Missing document = open. The payments Worker refuses new orders while it's closed, so this is the
 * page's view of a rule enforced on the server.
 */
export const DEFAULT_PAUSE_MESSAGE = 'New subscriptions are temporarily paused. If you already have Premium, nothing changes for you. Please check back soon.';

export function useSales() {
  const [sales, setSales] = useState({ loading: true, open: true, message: '' });
  useEffect(() => {
    let stop = () => {};
    let alive = true;
    loadFirebase().then((fb) => {
      if (!fb || !alive) { setSales({ loading: false, open: true, message: '' }); return; }
      stop = fb.fsMod.onSnapshot(
        fb.fsMod.doc(fb.db, 'settings', 'sales'),
        (snap) => {
          const d = snap.exists() ? snap.data() : {};
          setSales({ loading: false, open: d.open !== false, message: (d.message ?? '').trim(), updatedAt: d.updatedAt?.toDate?.() ?? null, updatedBy: d.updatedBy ?? null });
        },
        () => setSales({ loading: false, open: true, message: '' }),     // can't tell: the server still decides
      );
    });
    return () => { alive = false; stop(); };
  }, []);
  return sales;
}

/** Open or pause new purchases (admin only; the Firestore rules check). */
export async function setSales({ open, message }, by) {
  const fb = await loadFirebase();
  await fb.fsMod.setDoc(fb.fsMod.doc(fb.db, 'settings', 'sales'), {
    open: Boolean(open),
    message: (message ?? '').trim().slice(0, 300),
    updatedAt: fb.fsMod.serverTimestamp(),
    updatedBy: by ?? '',
  });
}
