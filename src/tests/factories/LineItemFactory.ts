import * as faker from 'faker';
import { LineItem } from '../../interfaces/LineItem';
import { ProductFactory } from './ProductFactory';
import { Product } from '../../models/Product';

export class LineItemFactory {
  static async persist(data: {} = {}): Promise<LineItem> {
    const product = await ProductFactory.persist();
    return { ...this.getFakeData(product), ...data };
  }

  static new(data: {} = {}): LineItem {
    return { ...this.getFakeData(), ...data };
  }

  private static getFakeData(product?: Product): LineItem {
    if (!product) {
      product = ProductFactory.new();
    }
    return {
      productId: product._id,
      quantity: faker.random.number(100),
    };
  }
}
