/**
 * CelebrAI — Interactive Preparation Timeline & Task Manager
 */

function filterPhase(phase, btn) {
  document.querySelectorAll('.chip').forEach(c => c.style.fontWeight = '500');
  btn.style.fontWeight = '700';

  const cards = document.querySelectorAll('.task-card');
  cards.forEach(card => {
    const cardPhase = card.getAttribute('data-phase');
    if (phase === 'ALL' || cardPhase === phase) {
      card.style.display = 'flex';
    } else {
      card.style.display = 'none';
    }
  });
}

async function toggleTaskComplete(taskId, isChecked) {
  try {
    const res = await fetch(`/api/tasks/${taskId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_completed: isChecked })
    });
    const data = await res.json();

    if (data.success) {
      const card = document.querySelector(`.task-card[data-id="${taskId}"]`);
      if (card) {
        const title = card.querySelector('.task-title');
        if (isChecked) {
          title.style.textDecoration = 'line-through';
          title.style.color = 'var(--text-muted)';
          card.style.background = '#F9FAFB';
          card.style.opacity = '0.85';
          showToast('Task marked as complete! 🎉', 'success');
        } else {
          title.style.textDecoration = 'none';
          title.style.color = 'var(--purple-950)';
          card.style.background = '#FFFFFF';
          card.style.opacity = '1';
          showToast('Task marked as pending', 'info');
        }
      }
      updateTimelineProgressStats();
    } else {
      showToast('Failed to update task status', 'error');
    }
  } catch (err) {
    showToast('Server communication error', 'error');
  }
}

function updateTimelineProgressStats() {
  const allCheckboxes = document.querySelectorAll('.task-checkbox');
  const total = allCheckboxes.length;
  let completed = 0;

  allCheckboxes.forEach(cb => {
    if (cb.checked) completed++;
  });

  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  const countEl = document.getElementById('completedTasksCount');
  if (countEl) countEl.innerText = completed;

  const pctText = document.getElementById('progressPctText');
  if (pctText) pctText.innerText = pct;

  const pBar = document.getElementById('timelineProgressBar');
  if (pBar) pBar.style.width = pct + '%';
}

function openAddTaskModal() {
  document.getElementById('addTaskModal').classList.add('active');
}

function openEditTaskModal(id, title, desc, phase, due, prio) {
  document.getElementById('editTaskId').value = id;
  document.getElementById('editTaskTitle').value = title;
  document.getElementById('editTaskDesc').value = desc || '';
  document.getElementById('editTaskPhase').value = phase;
  document.getElementById('editTaskDueDate').value = due || '';
  document.getElementById('editTaskPriority').value = prio || 'Medium';
  document.getElementById('editTaskModal').classList.add('active');
}

async function handleAddTask(e) {
  e.preventDefault();

  const title = document.getElementById('taskTitle').value.trim();
  const desc = document.getElementById('taskDesc').value.trim();
  const phase = document.getElementById('taskPhase').value;
  const dueDate = document.getElementById('taskDueDate').value;
  const priority = document.getElementById('taskPriority').value;

  if (!title) {
    showToast('Task title is required', 'error');
    return;
  }

  try {
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_id: EVENT_ID,
        title: title,
        description: desc,
        phase: phase,
        due_date: dueDate,
        priority: priority
      })
    });
    const data = await res.json();

    if (data.success) {
      showToast('New milestone added successfully!', 'success');
      closeModal('addTaskModal');
      setTimeout(() => window.location.reload(), 400);
    } else {
      showToast(data.error || 'Failed to add task', 'error');
    }
  } catch (err) {
    showToast('Server communication error', 'error');
  }
}

async function handleSaveTaskEdit(e) {
  e.preventDefault();
  const taskId = document.getElementById('editTaskId').value;
  const title = document.getElementById('editTaskTitle').value.trim();
  const desc = document.getElementById('editTaskDesc').value.trim();
  const phase = document.getElementById('editTaskPhase').value;
  const dueDate = document.getElementById('editTaskDueDate').value;
  const priority = document.getElementById('editTaskPriority').value;

  try {
    const res = await fetch(`/api/tasks/${taskId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: title,
        description: desc,
        phase: phase,
        due_date: dueDate,
        priority: priority
      })
    });
    const data = await res.json();
    if (data.success) {
      showToast('Milestone updated successfully!', 'success');
      closeModal('editTaskModal');
      // Update DOM
      const card = document.querySelector(`.task-card[data-id="${taskId}"]`);
      if (card) {
        card.setAttribute('data-phase', phase);
        card.querySelector('.task-title').innerText = title;
        card.querySelector('.task-desc').innerText = desc;
        const dueEl = card.querySelector('.task-due-date');
        if (dueEl) dueEl.innerText = dueDate || 'Scheduled';
      }
    } else {
      showToast('Failed to update task', 'error');
    }
  } catch (err) {
    showToast('Server communication error', 'error');
  }
}

async function deleteTaskItem(taskId) {
  if (!confirm('Are you sure you want to delete this milestone?')) return;

  try {
    const res = await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' });
    const data = await res.json();

    if (data.success) {
      const card = document.querySelector(`.task-card[data-id="${taskId}"]`);
      if (card) card.remove();
      updateTimelineProgressStats();
      showToast('Milestone removed', 'info');
    } else {
      showToast('Failed to delete task', 'error');
    }
  } catch (err) {
    showToast('Server communication error', 'error');
  }
}
