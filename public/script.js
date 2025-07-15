const socket = io();
let myName = "";
let currentChat = "group"; // default group mode

// ফর্ম লোড হলে ইউজার ইনফো আনা
fetch("/user-info")
  .then((res) => res.json())
  .then((data) => {
    myName = data.name;
    socket.emit("register", myName);
  });

// Active user list render
socket.on("user list", (users) => {
  const userList = document.getElementById("userList");
  userList.innerHTML = "";

  const selector = document.getElementById("chatModeSelector");
  selector.innerHTML = `<option value="group">🌐 Group Chat</option>`;

  users.forEach((user) => {
    const div = document.createElement("div");
    div.className = "user";
    div.innerHTML = `
      <img src="https://ui-avatars.com/api/?name=${user.name}&background=0084ff&color=fff" />
      ${user.name === myName ? "<span>You</span>" : `<span>${user.name}</span>`}
      ${user.active && user.name !== myName ? '<div class="dot"></div>' : ""}
    `;
    userList.appendChild(div);

    // dropdown add
    if (user.name !== myName) {
      const opt = document.createElement("option");
      opt.value = user.name;
      opt.textContent = `🔒 ${user.name}`;
      selector.appendChild(opt);
    }
  });
});

// Load messages
function loadMessages() {
  socket.emit("load chat", { to: currentChat });
}

socket.on("chat history", (msgs) => {
  const messages = document.getElementById("messages");
  messages.innerHTML = "";
  msgs.forEach((msg) => {
    showMessage(msg);
  });
  messages.scrollTop = messages.scrollHeight;
});

// Show message
function showMessage(msg) {
  const div = document.createElement("div");
  div.classList.add("message");
  div.classList.add(msg.from === myName ? "self" : "other");

  if (msg.image) {
    div.innerHTML = `<img src="${msg.image}" style="max-width: 100%;" />`;
  }
  if (msg.text) {
    div.innerHTML += `<div>${msg.text}</div>`;
  }

  document.getElementById("messages").appendChild(div);
}

// Send message
document.getElementById("sendBtn").onclick = () => {
  const text = document.getElementById("messageInput").value.trim();
  const file = document.getElementById("imageInput").files[0];

  if (!text && !file) return;

  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      socket.emit("chat message", {
        from: myName,
        to: currentChat,
        image: e.target.result,
        text,
      });
    };
    reader.readAsDataURL(file);
  } else {
    socket.emit("chat message", {
      from: myName,
      to: currentChat,
      text,
    });
  }

  document.getElementById("messageInput").value = "";
  document.getElementById("imageInput").value = "";
};

// Receive new message
socket.on("chat message", (msg) => {
  if (
    msg.to === "group" ||
    msg.to === myName ||
    msg.from === myName ||
    currentChat === "group"
  ) {
    showMessage(msg);
    const messages = document.getElementById("messages");
    messages.scrollTop = messages.scrollHeight;
  }
});

// Mode Change
document.getElementById("chatModeSelector").onchange = (e) => {
  currentChat = e.target.value;
  loadMessages();
};

// Typing
const msgInput = document.getElementById("messageInput");
msgInput.addEventListener("input", () => {
  socket.emit("typing", { from: myName, to: currentChat });
  setTimeout(() => {
    socket.emit("stop typing", { from: myName, to: currentChat });
  }, 1000);
});

socket.on("typing", (from) => {
  if (from !== myName) {
    document.getElementById("typing").textContent = `${from} is typing...`;
  }
});

socket.on("stop typing", () => {
  document.getElementById("typing").textContent = "";
});

// Initial load
setTimeout(() => {
  loadMessages();
}, 1000);
