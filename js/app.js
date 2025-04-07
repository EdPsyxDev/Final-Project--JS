// const button = document.querySelector('.input-wrapper button');

// button.addEventListener('click', () => {
//   if (!button.classList.contains('loading')) {
//     button.classList.remove('not-loading');
//     button.classList.add('loading');

//     setTimeout(() => {
//       button.classList.remove('loading');
//       button.classList.add('not-loading');
//     }, 2000);
//   }
// });

const searchInput = document.getElementById('main-search-input');
const searchBtn = document.querySelector('.input-wrapper button');

if (searchBtn && searchInput) {
  searchBtn.addEventListener('click', () => {
    const query = searchInput.value.trim();
    if (!query) {
      alert('Please enter sometthing to search.');
      return;
    }

    if (!searchBtn.classList.contains('loading')) {
      searchBtn.classList.remove('not-loading');
      searchBtn.classList.add('loading');

      setTimeout(() => {
        const encodedQuery = encodeURIComponent(query);
        window.location.href = `search.html?query=${encodedQuery}`;
      }, 800);
    }
  });
}



const bentoMenu = document.querySelector('.bento-menu');
const closeBtn = document.querySelector('.close-btn');
const showMenu = document.querySelector('.showMenu');

if (bentoMenu && closeBtn && showMenu) {
  let isMenuOpen = false;

  bentoMenu.addEventListener('click', () => {
    if (isMenuOpen) return;

    bentoMenu.classList.remove('show-anim-in');
    bentoMenu.classList.add('hide-anim-out');

    setTimeout(() => {
      closeBtn.classList.add('show');
      showMenu.classList.add('active');
      isMenuOpen = true;
    }, 100);
  });

  closeBtn.addEventListener('click', () => {
    closeBtn.classList.remove('show');
    showMenu.classList.remove('active');

    setTimeout(() => {
      bentoMenu.style.display = 'flex';
      bentoMenu.classList.remove('hide-anim-out');
      bentoMenu.classList.add('show-anim-in');
      isMenuOpen = false;
    }, 700);
  });
}