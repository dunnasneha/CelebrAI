import { CelebrationEvent, BudgetItem, TimelineTask, Vendor } from '../types';
import { formatINR } from '../utils/formatters';

function escapeHtml(str: unknown): string {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function exportEventToPrintablePDF(
  event: CelebrationEvent,
  budgetItems: BudgetItem[],
  tasks: TimelineTask[],
  vendors: Vendor[]
) {
  // Create hidden iframe for printing to comply with iFrame constraints and avoid window.open/window.alert
  const printIframe = document.createElement('iframe');
  printIframe.style.position = 'fixed';
  printIframe.style.right = '0';
  printIframe.style.bottom = '0';
  printIframe.style.width = '0';
  printIframe.style.height = '0';
  printIframe.style.border = '0';
  printIframe.style.visibility = 'hidden';
  document.body.appendChild(printIframe);

  const totPlanned = budgetItems
    .filter(b => !b.is_contingency && !b.category.toLowerCase().includes('contingency'))
    .reduce((sum, b) => sum + (Number(b.allocated_amount) || 0), 0);
  const contingencyAmt = budgetItems
    .filter(b => b.is_contingency || b.category.toLowerCase().includes('contingency'))
    .reduce((sum, b) => sum + (Number(b.allocated_amount) || 0), 0);
  const totAllocated = totPlanned + contingencyAmt;
  const remaining = (Number(event.total_budget) || 0) - totAllocated;

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>CelebrAI_Plan_${event.name.replace(/[^a-zA-Z0-9]/g, '_')}</title>
  <style>
    @page {
      size: letter;
      margin: 18mm 16mm;
    }
    body {
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      color: #1F2937;
      line-height: 1.5;
      font-size: 10pt;
      margin: 0;
      padding: 0;
      background: #FFFFFF;
    }
    .header {
      margin-bottom: 16px;
      border-bottom: 2px solid #D97706;
      padding-bottom: 12px;
    }
    .header h1 {
      font-size: 22pt;
      color: #2E1065;
      margin: 0 0 4px 0;
      font-weight: 800;
    }
    .header p {
      font-size: 10pt;
      color: #B45309;
      margin: 0;
      font-weight: 600;
    }
    .card-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      background: #FAF7F2;
      border: 1px solid #E5E7EB;
      border-radius: 6px;
      padding: 12px 16px;
      margin-bottom: 18px;
    }
    .card-grid div {
      font-size: 9.5pt;
    }
    .card-grid strong {
      color: #2E1065;
    }
    h2 {
      font-size: 12pt;
      color: #2E1065;
      margin: 18px 0 8px 0;
      padding-bottom: 4px;
      border-bottom: 1px solid #E5E7EB;
      page-break-after: avoid;
    }
    h3 {
      font-size: 10.5pt;
      color: #4C1D95;
      margin: 10px 0 4px 0;
      page-break-after: avoid;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 16px;
      font-size: 9pt;
      page-break-inside: auto;
    }
    tr {
      page-break-inside: avoid;
      page-break-after: auto;
    }
    th {
      background: #2E1065;
      color: #FFFFFF;
      text-align: left;
      padding: 6px 8px;
      font-weight: 600;
    }
    td {
      padding: 6px 8px;
      border-bottom: 1px solid #E5E7EB;
      vertical-align: top;
    }
    tr:nth-child(even) td {
      background: #F9FAFB;
    }
    .totals-row td {
      background: #FEF3C7 !important;
      font-weight: bold;
      color: #1F2937;
    }
    .badge {
      display: inline-block;
      padding: 2px 6px;
      font-size: 7.5pt;
      font-weight: 700;
      border-radius: 4px;
      text-transform: uppercase;
    }
    .badge-urgent { background: #FEE2E2; color: #991B1B; }
    .badge-high { background: #FEF3C7; color: #92400E; }
    .badge-medium { background: #E0E7FF; color: #3730A3; }
    .badge-low { background: #F3F4F6; color: #4B5563; }
    .badge-done { background: #D1FAE5; color: #065F46; }
    .badge-booked { background: #D1FAE5; color: #065F46; }
    .badge-contacted { background: #FEF3C7; color: #92400E; }
    .badge-notstarted { background: #F3F4F6; color: #4B5563; }
    ul {
      margin: 4px 0 10px 20px;
      padding: 0;
    }
    li {
      margin-bottom: 3px;
    }
    .footer {
      margin-top: 24px;
      border-top: 1px solid #E5E7EB;
      padding-top: 8px;
      font-size: 8pt;
      color: #6B7280;
      display: flex;
      justify-content: space-between;
    }
    @media print {
      body {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      .no-print {
        display: none !important;
      }
    }
    .print-actions {
      background: #2E1065;
      padding: 12px 18px;
      color: #FFFFFF;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      border-radius: 8px;
    }
    .btn-print {
      background: #F59E0B;
      color: #1C0A35;
      font-weight: 700;
      border: none;
      padding: 8px 18px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 9.5pt;
    }
  </style>
</head>
<body>
  <div class="print-actions no-print">
    <span><strong>CelebrAI Official Blueprint:</strong> Print or Save as PDF below.</span>
    <button class="btn-print" onclick="window.print()">Print / Save as PDF</button>
  </div>

  <div class="header">
    <h1>CelebrAI Event Blueprint</h1>
    <p>Plan Beautiful Moments, Effortlessly. • Official Executive Plan</p>
  </div>

  <div class="card-grid">
    <div><strong>Event Name:</strong> ${event.name}</div>
    <div><strong>Event Type:</strong> ${event.event_type}</div>
    <div><strong>Date:</strong> ${event.event_date}</div>
    <div><strong>Location:</strong> ${event.location}</div>
    <div><strong>Estimated Guests:</strong> ${event.guests}</div>
    <div><strong>Total Budget:</strong> ${formatINR(event.total_budget)}</div>
    <div><strong>Theme:</strong> ${event.theme || 'Custom'}</div>
    <div><strong>Venue Style:</strong> ${event.venue_preference}</div>
    <div><strong>Food Preference:</strong> ${event.food_preference}</div>
    <div><strong>Planning Style:</strong> ${event.planning_style}</div>
  </div>

  ${event.overview?.concept ? `
  <h2>1. Event Overview & Creative Concept</h2>
  <p><strong>Concept:</strong> ${event.overview.concept}</p>
  <p><strong>Atmosphere:</strong> ${event.overview.atmosphere}</p>
  <p>${event.overview.personalized_description || ''}</p>
  ${event.overview.key_considerations?.length ? `
    <p><strong>Key Considerations:</strong></p>
    <ul>
      ${event.overview.key_considerations.map(c => `<li>${c}</li>`).join('')}
    </ul>
  ` : ''}
  ` : ''}

  <h2>2. Financial Blueprint & Budget Allocation</h2>
  <p style="font-size: 8.5pt; color: #6B7280; margin-bottom: 6px;">
    <em>All estimates in Indian Rupees (INR) with separated contingency reserve to prevent double-counting.</em>
  </p>
  <table>
    <thead>
      <tr>
        <th style="width: 28%;">Category</th>
        <th style="width: 18%;">Allocated</th>
        <th style="width: 16%;">Actual Spent</th>
        <th style="width: 38%;">Notes & Scope</th>
      </tr>
    </thead>
    <tbody>
      ${budgetItems.map(item => `
        <tr>
          <td><strong>${item.category}</strong> ${item.is_contingency ? '<span style="color:#B45309;">(Contingency)</span>' : ''}</td>
          <td>${formatINR(item.allocated_amount)}</td>
          <td>${formatINR(item.actual_spent)}</td>
          <td>${item.notes || '—'}</td>
        </tr>
      `).join('')}
      <tr class="totals-row">
        <td>Total Allocated</td>
        <td>${formatINR(totAllocated)}</td>
        <td>${formatINR(budgetItems.reduce((s, i) => s + (Number(i.actual_spent) || 0), 0))}</td>
        <td>Remaining: ${formatINR(remaining)} ${remaining < 0 ? '(OVER BUDGET)' : ''}</td>
      </tr>
    </tbody>
  </table>

  <h2>3. Preparation Timeline & Milestones</h2>
  <table>
    <thead>
      <tr>
        <th style="width: 18%;">Phase</th>
        <th style="width: 44%;">Milestone Task</th>
        <th style="width: 16%;">Target Date</th>
        <th style="width: 11%;">Priority</th>
        <th style="width: 11%;">Status</th>
      </tr>
    </thead>
    <tbody>
      ${tasks.map(t => `
        <tr>
          <td><strong>${t.phase}</strong></td>
          <td><strong>${t.title}</strong><br><span style="color:#6B7280; font-size:8pt;">${t.description}</span></td>
          <td>${t.due_date || '—'}</td>
          <td><span class="badge badge-${t.priority.toLowerCase()}">${t.priority}</span></td>
          <td><span class="badge ${t.is_completed ? 'badge-done' : 'badge-notstarted'}">${t.is_completed ? 'Done' : 'Pending'}</span></td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <h2>4. Vendor Management & Selection Criteria</h2>
  <table>
    <thead>
      <tr>
        <th style="width: 16%;">Category</th>
        <th style="width: 44%;">Criteria & Questions</th>
        <th style="width: 16%;">Estimated</th>
        <th style="width: 12%;">Status</th>
        <th style="width: 12%;">Contact / Notes</th>
      </tr>
    </thead>
    <tbody>
      ${vendors.map(v => `
        <tr>
          <td><strong>${v.category}</strong></td>
          <td>
            ${v.criteria ? `<div><strong>Criteria:</strong> ${v.criteria}</div>` : ''}
            ${v.questions_to_ask ? `<div style="color:#4B5563; font-size:8pt; margin-top:2px;"><strong>Questions:</strong> ${v.questions_to_ask}</div>` : ''}
          </td>
          <td>${formatINR(v.estimated_cost)}</td>
          <td><span class="badge badge-${v.status.toLowerCase().replace(' ', '')}">${v.status}</span></td>
          <td style="font-size: 8pt;">${v.contact_info || v.notes || '—'}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  ${event.creative ? `
  <h2>5. Creative Blueprint & Styling</h2>
  ${event.creative.decorations?.length ? `
    <h3>Thematic Decor Elements</h3>
    <ul>
      ${event.creative.decorations.map(d => `<li>${d}</li>`).join('')}
    </ul>
  ` : ''}
  ${event.creative.menu_suggestions ? `
    <h3>Curated Feast & Menu Highlights</h3>
    <ul>
      ${event.creative.menu_suggestions.welcome_drinks?.length ? `<li><strong>Welcome Drinks:</strong> ${event.creative.menu_suggestions.welcome_drinks.join(', ')}</li>` : ''}
      ${event.creative.menu_suggestions.appetizers?.length ? `<li><strong>Appetizers:</strong> ${event.creative.menu_suggestions.appetizers.join(', ')}</li>` : ''}
      ${event.creative.menu_suggestions.mains?.length ? `<li><strong>Main Course:</strong> ${event.creative.menu_suggestions.mains.join(', ')}</li>` : ''}
      ${event.creative.menu_suggestions.desserts?.length ? `<li><strong>Desserts:</strong> ${event.creative.menu_suggestions.desserts.join(', ')}</li>` : ''}
    </ul>
  ` : ''}
  ${event.creative.invitation_draft ? `
    <h3>Personalized Invitation Draft</h3>
    <p style="background: #FAF7F2; padding: 10px; border-left: 3px solid #F59E0B; font-style: italic; border-radius: 4px;">
      "${event.creative.invitation_draft}"
    </p>
  ` : ''}
  ` : ''}

  ${event.risk ? `
  <h2>6. Risk Management & Contingencies</h2>
  <ul>
    ${event.risk.weather_contingency ? `<li><strong>Weather Contingency:</strong> ${event.risk.weather_contingency}</li>` : ''}
    ${event.risk.backup_venue ? `<li><strong>Backup Venue:</strong> ${event.risk.backup_venue}</li>` : ''}
    ${event.risk.emergency_supplies ? `<li><strong>Emergency Supplies:</strong> ${event.risk.emergency_supplies}</li>` : ''}
    ${event.risk.schedule_delays ? `<li><strong>Schedule Delays:</strong> ${event.risk.schedule_delays}</li>` : ''}
    ${event.risk.budget_overruns ? `<li><strong>Budget Overruns:</strong> ${event.risk.budget_overruns}</li>` : ''}
  </ul>
  ` : ''}

  <div class="footer">
    <span>CelebrAI — Your Celebration, Perfectly Planned.</span>
    <span>Generated: ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
  </div>
</body>
</html>
  `;

  const doc = printIframe.contentWindow?.document;
  if (doc) {
    doc.open();
    doc.write(htmlContent);
    doc.close();
    setTimeout(() => {
      try {
        printIframe.contentWindow?.focus();
        printIframe.contentWindow?.print();
      } catch (err) {
        console.warn('Print trigger note:', err);
      }
      setTimeout(() => {
        if (document.body.contains(printIframe)) {
          document.body.removeChild(printIframe);
        }
      }, 5000);
    }, 300);
  }
}
