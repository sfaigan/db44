const dbClient = require('../DbClient');

beforeAll(() => dbClient.connect('testing'));

beforeEach(() => dbClient.db.dropDatabase());

afterAll(() => dbClient.disconnect(true));
