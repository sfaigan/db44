import { User } from '../../models/User';
const app = require('../../app');
import * as supertest from 'supertest';
import { UserFactory } from '../factories/UserFactory';
const agent = supertest.agent(app.app);

export async function login(aUser?: User) {
  let user;
  //I hate this language
  if (aUser === undefined) {
    user = await UserFactory.persist();
  } else {
    user = aUser;
  }

  await post('/session/authenticate', {
    email: user.email,
    password: user.password,
  }).expect(302);

  return user;
}

export async function loginAdmin() {
  const admin = await UserFactory.persist({ role: 'administrator' });

  return login(admin);
}

export async function loginSupplier() {
  const supplier = await UserFactory.persist({ role: 'supplier' });

  return login(supplier);
}

export function get(uri: string) {
  return agent.get(uri);
}

export function post(uri: string, data: {}) {
  return agent.post(uri).send(data);
}

export function put(uri: string, data: {}) {
  return agent.put(uri).send(data);
}

export function destroy(uri: string) {
  return agent.delete(uri);
}
