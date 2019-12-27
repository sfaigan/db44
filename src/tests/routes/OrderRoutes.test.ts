import { OrderFactory } from '../factories/OrderFactory';
import { Order } from '../../models/Order';
import request = require('../test_helpers/requestHelpers');
import { Address } from '../../interfaces/Address';
import { LineItem } from '../../interfaces/LineItem';
const parser = new DOMParser();

function convertAddressObjectToDisplayedFormat(address: Address) {
  return [
    `${address.firstName} ${address.lastName}`,
    `${address.line1} ${address.line2}`,
    `${address.city}, ${address.province}, ${address.postalCode}`,
    `${address.country}`,
  ];
}

function parseAddressLinesHTML(address: HTMLCollection) {
  const parsedAddress = [];
  for (let i = 0; i < address.length; i++) {
    parsedAddress.push(address[i].textContent);
  }
  return parsedAddress;
}

function convertItemsArrayToDisplayedFormat(items: LineItem[]): string[] {
  return items.map((item: LineItem) => `${item.productId} x${item.quantity}`);
}

describe('GET #index', () => {
  it('can see order details in columns', async () => {
    const admin = await request.loginAdmin();
    const order = await OrderFactory.persist({ userId: admin._id });
    const parsedOrderBillingAddress = convertAddressObjectToDisplayedFormat(
      order.billingAddress
    );
    const parsedOrderShippingAddress = convertAddressObjectToDisplayedFormat(
      order.shippingAddress
    );
    const parsedOrderItems = convertItemsArrayToDisplayedFormat(order.items);

    const response = await request.get('/orders');
    const html = parser.parseFromString(response.text, 'text/html');
    const orderRow = html.querySelector(
      'table.order-table > tbody.order-table-body > tr.order-row'
    );
    const orderId = orderRow!.children[0].getElementsByTagName('a')[0]
      .innerHTML;
    const userId = orderRow!.children[1].getElementsByTagName('a')[0].innerHTML;
    const orderBillingAddress = parseAddressLinesHTML(
      orderRow!.children[2]!.children
    );
    const orderShippingAddress = parseAddressLinesHTML(
      orderRow!.children[3]!.children
    );
    const orderPaymentMethod = orderRow!.children[4];
    const orderStatus = orderRow!.children[5];
    expect(orderRow!.children.length).toBe(8);
    expect(orderId).toBe(order._id.toString());
    expect(userId).toBe(admin._id.toString());
    expect(orderBillingAddress).toEqual(parsedOrderBillingAddress);
    expect(orderShippingAddress).toEqual(parsedOrderShippingAddress);
    expect(orderPaymentMethod!.innerHTML).toBe(order.paymentMethod);
    expect(orderStatus!.innerHTML).toBe(order.status);
    for (let i = 0; i < orderRow!.children[6].children.length; i++) {
      expect(orderRow!.children[6].children[i].innerHTML).toBe(
        parsedOrderItems[i]
      );
    }
  });
});

describe('GET #show', () => {
  it('can see order details', async () => {
    const admin = await request.loginAdmin();
    const order = await OrderFactory.persist({ userId: admin._id });
    const parsedOrderBillingAddress = convertAddressObjectToDisplayedFormat(
      order.billingAddress
    );
    const parsedOrderShippingAddress = convertAddressObjectToDisplayedFormat(
      order.shippingAddress
    );
    const parsedOrderItems = convertItemsArrayToDisplayedFormat(order.items);
    const response = await request.get(`/orders/${order._id}`);
    const html = parser.parseFromString(response.text, 'text/html');
    const orderDetails = html.querySelector('div.order-details');
    const userId = orderDetails!.querySelector('.order-userId');
    const billingAddress = orderDetails!.querySelector(
      '.order-billing-address'
    );
    const shippingAddress = orderDetails!.querySelector(
      '.order-shipping-address'
    );
    const orderBillingAddress = parseAddressLinesHTML(billingAddress!.children);
    const orderShippingAddress = parseAddressLinesHTML(
      shippingAddress!.children
    );
    const paymentMethod = orderDetails!.querySelector('.order-payment-method');
    const status = orderDetails!.querySelector('.order-status');
    const items = orderDetails!.querySelector('.order-items');

    expect(orderDetails).not.toBeNull();
    expect(userId!.innerHTML).toContain(admin._id.toString());
    expect(orderBillingAddress).toEqual(parsedOrderBillingAddress);
    expect(orderShippingAddress).toEqual(parsedOrderShippingAddress);
    expect(paymentMethod!.innerHTML).toContain(order.paymentMethod);
    expect(status!.innerHTML).toContain(order.status);
    for (let i = 0; i < items!.children.length; i++) {
      expect(items!.children[i].innerHTML).toBe(parsedOrderItems[i]);
    }
  });
});

describe('GET #edit', () => {
  it('can see all editable order details on the page', async () => {
    const admin = await request.loginAdmin();
    const order = await OrderFactory.persist({ userId: admin._id });

    const response = await request.get(`/orders/edit/${order._id}`);
    const html = parser.parseFromString(response.text, 'text/html');
    const form = html.querySelector('form.edit-order-form');
    const userIdInput = form!.querySelector('input.userId-input');
    const billingAddressInput = form!.querySelector(
      'textarea.billing-address-input'
    );
    const shippingAddressInput = form!.querySelector(
      'textarea.shipping-address-input'
    );
    const paymentMethodInput = form!.querySelector(
      'input.payment-method-input'
    );
    const statusInput = form!.querySelector('input.status-input');
    const itemsInput = form!.querySelector('input.items-input');

    expect(form).not.toBeNull();
    expect(userIdInput!.getAttribute('value')).toBe(admin._id.toString());
    expect(billingAddressInput!.innerHTML).toBe(
      JSON.stringify(order.billingAddress, null, 2)
    );
    expect(shippingAddressInput!.innerHTML).toBe(
      JSON.stringify(order.shippingAddress, null, 2)
    );
    expect(paymentMethodInput!.getAttribute('value')).toBe(order.paymentMethod);
    expect(statusInput!.getAttribute('value')).toBe(order.status);
    expect(itemsInput!.getAttribute('value')).toBe(JSON.stringify(order.items));
  });
});

describe('PUT #update', () => {
  it('can update name associated with order', async () => {
    const order = await OrderFactory.persist();
    await request.loginAdmin();
    const firstName = 'Fake';
    const lastName = 'Name';

    await request.put(`/orders/${order._id}`, {
      shippingAddress: { ...order.shippingAddress, firstName, lastName },
    });
    const updatedOrder = await Order.findById(order._id);

    expect(updatedOrder.shippingAddress.firstName).toBe(firstName);
    expect(updatedOrder.shippingAddress.lastName).toBe(lastName);
  });
});

describe('DELETE #delete', () => {
  it('can delete an order', async () => {
    const order = await OrderFactory.persist();
    const sOrderId = order._id.toString();
    await request.loginAdmin();

    await request.destroy(`/orders/${sOrderId}`);
    const orderQuery = await Order.findAll({ _id: sOrderId });

    expect(orderQuery).toEqual([]);
  });
});
