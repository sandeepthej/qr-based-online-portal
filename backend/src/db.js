import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import { MONGO_URI } from './config.js';

const DATA_FILE = path.join(process.cwd(), 'data.json');

// Initialize local JSON database if Mongo connection fails
let localDb = {
  users: [],
  complaints: [],
  refunds: [],
  notifications: [],
  adminLogs: []
};

// Load data from file if it exists
if (fs.existsSync(DATA_FILE)) {
  try {
    const content = fs.readFileSync(DATA_FILE, 'utf-8');
    localDb = JSON.parse(content);
  } catch (err) {
    console.warn('Error reading local db file, starting fresh:', err.message);
  }
}

// Function to save localDb
const saveLocalDb = () => {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(localDb, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving local db file:', err.message);
  }
};

let useLocalDb = false;

export const connectDB = async () => {
  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 2000
    });
    console.log('MongoDB successfully connected.');
    useLocalDb = false;
  } catch (err) {
    console.error('MongoDB connection error. Falling back to robust local file persistence.');
    console.error(err.message);
    useLocalDb = true;
  }
};

// Create an abstraction layer for Models to support both Mongo & Local JSON seamlessly
export class Model {
  constructor(collectionName) {
    this.collection = collectionName;
  }

  async find(filter = {}) {
    if (!useLocalDb) {
      try {
        return await mongoose.model(this.collection).find(filter);
      } catch (e) {
        console.warn(`Mongo find failed for ${this.collection}, using local DB`);
      }
    }
    // Simple filter support
    return localDb[this.collection].filter(item => {
      return Object.entries(filter).every(([key, value]) => {
        if (value && typeof value === 'object' && value.$in) {
          return value.$in.includes(item[key]);
        }
        return item[key] === value;
      });
    });
  }

  async findOne(filter = {}) {
    if (!useLocalDb) {
      try {
        return await mongoose.model(this.collection).findOne(filter);
      } catch (e) {
        console.warn(`Mongo findOne failed for ${this.collection}, using local DB`);
      }
    }
    return localDb[this.collection].find(item => {
      return Object.entries(filter).every(([key, value]) => item[key] === value);
    }) || null;
  }

  async findById(id) {
    if (!useLocalDb) {
      try {
        return await mongoose.model(this.collection).findById(id);
      } catch (e) {
        console.warn(`Mongo findById failed for ${this.collection}, using local DB`);
      }
    }
    return localDb[this.collection].find(item => item._id === id || item.id === id) || null;
  }

  async create(data) {
    const newItem = {
      _id: 'local_' + Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
      updatedAt: new Date(),
      ...data
    };
    if (!useLocalDb) {
      try {
        const doc = await mongoose.model(this.collection).create(data);
        return doc;
      } catch (e) {
        console.warn(`Mongo create failed for ${this.collection}, using local DB fallback`);
      }
    }
    localDb[this.collection].push(newItem);
    saveLocalDb();
    return newItem;
  }

  async findByIdAndUpdate(id, updateData) {
    if (!useLocalDb) {
      try {
        return await mongoose.model(this.collection).findByIdAndUpdate(id, updateData, { new: true });
      } catch (e) {
        console.warn(`Mongo findByIdAndUpdate failed for ${this.collection}, using local DB fallback`);
      }
    }
    const index = localDb[this.collection].findIndex(item => item._id === id || item.id === id);
    if (index === -1) return null;
    localDb[this.collection][index] = {
      ...localDb[this.collection][index],
      ...updateData,
      updatedAt: new Date()
    };
    saveLocalDb();
    return localDb[this.collection][index];
  }

  async deleteOne(filter) {
    if (!useLocalDb) {
      try {
        return await mongoose.model(this.collection).deleteOne(filter);
      } catch (e) {
        console.warn(`Mongo deleteOne failed for ${this.collection}, using local DB fallback`);
      }
    }
    const index = localDb[this.collection].findIndex(item => {
      return Object.entries(filter).every(([key, value]) => item[key] === value);
    });
    if (index === -1) return { deletedCount: 0 };
    localDb[this.collection].splice(index, 1);
    saveLocalDb();
    return { deletedCount: 1 };
  }
}

// Instantiate DB models using simple proxying
export const User = new Model('users');
export const Complaint = new Model('complaints');
export const Refund = new Model('refunds');
export const Notification = new Model('notifications');
export const AdminLog = new Model('adminLogs');
