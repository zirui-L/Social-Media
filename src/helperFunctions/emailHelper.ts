const nodemailer = require('nodemailer');
const { google } = require('googleapis');

const CLIENT_ID =
  '384898540571-pt6qpkmhh3r47k4qeii9gms92hb9pi6d.apps.googleusercontent.com';
const CLIENT_SECRET = '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';
const REDIRECT_URI = 'https://developers.google.com/oauthplayground';
const REFRESH_TOKEN =
  '1//04FOSJhGykvs9CgYIARAAGAQSNwF-L9Iry24sgANvzJpUDn6I6TK7OKUnl-T3mx_3Lqx-Sx0y1I7qRGqRmCyRd-X61Ui03otkbAE';

const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

// send a password reset email to the user
export const sendPasswordResetEmail = (email: string, resetCode: string) => {
  const accessToken = oAuth2Client.getAccessToken();

  const transport = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: 'henry1531test@gmail.com',
      clientId: CLIENT_ID,
      clientSecret: CLIENT_SECRET,
      refreshToken: REFRESH_TOKEN,
      accessToken: accessToken,
    },
  });

  const mailOptions = {
    from: 'Memes Team <henry1531test@gmail.com>',
    to: email,
    subject: 'Memes Password Reset Code',
    text: resetCode,
  };

  transport.sendMail(mailOptions);

  return {};
};
