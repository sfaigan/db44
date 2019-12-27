import { ObjectId } from 'mongodb';

// Used to keep track of items in an order
export interface LineItem {
  productId: ObjectId;
  quantity: number;
}

// Used when updating the cart
export interface LineItemUpdate {
  productId: string;
  quantity: string;
  delete: string;
}

// Used for displaying the cart in a readable format
export interface ParsedLineItem {
  productId: string;
  name: string;
  description: string;
  quantity: number;
  price: number;
  category: string;
  supplierName: string;
}
