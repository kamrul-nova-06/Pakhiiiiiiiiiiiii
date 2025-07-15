const socket = io();
let currentUser = JSON.parse(localStorage.getItem('pakhiiUser'));
let currentChat = 'group';

if (!currentUser || !currentUser.name) {
  window.location.href = 'login.html';
}

document.getElementById("chatHeader").innerText = "🌐 Group Chat";
document.getElementById("chatForm").addEventListener("submit", sendMessage);
document.getElementById("imageInput").addEventListener("change", sendImage);

socket.emit("user-joined", currentUser.name);

// Receive active users list
socket.on("user-list", (users) => {
  const userList = document.getElementById("userList");
  userList.innerHTML = '';
  for (const id in users) {
    if (users[id] === currentUser.name) continue;
    const div = document.createElement("div");
    div.classList.add("user");
    div.innerHTML = `
      <div class="avatar">${users[id][0].toUpperCase()}</div>
      <div>${users[id]}</div>
    `;
    div.onclick = () => {
      currentChat = id;
      document.getElementById("chatHeader").innerText = users[id];
      document.getElementById("chatBox").innerHTML = '';
    };
    userList.appendChild(div);
  }
});

function openGroupChat() {
  currentChat = 'group';
  document.getElementById("chatHeader").innerText = "🌐 Group Chat";
  document.getElementById("chatBox").innerHTML = '';
}

// Receive text/image messages
socket.on("receive-message", (data) => {
  showMessage(data.message, data.name === currentUser.name, data.name);
});

function sendMessage(e) {
  e.preventDefault();
  const input = document.getElementById("messageInput");
  const message = input.value.trim();
  if (!message) return;
  socket.emit("send-message", {
    message,
    to: currentChat,
    name: currentUser.name
  });
  input.value = '';
}

function sendImage(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function () {
    socket.emit("send-message", {
      message: `<img src="${reader.result}" style="max-width:150px; border-radius:10px;">`,
      to: currentChat,
      name: currentUser.name
    });
  };
  reader.readAsDataURL(file);
}

function showMessage(message, isMine, senderName) {
  const box = document.getElementById("chatBox");
  const div = document.createElement("div");
  div.classList.add("message", isMine ? "my-message" : "other-message");
  div.innerHTML = !isMine ? `<div class="name">${senderName}</div>${message}` : message;
  box.appendChild(div);
  box.scrollTop = box.scrollHeight;
}
