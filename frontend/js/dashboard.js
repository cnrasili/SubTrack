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

        const today = new Date().toISOString().slice(0, 10);
        const in3 = new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10);

        const upcomingRows = upcoming.map(s => {
          const urgency = s.next_payment_date <= today ? 'urgent'
            : s.next_payment_date <= in3 ? 'soon'
            : '';
          return `
            <tr class="${urgency}">
              <td>${s.name}</td>
              <td>${s.cost.toFixed(2)} ${s.currency}</td>
              <td>${s.next_payment_date}</td>
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
          <h3>Upcoming Payments <span class="muted">(next 7 days)</span></h3>
          ${upcoming.length === 0
            ? '<p class="muted">No upcoming payments.</p>'
            : `<table><thead><tr><th>Name</th><th>Cost</th><th>Date</th></tr></thead><tbody>${upcomingRows}</tbody></table>`
          }
          <h3>Monthly Budget</h3>
          <div class="budget-section">
            ${Object.keys(summary.monthly).length === 0
              ? '<p class="muted">No active subscriptions.</p>'
              : budgetRows
            }
          </div>
          <form id="budget-form" style="display:none">
            <span id="budget-form-label"></span>
            <input type="hidden" id="budget-currency">
            <input type="number" id="budget-amount" placeholder="Budget amount" step="0.01" min="0.01" required>
            <button type="submit">Save</button>
            <button type="button" id="budget-cancel">Cancel</button>
          </form>
        `;

        const budgetForm = document.getElementById('budget-form');
        const budgetAmountInput = document.getElementById('budget-amount');
        const budgetCurrencyInput = document.getElementById('budget-currency');
        const budgetFormLabel = document.getElementById('budget-form-label');

        app.addEventListener('click', e => {
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
        });

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
