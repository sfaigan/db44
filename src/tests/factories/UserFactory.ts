import { User, UserI } from '../../models/User';
import * as faker from 'faker';
import { ObjectId } from 'mongodb';

export class UserFactory {
  // Create new User and persist to database
  static async persist(data: Partial<UserI> = {}): Promise<any> {
    const merged = { ...this.getFakeData(), ...data };
    delete merged._id;

    return User.create(merged);
  }
  // Create new User without persisting to database
  static new(data: Partial<UserI> = {}): User {
    const merged = { ...this.getFakeData(), ...data };

    return new User(merged);
  }

  private static getFakeData(): UserI {
    const id = new ObjectId();
    return {
      _id: id,
      email: faker.internet.email(),
      password: faker.lorem.word(),
      role: 'customer',
      supplierId: null,
    };
  }
}
