views.subscriptions = {
  render(filters = {}) {
    const app = document.getElementById('app');
    app.innerHTML = '<p>Loading...</p>';

    Promise.all([api.getSubscriptions(filters), api.getCategories()])
      .then(([subscriptions, categories]) => {
        const catOptions = categories.map(c =>
          `<option value="${c.id}">${c.name}</option>`
        ).join('');

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
            <button type="submit">Save</button>
            <button type="button" id="sub-cancel" style="display:none">Cancel</button>
          </form>

          <table>
            <thead>
              <tr><th>Name</th><th>Cost</th><th>Period</th><th>Next Payment</th><th>Active</th><th></th></tr>
            </thead>
            <tbody>
              ${subscriptions.map(s => `
                <tr data-id="${s.id}">
                  <td>${s.name}</td>
                  <td>${s.cost.toFixed(2)} ${s.currency}</td>
                  <td>${s.billing_period}</td>
                  <td>${s.next_payment_date}</td>
                  <td>${s.is_active ? 'Yes' : 'No'}</td>
                  <td>
                    <button data-action="edit" data-id="${s.id}">Edit</button>
                    <button data-action="delete" data-id="${s.id}">Delete</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `;

        const getFilters = () => ({
          q: document.getElementById('filter-q').value,
          category_id: document.getElementById('filter-category').value,
          billing_period: document.getElementById('filter-period').value,
          is_active: document.getElementById('filter-active').value,
        });

        document.getElementById('filter-q').addEventListener('input', () => views.subscriptions.render(getFilters()));
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

        const subMap = Object.fromEntries(subscriptions.map(s => [s.id, s]));

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
            cancelBtn.style.display = '';
            form.scrollIntoView({ behavior: 'smooth' });
          }

          if (action === 'delete') {
            if (!confirm('Delete this subscription?')) return;
            api.deleteSubscription(id)
              .then(() => views.subscriptions.render())
              .catch(err => alert(err.message));
          }
        });
      })
      .catch(err => { app.innerHTML = `<p class="error">${err.message}</p>`; });
  }
};
