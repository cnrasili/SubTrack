views.subscriptions = {
  render(filters = {}) {
    const app = document.getElementById('app');
    app.innerHTML = '<p>Loading...</p>';

    Promise.all([api.getSubscriptions(filters), api.getCategories()])
      .then(([subscriptions, categories]) => {
        const catOptions = categories.map(c =>
          `<option value="${c.id}">${c.name}</option>`
        ).join('');
        const catMap = Object.fromEntries(categories.map(c => [c.id, c]));

        app.innerHTML = `
          <h2>Subscriptions</h2>

          <div class="filters">
            <input type="text" id="filter-q" placeholder="Search..." value="${filters.q || ''}">
            <select id="filter-category">
              <option value="">All categories</option>
              ${catOptions}
            </select>
            <select id="filter-period">
              <option value="">All periods</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
            <select id="filter-active">
              <option value="">All</option>
              <option value="1">Active</option>
              <option value="0">Inactive</option>
            </select>
          </div>

          <form id="sub-form">
            <input type="hidden" id="sub-id">
            <input type="text" id="sub-name" placeholder="Name" required>
            <input type="number" id="sub-cost" placeholder="Cost" step="0.01" min="0.01" required>
            <select id="sub-period">
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
            <input type="date" id="sub-date" required>
            <select id="sub-category" required>
              ${catOptions}
            </select>
            <select id="sub-currency">
              <option value="TRY">TRY</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
            </select>
            <input type="text" id="sub-notes" placeholder="Notes (optional)">
            <button type="submit">Save</button>
            <button type="button" id="sub-cancel" style="display:none">Cancel</button>
          </form>

          <table>
            <thead>
              <tr><th>Name</th><th>Category</th><th>Cost</th><th>Period</th><th>Next Payment</th><th>Active</th><th></th></tr>
            </thead>
            <tbody id="subs-tbody"></tbody>
          </table>

          <div id="price-history-panel" style="display:none">
            <h3 id="history-title"></h3>
            <table id="history-table">
              <thead>
                <tr><th>Old Price</th><th>New Price</th><th>Date</th></tr>
              </thead>
              <tbody id="history-tbody"></tbody>
            </table>
            <button id="history-close">Close</button>
          </div>
        `;

        const subMap = Object.fromEntries(subscriptions.map(s => [s.id, s]));

        const renderRows = subs => {
          document.getElementById('subs-tbody').innerHTML = subs.map(s => {
            const cat = catMap[s.category_id];
            return `
              <tr data-id="${s.id}">
                <td>
                  ${s.name}
                  ${s.notes ? `<span class="sub-notes">${s.notes}</span>` : ''}
                </td>
                <td>
                  ${cat ? `<span class="color-dot" style="background:${cat.color}"></span>${cat.name}` : '—'}
                </td>
                <td>${s.cost.toFixed(2)} ${s.currency}</td>
                <td>${s.billing_period}</td>
                <td>${s.next_payment_date}</td>
                <td>${s.is_active ? 'Yes' : 'No'}</td>
                <td>
                  <button data-action="edit" data-id="${s.id}">Edit</button>
                  <button data-action="delete" data-id="${s.id}">Delete</button>
                  <button data-action="history" data-id="${s.id}" data-name="${s.name}">History</button>
                </td>
              </tr>
            `;
          }).join('');
        };

        renderRows(subscriptions);

        const getFilters = () => ({
          q: document.getElementById('filter-q').value,
          category_id: document.getElementById('filter-category').value,
          billing_period: document.getElementById('filter-period').value,
          is_active: document.getElementById('filter-active').value,
        });

        document.getElementById('filter-q').addEventListener('input', () => {
          api.getSubscriptions(getFilters())
            .then(subs => {
              subs.forEach(s => { subMap[s.id] = s; });
              renderRows(subs);
            })
            .catch(err => alert(err.message));
        });
        document.getElementById('filter-category').addEventListener('change', () => views.subscriptions.render(getFilters()));
        document.getElementById('filter-period').addEventListener('change', () => views.subscriptions.render(getFilters()));
        document.getElementById('filter-active').addEventListener('change', () => views.subscriptions.render(getFilters()));

        const form = document.getElementById('sub-form');
        const cancelBtn = document.getElementById('sub-cancel');

        form.addEventListener('submit', e => {
          e.preventDefault();
          const id = document.getElementById('sub-id').value;
          const data = {
            name: document.getElementById('sub-name').value.trim(),
            cost: parseFloat(document.getElementById('sub-cost').value),
            billing_period: document.getElementById('sub-period').value,
            next_payment_date: document.getElementById('sub-date').value,
            category_id: parseInt(document.getElementById('sub-category').value),
            currency: document.getElementById('sub-currency').value,
            notes: document.getElementById('sub-notes').value.trim(),
            is_active: 1,
          };
          const action = id ? api.updateSubscription(id, data) : api.createSubscription(data);
          action
            .then(() => views.subscriptions.render())
            .catch(err => alert(err.message));
        });

        cancelBtn.addEventListener('click', () => {
          document.getElementById('sub-id').value = '';
          form.reset();
          cancelBtn.style.display = 'none';
        });

        app.addEventListener('click', e => {
          const btn = e.target.closest('[data-action]');
          if (!btn) return;
          const { action, id } = btn.dataset;

          if (action === 'edit') {
            const s = subMap[id];
            document.getElementById('sub-id').value = s.id;
            document.getElementById('sub-name').value = s.name;
            document.getElementById('sub-cost').value = s.cost;
            document.getElementById('sub-period').value = s.billing_period;
            document.getElementById('sub-date').value = s.next_payment_date;
            document.getElementById('sub-category').value = s.category_id;
            document.getElementById('sub-currency').value = s.currency;
            document.getElementById('sub-notes').value = s.notes ?? '';
            cancelBtn.style.display = '';
            form.scrollIntoView({ behavior: 'smooth' });
          }

          if (action === 'delete') {
            if (!confirm('Delete this subscription?')) return;
            api.deleteSubscription(id)
              .then(() => views.subscriptions.render())
              .catch(err => alert(err.message));
          }

          if (action === 'history') {
            const panel = document.getElementById('price-history-panel');
            document.getElementById('history-title').textContent = `Price History — ${btn.dataset.name}`;
            document.getElementById('history-tbody').innerHTML = '<tr><td colspan="4">Loading...</td></tr>';
            panel.style.display = '';
            api.getPriceHistory(id)
              .then(rows => {
                document.getElementById('history-tbody').innerHTML = rows.length === 0
                  ? '<tr><td colspan="3">No price changes recorded yet.</td></tr>'
                  : rows.map(r => `
                      <tr>
                        <td>${r.old_cost.toFixed(2)} ${r.old_currency}</td>
                        <td>${r.new_cost.toFixed(2)} ${r.new_currency}</td>
                        <td>${r.changed_at.slice(0, 10)}</td>
                      </tr>
                    `).join('');
              })
              .catch(err => alert(err.message));
          }
        });

        document.getElementById('history-close').addEventListener('click', () => {
          document.getElementById('price-history-panel').style.display = 'none';
        });
      })
      .catch(err => { app.innerHTML = `<p class="error">${err.message}</p>`; });
  }
};
