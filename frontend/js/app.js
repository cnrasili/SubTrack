function navigate(viewName) {
  document.querySelectorAll('nav a').forEach(a => a.classList.remove('active'));
  const link = document.querySelector(`nav a[data-view="${viewName}"]`);
  if (link) link.classList.add('active');
  if (views[viewName]) views[viewName].render();
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelector('nav').addEventListener('click', e => {
    const a = e.target.closest('a[data-view]');
    if (!a) return;
    e.preventDefault();
    navigate(a.dataset.view);
  });
  navigate('dashboard');
});
