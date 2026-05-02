import { transporter } from '@/config/nodemailer';

interface IEmail {
  email: string;
  name: string;
  token: string;
}

export class AuthEmail {
  static sendConfirmationEmail = async (user: IEmail) => {
    const info = await transporter.sendMail({
      from: 'UpTask <admin@uptask.com>',
      to: user.email,
      subject: 'UpTask - Confirm your account',
      text: 'UpTask - Confirm your account',
      html: `<p>Hello ${user.name}, you have created your account in UpTask. You are almost ready — just confirm your account to get started.</p>
             <p>Visit the following link:</p>
             <a href="${process.env.FRONTEND_URL}/auth/confirm-account">Confirm account</a>
             <p>Here is your confirmation code: <b>${user.token}</b></p>
             <p>This code expires in 10 minutes</p>
            `,
    });

    console.log('Message sent', info.messageId);
  };

  static sendPasswordResetToken = async (user: IEmail) => {
    const info = await transporter.sendMail({
      from: 'UpTask <admin@uptask.com>',
      to: user.email,
      subject: 'UpTask - Reset your password',
      text: 'UpTask - Reset your password',
      html: `<p>Hello ${user.name}, you have requested to reset your password.</p>
             <p>Visit the following link:</p>
             <a href="${process.env.FRONTEND_URL}/auth/new-password">Reset password</a>
             <p>Here is your confirmation code: <b>${user.token}</b></p>
             <p>This code expires in 10 minutes</p>
            `,
    });

    console.log('Message sent', info.messageId);
  };
}
