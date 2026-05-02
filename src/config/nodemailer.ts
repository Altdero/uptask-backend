import { createTransport } from 'nodemailer';
import { config } from 'dotenv';
config();

const nodeMailerConfig = () => {
  return {
    host: process.env.SMTP_HOST,
    port: +process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  };
};

export const transporter = createTransport(nodeMailerConfig());
