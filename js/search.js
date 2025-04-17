function preloadImages(urls) {
  return Promise.all(urls.map(src => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = src;
      img.onload = resolve;
      img.onerror = reject;
    });
  }));
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

// /---/ //

const progressBar = document.querySelector('.md-progress-bar');

function showLoadingBar() {
  progressBar.classList.add('loading');
  progressBar.style.opacity = '1';
  progressBar.style.transform = 'translateZ(0) scaleY(1)';
}

function hideLoadingBar() {
  progressBar.style.transition = 'opacity .7s ease, transform .8s ease';
  progressBar.style.opacity = '0';
  progressBar.style.transform = 'translateZ(0) scaleY(0)';
  progressBar.classList.remove('loading');
}

// /---/ //

const searchInput = document.getElementById('search-input');
const suggestionsBox = document.getElementById('suggestions');
const searchButton = document.getElementById('search-button');

searchInput.addEventListener('input', async () => {
  const query = searchInput.value.trim();

  if(!query) {
    suggestionsBox.innerHTML = '';
    suggestionsBox.style.display = 'none';
    suggestionsBox.classList.remove('shows');
    return;
  }

  try {
    const res = await fetch(`https://api.lyrics.ovh/suggest/${encodeURIComponent(query)}`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);

    const data = await res.json();
    const results = data.data.slice(0, 15); // suggests limit

    if (results.length === 0) {
      suggestionsBox.innerHTML = '';
      suggestionsBox.style.display = 'none';
      suggestionsBox.classList.remove('shows');
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

      suggestionsBox.classList.add('shows');
      suggestionsBox.style.display = 'block';

    } catch (err) {
      console.error('Error finding suggest', err);
  }
  
  
});

searchInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    const query = searchInput.value.trim();
    if (!query) return;

    const encodedQuery = encodeURIComponent(query);
    window.location.href = `search.html?query=${encodedQuery}`;
  }
});

suggestionsBox.addEventListener('click', (e) => {
  const item = e.target.closest('.suggestion-item');
  if (!item) return;
  
  const artist = item.dataset.artist;
  const title = item.dataset.title;
  
  const encodedArtist = encodeURIComponent(artist);
  const encodedTitle = encodeURIComponent(title);
  
  window.location.href = `search.html?artist=${encodedArtist}&title=${encodedTitle}`;
});

searchButton.addEventListener('click', () => {
  const query = searchInput.value.trim();
  if (!query) return;

  const encodedQuery = encodeURIComponent(query);
  window.location.href = `search.html?query=${encodedQuery}`;
});


document.addEventListener('click', (e) => {
  if (!suggestionsBox.contains(e.target) && e.target !== searchInput) {
    suggestionsBox.style.display = 'none';
    suggestionsBox.classList.remove('shows');
  }
});

// /---/ //

const urlParams = new URLSearchParams(window.location.search);
const query = urlParams.get('query');
const artist = urlParams.get('artist');
const title = urlParams.get('title');

const defaultView = document.getElementById('default-view');
const resultsSection = document.getElementById('search-results');
const lyricsSection = document.getElementById('lyrics-container');

resultsSection.style.removeProperty('display');
lyricsSection.style.display = 'none';
defaultView.style.display = 'none';

if (artist && title) {
  loadLyrics(decodeURIComponent(artist), decodeURIComponent(title));
  defaultView.style.display = 'none';
} else if (query) {
  loadResults(query);
  lyricsSection.style.display = 'none';
  defaultView.style.display = 'none';
} else {
  defaultView.style.display = '';
  resultsSection.style.display = 'none';
  lyricsSection.style.display = 'none';
  loadDefaultView();
}

async function loadResults(query) {
  const songsContainer = document.getElementById('songs-list');
  const artistsContainer = document.getElementById('artists-list');
  const stateContainer = document.getElementById('search-state');
  
  stateContainer.innerHTML = '';

  const spinner = document.createElement('div');
  spinner.className = 'loading-state';
  spinner.innerHTML = `
    <div class="loading-artists">
      <i class="fas fa-spinner"></i>
      <p>Loading results</p>
    </div>`;
  stateContainer.appendChild(spinner);

  try {
    const res = await fetch(`https://api.lyrics.ovh/suggest/${encodeURIComponent(query)}`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();

    const results = data.data;
    if (results.length === 0) {
      showEmptyState(query);
      return;
    }

    const songImageUrls = results.map(song => song.album.cover_medium);
    const artistImageUrls = [...new Map(results.map(song => [song.artist.name, song.artist.picture_medium])).values()];

    await preloadImages([...songImageUrls, ...artistImageUrls]);

    songsContainer.innerHTML = '';
    artistsContainer.innerHTML = '';

    results.forEach(song => {
      const songItem = document.createElement('div');
      songItem.className = 'song-card';
      songItem.innerHTML = `
        <img src="${song.album.cover_medium}" alt="${song.title} cover">
        <div class="text">
          <h3>${song.title}</h3>
          <p>${song.artist.name}</p>
        </div>
      `;
      songItem.onclick = () => loadLyrics(song.artist.name, song.title);
      songsContainer.appendChild(songItem);
    });

    const uniqueArtists = [...new Map(results.map(song => [song.artist.name, song.artist])).values()];
    uniqueArtists.forEach(artist => {
      const artistItem = document.createElement('div');
      artistItem.className = 'artist-card';
      artistItem.innerHTML = `
        <img src="${artist.picture_medium}" alt="${artist.name}">
        <p>${artist.name}</p>
      `;
      artistsContainer.appendChild(artistItem);
    });
    
  
    songsContainer.style.display = '';
    artistsContainer.style.display = '';
    stateContainer.innerHTML = '';
    hideLoadingBar();


  } catch (err) {
    console.error('Error loading results:', err);
    stateContainer.innerHTML = `
    <div class="empty-state">
        <h1>No results found</h1>
        <span>We couldn't find anything for"${query}. Try another search."</span>
    </div>`;   
}}


function showEmptyState(query) {
  const stateContainer = document.getElementById('search-state');
  stateContainer.innerHTML = `
    <div class="empty-state">
      <h1>No results found</h1>
      <span>We couldn't find anything for "${query}". Try another search.</span>
    </div>`;
}


async function loadLyrics(artist, title) {
  const lyricsContainer = document.getElementById('lyrics-container');
  const resultsSection = document.getElementById('search-results');
  const defaultView = document.getElementById('default-view');

  lyricsContainer.innerHTML = '';

  showLoadingBar();

  const spinner = document.createElement('div');
  spinner.className = 'loading-state';
  spinner.innerHTML = `
    <div class="loading-artists">
      <i class="fas fa-spinner"></i>
      <p>Loading lyrics</p>
    </div>`;
  lyricsContainer.appendChild(spinner);

  lyricsContainer.style.display = '';
  resultsSection.style.display = 'none';
  defaultView.style.display = 'none';

  try {
    const res = await fetch(`https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    
    const data = await res.json();
    spinner.remove();
    hideLoadingBar();

    if (!data.lyrics || data.lyrics.trim() === '') {
      const empty = document.createElement('p');
      empty.className = 'empty-state';
      empty.textContent = `No lyrics available for "${title}" by ${artist}`;
      lyricsContainer.appendChild(empty);
      return;
    }

    const lyricsBlock = document.createElement('div');
    lyricsBlock.className = 'lyrics-block';
    lyricsBlock.innerHTML = `<h2>${title} - ${artist}</h2><pre>${data.lyrics}</pre>`;
    lyricsContainer.appendChild(lyricsBlock); 

  } catch (err) {
    console.error('Error loading lyrics:', err);
    spinner.remove();
    hideLoadingBar();

    const errorMsg = document.createElement('p');
    errorMsg.className = 'empty-state';
    errorMsg.textContent = `Couldn't load lyrics for "${title}" by ${artist}. Please try another song.`;
    lyricsContainer.appendChild(errorMsg);
  }
}


// /---/ //






// /---/ //

