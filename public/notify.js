// Notification permission request
if ('Notification' in window && Notification.permission !== 'granted') {
  Notification.requestPermission().then(function(permission) {
    console.log("Notification permission:", permission);
  });
}

// Notification sound function
function playNotification() {
  const audio = new Audio('/notify.mp3'); // তুমি চাইলে এখানে base64 sound ব্যবহার করতে পারো
  audio.play();
}

// Show notification (only when user is not on page)
function showNotification(title, body) {
  if (document.hidden && Notification.permission === 'granted') {
    new Notification(title, {
      body: body,
      icon: '/chat-icon.png' // তোমার PNG ফাইলের নাম এখানে
    });
    playNotification();
  }
}
