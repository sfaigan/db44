import { Product, ProductI } from '../../models/Product';
import * as faker from 'faker';
import { ObjectId } from 'mongodb';
import { SupplierFactory } from './SupplierFactory';

export class ProductFactory {
  // Create new Product and persist to database
  static async persist(data: Partial<ProductI> = {}): Promise<any> {
    const fakeData = await this.getFakeData();
    const merged = { ...fakeData, ...data };
    if (!data.supplier) {
      merged.supplier = await SupplierFactory.persist();
      merged.supplierId = merged.supplier._id;
    }
    delete merged._id;

    return Product.create(merged);
  }

  // Create new Product without persisting to database
  static new(data: {} = {}): Product {
    const merged = { ...this.getFakeData(), ...data };

    return new Product(merged);
  }

  private static getFakeData(): ProductI {
    const id = new ObjectId();
    const supplier = SupplierFactory.new();
    return {
      _id: id,
      supplier,
      supplierId: supplier._id,
      name: faker.lorem.words(3),
      description: faker.lorem.words(10),
      stock: faker.random.number({ min: 1, max: 100 }),
      price: faker.random.number({ min: 1, max: 5000 }),
      category: faker.lorem.words(1),
    };
  }
}
