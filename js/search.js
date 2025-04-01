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
        console.error('Error cargando datos', err);
    } finally {
        hideLoadingBar();
    }
}

window.addEventListener('DOMContentLoaded', fetchData);



