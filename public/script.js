const socket = io();
let currentUser = null;
let currentChat = 'group'; // default group chat
let typing = false;
let typingTimeout;

// Login info
fetch('/user-info')
  .then(res => res.json())
  .then(data => {
    currentUser = data;
    document.getElementById('chatHeader').innerText = 'Group Chat';
  });

const chatBox = document.getElementById('chatBox');
const chatForm = document.getElementById('chatForm');
const messageInput = document.getElementById('messageInput');
const imageInput = document.getElementById('imageInput');
const userList = document.getElementById('userList');

chatForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const msg = messageInput.value.trim();
  const file = imageInput.files[0];

  if (msg || file) {
    if (file) {
      const reader = new FileReader();
      reader.onload = function () {
        socket.emit('chat message', {
          from: currentUser.name,
          to: currentChat,
          text: msg,
          image: reader.result,
        });
      };
      reader.readAsDataURL(file);
    } else {
      socket.emit('chat message', {
        from: currentUser.name,
        to: currentChat,
        text: msg,
      });
    }
    messageInput.value = '';
    imageInput.value = '';
  }
});

socket.on('chat message', (data) => {
  const messageDiv = document.createElement('div');
  messageDiv.className = 'message';
  if (data.from === currentUser.name) {
    messageDiv.classList.add('my-message');
  } else {
    messageDiv.classList.add('other-message');
  }

  const nameDiv = document.createElement('div');
  nameDiv.className = 'name';
  nameDiv.innerText = data.from;

  messageDiv.appendChild(nameDiv);

  if (data.image) {
    const img = document.createElement('img');
    img.src = data.image;
    img.style.maxWidth = '100%';
    img.style.borderRadius = '8px';
    img.style.marginTop = '5px';
    messageDiv.appendChild(img);
  }

  if (data.text) {
    const text = document.createElement('div');
    text.innerText = data.text;
    messageDiv.appendChild(text);
  }

  if (data.to === currentChat || data.to === currentUser.name || data.from === currentUser.name) {
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;

    if (data.from !== currentUser.name) {
      playNotification();
      flashTitle(`${data.from} sent a message`);
    }
  }
});

function openGroupChat() {
  currentChat = 'group';
  document.getElementById('chatHeader').innerText = 'Group Chat';
  chatBox.innerHTML = '';
  socket.emit('load chat', { to: 'group' });
}

function openPrivateChat(user) {
  currentChat = user;
  document.getElementById('chatHeader').innerText = `Chat with ${user}`;
  chatBox.innerHTML = '';
  socket.emit('load chat', { to: user });
}

socket.on('chat history', (messages) => {
  chatBox.innerHTML = '';
  messages.forEach((data) => {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message';
    messageDiv.classList.add(data.from === currentUser.name ? 'my-message' : 'other-message');

    const nameDiv = document.createElement('div');
    nameDiv.className = 'name';
    nameDiv.innerText = data.from;

    messageDiv.appendChild(nameDiv);

    if (data.image) {
      const img = document.createElement('img');
      img.src = data.image;
      img.style.maxWidth = '100%';
      img.style.borderRadius = '8px';
      img.style.marginTop = '5px';
      messageDiv.appendChild(img);
    }

    if (data.text) {
      const text = document.createElement('div');
      text.innerText = data.text;
      messageDiv.appendChild(text);
    }

    chatBox.appendChild(messageDiv);
  });
  chatBox.scrollTop = chatBox.scrollHeight;
});

messageInput.addEventListener('input', () => {
  if (!typing) {
    typing = true;
    socket.emit('typing', { from: currentUser.name, to: currentChat });
    typingTimeout = setTimeout(stopTyping, 2000);
  } else {
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(stopTyping, 2000);
  }
});

function stopTyping() {
  typing = false;
  socket.emit('stop typing', { from: currentUser.name, to: currentChat });
}

socket.on('typing', (user) => {
  document.getElementById('chatHeader').innerText = `${user} is typing...`;
});

socket.on('stop typing', () => {
  document.getElementById('chatHeader').innerText = currentChat === 'group'
    ? 'Group Chat'
    : `Chat with ${currentChat}`;
});

function playNotification() {
  const audio = new Audio('/notify.mp3');
  audio.play().catch(() => {});
}

let defaultTitle = document.title;
function flashTitle(msg) {
  let flashing = true;
  let i = 0;
  const interval = setInterval(() => {
    document.title = i % 2 === 0 ? msg : defaultTitle;
    i++;
    if (!flashing) {
      clearInterval(interval);
      document.title = defaultTitle;
    }
  }, 1000);

  setTimeout(() => {
    flashing = false;
  }, 6000);
}

socket.on('user list', (users) => {
  userList.innerHTML = '';
  users.forEach(user => {
    const userDiv = document.createElement('div');
    userDiv.className = 'user';
    userDiv.onclick = () => openPrivateChat(user.name);

    const avatar = document.createElement('div');
    avatar.className = 'avatar';
    avatar.innerText = user.name.charAt(0).toUpperCase();

    if (user.active) {
      avatar.style.border = '2px solid red';
    }

    const label = document.createElement('div');
    label.innerText = user.name;
    label.style.fontSize = '12px';

    userDiv.appendChild(avatar);
    userDiv.appendChild(label);

    userList.appendChild(userDiv);
  });
});
