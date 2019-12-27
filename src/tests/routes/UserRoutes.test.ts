import { UserFactory } from '../factories/UserFactory';
import { User } from '../../models/User';
import request = require('../test_helpers/requestHelpers');
import { ObjectId } from 'mongodb';
import { ProductFactory } from '../factories/ProductFactory';
const parser = new DOMParser();

function convertSupplierIdToString(supplierId: null | ObjectId) {
  return supplierId == null ? '' : supplierId.toString();
}

describe('GET #index', () => {
  it('can see users details in columns', async () => {
    const admin = await request.loginAdmin();

    const response = await request.get('/users');
    const html = parser.parseFromString(response.text, 'text/html');
    const userRow = html.querySelector(
      'table.users-table > tbody.users-table-body > tr.user-row'
    );
    const userIdCell = userRow!.children[0].querySelector('a');
    const supplierIdCell = userRow!.children[3].querySelector('a');

    expect(userRow).not.toBeNull();
    expect(userRow!.children).not.toBeNull();
    expect(userRow!.children.length).toBe(5);
    expect(userIdCell!.innerHTML).toBe(admin._id.toString());
    expect(userRow!.children[1].innerHTML).toBe(admin.email);
    expect(userRow!.children[2].innerHTML).toBe(admin.role);
    expect(supplierIdCell!.innerHTML).toBe(
      convertSupplierIdToString(admin.supplierId)
    );
  });

  it('can see other users', async () => {
    const user = await UserFactory.persist();
    const admin = await request.loginAdmin();

    const response = await request.get('/users');
    const html = parser.parseFromString(response.text, 'text/html');
    const userRows = html.querySelector(
      'table.users-table > tbody.users-table-body'
    );
    const userRow = userRows!.children[0];
    const userIdCell = userRow!.children[0].querySelector('a');
    const supplierIdCell = userRow!.children[3].querySelector('a');

    expect(userIdCell!.innerHTML).toBe(user._id.toString());
    expect(userRow!.children[1].innerHTML).toBe(user.email);
    expect(userRow!.children[2].innerHTML).toBe(user.role);
    expect(supplierIdCell!.innerHTML).toBe(
      convertSupplierIdToString(user.supplierId)
    );
  });
});

describe('GET #show', () => {
  it('can see users email on the page', async () => {
    await request.loginAdmin();
    const user = await UserFactory.persist();

    const response = await request.get('/users/' + user._id);
    const html = parser.parseFromString(response.text, 'text/html');
    const userEmail = html.querySelector('h5.user-email');

    expect(userEmail).not.toBeNull();
    expect(userEmail!.innerHTML).toContain(user.email);
  });
});

describe('GET #edit', () => {
  it('can see users email form on the page', async () => {
    const user = await UserFactory.persist();
    await request.loginAdmin();

    const response = await request.get('/users/edit/' + user._id);
    const html = parser.parseFromString(response.text, 'text/html');
    const emailInput = html.querySelector(
      'form.edit-user-form > input.email-input'
    );

    expect(emailInput).not.toBeNull();
    expect(emailInput!.getAttribute('value')).toBe(user.email);
  });
});

describe('POST #create', () => {
  it('can register a new user customer', async () => {
    const userData = await UserFactory.new();

    await request.post('/users', {
      email: userData.email,
      password: userData.password,
      confirm_password: userData.password,
      role: userData.role,
      supplierId: userData.supplierId,
    });
    const userQuery = await User.findAll();

    expect(userQuery[0].password).toEqual(userData.password);
    expect(userQuery[0].role).toEqual('customer');
  });

  it('can register a new user supplier and see /products', async () => {
    const userData = await UserFactory.new({ role: 'supplier' });
    const product = await ProductFactory.persist();

    await request.post('/users', {
      email: userData.email,
      password: userData.password,
      confirm_password: userData.password,
      role: userData.role,
      inputSupplier: 'on',
      supplierId: product.supplier._id.toString(),
    });
    const userQuery = await User.findAll({ email: userData.email });

    expect(userQuery[0].password).toEqual(userData.password);
    expect(userQuery[0].role).toEqual('supplier');
    await request.login(userQuery[0]);
    const response = await request.get('/products');

    expect(response.text).toContain(product.name);
  });
});

describe('PUT #update', () => {
  it('can update users email', async () => {
    const user = await UserFactory.persist();
    const userData = await UserFactory.new();
    await request.loginAdmin();

    await request.put('/users/' + user._id, {
      email: userData.email,
    });
    const freshUser = await User.findById(user._id);

    expect(freshUser.email).toEqual(userData.email);
  });
});

describe('DELETE #delete', () => {
  it('can delete a user', async () => {
    const user = await UserFactory.persist();
    const sUserId = user._id.toString();
    await request.loginAdmin();

    await request.destroy('/users/' + sUserId);
    const userQuery = await User.findAll({ _id: sUserId });

    expect(userQuery).toEqual([]);
  });
});
