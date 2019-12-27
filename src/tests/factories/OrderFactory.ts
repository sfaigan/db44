import { Order, OrderI } from '../../models/Order';
import { LineItem } from '../../interfaces/LineItem';
import * as faker from 'faker';
import { ObjectId } from 'mongodb';
import { AddressFactory } from './AddressFactory';
import { LineItemFactory } from './LineItemFactory';

export class OrderFactory {
  // Create new Order and persist to database
  static async persist(data: Partial<OrderI> = {}): Promise<any> {
    let items = data.items ? data.items : [];
    if (!items) {
      const item = await LineItemFactory.persist();
      items = [item];
    }

    const merged = { ...this.getFakeData(items), ...data };
    delete merged._id;

    return Order.create(merged);
  }

  // Create new Order without persisting to database
  static new(data: {} = {}): Order {
    const merged = { ...this.getFakeData(), ...data };

    return new Order(merged);
  }

  private static getFakeData(items?: LineItem[]): OrderI {
    const id = new ObjectId();
    const userId = new ObjectId();
    const billingAddress = AddressFactory.new();
    const shippingAddress = AddressFactory.new();
    const numItems = faker.random.number(18);
    if (!items) {
      items = new Array(numItems).fill(null).map(LineItemFactory.new);
    }

    return {
      _id: id,
      userId,
      billingAddress,
      shippingAddress,
      paymentMethod: 'Credit Card',
      status: 'confirmed',
      items,
    };
  }
}
