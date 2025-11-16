<<<<<<< HEAD
// import mongoose from "mongoose";

// const MONGODB_URI = process.env.MONGODB_URI;

// if (!MONGODB_URI) throw new Error("⚠️ Please define MONGODB_URI in .env.local");

// let cached = global.mongoose;
// if (!cached) cached = global.mongoose = { conn: null, promise: null };

// export default async function dbConnect() {
//   if (cached.conn) return cached.conn;
//   if (!cached.promise) {
//     cached.promise = mongoose.connect(MONGODB_URI, {
//       bufferCommands: false,
//     });
//   }
//   cached.conn = await cached.promise;
//   return cached.conn;
// }

=======
>>>>>>> 780461f4a5f7a0a7aec153226935fdca1fcf335e
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) throw new Error("⚠️ Please define MONGODB_URI in .env.local");

let cached = global.mongoose;
if (!cached) cached = global.mongoose = { conn: null, promise: null };

export default async function dbConnect() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
<<<<<<< HEAD
}
=======
}
>>>>>>> 780461f4a5f7a0a7aec153226935fdca1fcf335e
