/**
 * CelebrAI — Interactive GenAI Tools Client Logic
 * Handles Improve Theme, Generate Invitation, Suggest Activities, and Ask CelebrAI Chat.
 */

function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('active');
}

// 1. IMPROVE THEME MODAL
async function openThemeModal() {
  const modal = document.getElementById('themeModal');
  modal.classList.add('active');
  const container = document.getElementById('themeResultsContainer');
  container.innerHTML = `<div style="text-align: center; padding: 30px; color: var(--purple-900);">✨ Consulting GenAI Theme Stylist...</div>`;

  try {
    const res = await fetch('/api/generate-theme', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event_id: EVENT_ID })
    });
    const data = await res.json();

    if (data.success && data.result && data.result.themes) {
      let html = '';
      data.result.themes.forEach((t, idx) => {
        let colorPills = '';
        if (t.colors) {
          t.colors.forEach(c => {
            colorPills += `
              <span style="display: inline-flex; align-items: center; gap: 5px; font-size: 0.75rem; background: #FFFFFF; border: 1px solid var(--border-subtle); padding: 2px 8px; border-radius: var(--radius-full);">
                <span style="width: 10px; height: 10px; border-radius: 50%; background: ${c.hex};"></span>
                <span>${c.name}</span>
              </span>
            `;
          });
        }

        html += `
          <div style="background: var(--bg-cream); border: 1.5px solid var(--border-subtle); border-radius: var(--radius-md); padding: 18px;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px;">
              <h4 style="font-size: 1.15rem; color: var(--purple-900); font-weight: 700;">${idx + 1}. ${t.name}</h4>
              <span class="badge badge-gold">${t.tagline || 'Atmospheric'}</span>
            </div>
            <p style="font-size: 0.88rem; color: var(--text-secondary); line-height: 1.6; margin-bottom: 12px;">
              ${t.description}
            </p>
            <div style="display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 10px;">
              ${colorPills}
            </div>
            <div style="font-size: 0.8rem; color: var(--text-muted);">
              <b>Music & Vibe:</b> ${t.music_vibe || 'Curated celebration soundtrack'}
            </div>
          </div>
        `;
      });
      container.innerHTML = html;
    } else {
      container.innerHTML = `<div style="color: var(--danger); text-align: center; padding: 20px;">Could not load themes. Please retry.</div>`;
    }
  } catch (e) {
    container.innerHTML = `<div style="color: var(--danger); text-align: center; padding: 20px;">Server error generating themes.</div>`;
  }
}

// 2. GENERATE INVITATION MODAL
async function openInvitationModal() {
  const modal = document.getElementById('invitationModal');
  modal.classList.add('active');
  const container = document.getElementById('invitationResultsContainer');
  container.innerHTML = `<div style="text-align: center; padding: 30px; color: var(--purple-900);">✨ Drafting multi-tone invitations with GenAI...</div>`;

  try {
    const res = await fetch('/api/generate-invitation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event_id: EVENT_ID })
    });
    const data = await res.json();

    if (data.success && data.result) {
      const r = data.result;
      const tones = [
        { title: "WhatsApp / Digital Motion", content: r.whatsapp, badge: "badge-success" },
        { title: "Warm & Friendly", content: r.casual, badge: "badge-pink" },
        { title: "Traditional & Formal", content: r.formal, badge: "badge-purple" },
        { title: "Poetic & Emotional", content: r.poetic, badge: "badge-gold" }
      ];

      let html = '';
      tones.forEach((t, idx) => {
        if (!t.content) return;
        const safeText = t.content.replace(/"/g, '&quot;');
        html += `
          <div style="background: var(--bg-cream); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 18px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
              <span class="badge ${t.badge}">${t.title}</span>
              <button onclick="copyToClipboard(document.getElementById('inviteText_${idx}').innerText, '${t.title} draft copied!')" class="btn btn-secondary btn-sm" style="padding: 4px 10px; font-size: 0.78rem;">
                Copy Text
              </button>
            </div>
            <div id="inviteText_${idx}" style="font-size: 0.88rem; color: var(--text-primary); line-height: 1.6; white-space: pre-line; background: #FFFFFF; padding: 14px; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);">
              ${t.content}
            </div>
          </div>
        `;
      });
      container.innerHTML = html;
    } else {
      container.innerHTML = `<div style="color: var(--danger); text-align: center; padding: 20px;">Could not draft invitations. Please retry.</div>`;
    }
  } catch (e) {
    container.innerHTML = `<div style="color: var(--danger); text-align: center; padding: 20px;">Server error drafting invitations.</div>`;
  }
}

// 3. SUGGEST ACTIVITIES MODAL
async function openActivitiesModal() {
  const modal = document.getElementById('activitiesModal');
  modal.classList.add('active');
  const container = document.getElementById('activitiesResultsContainer');
  container.innerHTML = `<div style="text-align: center; padding: 30px; color: var(--purple-900);">✨ Curating interactive guest games with GenAI...</div>`;

  try {
    const res = await fetch('/api/suggest-activities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event_id: EVENT_ID })
    });
    const data = await res.json();

    if (data.success && data.result && data.result.activities) {
      let html = '';
      data.result.activities.forEach((a, idx) => {
        let suppliesHtml = '';
        if (a.supplies_needed && a.supplies_needed.length > 0) {
          suppliesHtml = `
            <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 6px;">
              <b>Supplies Needed:</b> ${a.supplies_needed.join(', ')}
            </div>
          `;
        }

        html += `
          <div style="background: var(--bg-cream); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 18px;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px;">
              <h4 style="font-size: 1.1rem; color: var(--purple-900); font-weight: 700;">${idx + 1}. ${a.title}</h4>
              <span class="badge badge-gold">${a.duration || '20 mins'}</span>
            </div>
            <div style="font-size: 0.8rem; color: var(--purple-700); font-weight: 600; margin-bottom: 8px;">
              ⏰ Best Time: ${a.best_time || 'Celebration hours'}
            </div>
            <p style="font-size: 0.88rem; color: var(--text-secondary); line-height: 1.6; margin-bottom: 6px;">
              ${a.how_it_works}
            </p>
            ${suppliesHtml}
          </div>
        `;
      });
      container.innerHTML = html;
    } else {
      container.innerHTML = `<div style="color: var(--danger); text-align: center; padding: 20px;">Could not load activities. Please retry.</div>`;
    }
  } catch (e) {
    container.innerHTML = `<div style="color: var(--danger); text-align: center; padding: 20px;">Server error generating activities.</div>`;
  }
}

// 4. ASK CELEBRAI CHAT CONCIERGE
const chatHistory = [];

function openChatDrawer() {
  document.getElementById('chatModal').classList.add('active');
  setTimeout(() => {
    document.getElementById('chatInput').focus();
  }, 100);
}

async function sendChatMessage() {
  const input = document.getElementById('chatInput');
  const message = input.value.trim();
  if (!message) return;

  input.value = '';
  const messagesBox = document.getElementById('chatMessages');

  // Render User Message
  const userBubble = document.createElement('div');
  userBubble.style.cssText = 'align-self: flex-end; background: var(--purple-900); color: #FFFFFF; padding: 10px 16px; border-radius: 16px 16px 2px 16px; max-width: 80%; font-size: 0.9rem; line-height: 1.5;';
  userBubble.innerText = message;
  messagesBox.appendChild(userBubble);
  messagesBox.scrollTop = messagesBox.scrollHeight;

  // Add typing indicator
  const typingIndicator = document.createElement('div');
  typingIndicator.id = 'chatTypingIndicator';
  typingIndicator.style.cssText = 'align-self: flex-start; background: #F3F4F6; color: var(--text-muted); padding: 8px 14px; border-radius: 16px 16px 16px 2px; font-size: 0.85rem; font-style: italic;';
  typingIndicator.innerText = 'CelebrAI is formulating advice...';
  messagesBox.appendChild(typingIndicator);
  messagesBox.scrollTop = messagesBox.scrollHeight;

  chatHistory.push({ role: 'user', content: message });

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_id: EVENT_ID,
        message: message,
        history: chatHistory
      })
    });
    const data = await res.json();

    const indicator = document.getElementById('chatTypingIndicator');
    if (indicator) indicator.remove();

    if (data.success && data.reply) {
      chatHistory.push({ role: 'assistant', content: data.reply });

      const assistantBubble = document.createElement('div');
      assistantBubble.style.cssText = 'align-self: flex-start; background: #FFFFFF; border: 1px solid var(--border-subtle); color: var(--text-primary); padding: 12px 16px; border-radius: 16px 16px 16px 2px; max-width: 85%; font-size: 0.9rem; line-height: 1.6; box-shadow: var(--shadow-sm);';
      // Simple markdown newlines and bold handling
      let formatted = data.reply
        .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
        .replace(/\n\n/g, '<br><br>')
        .replace(/\n/g, '<br>');
      assistantBubble.innerHTML = formatted;
      messagesBox.appendChild(assistantBubble);
    } else {
      const errBubble = document.createElement('div');
      errBubble.style.cssText = 'align-self: flex-start; background: var(--danger-bg); color: var(--danger); padding: 10px 14px; border-radius: 12px; font-size: 0.85rem;';
      errBubble.innerText = data.error || 'Could not process response.';
      messagesBox.appendChild(errBubble);
    }
  } catch (err) {
    const indicator = document.getElementById('chatTypingIndicator');
    if (indicator) indicator.remove();
    showToast('Failed to reach AI assistant', 'error');
  }

  messagesBox.scrollTop = messagesBox.scrollHeight;
}
