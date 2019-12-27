import request = require('../test_helpers/requestHelpers');
const parser = new DOMParser();

describe('GET #new', () => {
  it('can show login form when unauthenticated', async () => {
    const response = await request.get('/session/login').expect(200);
    const html = parser.parseFromString(response.text, 'text/html');
    const form = html.querySelector('.login-container > form.form-signin');

    expect(form).not.toBeNull();

    const emailInput = form!.querySelector('.input-email');
    const passwordInput = form!.querySelector('.input-password');

    expect(emailInput).not.toBeNull();
    expect(emailInput!.getAttribute('type')).toBe('email');
    expect(passwordInput).not.toBeNull();
    expect(passwordInput!.getAttribute('type')).toBe('password');
  });

  it('can show logged in when authenticated', async () => {
    await request.login();

    const response = await request.get('/session/login').expect(200);
    const html = parser.parseFromString(response.text, 'text/html');
    const message = html.querySelector('.login-container > p');

    expect(message).not.toBeNull();
    expect(message!.innerHTML).toBe('You are already logged in!');
  });
});

describe('POST #create', () => {
  it('can login a user', async () => {
    const user = await request.login();
    const response = await request.get('/').expect(200);
    const html = parser.parseFromString(response.text, 'text/html');
    const userEmail = html.querySelector('.navbar > .user-email');
    const logoutButton = html.querySelector('.navbar > a.btn-logout');

    expect(userEmail).not.toBeNull();
    expect(userEmail!.innerHTML).toBe(user.email);
    expect(logoutButton).not.toBeNull();
  });
});

describe('GET #delete', () => {
  it('can logout a user', async () => {
    await request.login();
    await request.get('/session/logout').expect(302);

    const response = await request.get('/').expect(200);
    const html = parser.parseFromString(response.text, 'text/html');
    const userEmail = html.querySelector('.navbar > .user-email');
    const registerButton = html.querySelector('.navbar > a.btn-register');
    const loginButton = html.querySelector('.navbar > a.btn-login');

    expect(userEmail).toBeNull();
    expect(registerButton).not.toBeNull();
    expect(loginButton).not.toBeNull();
  });
});
