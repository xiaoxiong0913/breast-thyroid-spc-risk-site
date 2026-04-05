document.querySelectorAll('[data-gallery-target]').forEach((button) => {
  button.addEventListener('click', () => {
    const target = button.getAttribute('data-gallery-target');
    document.querySelectorAll('[data-gallery-target]').forEach((item) => item.classList.toggle('active', item === button));
    document.querySelectorAll('[data-gallery-panel]').forEach((panel) => {
      panel.hidden = panel.getAttribute('data-gallery-panel') !== target;
    });
  });
});
