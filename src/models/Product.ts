import { ObjectId } from 'mongodb';
import { Request } from 'express';
import { Model, ModelI } from './Model';
import { Checkbox, ProductFilter } from '../interfaces/StoreFilters';
import { Supplier } from './Supplier';
import DbClient = require('../DbClient');

export interface ProductI extends ModelI {
  name: string;
  description: string;
  stock: number;
  price: number;
  category: string;
  supplierId: ObjectId;
  supplier: Supplier;
}

export class Product extends Model implements ProductI {
  static collection = 'products';

  supplier: Supplier;
  name: string;
  description: string;
  stock: number;
  price: number;
  category: string;
  supplierId: ObjectId;

  constructor(data: ProductI) {
    super(data);
    this.collection = Product.collection;
    this.supplier = data.supplier;
    this.name = data.name;
    this.description = data.description;
    this.stock = data.stock;
    this.price = data.price;
    this.category = data.category;
    this.supplierId = data.supplierId;
  }

  // Needed to be overridden for aggregation
  static async findAll(query = {}) {
    const collection = await DbClient.getCollection(Product.collection)
      .aggregate([
        { $match: query },
        {
          $lookup: {
            from: Supplier.collection,
            localField: 'supplierId',
            foreignField: '_id',
            as: 'supplierArr',
          },
        },
        { $addFields: { supplier: { $arrayElemAt: ['$supplierArr', 0] } } },
        { $project: { supplierArr: 0 } },
      ])
      .toArray();

    return collection.map(document => {
      return (this as any).getModel(document);
    });
  }

  // Needed to be overridden for aggregation
  static async findById(queryId: string) {
    const objectId = new ObjectId(queryId);

    const document = await DbClient.getCollection(this.collection)
      .aggregate([
        { $match: { _id: objectId } },
        {
          $lookup: {
            from: Supplier.collection,
            localField: 'supplierId',
            foreignField: '_id',
            as: 'supplierArr',
          },
        },
        { $addFields: { supplier: { $arrayElemAt: ['$supplierArr', 0] } } },
        { $project: { supplierArr: 0 } },
      ])
      .toArray();
    if (document && document[0]) {
      return (this as any).getModel(document[0]);
    }
    return null;
  }

  static async getNameFromId(productId: string) {
    const product = await this.findById(productId);
    return product.name;
  }

  static async getCategories(setFilters: string[]): Promise<Checkbox[]> {
    const products = await this.findAll();

    setFilters = setFilters ? setFilters : [];

    const categoryNames = [
      ...new Set(products.map(product => product.category)),
    ];

    return categoryNames.map(categoryName => ({
      name: categoryName,
      isSet: setFilters.includes(categoryName),
    }));
  }

  static async getSuppliers(setFilters: string[]): Promise<Checkbox[]> {
    const suppliers = await Supplier.findAll();
    setFilters = setFilters ? setFilters : [];

    return suppliers.map(supplier => ({
      name: supplier.name,
      _id: supplier._id.toString(),
      isSet: setFilters.includes(supplier._id.toString()),
    }));
  }

  static async buildQuery(req: Request) {
    const category = { $in: req.query.categories };
    let suppliers;
    if (req.query.suppliers) {
      suppliers = req.query.suppliers.map((supplierId: string) => {
        return new ObjectId(supplierId);
      });
    }
    const supplierId = { $in: suppliers };

    const query: ProductFilter = {};
    if (category.$in) {
      query.category = category;
    }

    if (supplierId.$in) {
      query.supplierId = supplierId;
    }
    return query;
  }
}
