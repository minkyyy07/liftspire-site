'use strict';
(() => {
  const tabs = Array.from(document.querySelectorAll('[role="tab"]'));
  const panel = document.getElementById('demo-panel');
  const image = document.getElementById('demo-image');
  const views = {
    today: { title: 'Start with the day in front of you.', description: 'A weekly calendar, your planned training and a nutrition summary — brought into one daily view.', label: 'DAILY OVERVIEW', alt: 'English dashboard interface concept with an illustrative calendar, lower-body workout and nutrition summary', width: 540, height: 850 },
    workout: { title: 'Your next session starts here.', description: 'See the exercise, working weight and reps together. This illustrative lower-body session shows two logged squat sets and the exercises coming next.', label: 'WORKOUTS', alt: 'English training interface concept showing sample barbell squat sets, working weights and upcoming exercises', width: 540, height: 850 },
    nutrition: { title: 'Nutrition, alongside your training.', description: 'An illustrative day of meals, with calories and macros that add up. See food entries alongside your daily totals, without losing the bigger picture.', label: 'NUTRITION', alt: 'English nutrition interface concept with three sample meals totaling 1872 calories, 132 grams protein, 210 grams carbs and 56 grams fat', width: 540, height: 850 }
  };
  function select(view, focus = false) {
    const data = views[view];
    if (!data) return;
    tabs.forEach(tab => {
      const active = tab.dataset.view === view;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
      if (active && focus) tab.focus({ preventScroll: true });
    });
    panel.setAttribute('aria-labelledby', 'tab-' + view);
    image.src = 'assets/app-' + view + '.webp';
    image.alt = data.alt;
    image.width = data.width;
    image.height = data.height;
    document.getElementById('demo-title').textContent = data.title;
    document.getElementById('demo-description').textContent = data.description;
    document.getElementById('preview-label').textContent = 'LIFTSPIRE / ' + data.label;
  }
  document.querySelector('[role="tablist"]').setAttribute('aria-orientation', 'vertical');
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => select(tab.dataset.view));
    tab.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowDown' || event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      if (next !== undefined) {
        event.preventDefault();
        select(tabs[next].dataset.view, true);
      }
    });
  });
  document.querySelectorAll('[data-feature-link]').forEach(link => {
    link.addEventListener('click', () => select(link.dataset.featureLink));
  });
})();
