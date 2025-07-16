let user = JSON.parse(localStorage.getItem("user")) || {};
let notificationSound = new Audio("/notify.mp3");
notificationSound.volume = 0.5;

function playNotify(senderName) {
  // নিজের নাম হলে সাউন্ড বাজবে না
  if (!senderName || senderName === user.name) return;

  // যদি ট্যাব মিনিমাইজ থাকে বা ইউজার অন্যখানে তাকায়
  if (document.hidden || !document.hasFocus()) {
    notificationSound.play().catch(() => {
      // সাইলেন্টলি ব্যর্থ হলে কিছু করো না
    });

    // Desktop notification
    if (Notification.permission === "granted") {
      new Notification("📩 New Message from " + senderName, {
        body: "Click to view",
        icon: "/chat-icon.png"
      });
    }
  }
}

// নোটিফিকেশন পারমিশন একবারে নেবে
if ("Notification" in window && Notification.permission !== "granted") {
  Notification.requestPermission();
}
