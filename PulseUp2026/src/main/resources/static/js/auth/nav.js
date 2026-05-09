
(function () {
  const navLinks = document.querySelectorAll('.nav-links a');
  const sectionIds = ['home', 'about', 'services', 'contact'];

  window.addEventListener('scroll', () => {
    let current = 'home';

    sectionIds.forEach(id => {
      const el = document.getElementById(id);
      if (el && window.scrollY >= el.offsetTop - 120) {
        current = id;
      }
    });

    navLinks.forEach(a => {
      const href = a.getAttribute('href').replace('#', '');
      a.classList.toggle('active', href === current);
    });
  });
})();
