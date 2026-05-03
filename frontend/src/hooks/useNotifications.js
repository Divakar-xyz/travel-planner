import { useState, useCallback } from 'react';

let notifId = 0;
let globalDispatch = null;

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);

  globalDispatch = useCallback((notif) => {
    const id = ++notifId;
    const newNotif = { id, ...notif };
    setNotifications(prev => [...prev, newNotif]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, notif.duration || 4000);
  }, []);

  const dismiss = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  return { notifications, dismiss, notify: globalDispatch };
};

export const notify = (notif) => {
  if (globalDispatch) globalDispatch(notif);
};
