/**
 * CelebrAI — Main Client Utilities & Global Interactions
 */

// Global Toast System
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  let iconSvg = '';
  if (type === 'success') {
    iconSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`;
  } else if (type === 'error') {
    iconSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#DC2626" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`;
  } else {
    iconSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D97706" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`;
  }

  toast.innerHTML = `
    ${iconSvg}
    <div style="flex: 1; font-weight: 500;">${message}</div>
    <button onclick="this.parentElement.remove()" style="background: none; border: none; font-size: 1.2rem; cursor: pointer; color: #9CA3AF;">&times;</button>
  `;

  container.appendChild(toast);

  // Auto remove after 4.5 seconds
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4500);
}

// Indian Rupee (INR) Formatter for Vanilla JS
function formatINR(number) {
  const val = Math.round(Number(number) || 0);
  const isNeg = val < 0;
  const absVal = Math.abs(val);
  const s = absVal.toString();
  
  if (s.length <= 3) {
    return (isNeg ? "-₹" : "₹") + s;
  }
  
  const lastThree = s.substring(s.length - 3);
  let otherNumbers = s.substring(0, s.length - 3);
  let result = '';
  
  while (otherNumbers.length > 2) {
    result = ',' + otherNumbers.substring(otherNumbers.length - 2) + result;
    otherNumbers = otherNumbers.substring(0, otherNumbers.length - 2);
  }
  
  if (otherNumbers.length > 0) {
    result = otherNumbers + result;
  }
  
  return (isNeg ? "-₹" : "₹") + result + ',' + lastThree;
}

// Mobile Navigation
function toggleMobileNav() {
  const nav = document.getElementById('navLinks');
  if (nav) {
    nav.classList.toggle('active');
  }
}

// AI Config Modal
function openAiConfigModal() {
  const modal = document.getElementById('aiConfigModal');
  if (modal) modal.classList.add('active');
}

function closeAiConfigModal() {
  const modal = document.getElementById('aiConfigModal');
  if (modal) modal.classList.remove('active');
}

// About Modal
function openAboutModal(e) {
  if (e) e.preventDefault();
  const modal = document.getElementById('aboutModal');
  if (modal) modal.classList.add('active');
}

function closeAboutModal() {
  const modal = document.getElementById('aboutModal');
  if (modal) modal.classList.remove('active');
}

// Close modals when clicking backdrop
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('active');
  }
});

// Copy text helper
function copyToClipboard(text, successMsg = 'Copied to clipboard!') {
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(() => {
      showToast(successMsg, 'success');
    }).catch(() => {
      fallbackCopy(text, successMsg);
    });
  } else {
    fallbackCopy(text, successMsg);
  }
}

function fallbackCopy(text, successMsg) {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.style.position = "fixed";
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  try {
    document.execCommand('copy');
    showToast(successMsg, 'success');
  } catch (err) {
    showToast('Failed to copy', 'error');
  }
  document.body.removeChild(textArea);
}
