/**
 * CelebrAI — Smart Budget Dashboard & Interactive Chart.js Controller
 */

let chartInstance = null;

const CATEGORY_COLORS = [
  '#2E1065', '#7C3AED', '#D97706', '#F59E0B', '#F43F5E',
  '#059669', '#2563EB', '#0D9488', '#9333EA', '#6B7280'
];

document.addEventListener('DOMContentLoaded', () => {
  initBudgetChart();
  recalculateBudgetLive();
});

function initBudgetChart() {
  const canvas = document.getElementById('budgetChart');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  chartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: [],
      datasets: [{
        data: [],
        backgroundColor: CATEGORY_COLORS,
        borderWidth: 2,
        borderColor: '#FFFFFF',
        hoverOffset: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const label = context.label || '';
              const val = context.raw || 0;
              return `${label}: ${formatINR(val)}`;
            }
          }
        }
      },
      cutout: '68%'
    }
  });
}

function recalculateBudgetLive() {
  const rows = document.querySelectorAll('.budget-row');
  let totalPlanned = 0;
  let contingency = 0;

  const chartLabels = [];
  const chartData = [];

  rows.forEach(row => {
    const isCont = row.getAttribute('data-contingency') === '1' ||
      row.querySelector('.item-category').value.toLowerCase().includes('contingency');
    const amtInput = row.querySelector('.item-allocated');
    const amt = Math.max(0, parseFloat(amtInput.value) || 0);
    const catName = row.querySelector('.item-category').value.trim() || 'Item';

    if (isCont) {
      contingency += amt;
    } else {
      totalPlanned += amt;
    }

    // Update row percentage badge
    const pctBadge = row.querySelector('.item-percent-badge');
    if (pctBadge) {
      const pct = TOTAL_BUDGET > 0 ? ((amt / TOTAL_BUDGET) * 100).toFixed(1) : 0;
      pctBadge.innerText = `${pct}%`;
    }

    if (amt > 0) {
      chartLabels.push(catName);
      chartData.push(amt);
    }
  });

  const totalAllocated = totalPlanned + contingency;
  const remaining = TOTAL_BUDGET - totalAllocated;
  const isOverBudget = remaining < 0;
  const utilPct = TOTAL_BUDGET > 0 ? ((totalAllocated / TOTAL_BUDGET) * 100).toFixed(1) : 0;

  // Update summary DOM nodes
  document.getElementById('dispTotalPlanned').innerText = formatINR(totalPlanned);
  document.getElementById('dispContingency').innerText = formatINR(contingency);
  document.getElementById('dispRemaining').innerText = formatINR(remaining);
  document.getElementById('dispUtilPct').innerText = `${utilPct}% utilized`;

  // Over-budget alert
  const alertEl = document.getElementById('overBudgetAlert');
  const remCard = document.getElementById('remainingCard');
  const remDisp = document.getElementById('dispRemaining');
  const utilDisp = document.getElementById('dispUtilPct');

  if (isOverBudget) {
    alertEl.style.display = 'flex';
    document.getElementById('overBudgetAmountText').innerText = formatINR(Math.abs(remaining));
    remCard.style.background = 'var(--danger-bg)';
    remCard.style.borderColor = '#FECACA';
    remDisp.style.color = 'var(--danger)';
    utilDisp.style.color = 'var(--danger)';
  } else {
    alertEl.style.display = 'none';
    remCard.style.background = 'var(--success-bg)';
    remCard.style.borderColor = '#A7F3D0';
    remDisp.style.color = 'var(--success)';
    utilDisp.style.color = 'var(--success)';
  }

  // Update Chart
  if (chartInstance) {
    chartInstance.data.labels = chartLabels;
    chartInstance.data.datasets[0].data = chartData;
    chartInstance.update();
  }
}

function addNewCategoryRow() {
  const tbody = document.getElementById('budgetTableBody');
  const tr = document.createElement('tr');
  tr.className = 'budget-row';
  tr.setAttribute('data-contingency', '0');

  tr.innerHTML = `
    <td>
      <input type="text" class="form-control item-category" value="New Category" style="padding: 6px 10px; font-size: 0.88rem; font-weight: 600;">
    </td>
    <td>
      <div style="position: relative;">
        <span style="position: absolute; left: 10px; top: 8px; color: var(--text-muted); font-size: 0.85rem;">₹</span>
        <input type="number" class="form-control item-allocated" value="10000" min="0" style="padding-left: 24px; padding-top: 6px; padding-bottom: 6px; font-size: 0.9rem; font-weight: 700; color: var(--purple-900);" oninput="recalculateBudgetLive()">
      </div>
    </td>
    <td>
      <span class="item-percent-badge badge badge-neutral" style="font-size: 0.8rem;">0%</span>
    </td>
    <td>
      <input type="text" class="form-control item-notes" value="" placeholder="Notes..." style="padding: 6px 10px; font-size: 0.85rem;">
    </td>
    <td style="text-align: right;">
      <button onclick="removeBudgetRow(this)" class="btn btn-danger btn-sm" style="padding: 4px 8px; font-size: 0.75rem;" title="Remove Category">&times;</button>
    </td>
  `;

  // Insert before the last item (contingency) if present
  const rows = tbody.querySelectorAll('.budget-row');
  if (rows.length > 0) {
    const lastRow = rows[rows.length - 1];
    if (lastRow.getAttribute('data-contingency') === '1') {
      tbody.insertBefore(tr, lastRow);
    } else {
      tbody.appendChild(tr);
    }
  } else {
    tbody.appendChild(tr);
  }

  recalculateBudgetLive();
  showToast('Added new budget category row', 'info');
}

function removeBudgetRow(btn) {
  const row = btn.closest('.budget-row');
  if (row) {
    row.remove();
    recalculateBudgetLive();
    showToast('Category removed', 'info');
  }
}

async function saveBudgetCk() {
  const rows = document.querySelectorAll('.budget-row');
  const items = [];

  rows.forEach(row => {
    const cat = row.querySelector('.item-category').value.trim();
    const amt = parseFloat(row.querySelector('.item-allocated').value) || 0;
    const notes = row.querySelector('.item-notes').value.trim();
    const isCont = row.getAttribute('data-contingency') === '1' || cat.toLowerCase().includes('contingency');

    items.push({
      category: cat,
      allocated_amount: amt,
      notes: notes,
      is_contingency: isCont
    });
  });

  const saveBtns = [document.getElementById('saveBudgetTopBtn'), document.getElementById('saveBudgetBottomBtn')];
  saveBtns.forEach(b => { if (b) b.disabled = true; });

  try {
    const res = await fetch(`/api/events/${EVENT_ID}/budget/update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: items })
    });
    const data = await res.json();

    if (data.success) {
      showToast('Budget allocations successfully saved!', 'success');
    } else {
      showToast(data.error || 'Failed to save budget changes.', 'error');
    }
  } catch (err) {
    showToast('Server communication error', 'error');
  } finally {
    saveBtns.forEach(b => { if (b) b.disabled = false; });
  }
}

async function openOptimizeBudgetModal() {
  const modal = document.getElementById('optimizeBudgetModal');
  modal.classList.add('active');
  const container = document.getElementById('optimizeResultsContainer');
  container.innerHTML = `<div style="text-align: center; padding: 30px; color: var(--purple-900);">✨ Analyzing expenses & vendor pricing with GenAI...</div>`;

  try {
    const res = await fetch('/api/optimize-budget', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event_id: EVENT_ID })
    });
    const data = await res.json();

    if (data.success && data.result) {
      const r = data.result;
      let html = '';

      if (r.analysis) {
        html += `
          <div style="background: var(--purple-50); border: 1px solid var(--purple-100); padding: 14px 18px; border-radius: var(--radius-md); font-size: 0.9rem; color: var(--purple-950); line-height: 1.6;">
            <b>Strategist Diagnosis:</b> ${r.analysis}
          </div>
        `;
      }

      if (r.tips && r.tips.length > 0) {
        html += `<div style="font-size: 0.85rem; font-weight: 700; color: var(--gold-700); text-transform: uppercase; margin-top: 8px;">Actionable Savings Recommendations:</div>`;
        r.tips.forEach((tip, idx) => {
          html += `
            <div style="background: var(--bg-cream); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 16px;">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px;">
                <h4 style="font-size: 1.05rem; color: var(--purple-900); font-weight: 700;">${idx + 1}. ${tip.title}</h4>
                <span class="badge badge-success">Save ${tip.potential_saving}</span>
              </div>
              <div style="font-size: 0.8rem; color: var(--purple-700); font-weight: 600; margin-bottom: 6px;">
                Impact: ${tip.category}
              </div>
              <p style="font-size: 0.88rem; color: var(--text-secondary); line-height: 1.6;">
                ${tip.action}
              </p>
            </div>
          `;
        });
      }

      container.innerHTML = html;
    } else {
      container.innerHTML = `<div style="color: var(--danger); text-align: center; padding: 20px;">Could not analyze budget. Please retry.</div>`;
    }
  } catch (err) {
    container.innerHTML = `<div style="color: var(--danger); text-align: center; padding: 20px;">Server error generating optimization advice.</div>`;
  }
}

function resetBudgetToDefault() {
  if (confirm("Reset current allocations back to standard baseline ratios?")) {
    window.location.reload();
  }
}
