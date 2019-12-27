import { ObjectId } from 'mongodb';
import { Model, ModelI } from './Model';
import { Product } from './Product';
import { Address } from '../interfaces/Address';
import {
  LineItem,
  LineItemUpdate,
  ParsedLineItem,
} from '../interfaces/LineItem';

export interface OrderI extends ModelI {
  userId: ObjectId;
  billingAddress: Address;
  shippingAddress: Address;
  paymentMethod: string;
  status: string;
  items: LineItem[];
}

export class Order extends Model implements OrderI {
  static collection = 'orders';

  userId: ObjectId;
  billingAddress: Address;
  shippingAddress: Address;
  paymentMethod: string;
  status: string;
  items: LineItem[];

  constructor(data: OrderI) {
    super(data);
    this.collection = Order.collection;
    this.userId = data.userId;
    this.billingAddress = data.billingAddress;
    this.shippingAddress = data.shippingAddress;
    this.paymentMethod = data.paymentMethod;
    this.status = data.status;
    this.items = data.items;
  }

  static async getCartFromUserId(userId: string) {
    const result = await this.findAll({
      userId: new ObjectId(userId),
      status: 'cart',
    });
    if (!result.length) {
      return this.createCart(userId);
    }
    return result[0];
  }

  static async createCart(userId: string) {
    const result = await this.create({
      userId: new ObjectId(userId),
      billingAddress: {},
      shippingAddress: {},
      paymentMethod: '',
      status: 'cart',
      items: [],
    });
    return result;
  }

  static async addToCart(userId: string, sProductId: string, quantity: number) {
    const productId = new ObjectId(sProductId);
    const lineItem: LineItem = {
      productId,
      quantity,
    };
    const cart = await this.getCartFromUserId(userId);
    const items: LineItem[] = cart.items;
    console.log(items);
    const itemIndex = items.findIndex(
      item => item.productId.toString() === productId.toString()
    );
    if (itemIndex === -1) {
      items.push(lineItem);
    } else {
      items[itemIndex].quantity += quantity;
    }
    return cart.update({
      items,
    });
  }

  static async updateCart(userId: string, products: LineItemUpdate[]) {
    const lineItems = products.reduce(
      (filtered: LineItem[], rawLineItem: LineItemUpdate) => {
        if (!rawLineItem.delete) {
          const lineItem = {
            productId: new ObjectId(rawLineItem.productId),
            quantity: Number.parseInt(rawLineItem.quantity, 10),
          };
          filtered.push(lineItem);
        }
        return filtered;
      },
      []
    );
    const numItemsInCart = await Order.getNumberOfItemsInCart(lineItems);
    const cart = await this.getCartFromUserId(userId);
    await cart.update({
      items: lineItems,
    });
    return numItemsInCart;
  }

  static async parseLineItems(lineItems: LineItem[]) {
    // I tried to write this with Array.prototype.map but it does NOT play nice with async/await
    const products = [];
    for (let i = 0; i < lineItems.length; i++) {
      const product = await Product.findById(lineItems[i].productId.toString());
      products.push({
        productId: product._id,
        name: product.name,
        description: product.description,
        quantity: lineItems[i].quantity,
        price: Math.ceil(product.price * lineItems[i].quantity * 100) / 100,
        category: product.category,
        supplierName: product.supplier
          ? product.supplier.name
          : product.supplierId,
      } as ParsedLineItem);
    }
    return products;
  }

  static async getNumberOfItemsInCartFromUserId(userId: string) {
    const cart = await this.getCartFromUserId(userId);
    return this.getNumberOfItemsInCart(cart.items);
  }

  static async getNumberOfItemsInCart(items: LineItem[]) {
    const initialValue = 0;
    const sum = items.reduce(
      (count: number, item: LineItem) => count + item.quantity,
      initialValue
    );
    return sum;
  }

  // Takes a parsed list of line items
  static async getTotalCostOfItems(parsedItems: ParsedLineItem[]) {
    const initialValue = 0;
    const sum = parsedItems.reduce(
      (accumulator: number, item: ParsedLineItem) => accumulator + item.price,
      initialValue
    );
    return Math.ceil(sum * 100) / 100;
  }
}
