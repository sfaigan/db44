import { MongoClient, Db } from 'mongodb';
import * as seedData from './Seeds';
import schema = require('./schema.json');
import { MongoMemoryServer } from 'mongodb-memory-server';

class DbClient {
  db!: Db;
  client!: MongoClient;
  server!: MongoMemoryServer;

  async connect(env: string) {
    let uri = '';
    let dbName = '';
    switch (env) {
      case 'production':
        uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_URL}`;
        dbName = 'db44';
        break;
      case 'development':
        uri = 'mongodb://mongo:27017/db44_dev';
        dbName = 'db44_dev';
        break;
      case 'testing':
        this.server = new MongoMemoryServer();
        uri = await this.server.getConnectionString();
        dbName = 'db44_test';
        break;
      case 'debug':
        uri = 'mongodb://localhost:27017/db44_dev';
        dbName = 'db44_dev';
        break;
      default:
        console.error('No environment specified. Please set NODE_ENV.');
        process.exit(1);
    }
    try {
      this.client = await MongoClient.connect(uri, {
        useUnifiedTopology: true,
      });
      this.db = this.client.db(dbName);
      console.log('Connected to ' + env + ' database.');
      if (env === 'development' || env === 'debug') await this.setupDb();
      return this.db;
    } catch (error) {
      return console.log('Unable to connect to DB.');
    }
  }

  async disconnect(isTesting?: boolean) {
    await this.client.close();
    if (isTesting) {
      await this.server.stop();
    }
  }

  getCollection(collection: string) {
    return this.db.collection(collection);
  }

  private async setupDb() {
    try {
      await this.db.dropDatabase();
      await this.createSchema();
      await this.seedDatabase();
    } catch (e) {
      console.error('Error setting up development database.');
      console.error(e);
      process.exit(1);
    }
  }

  private async createSchema() {
    await this.db.createCollection('users', {
      validator: { $jsonSchema: schema.users },
    });
    await this.db.createCollection('products', {
      validator: { $jsonSchema: schema.products },
    });
    await this.db.createCollection('suppliers', {
      validator: { $jsonSchema: schema.suppliers },
    });
  }

  private async seedDatabase() {
    await this.db.collection('users').insertMany(seedData.usersCollection);
    await this.db
      .collection('products')
      .insertMany(seedData.productsCollection);
    await this.db
      .collection('suppliers')
      .insertMany(seedData.suppliersCollection);
  }
}

export = new DbClient();
