import request = require('../test_helpers/requestHelpers');
const parser = new DOMParser();

describe('GET #index', () => {
  it('Can read welcome message', async () => {
    const response = await request.get('/').expect(200);
    const html = parser.parseFromString(response.text, 'text/html');
    const message = html.querySelector('.content-container > h1');

    expect(message).not.toBeNull();
    expect(message!.innerHTML).toBe('Welcome to db44!');
  });
});
