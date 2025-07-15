function playNotification() {
  const audio = new Audio('/notify.mp3');
  audio.play().catch(() => {});
}
