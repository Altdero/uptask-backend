import { exit } from 'node:process';

import colors from 'colors';
import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const { connection } = await mongoose.connect(process.env.DATABASE_URL);
    const url = `${connection.host}:${connection.port}`;
    console.log(colors.magenta.bold(`MongoDB connected on: ${url}`));
  } catch {
    console.log(colors.red.bold('Error while trying to connect to MongoDB'));
    exit(1);
  }
};
