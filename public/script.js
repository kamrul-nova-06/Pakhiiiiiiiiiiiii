// script.js

const socket = io();

// DOM elements const messageInput = document.getElementById("messageInput"); const sendBtn = document.getElementById("sendBtn"); const chatBox = document.getElementById("chatBox"); const imageInput = document.getElementById("imageInput"); const userList = document.getElementById("userList");

let currentUser = localStorage.getItem("chat_user"); let profilePic = localStorage.getItem("chat_pic"); let currentChat = "group"; // default let selectedUser = null;

if (!currentUser || !profilePic) { window.location.href = "/login.html"; }

socket.emit("join", { name: currentUser, pic: profilePic });

// Send Message sendBtn.addEventListener("click", (e) => { e.preventDefault(); const msg = messageInput.value.trim(); if (msg === "") return; socket.emit("message", { to: currentChat === "group" ? "group" : selectedUser, from: currentUser, text: msg, type: "text", pic: profilePic, time: new Date().toLocaleTimeString(), }); messageInput.value = ""; });

// Typing messageInput.addEventListener("input", () => { socket.emit("typing", { to: currentChat === "group" ? "group" : selectedUser, from: currentUser, }); });

// Send Image imageInput.addEventListener("change", () => { const file = imageInput.files[0]; const reader = new FileReader(); reader.onload = () => { socket.emit("message", { to: currentChat === "group" ? "group" : selectedUser, from: currentUser, text: reader.result, type: "image", pic: profilePic, time: new Date().toLocaleTimeString(), }); }; reader.readAsDataURL(file); });

// Receive Message socket.on("message", (data) => { const msg = document.createElement("div"); msg.className = message ${data.from === currentUser ? "my-message" : "other-message"}; msg.innerHTML = <div class="name">${data.from} • ${data.time}</div> ${data.type === "text" ? data.text :<img src='${data.text}' style='max-width:100%;border-radius:10px;' />} ; chatBox.appendChild(msg); chatBox.scrollTop = chatBox.scrollHeight;

if (data.from !== currentUser) playNotifySound(); });

// Typing Indicator socket.on("typing", (data) => { showTyping(data.from, currentChat); });

// Load Online Users socket.on("users", (users) => { userList.innerHTML = ""; users.forEach((u) => { const el = document.createElement("div"); el.className = "user"; el.innerHTML = <div class="avatar">${u.pic ?<img src='${u.pic}' style='width:100%;height:100%;border-radius:50%;' />: u.name.charAt(0)}</div> <div>${u.name} ${u.active ? "<span style='color:red;'>●</span>" : ""}</div>; el.onclick = () => { currentChat = u.name; selectedUser = u.name; chatBox.innerHTML = ""; // optional: load history }; userList.appendChild(el); }); });

