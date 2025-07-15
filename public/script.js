const socket = io();
const form = document.getElementById('form');
const input = document.getElementById('input');
const messages = document.getElementById('messages');
const imageInput = document.getElementById('imageInput');

const user = JSON.parse(localStorage.getItem('user'));
if (!user) {
  window.location.href = 'login.html';
}

form.addEventListener('submit', function(e) {
  e.preventDefault();
  if (input.value) {
    socket.emit('chat message', { name: user.name, text: input.value });
    input.value = '';
  }

  if (imageInput.files.length > 0) {
    const reader = new FileReader();
    reader.onload = function() {
      socket.emit('chat image', { name: user.name, image: reader.result });
    };
    reader.readAsDataURL(imageInput.files[0]);
    imageInput.value = '';
  }
});

socket.on('chat message', function(msg) {
  const item = document.createElement('li');
  item.textContent = `[${msg.name}]: ${msg.text}`;
  messages.appendChild(item);
  window.scrollTo(0, document.body.scrollHeight);
});

socket.on('chat image', function(msg) {
  const item = document.createElement('li');
  item.innerHTML = `[${msg.name}]: <br><img src="${msg.image}" width="200">`;
  messages.appendChild(item);
  window.scrollTo(0, document.body.scrollHeight);
});
