// script.js

const socket = io();

// DOM References
const loginPage = document.getElementById("loginPage");
const chatPage = document.getElementById("chatPage");
const userScroll = document.getElementById("userScroll");
const chatList = document.getElementById("chatList");

let currentUser = JSON.parse(localStorage.getItem("user"));

// Redirect to login if not logged in
if (!currentUser) {
  window.location.href = "/login.html";
} else {
  socket.emit("login", currentUser, res => {
    if (!res.success) {
      alert("Username already taken. Choose another.");
      localStorage.removeItem("user");
      window.location.href = "/login.html";
    }
  });
}

// Handle updated user list
socket.on("user-list", users => {
  userScroll.innerHTML = "";
  users.forEach(u => {
    const div = document.createElement("div");
    div.className = "userCircle";
    div.innerHTML = `
      <div class="avatar">
        ${u.pic ? `<img src="${u.pic}" />` : u.name.charAt(0).toUpperCase()}
      </div>
      <small>${u.name}</small>
    `;
    if (u.name === currentUser.name) {
      div.querySelector("small").innerText += " (You)";
    }
    div.onclick = () => {
      startPrivate(u.name);
    };
    userScroll.appendChild(div);
  });
});

// Start private chat
function startPrivate(name) {
  localStorage.setItem("privateWith", JSON.stringify({ name }));
  window.location.href = "/private-chat.html";
}

// Group create action
document.getElementById("createGroupBtn").onclick = () => {
  window.location.href = "/group-create.html";
};

// Add recent chats example (extend with real storage later)
const chats = JSON.parse(localStorage.getItem("recentChats") || "[]");
chats.forEach(c => {
  const div = document.createElement("div");
  div.className = "chat-user";
  div.onclick = () => {
    const target = c.type === "group" ? "/group-chat.html" : "/private-chat.html";
    localStorage.setItem(c.type === "group" ? "currentGroup" : "privateWith", JSON.stringify({
      name: c.name
    }));
    window.location.href = target;
  };
  div.innerHTML = `<span>${c.name}</span>`;
  chatList.appendChild(div);
});
