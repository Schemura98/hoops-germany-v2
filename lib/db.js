import mongoose from "mongoose";

// Cached Mongoose-Verbindung für Next.js (verhindert mehrfache Verbindungen
// bei Hot-Reload im Dev-Modus und in serverless-ähnlichen Umgebungen).
const MONGODB_URI = process.env.MONGODB_URI;

let cached = global._mongoose;
if (!cached) {
  cached = global._mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!MONGODB_URI) {
    throw new Error(
      "MONGODB_URI ist nicht gesetzt. Bitte .env-Datei prüfen (siehe .env.example)."
    );
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, { bufferCommands: false })
      .then((m) => m);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export default connectDB;
