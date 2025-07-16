// 📢 Notification Sound Config
const notificationAudio = new Audio("/notify.mp3");

// Only play sound if the tab is not focused or message is not from self
function playNotificationSound(fromName) {
  if (document.hidden && fromName !== localStorage.getItem("username")) {
    notificationAudio.play().catch(() => {}); // Silent fail if autoplay blocked
  }
}

// 🔔 Browser Push Notification
function showPushNotification(title, message) {
  if (document.hidden && Notification.permission === "granted") {
    const notification = new Notification(title, {
      body: message,
      icon: "/chat-icon.png", // 📸 Optional custom icon
    });

    // Auto-close after 4 sec
    setTimeout(() => notification.close(), 4000);
  }
}

// 🛡️ Ask permission for browser notification
if ("Notification" in window && Notification.permission !== "granted") {
  Notification.requestPermission();
}

// 🔁 Exported functions
window.notify = {
  play: playNotificationSound,
  show: showPushNotification,
};
