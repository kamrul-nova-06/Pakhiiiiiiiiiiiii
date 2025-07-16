// Notification sound
const notifySound = new Audio("/notify.mp3");

function playNotifySound() {
  // Play only if tab is visible and user didn't send the message
  if (document.visibilityState === "visible") {
    notifySound.play().catch(() => {});
  }
}

// Show typing indicator
function showTyping(name, target = "group") {
  const typingId = target === "group" ? "#groupTyping" : "#privateTyping";
  let typingBox = document.querySelector(typingId);

  if (!typingBox) {
    typingBox = document.createElement("div");
    typingBox.id = typingId.substring(1);
    typingBox.style.fontSize = "13px";
    typingBox.style.padding = "3px 12px";
    typingBox.style.color = "#555";
    typingBox.style.fontStyle = "italic";

    const chatBox = document.getElementById("chatBox");
    chatBox.appendChild(typingBox);
  }

  typingBox.textContent = `${name} is typing...`;

  clearTimeout(typingBox.timeout);
  typingBox.timeout = setTimeout(() => {
    typingBox.textContent = "";
  }, 2000);
}

// Document visibility check
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") {
    // Optional: clear notifications
  }
});
