const socket = io();
let currentMode = 'group';
let to = 'group';

const msgBox = document.getElementById('msg');
const messagesDiv = document.getElementById('messages');
const modeSelect = document.getElementById('modeSelect');

function scrollToBottom() {
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function formatTime(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function showMessage(msg) {
  const div = document.createElement('div');
  div.className = 'message';
  div.classList.add(msg.from === window.userName ? 'self' : 'other');
  div.innerHTML = `<b>${msg.from}</b><br>${msg.text}<br><small>${formatTime(msg.time)}</small>`;
  messagesDiv.appendChild(div);
  if (msg.from !== window.userName) playNotification();
  scrollToBottom();
}

function sendMessage() {
  const text = msgBox.value.trim();
  if (!text) return;
  const msg = { from: window.userName, to, text };
  socket.emit('chat message', msg);
  msgBox.value = '';
  showMessage(msg);
}

msgBox.addEventListener('keydown', e => {
  if (e.key === 'Enter') sendMessage();
  else socket.emit('typing', { from: window.userName, to });
});

msgBox.addEventListener('keyup', () => {
  setTimeout(() => {
    socket.emit('stop typing', { from: window.userName, to });
  }, 500);
});

socket.on('chat message', showMessage);

socket.on('typing', from => {
  if (from !== window.userName) {
    msgBox.placeholder = `${from} is typing...`;
  }
});

socket.on('stop typing', () => {
  msgBox.placeholder = "Type your message...";
});

socket.on('chat history', list => {
  messagesDiv.innerHTML = '';
  list.forEach(showMessage);
});

socket.on('user list', userList => {
  const userBar = document.getElementById('userBar');
  userBar.innerHTML = '';
  modeSelect.innerHTML = `<option value="group">Group</option>`;
  userList.forEach(u => {
    if (u.name !== window.userName) {
      const userEl = document.createElement('div');
      userEl.className = 'user';
      userEl.innerHTML = `<div>${u.name}</div>`;
      if (u.active) {
        userEl.innerHTML += `<div class="dot"></div>`;
      }
      userBar.appendChild(userEl);

      const opt = document.createElement('option');
      opt.value = u.name;
      opt.textContent = u.name;
      modeSelect.appendChild(opt);
    }
  });
});

modeSelect.addEventListener('change', () => {
  to = modeSelect.value;
  socket.emit('load chat', { to });
});

window.onload = () => {
  socket.emit('load chat', { to });
};
