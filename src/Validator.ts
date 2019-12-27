import validation = require('./validation.json');
import DbClient = require('./DbClient');
import { ObjectId } from 'mongodb';

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

interface DataI {
  [key: string]: any;
}

interface ValidationI {
  required: string[];
  unique: string[];
}

export class Validator {
  private rules: ValidationI;
  private collection: string;

  errors: string[];

  constructor(collection: string) {
    this.collection = collection;
    this.rules = (validation as any)[collection];
    this.errors = [];
  }
  //Providing Id indicates update action
  async validate(data: DataI, _id?: ObjectId) {
    if (this.rules.required) {
      this.validateRequired(data, !!_id);
    }
    if (this.rules.unique) {
      await this.validateUnique(data, _id);
    }
    if (this.errors.length > 0) {
      throw new ValidationError(this.errors.join(' '));
    }
  }

  private validateRequired(data: DataI, isUpdate: boolean) {
    this.rules.required.forEach(property => {
      if (!data[property] && (data.hasOwnProperty(property) || !isUpdate)) {
        this.errors.push(this.formatError(property, 'is required.'));
      }
    });
  }

  private async validateUnique(data: DataI, _id?: ObjectId) {
    for (const property of this.rules.unique) {
      const value = data[property];
      if (value) {
        const filter: DataI = {};
        filter[property] = data[property];
        const result = await DbClient.getCollection(this.collection).findOne(
          filter
        );

        if (
          result &&
          (!_id || (_id && result._id.toString() !== _id.toString()))
        ) {
          this.errors.push(
            this.formatError(property, 'has already been taken.')
          );
        }
      }
    }
  }

  private formatError(property: string, description: string) {
    const message = property + ' ' + description;
    return message.replace(/./, x => x.toUpperCase());
  }
}
