let appToken;
const form = document.querySelector('form');
const alertBanner = document.querySelector('alert-banner');

form &&
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    switch (e.target.id) {
      case 'signin-form':
        handlers.signIn(e.target);
        break;
      case 'signup-form':
        handlers.signUp(e.target);
        break;
      default:
        return;
    }
  });
