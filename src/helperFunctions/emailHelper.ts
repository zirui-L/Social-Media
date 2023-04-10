const nodemailer = require('nodemailer');

// send a password reset email to the user
export const sendPasswordResetEmail = (email: string, resetCode: string) => {
  const transport = nodemailer.createTransport({
    host: 'sandbox.smtp.mailtrap.io',
    port: 2525,
    auth: {
      user: 'a17ccada696346',
      pass: '12f153f6da489a',
    },
  });

  const message = {
    from: 'z5416650@ad.unsw.edu.au',
    to: email,
    subject: 'Password reset code',
    text: resetCode,
  };

  transport.sendMail(message);

  return {};
};
