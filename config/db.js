const mongoose = require('mongoose');
const net = require('net');

let memoryServer = null;
let resolveClient;
const clientPromise = new Promise((resolve) => {
  resolveClient = resolve;
});

// Helper to test if a host & port is reachable quickly
function isPortReachable(port, host = '127.0.0.1', timeoutMs = 800) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let isConnected = false;

    socket.setTimeout(timeoutMs);

    socket.on('connect', () => {
      isConnected = true;
      socket.destroy();
      resolve(true);
    });

    socket.on('timeout', () => {
      socket.destroy();
      resolve(false);
    });

    socket.on('error', () => {
      socket.destroy();
      resolve(false);
    });

    socket.connect(port, host);
  });
}

let connectingPromise = null;

const connectDB = async () => {
  // If already connected, resolve client and return
  if (mongoose.connection.readyState === 1) {
    const client = mongoose.connection.getClient();
    resolveClient(client);
    return mongoose.connection;
  }

  // If connection is in progress, wait for it
  if (connectingPromise) {
    return connectingPromise;
  }

  if (!process.env.MONGODB_URI && (process.env.NODE_ENV === 'production' || process.env.VERCEL)) {
    throw new Error('Database Error: MONGODB_URI is missing in Vercel Environment Variables! Please add MONGODB_URI in your Vercel Project Settings > Environment Variables.');
  }

  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/student_management_db';
  const forceInMemory = process.env.USE_IN_MEMORY_DB === 'true';

  // Check if URI is local 127.0.0.1/localhost
  const isLocalUri = uri.includes('127.0.0.1:27017') || uri.includes('localhost:27017');

  if (forceInMemory && process.env.NODE_ENV !== 'production') {
    return await startInMemory();
  }

  if (isLocalUri && process.env.NODE_ENV !== 'production') {
    const isReachable = await isPortReachable(27017, '127.0.0.1', 600);
    if (!isReachable) {
      console.log('⚡ Local MongoDB port 27017 not detected. Starting high-performance in-memory MongoDB...');
      return await startInMemory();
    }
  }

  connectingPromise = (async () => {
    try {
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 8000,
      });
      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
      const client = mongoose.connection.getClient();
      resolveClient(client);
      return conn;
    } catch (error) {
      connectingPromise = null;
      if (process.env.NODE_ENV === 'production') {
        console.error(`❌ MongoDB connection failed: ${error.message}`);
        throw error;
      }
      console.warn(`⚠️ Could not connect to MongoDB at ${uri}: ${error.message}`);
      return await startInMemory();
    }
  })();

  return connectingPromise;
};

async function startInMemory() {
  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    if (!memoryServer) {
      memoryServer = await MongoMemoryServer.create();
    }
    const memUri = memoryServer.getUri();
    const conn = await mongoose.connect(memUri);
    console.log(`✅ In-Memory MongoDB connected: ${conn.connection.host}`);
    const client = mongoose.connection.getClient();
    resolveClient(client);
    return conn;
  } catch (err) {
    console.error('❌ Failed to initialize in-memory MongoDB server:', err.message);
    process.exit(1);
  }
}

module.exports = { connectDB, clientPromise };
