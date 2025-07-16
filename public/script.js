// ✅ script.js const socket = io();

let username = localStorage.getItem("pakhi-username"); let profilePic = localStorage.getItem("pakhi-avatar"); let currentChat = "group"; let typingTimeout;

function initLogin() { if (username) { socket.emit("user-joined", { username, profilePic }); document.getElementById("loginPage").style.display = "none"; document.getElementById("chatPage").style.display = "flex"; } }

function loginSubmit() { const name = document.getElementById("nameInput").value.trim(); const pass = document.getElementById("passInput").value.trim(); const picInput = document.getElementById("picInput"); if (pass !== "uss") return alert("Wrong password!"); if (!name) return alert("Enter name!"); socket.emit("check-username", name, (isTaken, suggestion) => { if (isTaken) return alert(Name taken! Try ${suggestion}); username = name; profilePic = picInput.files[0] ? URL.createObjectURL(picInput.files[0]) : default${Math.floor(Math.random() * 2) + 1}.png; localStorage.setItem("pakhi-username", username); localStorage.setItem("pakhi-avatar", profilePic); socket.emit("user-joined", { username, profilePic }); document.getElementById("loginPage").style.display = "none"; document.getElementById("chatPage").style.display = "flex"; }); }

function sendMessage(e) { e.preventDefault(); const input = document.getElementById("messageInput"); const fileInput = document.getElementById("imageInput"); const message = input.value.trim(); if (!message && !fileInput.files.length) return; let fileData = null; if (fileInput.files.length) { const reader = new FileReader(); reader.onload = () => { fileData = reader.result; socket.emit("chat-message", { room: currentChat, message, username, file: fileData, profilePic, }); fileInput.value = ""; }; reader.readAsDataURL(fileInput.files[0]); } else { socket.emit("chat-message", { room: currentChat, message, username, file: null, profilePic, }); } input.value = ""; }

function appendMessage(data, isOwn) { const box = document.getElementById("chatBox"); const msg = document.createElement("div"); msg.className = message ${isOwn ? "my-message" : "other-message"}; msg.innerHTML = <div class="name">${data.username} • ${data.time}</div>; if (data.file) { msg.innerHTML += <img src="${data.file}" style="max-width:100%; border-radius:8px" /><br/>; } msg.innerHTML += data.message; box.appendChild(msg); box.scrollTop = box.scrollHeight; }

function switchRoom(to) { currentChat = to; document.getElementById("chatBox").innerHTML = ""; socket.emit("load-history", { room: to }); }

function updateUserList(users) { const list = document.getElementById("userList"); list.innerHTML = ""; users.forEach(u => { const item = document.createElement("div"); item.className = "user"; item.innerHTML = <div class="avatar">${u.username.charAt(0)}</div><div>${u.username} ${u.active ? '🔴' : ''}</div>; item.onclick = () => switchRoom(u.username); list.appendChild(item); }); }

function notifyTyping() { socket.emit("typing", { room: currentChat, username }); }

socket.on("chat-message", data => { appendMessage(data, data.username === username); if (data.username !== username) { playNotificationSound(); notifyMe(data.message, data.username); } });

socket.on("history", messages => { messages.forEach(data => appendMessage(data, data.username === username)); });

socket.on("user-list", updateUserList);

socket.on("typing", data => { const header = document.getElementById("chatHeader"); header.innerText = ${data.username} is typing...; clearTimeout(typingTimeout); typingTimeout = setTimeout(() => { header.innerText = currentChat === "group" ? "Group Chat" : currentChat; }, 1500); });

document.getElementById("chatForm").addEventListener("submit", sendMessage); document.getElementById("messageInput").addEventListener("input", notifyTyping);

initLogin();

