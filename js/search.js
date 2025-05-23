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

const resultsPerPage = 5;
let currentPage = 1;
let currentResults = [];

let currentArtists = [];
let currentArtistsPage = 1;

let currentArtistSongs = [];
let currentArtistSongsPage = 1;


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
  progressBar.style.transition = 'opacity .5s ease, transform 1s ease';
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
    const results = data.data.slice(0, 15); // suggests limit (API limit)

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
  hideLoadingBar();
}

async function loadResults(query) {
  const songsContainer = document.getElementById('songs-list');
  const artistsContainer = document.getElementById('artists-list');
  const stateContainer = document.getElementById('search-state');
  const resultsHeader = document.getElementById('results-header');
  resultsHeader.textContent = `Results for "${query}".`;

  
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
      document.querySelector('.results-wrapper').classList.add('hidden');
      return;
    }
    
    const songImageUrls = results.map(song => song.album.cover_medium);
    const artistImageUrls = [...new Map(results.map(song => [song.artist.name, song.artist.picture_medium])).values()];

    await preloadImages([...songImageUrls, ...artistImageUrls]);

    songsContainer.innerHTML = '';
    artistsContainer.innerHTML = '';

    currentResults = results;
    renderSongsPage(currentPage);
    
    const uniqueArtists = [...new Map(results.map(song => [song.artist.name, song.artist])).values()];
    currentArtists = uniqueArtists;
    renderArtistsPage(currentArtistsPage);
    
    songsContainer.style.display = '';
    artistsContainer.style.display = '';
    stateContainer.innerHTML = '';
    hideLoadingBar();
    document.querySelector('.results-wrapper').classList.remove('hidden');


  } catch (err) {
    console.error('Error loading results:', err);
    stateContainer.innerHTML = `
    <div class="empty-state">
        <h1>No results found</h1>
        <span>We couldn't find anything for "${query}". Try another search.</span>
    </div>`;   
}}

function renderSongsPage(page) {
  const songsContainer = document.getElementById('songs-list');
  songsContainer.innerHTML = '';

  const start = (page - 1) * resultsPerPage;
  const end = start + resultsPerPage;
  const pageResults = currentResults.slice(start, end);

  pageResults.forEach(song => {
    const songItem = document.createElement('div');
    songItem.className = 'song-card';
    songItem.innerHTML = `
      <img src="${song.album.cover_medium}" alt="${song.title}">
      <div class="text">
        <h3>${song.title}</h3>
        <p>${song.artist.name}</p>
      </div>
    `;
    songItem.onclick = () => loadLyrics(song.artist.name, song.title);
    songsContainer.appendChild(songItem);
  });

  renderPagination(page);
}

function renderArtistsPage(page) {
  const artistsContainer = document.getElementById('artists-list');
  artistsContainer.innerHTML = '';

  const start = (page - 1) * resultsPerPage;
  const end = start + resultsPerPage;
  const pageArtists = currentArtists.slice(start, end);

  pageArtists.forEach(artist => {
    const artistItem = document.createElement('div');
    artistItem.className = 'artist-card';
    artistItem.innerHTML = `
      <img src="${artist.picture_medium}" alt="${artist.name}">
      <p>${artist.name}</p>
    `;
    artistItem.onclick = () => {
      loadArtistProfile(artist.name);
      document.getElementById('artist-profile').classList.remove('hidden');
    };

    artistsContainer.appendChild(artistItem);
  });

  renderArtistsPagination(page);
}

function renderArtistSongsPage(page) {
  const songsContainer = document.getElementById('artist-songs-list');
  songsContainer.innerHTML = '';

  const start = (page - 1) * resultsPerPage;
  const end = start + resultsPerPage;
  const songsToRender = currentArtistSongs.slice(start, end);

  songsToRender.forEach(song => {
    const songItem = document.createElement('div');
    songItem.className = 'song-card';
    songItem.innerHTML = `
      <img src="${song.album.cover_medium}" alt="${song.title}">
      <div class="text">
        <h3>${song.title}</h3>
        <p>${song.artist.name}</p>
      </div>
    `;
    songItem.onclick = () => loadLyrics(song.artist.name, song.title);
    songsContainer.appendChild(songItem);
  });

  renderArtistSongsPagination(page);
}


function renderArtistsPagination(activePage) {
  const artistsButtonsWrapper = document.getElementById('artists-buttons');
  artistsButtonsWrapper.innerHTML = '';

  const paginationContainer = document.createElement('div');
  paginationContainer.className = 'pagination-container';

  const totalPages = Math.ceil(currentArtists.length / resultsPerPage);

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement('button');
    btn.className = 'pagination-btn';
    btn.textContent = i;

    if (i === activePage) {
      btn.classList.add('active');
    }

    btn.addEventListener('click', () => {
      currentArtistsPage = i;
      renderArtistsPage(i);
    });

    paginationContainer.appendChild(btn);
  }

  artistsButtonsWrapper.appendChild(paginationContainer);
}

function renderPagination(activePage) {
  let paginationContainer = document.getElementById('pagination-container');

  if (!paginationContainer) {
    paginationContainer = document.createElement('div');
    paginationContainer.id = 'pagination-container';
    paginationContainer.className = 'pagination-container';
    document.getElementById('songs-buttons').appendChild(paginationContainer);
  }

  paginationContainer.innerHTML = '';

  const totalPages = Math.ceil(currentResults.length / resultsPerPage);

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement('button');
    btn.className = 'pagination-btn';
    btn.textContent = i;

    if (i === activePage) {
      btn.classList.add('active');
    }

    btn.addEventListener('click', () => {
      currentPage = i;
      renderSongsPage(i);
    });

    paginationContainer.appendChild(btn);
  }
}

function renderArtistSongsPagination(activePage) {
  let paginationContainer = document.getElementById('artist-pagination-container');

  if (!paginationContainer) {
    paginationContainer = document.createElement('div');
    paginationContainer.id = 'artist-pagination-container';
    paginationContainer.className = 'pagination-container';
    document.getElementById('artist-songs').appendChild(paginationContainer);
  }

  paginationContainer.innerHTML = '';

  const totalPages = Math.ceil(currentArtistSongs.length / resultsPerPage);

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement('button');
    btn.className = 'pagination-btn';
    btn.textContent = i;

    if (i === activePage) {
      btn.classList.add('active');
    }

    btn.addEventListener('click', () => {
      currentArtistSongsPage = i;
      renderArtistSongsPage(i);
    });

    paginationContainer.appendChild(btn);
  }
}


async function loadLyrics(artist, title) {
  const lyricsContainer = document.getElementById('lyrics-container');
  const resultsSection = document.getElementById('search-results');
  const defaultView = document.getElementById('default-view');

  const prevHeight = lyricsContainer.offsetHeight;
  lyricsContainer.style.minHeight = `${prevHeight}px`;
  lyricsContainer.style.transition = 'min height 1s ease';

  lyricsContainer.innerHTML = '';
  lyricsContainer.style.display = 'block';
  resultsSection.style.display = 'none';
  defaultView.style.display = 'none';

  showLoadingBar();

  const spinner = document.createElement('div');
  spinner.className = 'loading-state';
  spinner.innerHTML = `
    <div class="loading-artists">
      <i class="fas fa-spinner"></i>
      <p>Loading lyrics</p>
    </div>`;
  lyricsContainer.appendChild(spinner);

  try {
    const res = await fetch(`https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    
    const data = await res.json();
    spinner.remove();

    hideLoadingBar();

    lyricsContainer.innerHTML = '';

    if (!data.lyrics || data.lyrics.trim() === '') {
      lyricsContainer.innerHTML = 
      `<p class="empty-state">No lyrics available for "${title}" by ${artist}</p>`;

      smoothScrollToElement('lyrics-container', -50);
      setTimeout(() => {
        lyricsContainer.style.minHeight = '0';
      }, 300);

      return;
    }

    const lyricsBlock = document.createElement('div');
    lyricsBlock.className = 'lyrics-block';

    const paragraphs = data.lyrics.split(/\n{3,}/);
    const formattedParagraphs = paragraphs.map(paragraph => {
      const lines = paragraph
        .split('\n')
        .map(line => `<p>${line.trim()}</p>`)
        .join('');
      return `<div class="lyrics-paragraph">${lines}</div>`;
    }).join('');
    lyricsBlock.innerHTML = `<h2>${title} - ${artist}
    </h2><div class="lyrics-text">${formattedParagraphs}</div>`;

    lyricsContainer.appendChild(lyricsBlock);
    
    smoothScrollToElement('lyrics-container', -50);
    setTimeout(() => {
      lyricsContainer.style.minHeight = '0';
    }, 300);
  } catch (err) {
    console.error('Error loading lyrics:', err);
    spinner.remove();
    hideLoadingBar();
    lyricsContainer.innerHTML = `<p class="empty-state">Couldn't load lyrics for "${title}" by ${artist}. Please try another song.</p>`;
    smoothScrollToElement('lyrics-container', -50);
    setTimeout(() => {
      lyricsContainer.style.minHeight = '0';
    }, 300);
  }
}

// /---/ //

async function loadDefaultRandom() {
  const songsContainer = document.getElementById('discover-songs');
  const artistsContainer = document.getElementById('discover-artists');
  const progressBar = document.querySelector('.md-progress-bar');

  songsContainer.innerHTML = '';
  artistsContainer.innerHTML = '';

  const keywords = [
    'love', 'summer', 'night', 'dream', 'fire', 'life', 'star', 'feel', 'light', 'sound',
    'moon', 'sky', 'heart', 'time', 'dance', 'rain', 'home', 'lost', 'alone', 'baby',
    'fly', 'eyes', 'sun', 'hope', 'dark', 'kiss', 'pain', 'freedom', 'truth', 'wild',
    'run', 'angel', 'wind', 'shadow', 'broken', 'desire', 'cold', 'blue', 'fear', 'rise',
    'road', 'gold', 'fireworks', 'storm', 'sea', 'heaven', 'tears', 'lightning', 'glory', 'end'
  ];
  

  const fetches = await Promise.all(
    keywords.map(term =>  fetch(`https://api.lyrics.ovh/suggest/${encodeURIComponent(term)}`))
  );

  const allData = await Promise.all(
    fetches.map(async res => {
      if (!res.ok) return [];
      const data = await res.json();
      return data.data || [];
    })
  );

  const combinedResults = allData.flat();
  const shuffled = combinedResults.sort(() => 0.5 - Math.random());
  const randomSongs = shuffled.slice(0, 5); 
  const randomArtists = shuffled.slice(5, 10);

  randomSongs.forEach(song => {
    const songCard = document.createElement('div');
    songCard.className = 'random-item';
    songCard.innerHTML = `
      <img src="${song.album.cover_small}" alt="${song.title}">
      <div class="random-info">
          <h4>${song.title}</h4>
          <p>${song.artist.name}</p>
      </div>
    `;

    songCard.onclick = () => {
      const encodedArtist = encodeURIComponent(song.artist.name);
      const encodedTitle = encodeURIComponent(song.title);
      window.location.href = `search.html?artist=${encodedArtist}&title=${encodedTitle}`;
    };

    songsContainer.appendChild(songCard);
  });

  randomArtists.forEach(artist => {
    const artistCard = document.createElement('div');
    artistCard.className = 'random-item';
    artistCard.innerHTML = `
      <img src="${artist.artist.picture_small}" alt="${artist.artist.name}">
      <div class="random-info">
          <h4>${artist.artist.name}</h4>
      </div>
    `;
    artistCard.onclick = () => {
      loadArtistProfile(artist.artist.name);
      document.getElementById('artist-profile').classList.remove('hidden');
    };

    artistsContainer.appendChild(artistCard);
  });

  document.getElementById('artist-profile').classList.add('hidden');

  progressBar.style.opacity = '0';
  progressBar.style.transform = 'translateZ(0) scaleY(0)';
  const rec = document.getElementById('recommendations');
  rec.classList.remove('hidden');
  setTimeout(() => rec.classList.add('visible'), 50);
}

window.addEventListener('DOMContentLoaded', () => {
  loadDefaultRandom();
});

window.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    const defaultView = document.getElementById('default-view');
    defaultView.style.opacity = '1';
    defaultView.style.transform = 'translateY(0)';
    defaultView.style.transition = 'opacity .8s ease, transform .8s ease';
    defaultView.style.pointerEvents = 'auto';
  }, 1000);
});
// /---/ //

async function loadArtistProfile(artistName) {
  document.getElementById('default-view').style.display = 'none';
  document.getElementById('search-results').style.display = 'none';
  document.getElementById('lyrics-container').style.display = 'none';

  const profile = document.getElementById('artist-profile');
  profile.classList.remove('hidden');

  try {
    const res = await fetch(`https://api.lyrics.ovh/suggest/${encodeURIComponent(artistName)}`);
    const data = await res.json();
    if (!data || !Array.isArray(data.data) || data.data.length === 0) return;

    const songs = data.data;
    const artist = {
      name: artistName,
      picture_big: songs.find(song =>
        song.artist.name.toLowerCase() === artistName.toLowerCase())?.artist.picture_big || '',
    };

    const imageContainer = document.getElementById('artist-image-container');
    imageContainer.innerHTML = '';

    const img = document.createElement('img');
    img.src = artist.picture_big;
    img.alt = artist.name;
    img.className = 'artist-image';
    imageContainer.appendChild(img);

    document.getElementById('artist-name').textContent = artist.name;

    currentArtistSongs = songs.slice(0, 15);
    renderArtistSongsPage(1);

    smoothScrollToElement('artist-profile');

  } catch (err) {
    console.error('Error loading artist profile', err);
  }
}

// /---/ //

function smoothScrollToElement(elementId, offset = 0) {
  const element = document.getElementById(elementId);
  if (!element) return;

  const top = element.getBoundingClientRect().top + window.pageYOffset + offset;

  window.scrollTo({
    top, 
    behavior: 'smooth'
  });
}