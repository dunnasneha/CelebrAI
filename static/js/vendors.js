/**
 * CelebrAI — Vendor Checklist & Status Controller
 */

function filterVendors(status, btn) {
  document.querySelectorAll('.chip').forEach(c => c.style.fontWeight = '500');
  btn.style.fontWeight = '700';

  const cards = document.querySelectorAll('.vendor-card');
  cards.forEach(card => {
    const cardStatus = card.getAttribute('data-status');
    if (status === 'ALL' || cardStatus === status) {
      card.style.display = 'flex';
    } else {
      card.style.display = 'none';
    }
  });
}

async function updateVendorStatus(vendorId, newStatus) {
  try {
    const res = await fetch(`/api/vendors/${vendorId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });
    const data = await res.json();

    if (data.success) {
      const card = document.querySelector(`.vendor-card[data-id="${vendorId}"]`);
      if (card) {
        card.setAttribute('data-status', newStatus);
      }
      showToast(`Status updated to "${newStatus}"`, 'success');
    } else {
      showToast('Failed to update vendor status', 'error');
    }
  } catch (err) {
    showToast('Server communication error', 'error');
  }
}

async function saveVendorField(vendorId, fieldName, value) {
  try {
    const res = await fetch(`/api/vendors/${vendorId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [fieldName]: value })
    });
    const data = await res.json();
    if (data.success) {
      showToast('Vendor details saved', 'info');
    }
  } catch (err) {
    showToast('Failed to update vendor field', 'error');
  }
}

function openAddVendorModal() {
  document.getElementById('addVendorModal').classList.add('active');
}

async function handleAddVendor(e) {
  e.preventDefault();

  const category = document.getElementById('newVendorCategory').value.trim();
  const cost = parseFloat(document.getElementById('newVendorCost').value) || 0;
  const deadline = document.getElementById('newVendorDeadline').value;
  const criteria = document.getElementById('newVendorCriteria').value.trim();
  const questions = document.getElementById('newVendorQuestions').value.trim();

  if (!category) {
    showToast('Category is required', 'error');
    return;
  }

  try {
    const res = await fetch('/api/vendors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_id: EVENT_ID,
        category: category,
        estimated_cost: cost,
        deadline: deadline,
        criteria: criteria,
        questions_to_ask: questions,
        status: 'Not Started'
      })
    });
    const data = await res.json();

    if (data.success) {
      showToast('Vendor added successfully!', 'success');
      closeModal('addVendorModal');
      setTimeout(() => window.location.reload(), 400);
    } else {
      showToast(data.error || 'Failed to add vendor', 'error');
    }
  } catch (err) {
    showToast('Server communication error', 'error');
  }
}

async function deleteVendorItem(vendorId) {
  if (!confirm('Are you sure you want to remove this vendor item?')) return;

  try {
    const res = await fetch(`/api/vendors/${vendorId}`, { method: 'DELETE' });
    const data = await res.json();

    if (data.success) {
      const card = document.querySelector(`.vendor-card[data-id="${vendorId}"]`);
      if (card) card.remove();
      showToast('Vendor item removed', 'info');
    } else {
      showToast('Failed to delete vendor item', 'error');
    }
  } catch (err) {
    showToast('Server communication error', 'error');
  }
}
