/**
 * CelebrAI — Event Creation & AI Generation Form Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('createEventForm');
  if (!form) return;

  const overlay = document.getElementById('aiLoadingOverlay');
  const statusText = document.getElementById('loadingStatusText');
  const progressBar = document.getElementById('loadingProgressBar');
  const submitBtn = document.getElementById('submitBtn');

  // Step-by-step progress simulation messages
  const steps = [
    { text: "Initializing CelebrAI Event Architect...", progress: 20 },
    { text: "Analyzing guest scale, location & regional market pricing...", progress: 40 },
    { text: "Computing optimal INR budget allocations & contingency buffer...", progress: 65 },
    { text: "Formulating adaptive chronological timeline milestones...", progress: 80 },
    { text: "Curating theme styling, menus & vendor negotiation guide...", progress: 92 },
    { text: "Finalizing your executive celebration blueprint...", progress: 98 }
  ];

  let stepInterval = null;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Reset error styles
    document.querySelectorAll('.form-error').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.form-control').forEach(el => el.classList.remove('is-invalid'));

    // Validate fields
    let isValid = true;

    const name = document.getElementById('eventName').value.trim();
    if (!name) {
      document.getElementById('nameError').style.display = 'block';
      document.getElementById('eventName').classList.add('is-invalid');
      isValid = false;
    }

    const eventType = document.getElementById('eventType').value;
    if (!eventType) {
      document.getElementById('typeError').style.display = 'block';
      document.getElementById('eventType').classList.add('is-invalid');
      isValid = false;
    }

    const eventDate = document.getElementById('eventDate').value;
    if (!eventDate) {
      document.getElementById('dateError').style.display = 'block';
      document.getElementById('eventDate').classList.add('is-invalid');
      isValid = false;
    }

    const location = document.getElementById('location').value.trim();
    if (!location) {
      document.getElementById('locationError').style.display = 'block';
      document.getElementById('location').classList.add('is-invalid');
      isValid = false;
    }

    const guests = parseInt(document.getElementById('guests').value, 10);
    if (isNaN(guests) || guests <= 0) {
      document.getElementById('guestsError').style.display = 'block';
      document.getElementById('guests').classList.add('is-invalid');
      isValid = false;
    }

    const totalBudget = parseFloat(document.getElementById('totalBudget').value);
    if (isNaN(totalBudget) || totalBudget <= 0) {
      document.getElementById('budgetError').style.display = 'block';
      document.getElementById('totalBudget').classList.add('is-invalid');
      isValid = false;
    }

    if (!isValid) {
      showToast('Please correct highlighted errors in the form.', 'error');
      return;
    }

    // Construct Payload
    const payload = {
      name: name,
      event_type: eventType,
      event_date: eventDate,
      location: location,
      guests: guests,
      total_budget: totalBudget,
      theme: document.getElementById('theme').value.trim(),
      venue_preference: document.getElementById('venuePref').value,
      food_preference: document.getElementById('foodPref').value,
      duration: document.getElementById('duration').value.trim(),
      special_requirements: document.getElementById('specialReqs').value.trim(),
      planning_style: document.getElementById('planningStyle').value
    };

    // Show Loading Overlay
    overlay.style.display = 'flex';
    submitBtn.disabled = true;

    let stepIdx = 0;
    statusText.innerText = steps[0].text;
    progressBar.style.width = steps[0].progress + '%';

    stepInterval = setInterval(() => {
      stepIdx++;
      if (stepIdx < steps.length) {
        statusText.innerText = steps[stepIdx].text;
        progressBar.style.width = steps[stepIdx].progress + '%';
      }
    }, 1400);

    try {
      const response = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      clearInterval(stepInterval);
      const result = await response.json();

      if (result.success) {
        progressBar.style.width = '100%';
        statusText.innerText = 'Plan generated successfully! Redirecting...';

        if (result.mode === 'demo') {
          showToast('Demo Mode: Structured template created. Configure GEMINI_API_KEY for live GenAI.', 'warning');
        } else {
          showToast('Live GenAI plan successfully generated!', 'success');
        }

        setTimeout(() => {
          window.location.href = result.redirect_url;
        }, 800);
      } else {
        overlay.style.display = 'none';
        submitBtn.disabled = false;
        showToast(result.error || 'Failed to generate event plan. Please retry.', 'error');
      }
    } catch (err) {
      clearInterval(stepInterval);
      overlay.style.display = 'none';
      submitBtn.disabled = false;
      showToast('Server communication error. Please try again.', 'error');
    }
  });
});
