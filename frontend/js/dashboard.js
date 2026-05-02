views.dashboard = {
  render() {
    const app = document.getElementById('app');
    app.innerHTML = '<p>Loading...</p>';

    Promise.all([api.getSummary(), api.getUpcoming(7), api.getBudgets()])
      .then(([summary, upcoming, budgets]) => {
        const budgetMap = Object.fromEntries(budgets.map(b => [b.currency, b.amount]));

        const budgetRows = Object.entries(summary.monthly).map(([currency, spent]) => {
          const limit = budgetMap[currency];
          if (!limit) {
            return `
              <div class="budget-row">
                <span class="budget-currency">${currency}</span>
                <span class="budget-spent">${spent.toFixed(2)}</span>
                <span class="muted">No limit set</span>
                <button data-action="edit-budget" data-currency="${currency}" data-amount="">Set limit</button>
              </div>`;
          }
          const pct = Math.min((spent / limit) * 100, 100);
          const barClass = pct >= 100 ? 'over' : pct >= 70 ? 'warning' : 'under';
          return `
            <div class="budget-row">
              <span class="budget-currency">${currency}</span>
              <span class="budget-spent">${spent.toFixed(2)} / ${limit.toFixed(2)}</span>
              <div class="budget-bar-wrap">
                <div class="budget-bar ${barClass}" style="width:${pct.toFixed(1)}%"></div>
              </div>
              <button data-action="edit-budget" data-currency="${currency}" data-amount="${limit}">Edit</button>
              <button data-action="delete-budget" data-currency="${currency}">Remove</button>
            </div>`;
        }).join('');

        const monthlyCards = Object.entries(summary.monthly)
          .map(([currency, amount]) => `
            <div class="card">
              <div class="card-label">Monthly (${currency})</div>
              <div class="card-value">${amount.toFixed(2)}</div>
            </div>
          `).join('');

        const now = new Date(); now.setHours(0, 0, 0, 0);
        const pad = n => String(n).padStart(2, '0');
        const todayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
        const in3Date = new Date(now); in3Date.setDate(in3Date.getDate() + 3);
        const in3Str = `${in3Date.getFullYear()}-${pad(in3Date.getMonth() + 1)}-${pad(in3Date.getDate())}`;

        const upcomingRows = upcoming.map(s => {
          const urgency = s.next_payment_date <= todayStr ? 'urgent'
            : s.next_payment_date <= in3Str ? 'soon'
            : '';
          const urgencyBadge = s.next_payment_date <= todayStr
            ? '<span class="badge badge-urgent">Today</span>'
            : s.next_payment_date <= in3Str
            ? '<span class="badge badge-soon">Soon</span>'
            : '';
          return `
            <tr class="${urgency}">
              <td>${s.name}</td>
              <td>${s.cost.toFixed(2)} ${s.currency}</td>
              <td>${s.next_payment_date} ${urgencyBadge}</td>
            </tr>
          `;
        }).join('');

        app.innerHTML = `
          <h2>Dashboard</h2>
          <div class="cards">
            <div class="card">
              <div class="card-label">Active Subscriptions</div>
              <div class="card-value">${summary.total_active}</div>
            </div>
            ${monthlyCards}
          </div>
          <div class="section-card">
            <div class="section-header">
              <h3>Upcoming Payments <span class="muted">(next 7 days)</span></h3>
            </div>
            ${upcoming.length === 0
              ? '<p class="muted">No upcoming payments in the next 7 days.</p>'
              : `<table><thead><tr><th>Name</th><th>Cost</th><th>Date</th></tr></thead><tbody>${upcomingRows}</tbody></table>`
            }
          </div>
          <div class="section-card">
            <div class="section-header">
              <h3>Monthly Budget</h3>
            </div>
            <div class="budget-section">
              ${Object.keys(summary.monthly).length === 0
                ? '<p class="muted">No active subscriptions.</p>'
                : budgetRows
              }
            </div>
            <form id="budget-form" class="budget-inline-form" style="display:none">
              <p class="form-title" id="budget-form-label"></p>
              <input type="hidden" id="budget-currency">
              <input type="number" id="budget-amount" placeholder="0.00" step="0.01" min="0.01" required style="max-width:160px">
              <button type="submit">Save</button>
              <button type="button" id="budget-cancel" class="btn-secondary">Cancel</button>
            </form>
          </div>
        `;

        const budgetForm = document.getElementById('budget-form');
        const budgetAmountInput = document.getElementById('budget-amount');
        const budgetCurrencyInput = document.getElementById('budget-currency');
        const budgetFormLabel = document.getElementById('budget-form-label');

        app.onclick = e => {
          const btn = e.target.closest('[data-action]');
          if (!btn) return;
          const { action, currency, amount } = btn.dataset;

          if (action === 'edit-budget') {
            budgetCurrencyInput.value = currency;
            budgetAmountInput.value = amount || '';
            budgetFormLabel.textContent = `${currency} monthly limit:`;
            budgetForm.style.display = '';
            budgetAmountInput.focus();
          }

          if (action === 'delete-budget') {
            if (!confirm(`Remove ${currency} budget limit?`)) return;
            api.deleteBudget(currency)
              .then(() => views.dashboard.render())
              .catch(err => alert(err.message));
          }
        };

        budgetForm.addEventListener('submit', e => {
          e.preventDefault();
          api.setBudget(budgetCurrencyInput.value, parseFloat(budgetAmountInput.value))
            .then(() => views.dashboard.render())
            .catch(err => alert(err.message));
        });

        document.getElementById('budget-cancel').addEventListener('click', () => {
          budgetForm.style.display = 'none';
        });
      })
      .catch(err => { app.innerHTML = `<p class="error">${err.message}</p>`; });
  }
};
