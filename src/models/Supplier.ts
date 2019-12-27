import { Model, ModelI } from './Model';
import { Address } from '../interfaces/Address';

export interface SupplierI extends ModelI {
  name: string;
  address: Address;
  phone: string;
  website: string;
}

export class Supplier extends Model implements SupplierI {
  static collection = 'suppliers';

  name: string;
  address: Address;
  phone: string;
  website: string;

  constructor(data: SupplierI) {
    super(data);
    this.collection = Supplier.collection;
    this.name = data.name;
    this.address = data.address;
    this.phone = data.phone;
    this.website = data.website;
  }
}
