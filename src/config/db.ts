import { exit } from 'node:process';

import colors from 'colors';
import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const { connection } = await mongoose.connect(process.env.DATABASE_URL);
    const url = connection.port ? `${connection.host}:${connection.port}` : connection.host;
    console.log(colors.magenta.bold(`MongoDB Connected on: ${url}/${connection.name}`));
  } catch {
    console.log(colors.red.bold('Error connecting to MongoDB'));
    exit(1);
  }
};
