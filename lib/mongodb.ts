import mongoose from "mongoose";
import { ensureSeedData } from "./seed";

// Cache the connection across hot reloads in dev
declare global {
  // eslint-disable-next-line no-var
  var _mongoose: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null } | undefined;
  // eslint-disable-next-line no-var
  var _openarmSeedPromise: Promise<void> | undefined;
}

const cached = global._mongoose ?? { conn: null, promise: null };
global._mongoose = cached;

export async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) return cached.conn;

  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI not set");

  if (!cached.promise) {
    cached.promise = mongoose.connect(uri, {
      dbName: process.env.MONGODB_DB_NAME ?? "openarm",
      bufferCommands: false,
    });
  }

  cached.conn = await cached.promise;
  if (!global._openarmSeedPromise) {
    global._openarmSeedPromise = ensureSeedData();
  }
  await global._openarmSeedPromise;
  return cached.conn;
}
