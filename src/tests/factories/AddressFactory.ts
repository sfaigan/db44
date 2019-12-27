import * as faker from 'faker';
import { Address } from '../../interfaces/Address';

export class AddressFactory {
  static new(data: {} = {}): Address {
    return { ...this.getFakeData(), ...data };
  }

  private static getFakeData(): Address {
    return {
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      line1: faker.address.streetAddress(),
      line2: faker.address.secondaryAddress(),
      city: faker.address.city(),
      province: faker.address.state(),
      country: faker.address.country(),
      postalCode: faker.address.zipCode(),
    };
  }
}
