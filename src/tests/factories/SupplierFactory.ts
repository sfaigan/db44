import { Supplier, SupplierI } from '../../models/Supplier';
import * as faker from 'faker';
import { ObjectId } from 'mongodb';
import { AddressFactory } from './AddressFactory';

export class SupplierFactory {
  // Create new Supplier and persist to database
  static async persist(data: {} = {}): Promise<any> {
    const merged = { ...this.getFakeData(), ...data };
    delete merged._id;

    return Supplier.create(merged);
  }
  // Create new Supplier without persisting to database
  static new(data: {} = {}): Supplier {
    const merged = { ...this.getFakeData(), ...data };

    return new Supplier(merged);
  }

  private static getFakeData(): SupplierI {
    const id = new ObjectId();
    return {
      _id: id,
      name: faker.lorem.words(3),
      address: AddressFactory.new(),
      phone: faker.phone.phoneNumber(),
      website: faker.internet.url(),
    };
  }
}
