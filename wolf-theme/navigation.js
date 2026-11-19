const menu = document.querySelector('.wolf-menu');
const links = document.querySelector('.wolf-links');

if (menu && links) {
  const collapseMenu = () => menu.setAttribute('aria-expanded', 'false');
  menu.hidden = false;

  menu.addEventListener('click', () => {
    menu.setAttribute('aria-expanded', String(menu.getAttribute('aria-expanded') === 'false'));
  });

  links.addEventListener('click', (event) => {
    if (event.target.closest('a')) collapseMenu();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') {
      collapseMenu();
      menu.focus();
    }
  });
}

document.addEventListener('click', (event) => {
  const link = event.target.closest('a[href]');
  if (link && link.origin === location.origin && link.pathname === '/visibility-check.html') {
    window.gtag?.('event', 'visibility_check_click');
  }
});
