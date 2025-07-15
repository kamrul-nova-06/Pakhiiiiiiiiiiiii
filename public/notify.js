function notifyUser(message) {
  if (!("Notification" in window)) return;

  if (Notification.permission === "granted") {
    new Notification("Pakhiiiiiiiiiiiii 🐦", {
      body: message,
      icon: "https://cdn-icons-png.flaticon.com/512/616/616408.png"
    });
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission().then(permission => {
      if (permission === "granted") {
        new Notification("Pakhiiiiiiiiiiiii 🐦", {
          body: message,
          icon: "https://cdn-icons-png.flaticon.com/512/616/616408.png"
        });
      }
    });
  }
}
