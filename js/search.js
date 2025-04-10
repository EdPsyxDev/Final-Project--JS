// const bentoMenu = document.querySelector('.bento-menu');
// const closeBtn = document.querySelector('.close-btn');
// const showMenu = document.querySelector('.showMenu');

// if (bentoMenu && closeBtn && showMenu) {
//   let isMenuOpen = false;

//   bentoMenu.addEventListener('click', () => {
//     if (isMenuOpen) return;

//     bentoMenu.classList.remove('show-anim-in');
//     bentoMenu.classList.add('hide-anim-out');

//     setTimeout(() => {
//       closeBtn.classList.add('show');
//       showMenu.classList.add('active');
//       isMenuOpen = true;
//     }, 100);
//   });

//   closeBtn.addEventListener('click', () => {
//     closeBtn.classList.remove('show');
//     showMenu.classList.remove('active');

//     setTimeout(() => {
//       bentoMenu.style.display = 'flex';
//       bentoMenu.classList.remove('hide-anim-out');
//       bentoMenu.classList.add('show-anim-in');
//       isMenuOpen = false;
//     }, 700);
//   });
// }

// /---/ //

const progressBar = document.querySelector('.md-progress-bar');

function showLoadingBar() {
    progressBar.classList.add('loading');
    progressBar.style.opacity = '1';
    progressBar.style.transform = 'translateZ(0) scaleY(1)';
}

function hideLoadingBar() {
    progressBar.style.opacity = '0';
    progressBar.style.transform = 'translateZ(0) scaleY(0)';
    
    setTimeout(() => {
        progressBar.classList.remove('loading');
    }, 400);
}

async function fetchData() {
    try {
        showLoadingBar();

        await new Promise(resolve => setTimeout(resolve, 2000));

    } catch (err) {
        console.error('...', err);
    } finally {
        hideLoadingBar();
    }
}

window.addEventListener('DOMContentLoaded', fetchData);

// /---/ //

const searchInput = document.getElementById('search-input');
const suggestionsBox = document.getElementById('suggestions');

searchInput.addEventListener('input', async () => {
  const query = searchInput.value.trim();

  if(!query) {
    suggestionsBox.innerHTML = '';
    suggestionsBox.style.display = 'none';
    suggestionsBox.classList.add('shows');
    return;
  }

  try {
    const res = await fetch(`https://api.lyrics.ovh/suggest/${encodeURIComponent(query)}`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);

    const data = await res.json();
    console.log('API response:', data);

    const results = data.data.slice(0, 15); // suggests limit

    if (results.length === 0) {
      suggestionsBox.innerHTML = '';
      suggestionsBox.style.display = 'none';
      suggestionsBox.classList.add('shows');
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
  
  
  suggestionsBox.addEventListener('click', (e) => {
    const item = e.target.closest('.suggestion.item');
    if (!item) return;
    
    const artist = item.dataset.artist;
    const title = item.dataset.title;
    
    const encodedArtist = encodeURIComponent(artist);
    const encodedTitle = encodeURIComponent(title);
    
    window.location.href = `/search.html?artist=${encodedArtist}&title=${encodedTitle}`;
  });
});

document.addEventListener('click', (e) => {
  if (!suggestionsBox.contains(e.target) && e.target !== searchInput) {
    suggestionsBox.classList.remove('shows');
  }
});

// /---/ //

const urlParams = new URLSearchParams(window.location.search);
const query = urlParams.get('query');

if (query) {
  console.log('query found:', query);
  loadResults(query);
}

async function loadResults(query) {
  const songsContainer = document.getElementById('songs-list');
  const artistsContainer = document.getElementById('artists-list');

  if (!songsContainer || !artistsContainer) {
    console.error('Missing result containers in the HTML');
    return;
  }

  songsContainer.innerHTML = '';
  artistsContainer.innerHTML = '';

  const spinner = document.createElement('div');
  spinner.className = 'loading-state';
  spinner.innerHTML = `
    <div class="loading-artists">
      <i class="fas fa-spinner"></i>
      <p>Loading results</p>
    </div>`;
  songsContainer.appendChild(spinner);

  try {
    const res = await fetch(`https://api.lyrics.ovh/suggest/${encodeURIComponent(query)}`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();

    spinner.remove();

    const results = data.data;
    if (results.length === 0) {
      showEmptyState(query);
      return;
    }

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

  } catch (err) {
    console.error('Error loading results:', err);
    spinner.remove();
    showEmptyState(query);
  }
}


function showEmptyState(query) {
  const songsContainer = document.getElementById('song-list');
  songsContainer.innerHTML = '';
  const empty = document.createElement('div');
  empty.className = "empty-state";
  empty.innerHTML = `
    <h1>No results found</h1>
    <span>We couldn't find anything for "${query}". Try another search.</span>`;
    songsContainer.appendChild(empty);
}

async function loadLyrics(artist, title) {
  const lyricsContainer = document.getElementById('lyrics-container');
  lyricsContainer.innerHTML = '';

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

    const lyricsBlock = document.createElement('div');
    lyricsBlock.className = 'lyrics-block';
    lyricsBlock.innerHTML = `<h2>${title} - ${artist}</h2><pre>${data.lyrics}</pre>`;
    lyricsContainer.appendChild(lyricsBlock); 
  } catch (err) {
    spinner.remove();
    lyricsContainer.innerHTML = `<p class="empty-state">Couldn't load lyrics for "${title}"</p>`;
    console.error('Error loading lyrics:', err);
  }
}

// /---/ //

const searchInputField = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');

function updateSearchResults() {
  const newQuery = searchInputField.value.trim();
  if (!newQuery) return;

  const encoded = encodeURIComponent(newQuery);
  const newURL = new URL(window.location.href);
  history.pushState({}, '', newURL);
  loadResults(encoded);
}

searchInputField.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') updateSearchResults();
});

searchButton.addEventListener('click', updateSearchResults);