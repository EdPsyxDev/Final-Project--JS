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
  
  
  // suggestionsBox.addEventListener('click', (e) => {
  //   const item = e.target.closest('.suggestion.item');
  //   if (!item) return;
    
  //   const artist = item.dataset.artist;
  //   const title = item.dataset.title;
    
  //   const encodedArtist = encodeURIComponent(artist);
  //   const encodedTitle = encodeURIComponent(title);
    
  //   window.location.href = `/search.html?artist=${encodedArtist}&title=${encodedTitle}`;  
    
  // });
  
});

// /---/ //

const urlParams = new URLSearchParams(window.location.search);
const query = urlParams.get('query');

if (query) {
  console.log('query found:', query);
  simulateSearch(query);
}

function simulateSearch(query) {
  const container = document.getElementById('lyrics');

  container.innerHTML = '';

  const spinner = document.createElement('div');
  spinner.className = 'loading-state'
  spinner.innerHTML = `
    <div class="loading-artists">
      <i class="fas fa-spinner"></i>
      <p>Loading results</p>
    </div>`;

  container.appendChild(spinner);
  
  setTimeout(() => {
    spinner.remove();
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.innerHTML = `
    <h1>No results found</h1>
    <span>We couldn't find anything for "${query}". Try another search.</span>`;
    container.appendChild(empty);
  }, 2000);
}
