// script.js

const socket = io(); let user = JSON.parse(localStorage.getItem("user")) || null;

const loginTimeout = 24 * 60 * 60 * 1000; // 24 ঘন্টা const now = Date.now();

if (!user || now - (user.timestamp || 0) > loginTimeout) { window.location.href = "/login.html"; } else { document.addEventListener("DOMContentLoaded", () => { initChat(); }); }

function initChat() { const chatBox = document.getElementById("chatBox"); const chatForm = document.getElementById("chatForm"); const messageInput = document.getElementById("messageInput"); const imageInput = document.getElementById("imageInput");

socket.emit("user-join", user);

chatForm.addEventListener("submit", (e) => { e.preventDefault(); const message = messageInput.value.trim(); if (message) { const msgData = { sender: user.name, avatar: user.avatar, message, timestamp: new Date().toLocaleTimeString(), type: "text", }; socket.emit("groupMessage", msgData); messageInput.value = ""; displayMessage(msgData, true); } });

imageInput.addEventListener("change", () => { const file = imageInput.files[0]; if (!file) return; const reader = new FileReader(); reader.onload = () => { const msgData = { sender: user.name, avatar: user.avatar, message: reader.result, timestamp: new Date().toLocaleTimeString(), type: "image", }; socket.emit("groupMessage", msgData); displayMessage(msgData, true); }; reader.readAsDataURL(file); });

socket.on("groupMessage", (msg) => { if (msg.sender !== user.name) { playNotify(msg.sender); displayMessage(msg, false); } });

function displayMessage(data, isMine) { const msgDiv = document.createElement("div"); msgDiv.className = message ${isMine ? "my-message" : "other-message"}; if (data.type === "text") { msgDiv.innerHTML = <div class='name'>${data.sender} <small>${data.timestamp}</small></div>${data.message}; } else if (data.type === "image") { msgDiv.innerHTML = <div class='name'>${data.sender} <small>${data.timestamp}</small></div><img src='${data.message}' style='max-width: 100%; border-radius: 8px;' />; } chatBox.appendChild(msgDiv); chatBox.scrollTop = chatBox.scrollHeight; }

// টাইপিং ইন্ডিকেটর messageInput.addEventListener("input", () => { socket.emit("typing", user.name); });
socket.on("user-list", (list) => {
  const userList = document.getElementById("userList");
  userList.innerHTML = "";

  list.forEach((name) => {
    const div = document.createElement("div");
    div.className = "user";
    div.innerText = name;
    userList.appendChild(div);
  });
});
socket.on("typing", (name) => { const typing = document.getElementById("typing") || document.createElement("div"); typing.id = "typing"; typing.textContent = ${name} is typing...; typing.style.fontSize = "13px"; typing.style.color = "gray"; chatBox.appendChild(typing); setTimeout(() => typing.remove(), 3000); }); }

// 3 letter টাইপ করলে নাম সাজেশন const nameInput = document.getElementById("nameInput"); if (nameInput) { nameInput.addEventListener("input", () => { const val = nameInput.value; if (val.length >= 3) { const saved = JSON.parse(localStorage.getItem("userList")) || []; const matched = saved.find((u) => u.name.startsWith(val)); if (matched) { nameInput.value = matched.name; } } }); }

// ইউজার লগইন সেভ function saveLogin(userData) { userData.timestamp = Date.now(); localStorage.setItem("user", JSON.stringify(userData)); let list = JSON.parse(localStorage.getItem("userList")) || []; if (!list.find((u) => u.name === userData.name)) { list.push({ name: userData.name }); localStorage.setItem("userList", JSON.stringify(list)); } }

