import { Supplier } from '../../models/Supplier';
import { ProductFactory } from '../factories/ProductFactory';
import { SupplierFactory } from '../factories/SupplierFactory';
import request = require('../test_helpers/requestHelpers');
import { UserFactory } from '../factories/UserFactory';

const parser = new DOMParser();

describe('GET #index', () => {
  it('admin can see supplier details in columns', async () => {
    await request.loginAdmin();
    const supplier = await SupplierFactory.persist();

    const response = await request.get('/suppliers');
    const html = parser.parseFromString(response.text, 'text/html');
    const supplierRow = html.querySelector('tr.supplier-row');
    const supplierIdCell = supplierRow!.children[0].querySelector('a');
    const supplierWebsiteCell = supplierRow!.children[4].querySelector('a');

    expect(supplierRow!.children.length).toBe(6);
    expect(supplierIdCell!.innerHTML).toBe(supplier._id.toString());
    expect(supplierRow!.children[1].innerHTML).toBe(supplier.name);
    expect(supplierRow!.children[2].innerHTML).toContain(
      supplier.address.line1
    );
    expect(supplierRow!.children[3].innerHTML).toBe(supplier.phone);
    expect(supplierWebsiteCell!.innerHTML).toBe(supplier.website);
  });

  it('supplier cannot visit suppliers index page', async () => {
    await request.loginSupplier();
    const supplier = await SupplierFactory.persist();

    const response = await request.get('/suppliers');
    const html = parser.parseFromString(response.text, 'text/html');
    const supplierRow = html.querySelector('tr.supplier-row');

    expect(supplierRow).toBe(null);
    expect(response.status).toEqual(302);
  });
});

describe('GET #show', () => {
  it('can see suppliers email on the page', async () => {
    await request.loginAdmin();
    const supplier = await SupplierFactory.persist();

    const response = await request.get('/suppliers/' + supplier._id);
    const html = parser.parseFromString(response.text, 'text/html');
    const supplierName = html.querySelector('.supplier-name');

    expect(supplierName!.innerHTML).toContain(supplier.name);
  });
});

describe('GET #edit', () => {
  it('can see products email form on the page', async () => {
    const product = await ProductFactory.persist();
    await request.loginAdmin();

    const response = await request.get('/products/edit/' + product._id);
    const html = parser.parseFromString(response.text, 'text/html');
    const nameInput = html.querySelector('form.edit-product-form > input#name');

    expect(nameInput!.getAttribute('value')).toBe(product.name);
  });
});

describe('POST #create', () => {
  it('admin can add a new supplier ', async () => {
    const supplierData = await SupplierFactory.new();
    const supplier = await SupplierFactory.persist();
    await request.loginAdmin();

    await request.post('/suppliers', {
      name: supplierData.name,
      address: supplierData.address,
      phone: supplierData.phone,
      website: supplierData.website,
    });
    const supplierQuery = await Supplier.findAll({ name: supplierData.name });
    expect(supplierQuery[0].name).toEqual(supplierData.name);
    expect(supplierQuery[0].address).toEqual(supplierData.address);
    expect(supplierQuery[0].phone).toEqual(supplierData.phone);
    expect(supplierQuery[0].website).toEqual(supplierData.website);
  });
});
//
describe('PUT #update', () => {
  it('admin can update supplier info', async () => {
    const supplier = await SupplierFactory.persist();
    const supplierData = await SupplierFactory.new();
    await request.loginAdmin();

    await request.put('/suppliers/' + supplier._id.toString(), {
      name: supplierData.name,
      website: supplierData.website,
      address: supplierData.address,
      phone: supplierData.phone,
    });
    const supplierQuery = await Supplier.findById(supplier._id.toString());

    expect(supplierQuery.name).toEqual(supplierData.name);
  });

  it('supplier user can update their supplier info', async () => {
    const supplier = await SupplierFactory.persist();
    const user = await UserFactory.persist({
      role: 'supplier',
      supplierId: supplier._id,
    });
    const supplierData = await SupplierFactory.new();
    await request.login(user);

    await request.put('/suppliers/' + supplier._id.toString(), {
      name: supplierData.name,
      website: supplierData.website,
      address: supplierData.address,
      phone: supplierData.phone,
    });
    const supplierQuery = await Supplier.findById(supplier._id.toString());

    expect(supplierQuery.name).toEqual(supplierData.name);
  });

  it('supplier user cant update other suppliers info', async () => {
    const supplier = await SupplierFactory.persist();
    const user = await UserFactory.persist({ role: 'supplier' });
    const supplierData = await SupplierFactory.new();
    await request.login(user);

    await request.put('/suppliers/' + supplier._id.toString(), {
      name: supplierData.name,
      website: supplierData.website,
      address: supplierData.address,
      phone: supplierData.phone,
    });
    const supplierQuery = await Supplier.findById(supplier._id.toString());

    expect(supplierQuery.name).toEqual(supplier.name);
  });
});

describe('DELETE #delete', () => {
  it('admin can delete a supplier from their store', async () => {
    const supplier = await SupplierFactory.persist();
    await request.loginAdmin();

    await request.get('/suppliers/delete/' + supplier._id.toString());
    const supplierQuery = await Supplier.findById(supplier._id.toString());

    expect(supplierQuery).toEqual(null);
  });

  it('supplier user cant delete a supplier', async () => {
    const supplier = await SupplierFactory.persist();
    const supplierUser = await UserFactory.persist({
      role: 'supplier',
      supplierId: supplier._id,
    });
    await request.login(supplierUser);

    await request.get('/supplier/delete/' + supplier._id.toString());
    const supplierQuery = await Supplier.findById(supplier._id.toString());

    expect(supplierQuery._id).toEqual(supplier._id);
  });
});
