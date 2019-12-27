import { Product } from '../../models/Product';
import { ProductFactory } from '../factories/ProductFactory';
import { SupplierFactory } from '../factories/SupplierFactory';
import { UserFactory } from '../factories/UserFactory';
import request = require('../test_helpers/requestHelpers');

const parser = new DOMParser();

describe('GET #index', () => {
  it('admin can see product details in columns', async () => {
    await request.loginAdmin();
    const product = await ProductFactory.persist();

    const response = await request.get('/products');
    const html = parser.parseFromString(response.text, 'text/html');
    const productRow = html.querySelector('tr.product-row');
    const productIdCell = productRow!.children[0].querySelector('a');
    const supplierIdCell = productRow!.children[1].querySelector('a');

    expect(productRow!.children.length).toBe(7);
    expect(productIdCell!.innerHTML).toBe(product._id.toString());
    expect(supplierIdCell!.innerHTML).toBe(product.supplierId.toString());
    expect(productRow!.children[2].innerHTML).toBe(product.name);
    expect(productRow!.children[3].innerHTML).toBe(product.category);
    expect(productRow!.children[4].innerHTML).toBe(
      '$' + product.price.toString()
    );
    expect(productRow!.children[5].innerHTML).toBe(product.stock.toString());
  });

  it('product cannot visit products page', async () => {
    await request.login();
    const product = await ProductFactory.persist();

    const response = await request.get('/products');

    const html = parser.parseFromString(response.text, 'text/html');
    const productRow = html.querySelector('tr.product-row');

    expect(productRow).toBe(null);
    expect(response.status).toEqual(302);
  });
});

describe('GET #show', () => {
  it('can see products email on the page', async () => {
    await request.loginAdmin();
    const product = await ProductFactory.persist();

    const response = await request.get('/products/' + product._id);
    const html = parser.parseFromString(response.text, 'text/html');
    const productName = html.querySelector('.product-name');

    expect(productName!.innerHTML).toContain(product.name);
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
//
describe('POST #create', () => {
  it('admin can add a new product ', async () => {
    const productData = await ProductFactory.new();
    const supplier = await SupplierFactory.persist();
    await request.loginAdmin();

    await request.post('/products', {
      name: productData.name,
      description: productData.description,
      stock: productData.stock.toString(),
      price: productData.price.toString(),
      category: productData.category,
      supplierId: supplier._id.toString(),
    });
    const productQuery = await Product.findAll({ name: productData.name });
    expect(productQuery[0].description).toEqual(productData.description);
    expect(productQuery[0].stock).toEqual(productData.stock);
    expect(productQuery[0].price).toEqual(productData.price);
    expect(productQuery[0].category).toEqual(productData.category);
    expect(productQuery[0].supplierId).toEqual(supplier._id);
  });

  it('supplier user can add a new product to their store', async () => {
    const productData = await ProductFactory.new();
    const supplier = await SupplierFactory.persist();
    const supplierUser = await UserFactory.persist({
      role: 'supplier',
      supplierId: supplier._id,
    });
    await request.login(supplierUser);

    await request.post('/products', {
      name: productData.name,
      description: productData.description,
      stock: productData.stock.toString(),
      price: productData.price.toString(),
      category: productData.category,
      supplierId: supplier._id.toString(),
    });

    const productQuery = await Product.findAll({ name: productData.name });
    expect(productQuery[0].description).toEqual(productData.description);
    expect(productQuery[0].stock).toEqual(productData.stock);
    expect(productQuery[0].price).toEqual(productData.price);
    expect(productQuery[0].category).toEqual(productData.category);
    const response = await request.get('/store');
    expect(response.text).toContain(productData.name);
  });

  it('supplier user cant add a new product to their another store', async () => {
    const productData = await ProductFactory.new();
    const supplier1 = await SupplierFactory.persist();
    const supplier2 = await SupplierFactory.persist();
    const supplierUser1 = await UserFactory.persist({
      supplierId: supplier1._id,
    });
    await request.login(supplierUser1);

    await request.post('/products', {
      name: productData.name,
      description: productData.description,
      stock: productData.stock.toString(),
      price: productData.price.toString(),
      category: productData.category,
      supplierId: supplier2._id.toString(),
    });
    const productQuery = await Product.findAll({ name: productData.name });

    expect(productQuery).toHaveLength(0);
  });
});

describe('PUT #update', () => {
  it('supplier user can update a product from their store', async () => {
    const product = await ProductFactory.persist();
    const productData = await ProductFactory.new();
    const supplierUser = await UserFactory.persist({
      role: 'supplier',
      supplierId: product.supplierId,
    });
    await request.login(supplierUser);

    await request.put('/products/' + product._id.toString(), {
      name: productData.name,
      description: productData.description,
      stock: productData.stock.toString(),
      price: productData.price.toString(),
      category: productData.category,
    });

    const productQuery = await Product.findById(product._id.toString());
    expect(productQuery.description).toEqual(productData.description);
    expect(productQuery.stock).toEqual(productData.stock);
    expect(productQuery.price).toEqual(productData.price);
    expect(productQuery.category).toEqual(productData.category);
  });

  it('supplier user cant update product from another store', async () => {
    const product = await ProductFactory.persist();
    const productData = await ProductFactory.new();
    const otherSupplier = await SupplierFactory.persist();
    const supplierUser = await UserFactory.persist({
      role: 'supplier',
      supplierId: otherSupplier._id,
    });
    await request.login(supplierUser);

    await request.put('/products/' + product._id.toString(), {
      name: productData.name,
      description: productData.description,
      stock: productData.stock.toString(),
      price: productData.price.toString(),
      category: productData.category,
    });
    const productQuery = await Product.findById(product._id.toString());

    expect(productQuery.name).toEqual(product.name);
  });
});

describe('DELETE #delete', () => {
  it('supplier user can delete a product from their store', async () => {
    const product = await ProductFactory.persist();
    const supplierUser = await UserFactory.persist({
      role: 'supplier',
      supplierId: product.supplierId,
    });
    await request.login(supplierUser);

    await request.get('/products/delete/' + product._id.toString());
    const productQuery = await Product.findById(product._id.toString());

    expect(productQuery).toEqual(null);
  });

  it('supplier user cant delete a product from another store', async () => {
    const product = await ProductFactory.persist();
    const otherSupplier = await SupplierFactory.persist();
    const supplierUser = await UserFactory.persist({
      role: 'supplier',
      supplierId: otherSupplier._id,
    });
    await request.login(supplierUser);

    await request.get('/products/delete/' + product._id.toString());
    const productQuery = await Product.findById(product._id.toString());

    expect(productQuery._id).toEqual(product._id);
  });
});
