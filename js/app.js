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

const searchmain = document.getElementById('search-input');
const suggestionsBox = document.getElementById('suggestions');

searchmain.addEventListener('input', async () => {
  const query = searchmain.value.trim();

  if(!query) {
    suggestionsBox.innerHTML = '';
    suggestionsBox.style.display = 'none';
    return;
  }

  try {
    const res = await fetch(`https://api.lyrics.ovh/suggest/${encodeURIComponent(query)}`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);

    const data = await res.json();
    console.log('API response:', data);

    const results = data.data.slice(0, 20); // suggests limit

    if (results.length === 0) {
      suggestionsBox.innerHTML = '';
      suggestionsBox.style.display = 'none';
      return;
    }

    suggestionsBox.innerHTML = results.map(result => `
      <div class="suggestion-item" data-artist="${result.artist.name}" data-title="${result.title}">
        <img src="${result.artist.picture_small}" alt="${result.artist.name}">
        <div class="text">
          <span class="artist">${result.title}</span>
          <span class="title">${result.artist.name}</span>
        </div>
      </div>
      `).join('');

      suggestionsBox.style.display = 'block';

    } catch (err) {
      console.error('Error finding suggest', err);
  }  
});
  
  // suggestionsBox.addEventListener('click', (e) => {
  //   const item = e.target.closest('.suggestion.item');
  //   if (!item) return;
    
  //   const artist = item.dataset.artist;
  //   const title = item.dataset.title;
    
  //   const encodedArtist = encodeURIComponent(artist);
  //   const encodedTitle = encodeURIComponent(title);
    
  //   window.location.href = `/search.html?artist=${encodedArtist}&title=${encodedTitle}`;  
    
  // });
  