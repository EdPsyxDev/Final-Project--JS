const button = document.querySelector('.input-wrapper button');

button.addEventListener('click', () => {
  if (!button.classList.contains('loading')) {
    button.classList.remove('not-loading');
    button.classList.add('loading');

    setTimeout(() => {
      button.classList.remove('loading');
      button.classList.add('not-loading');
    }, 2000);
  }
});
