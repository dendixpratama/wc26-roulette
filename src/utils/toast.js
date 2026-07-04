export function showToast(message, type = 'error') {
  // Check if container exists
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.innerHTML = `
    <div class="toast-icon">${type === 'error' ? '⚠️' : '✅'}</div>
    <div class="toast-message">${message}</div>
    <button class="toast-close">&times;</button>
  `;

  container.appendChild(toast);

  // Auto remove
  const timer = setTimeout(() => {
    toast.classList.add('toast--hiding');
    setTimeout(() => { if (toast.parentNode) toast.remove(); }, 300);
  }, 3000);

  toast.querySelector('.toast-close').addEventListener('click', () => {
    clearTimeout(timer);
    toast.classList.add('toast--hiding');
    setTimeout(() => { if (toast.parentNode) toast.remove(); }, 300);
  });
}
