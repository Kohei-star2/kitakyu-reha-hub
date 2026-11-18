(() => {
  const buttons = document.querySelectorAll('#tag-filter button');
  const items = document.querySelectorAll('.report-item');
  buttons.forEach((b) => b.addEventListener('click', () => {
    const tag = b.dataset.tag;
    buttons.forEach((x) => x.classList.toggle('is-on', x === b));
    items.forEach((it) => {
      const show = !tag || (it.dataset.tags || '').split(',').includes(tag);
      it.hidden = !show;
    });
  }));
})();
