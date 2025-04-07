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

const filterBtn = document.getElementById('filter-btn');
const filterPanel = document.querySelector('.filter-panel');

let isMenuOpen = false;

filterBtn.addEventListener('click', () => {
  if (!isMenuOpen) {
    filterPanel.style.maxWidth = '320px';
    filterPanel.style.opacity = '1';

    setTimeout(() => {
      filterPanel.style.maxHeight = '1500px';
      filterPanel.style.transform = 'translateY(0)';
    }, 320);
    
    isMenuOpen = true;
  }
  else {
    filterPanel.style.maxHeight = '10px';
    filterPanel.style.transform = 'translateY(-10px)';
    filterPanel.style.opacity = '0';


    setTimeout

    setTimeout(() => {
      filterPanel.style.maxWidth = '0px';
      filterPanel.style.maxHeight = '-20px';
    }, 300);
  
    isMenuOpen = false;
  }
});

const input = document.getElementById('search-input');
const searchIcon = document.querySelector('.search-wrapper');

function handleSearch() {
  const query = input.ariaValueMax.trim();
  if (query) {
    const encodedQuery = encodeURIComponent(query);
    window.location.href = `/search.html?query=${encodedQuery}`;
  }
}

input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    handleSearch();
  }
})

searchIcon.addEventListener('click', handleSearch);


const urlParams = new URLSearchParams(window.location.search);
const query = urlParams.get('query');

if (query) {
  console.log('query found:', query);
  simulateSearch(query);
}

function simulateSearch(query) {
  const container = document.getElementById('artists');

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
