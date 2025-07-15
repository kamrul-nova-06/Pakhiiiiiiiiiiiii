const socket = io();
let currentChat = 'group';
let myName = getCookie('name') || 'Unknown';

const chatBox = document.getElementById('chatBox');
const messageInput = document.getElementById('messageInput');
const chatForm = document.getElementById('chatForm');
const userList = document.getElementById('userList');
const chatHeader = document.getElementById('chatHeader');
const imageInput = document.getElementById('imageInput');

function getCookie(name) {
  const match = document.cookie.match(new RegExp(name + '=([^;]+)'));
  return match ? decodeURIComponent(match[1]) : null;
}

function scrollToBottom() {
  chatBox.scrollTop = chatBox.scrollHeight;
}

function showMessage({ name, message, image, isOwn }) {
  const msgDiv = document.createElement('div');
  msgDiv.classList.add('message');
  msgDiv.classList.add(isOwn ? 'my-message' : 'other-message');

  if (!isOwn) {
    const nameTag = document.createElement('div');
    nameTag.className = 'name';
    nameTag.innerText = name;
    msgDiv.appendChild(nameTag);
  }

  if (message) msgDiv.appendChild(document.createTextNode(message));

  if (image) {
    const img = document.createElement('img');
    img.src = image;
    img.style.maxWidth = '200px';
    img.style.borderRadius = '8px';
    img.style.marginTop = '5px';
    msgDiv.appendChild(img);
  }

  chatBox.appendChild(msgDiv);
  scrollToBottom();
}

function openGroupChat() {
  currentChat = 'group';
  chatHeader.innerText = 'Group Chat';
  chatBox.innerHTML = '';
}

socket.on('groupMessage', ({ name, message, image }) => {
  const isOwn = name === myName;
  if (currentChat === 'group') {
    showMessage({ name, message, image, isOwn });
    if (!isOwn) playNotification();
  }
});

socket.on('privateMessage', ({ from, message, image }) => {
  const isOwn = from === myName;
  if (currentChat === from || isOwn) {
    showMessage({ name: from, message, image, isOwn });
    if (!isOwn) playNotification();
  }
});

socket.on('updateUsers', (users) => {
  userList.innerHTML = '';
  users.forEach(user => {
    const userDiv = document.createElement('div');
    userDiv.className = 'user';
    userDiv.onclick = () => {
      currentChat = user;
      chatHeader.innerText = `Chat with ${user}`;
      chatBox.innerHTML = '';
    };

    const avatar = document.createElement('div');
    avatar.className = 'avatar';
    avatar.innerText = user[0]?.toUpperCase();

    if (user !== myName) avatar.style.boxShadow = '0 0 0 3px red';

    userDiv.appendChild(avatar);
    const label = document.createElement('div');
    label.innerText = user;
    label.style.fontSize = '12px';
    label.style.marginTop = '4px';
    userDiv.appendChild(label);

    userList.appendChild(userDiv);
  });
});

chatForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const msg = messageInput.value.trim();
  const file = imageInput.files[0];

  if (!msg && !file) return;

  let imageUrl = null;

  if (file) {
    const formData = new FormData();
    formData.append('image', file);
    const res = await fetch('/upload', { method: 'POST', body: formData });
    const data = await res.json();
    imageUrl = data.image;
    imageInput.value = '';
  }

  if (currentChat === 'group') {
    socket.emit('groupMessage', { message: msg, image: imageUrl });
  } else {
    socket.emit('privateMessage', {
      to: currentChat,
      message: msg,
      image: imageUrl,
    });
  }

  if (msg || imageUrl) {
    showMessage({ name: myName, message: msg, image: imageUrl, isOwn: true });
    messageInput.value = '';
  }
});

messageInput.addEventListener('input', () => {
  socket.emit('typing', currentChat);
});

socket.on('typing', ({ from, target }) => {
  if (from !== myName && currentChat === target) {
    chatHeader.innerText = `${from} typing...`;
    setTimeout(() => {
      chatHeader.innerText = currentChat === 'group' ? 'Group Chat' : `Chat with ${currentChat}`;
    }, 2000);
  }
});

function playNotification() {
  if (document.hidden) {
    const audio = new Audio('/notify.mp3');
    audio.play().catch(() => {});
  }
}
