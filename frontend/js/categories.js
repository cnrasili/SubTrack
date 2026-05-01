views.categories = {
  render() {
    const app = document.getElementById('app');
    app.innerHTML = '<p>Loading...</p>';

    api.getCategories()
      .then(categories => {
        app.innerHTML = `
          <h2>Categories</h2>
          <form id="cat-form">
            <input type="hidden" id="cat-id">
            <input type="text" id="cat-name" placeholder="Category name" required>
            <button type="submit">Save</button>
            <button type="button" id="cat-cancel" style="display:none">Cancel</button>
          </form>
          <table>
            <thead><tr><th>Name</th><th>Created</th><th></th></tr></thead>
            <tbody>
              ${categories.map(c => `
                <tr>
                  <td>${c.name}</td>
                  <td>${c.created_at.slice(0, 10)}</td>
                  <td>
                    <button data-action="edit" data-id="${c.id}" data-name="${c.name}">Edit</button>
                    <button data-action="delete" data-id="${c.id}">Delete</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `;

        const form = document.getElementById('cat-form');
        const nameInput = document.getElementById('cat-name');
        const idInput = document.getElementById('cat-id');
        const cancelBtn = document.getElementById('cat-cancel');

        form.addEventListener('submit', e => {
          e.preventDefault();
          const id = idInput.value;
          const data = { name: nameInput.value.trim() };
          const action = id ? api.updateCategory(id, data) : api.createCategory(data);
          action
            .then(() => views.categories.render())
            .catch(err => alert(err.message));
        });

        cancelBtn.addEventListener('click', () => {
          idInput.value = '';
          nameInput.value = '';
          cancelBtn.style.display = 'none';
        });

        app.addEventListener('click', e => {
          const btn = e.target.closest('[data-action]');
          if (!btn) return;
          const { action, id, name } = btn.dataset;
          if (action === 'edit') {
            idInput.value = id;
            nameInput.value = name;
            nameInput.focus();
            cancelBtn.style.display = '';
          }
          if (action === 'delete') {
            if (!confirm('Delete this category?')) return;
            api.deleteCategory(id)
              .then(() => views.categories.render())
              .catch(err => alert(err.message));
          }
        });
      })
      .catch(err => { app.innerHTML = `<p class="error">${err.message}</p>`; });
  }
};
