const NOTIFICATIONS_KEY = 'peoplecore_notifications';

export function getNotifications(userId) {
  if (!userId) return [];
  const allNotifs = JSON.parse(localStorage.getItem(NOTIFICATIONS_KEY) || '{}');
  return allNotifs[userId] || [];
}

export function addNotification(userId, notification) {
  if (!userId) return;
  const allNotifs = JSON.parse(localStorage.getItem(NOTIFICATIONS_KEY) || '{}');
  if (!allNotifs[userId]) {
    allNotifs[userId] = [];
  }
  
  const newNotif = {
    ...notification,
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    timestamp: new Date().toISOString(),
    isUnread: true
  };
  
  // Add to beginning so newest is first
  allNotifs[userId].unshift(newNotif);
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(allNotifs));
  
  // Dispatch custom event to update Navbar instantly
  window.dispatchEvent(new CustomEvent('notificationSync', { detail: { userId } }));
}

export function markAsRead(userId, notificationId) {
  if (!userId) return;
  const allNotifs = JSON.parse(localStorage.getItem(NOTIFICATIONS_KEY) || '{}');
  if (allNotifs[userId]) {
    allNotifs[userId] = allNotifs[userId].map(n => 
      n.id === notificationId ? { ...n, isUnread: false } : n
    );
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(allNotifs));
    window.dispatchEvent(new CustomEvent('notificationSync', { detail: { userId } }));
  }
}

export function markAllAsRead(userId) {
  if (!userId) return;
  const allNotifs = JSON.parse(localStorage.getItem(NOTIFICATIONS_KEY) || '{}');
  if (allNotifs[userId]) {
    allNotifs[userId] = allNotifs[userId].map(n => ({ ...n, isUnread: false }));
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(allNotifs));
    window.dispatchEvent(new CustomEvent('notificationSync', { detail: { userId } }));
  }
}
