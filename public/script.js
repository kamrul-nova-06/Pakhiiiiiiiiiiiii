const socket = io();

let currentUser = localStorage.getItem("userName");
let password = localStorage.getItem("userPass");
let currentChat = "group";

if (!currentUser || password !== "uss") {
  currentUser = prompt("Enter your name:");
  password = prompt("Enter password:");

  if (!currentUser || password !== "uss") {
    alert("Wrong credentials. Try again.");
    location.reload();
  }

  localStorage.setItem("userName", currentUser);
  localStorage.setItem("userPass", password);
}

socket.emit("join", currentUser);

const chatBox = document.getElementById("chatBox");
const messageInput = document.getElementById("messageInput");
const chatForm = document.getElementById("chatForm");
const chatHeader = document.getElementById("chatHeader");
const userList = document.getElementById("userList");
const imageInput = document.getElementById("imageInput");

chatForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const msg = messageInput.value.trim();
  if (!msg) return;

  const data = {
    from: currentUser,
    to: currentChat,
    text: msg,
    type: "text"
  };

  socket.emit("message", data);
  appendMessage(data, true);
  messageInput.value = "";
});

imageInput.addEventListener("change", () => {
  const file = imageInput.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function () {
    const data = {
      from: currentUser,
      to: currentChat,
      image: reader.result,
      type: "image"
    };

    socket.emit("message", data);
    appendMessage(data, true);
  };
  reader.readAsDataURL(file);
});

function appendMessage(data, isMine = false) {
  const div = document.createElement("div");
  div.classList.add("message");
  div.classList.add(isMine ? "my-message" : "other-message");

  if (data.type === "text") {
    div.innerHTML = `<div class="name">${data.from}</div>${data.text}`;
  } else if (data.type === "image") {
    div.innerHTML = `<div class="name">${data.from}</div><img src="${data.image}" style="max-width: 100%; border-radius: 10px;" />`;
  }

  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}

socket.on("message", (data) => {
  if (data.to === currentUser || data.to === "group") {
    appendMessage(data);
    if (document.hidden) {
      notifyUser(`${data.from}: ${data.type === "text" ? data.text : "📷 Image"}`);
    }
  }
});

socket.on("userList", (users) => {
  userList.innerHTML = "";
  users.forEach((u) => {
    if (u === currentUser) return;

    const userDiv = document.createElement("div");
    userDiv.className = "user";
    userDiv.innerHTML = `
      <div class="avatar">${u.charAt(0).toUpperCase()}</div>
      <div class="label" style="font-size:12px;">${u}</div>
    `;
    userDiv.onclick = () => openPrivateChat(u);
    userList.appendChild(userDiv);
  });
});

function openPrivateChat(user) {
  currentChat = user;
  chatHeader.innerText = `Chat with ${user}`;
  chatBox.innerHTML = "";
}

function openGroupChat() {
  currentChat = "group";
  chatHeader.innerText = "Group Chat";
  chatBox.innerHTML = "";
}
