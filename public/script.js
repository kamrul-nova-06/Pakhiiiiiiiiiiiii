const socket = io();
const form = document.getElementById('form');
const input = document.getElementById('input');
const imageInput = document.getElementById('imageInput');
const messages = document.getElementById('messages');

const user = JSON.parse(localStorage.getItem('pakhiiUser'));
if (!user) location.href = 'login.html';

socket.emit('login', user);
socket.on('loggedin', () => {
  const item = document.createElement('li');
  item.textContent = `🕊️ ${user.name}, welcome!`;
  messages.appendChild(item);
});

form.addEventListener('submit', e => {
  e.preventDefault();
  if (input.value.trim()) {
    socket.emit('chat message', input.value.trim());
    input.value = '';
  }
  if (imageInput.files.length) {
    const fr = new FileReader();
    fr.onload = () => {
      socket.emit('chat image', fr.result);
    }
    fr.readAsDataURL(imageInput.files[0]);
    imageInput.value = '';
  }
});

socket.on('chat message', msg => {
  const item = document.createElement('li');
  item.innerHTML = `<strong>[${msg.user.name}]:</strong> ${msg.text}`;
  messages.appendChild(item);
  messages.scrollTo(0, messages.scrollHeight);
});

socket.on('chat image', msg => {
  const item = document.createElement('li');
  item.innerHTML = `<strong>[${msg.user.name}]:</strong><br><img src="${msg.image}">`;
  messages.appendChild(item);
});
