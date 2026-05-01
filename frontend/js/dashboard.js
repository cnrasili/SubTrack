views.dashboard = {
  render() {
    const app = document.getElementById('app');
    app.innerHTML = '<p>Loading...</p>';

    Promise.all([api.getSummary(), api.getUpcoming(7)])
      .then(([summary, upcoming]) => {
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
        `;
      })
      .catch(err => { app.innerHTML = `<p class="error">${err.message}</p>`; });
  }
};
