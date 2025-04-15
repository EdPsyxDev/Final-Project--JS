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

const input = document.getElementById('main-input');
const button = document.getElementById('main-search-btn');

function handleSearch() {
  const query = input.value.trim();
  if (!query) {
    alert('Please enter something to search.');
    return;
  }

  if (!button.classList.contains('loading')) {
    button.classList.remove('not-loading');
    button.classList.add('loading');

    fetch(`https://api.lyrics.ovh/suggest/${encodeURIComponent(query)}`)
      .then(res => res.json())
      .then(data => {
        const encodedQuery = encodeURIComponent(query);
        window.location.href = `search.html?query=${encodedQuery}`;
      })
      .catch(err => {
        console.error('Error searching:', err);
        alert('Something went wrong.');
      });
  }
}

button.addEventListener('click', handleSearch);

input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') handleSearch();
});




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

// ========

const inputMain = document.getElementById('main-input');
const suggestionsBoxMain = document.getElementById('suggestions');

inputMain.addEventListener('input', async () => {
  const query = inputMain.value.trim();

  if (!query) {
    suggestionsBoxMain.innerHTML = '';
    suggestionsBoxMain.style.display = 'none';
    suggestionsBoxMain.classList.remove('shows');
    return;
  }

  try {
    const res = await fetch(`https://api.lyrics.ovh/suggest/${encodeURIComponent(query)}`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    
    const data = await res.json();
    const results = data.data.slice(0, 15);

    if (results.length === 0) {
      suggestionsBoxMain.innerHTML = '';
      suggestionsBoxMain.style.display = 'none';
      suggestionsBoxMain.classList.remove('shows');
      return;
    }

    suggestionsBoxMain.innerHTML = results.map(result => `
      <div class="suggestion-item" data-artist="${result.artist.name}" data-title="${result.title}">
        <img src="${result.artist.picture_small}" alt="${result.artist.name}">
        <div class="text">
          <span class="artist">${result.title}</span>
          <span class="title">${result.artist.name}</span>
        </div>
      </div>
    `).join('');
    suggestionsBoxMain.classList.add('shows');

    suggestionsBoxMain.style.display = 'block';

  } catch (err) {
    suggestionsBoxMain.innerHTML = '';
    suggestionsBoxMain.style.display = 'none';
    console.error('Error fetching suggestions:', err);
  }

  suggestionsBoxMain.addEventListener('click', (e) => {
    const item = e.target.closest('.suggestion-item');
    if (!item) return;

    const artist = item.dataset.artist;
    const title = item.dataset.title;

    const encodedArtist = encodeURIComponent(artist);
    const encodedTitle = encodeURIComponent(title);

    window.location.href = `/search.html?artist=${encodedArtist}&title=${encodedTitle}`;
  });
});



document.addEventListener('click', (e) => {
  if (!suggestionsBoxMain.contains(e.target) && e.target !== inputMain) {
    suggestionsBoxMain.classList.remove('shows');
  }
})

// ========
