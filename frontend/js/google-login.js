const GOOGLE_CLIENT_ID = '501580655368-vaet66j3vfr1nsvh0f4gd5ek1m54qs7f.apps.googleusercontent.com';

function handleCredentialResponse(response) {
  if (!response?.credential) {
    alert('Error al recibir credencial de Google.');
    return;
  }

  const body = new URLSearchParams();
  body.append('credential', response.credential);

  fetch('../backend/google_login.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  })
    .then((res) => res.text())
    .then((html) => {
      document.open();
      document.write(html);
      document.close();
    })
    .catch(() => {
      alert('No se pudo iniciar sesión con Google. Reintente más tarde.');
    });
}

let googleInitialized = false;

function handleGoogleButtonClick() {
  if (!window.google?.accounts?.id) {
    alert('La librería de Google aún no está lista. Recarga la página y vuelve a intentarlo.');
    return;
  }

  google.accounts.id.disableAutoSelect();
  google.accounts.id.prompt();
}

function initGoogleSignIn() {
  const button = document.getElementById('google-signin-button');
  if (!button) {
    return;
  }

  if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID === 'TU_CLIENT_ID_DE_GOOGLE_AQUI') {
    console.warn('Google Client ID no está configurado en frontend/js/google-login.js');
    button.disabled = true;
    return;
  }

  if (!window.google?.accounts?.id) {
    button.addEventListener('click', () => {
      alert('La librería de Google aún no está lista. Recarga la página y vuelve a intentarlo.');
    });
    return;
  }

  if (!googleInitialized) {
    google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleCredentialResponse,
      ux_mode: 'popup',
    });
    googleInitialized = true;
  }

  button.addEventListener('click', handleGoogleButtonClick);
}

window.addEventListener('load', initGoogleSignIn);
