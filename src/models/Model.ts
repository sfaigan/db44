import DbClient = require('../DbClient');
import { ObjectId } from 'mongodb';
import { Validator } from '../Validator';

export interface ModelI {
  _id: ObjectId;
}

export abstract class Model {
  _id: ObjectId;
  static collection: string;
  protected collection: string;

  protected constructor(data: ModelI) {
    this.collection = Model.collection;
    this._id = data._id;
  }

  static async findAll(query?: {}) {
    const collection = await DbClient.getCollection(this.collection)
      .find(query)
      .toArray();

    return collection.map(document => {
      return (this as any).getModel(document);
    });
  }

  static async findById(queryId: string) {
    const objectId = new ObjectId(queryId);

    const document = await DbClient.getCollection(this.collection).findOne({
      _id: objectId,
    });
    if (document) {
      return (this as any).getModel(document);
    }
    return null;
  }

  static async create(data: {}) {
    await new Validator(this.collection).validate(data);

    const result = await DbClient.getCollection(this.collection).insertOne(
      data
    );

    return (this as any).getModel(result.ops[0]);
  }

  async update(data: {}) {
    await new Validator(this.collection).validate(data, this._id);

    return DbClient.getCollection(this.collection).findOneAndUpdate(
      { _id: this._id },
      { $set: data }
    );
  }

  async delete() {
    return DbClient.getCollection(this.collection).findOneAndDelete({
      _id: this._id,
    });
  }

  private static getModel<T extends Model>(
    this: { new (data?: {}): T; collection: string },
    data: {}
  ) {
    return new this(data);
  }
}
