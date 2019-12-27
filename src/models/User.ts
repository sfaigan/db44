import { Model, ModelI } from './Model';
import { ObjectId } from 'mongodb';

export interface UserI extends ModelI {
  email: string;
  password: string;
  role: string;
  supplierId: null | ObjectId;
}

export class User extends Model implements UserI {
  static collection = 'users';

  email: string;
  password: string;
  role: string;
  supplierId: null | ObjectId;

  constructor(data: UserI) {
    super(data);
    this.collection = User.collection;
    this.email = data.email;
    this.password = data.password;
    this.role = data.role;
    this.supplierId = data.supplierId;
  }
}
