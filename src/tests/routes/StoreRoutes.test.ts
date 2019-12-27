import { ProductFactory } from '../factories/ProductFactory';
import request = require('../test_helpers/requestHelpers');
import { Supplier } from '../../models/Supplier';
const parser = new DOMParser();

describe('GET #index', () => {
  it('can see products in store', async () => {
    const product1 = await ProductFactory.persist();
    const product2 = await ProductFactory.persist();

    const response = await request.get('/store');
    const html = parser.parseFromString(response.text, 'text/html');
    const productCards = html.querySelectorAll('.product-card');

    expect(productCards.length).toBe(2);

    const product1CardName = productCards[0].querySelector(
      '.card-body > h4.product-name > a'
    );
    const product1CardPrice = productCards[0].querySelector(
      '.card-body > h5.product-price'
    );
    const product1CardDescription = productCards[0].querySelector(
      '.card-body > p.product-description'
    );
    const product2CardName = productCards[1].querySelector(
      '.card-body > h4.product-name > a'
    );
    const product2CardPrice = productCards[1].querySelector(
      '.card-body > h5.product-price'
    );
    const product2CardDescription = productCards[1].querySelector(
      '.card-body > p.product-description'
    );

    expect(product1CardName!.innerHTML).toBe(product1.name);
    expect(product1CardPrice!.innerHTML).toBe('$' + product1.price.toString());
    expect(product1CardDescription!.innerHTML).toBe(product1.description);
    expect(product2CardName!.innerHTML).toBe(product2.name);
    expect(product2CardPrice!.innerHTML).toBe('$' + product2.price.toString());
    expect(product2CardDescription!.innerHTML).toBe(product2.description);
  });

  it('can filter products by multiple categories', async () => {
    const product1 = await ProductFactory.persist();
    const product2 = await ProductFactory.persist();
    const product3 = await ProductFactory.persist();

    const response = await request.get(
      encodeURI(
        `/store?categories[0]=${product1.category}&categories[1]=${product2.category}`
      )
    );
    const html = parser.parseFromString(response.text, 'text/html');
    const category0 = html.querySelector('#categories_0');
    const category1 = html.querySelector('#categories_1');
    const category2 = html.querySelector('#categories_2');

    expect(category0!.hasAttribute('checked')).toBeTruthy();
    expect(category1!.hasAttribute('checked')).toBeTruthy();
    expect(category2!.hasAttribute('checked')).toBeFalsy();
    expect(response.text).toContain(product1.name);
    expect(response.text).toContain(product2.name);
    expect(response.text).not.toContain(product3.name);
  });

  it('can filter products by multiple suppliers', async () => {
    const product1 = await ProductFactory.persist();
    const product2 = await ProductFactory.persist();
    const product3 = await ProductFactory.persist();

    const response = await request.get(
      encodeURI(
        `/store?suppliers[0]=${product1.supplier._id}&suppliers[1]=${product2.supplier._id}`
      )
    );
    const html = parser.parseFromString(response.text, 'text/html');
    const supplier0 = html.querySelector('#suppliers_0');
    const supplier1 = html.querySelector('#suppliers_1');
    const supplier2 = html.querySelector('#suppliers_2');

    expect(supplier0!.hasAttribute('checked')).toBeTruthy();
    expect(supplier1!.hasAttribute('checked')).toBeTruthy();
    expect(supplier2!.hasAttribute('checked')).toBeFalsy();
    expect(response.text).toContain(product1.name);
    expect(response.text).toContain(product2.name);
    expect(response.text).not.toContain(product3.name);
  });
});

describe('GET #show', () => {
  it('can see product in store', async () => {
    const product = await ProductFactory.persist();
    const response = await request.get('/store/' + product._id);
    const html = parser.parseFromString(response.text, 'text/html');
    const productName = html.querySelector('.product-name');

    expect(productName!.innerHTML).toContain(product.name);
  });
});
