import {
  authRegisterV3,
  authLoginV3,
  authLogOutV2,
  authPasswordresetRequestV1,
  authPasswordresetResetV1,
} from './auth';
import {
  channelsCreateV3,
  channelsListV3,
  channelsListAllV3,
} from './channels';
import {
  channelDetailsV3,
  channelJoinV3,
  channelInviteV3,
  channelMessagesV3,
  channelLeaveV2,
  channelAddOwnerV2,
  channelRemoveOwnerV2,
} from './channel';
import {
  userProfileV3,
  usersAllV2,
  userProfileSetEmailV2,
  userProfileSetHandleV2,
  userProfileSetNameV2,
  userProfileUploadPhotoV1,
} from './users';
import {
  messageEditV2,
  messageRemoveV2,
  messageSendDmV2,
  messageSendV2,
  messageReactV1,
  messageUnReactV1,
  messagePinV1,
  messageUnPinV1,
} from './message';
import {
  dmCreateV2,
  dmDetailsV2,
  dmLeaveV2,
  dmListV2,
  dmMessagesV2,
  dmRemoveV2,
} from './dm';
import { clearV1 } from './other';
import { storeData } from './helperFunctions/helperFunctions';
import { setData } from './dataStore';
import express, { json, Request, Response } from 'express';
import { echo } from './echo';
import morgan from 'morgan';
import config from './config.json';
import cors from 'cors';
import fs from 'fs';
import errorHandler from 'middleware-http-errors';
import { standupActiveV1, standupSendV1, standupStartV1 } from './standup';

// Set up web app
const app = express();
// Use middleware that allows us to access the JSON body of requests
app.use(json());
// Use middleware that allows for access from other domains
app.use(cors());
// for logging errors (print to terminal)
app.use(morgan('dev'));

const PORT: number = parseInt(process.env.PORT || config.port);
const HOST: string = process.env.IP || 'localhost';

// Example get request
app.get('/echo', (req: Request, res: Response, next) => {
  const data = req.query.echo as string;
  return res.json(echo(data));
});

app.post('/auth/login/v3', (req: Request, res: Response) => {
  const { email, password } = req.body;
  res.json(authLoginV3(email, password));
  storeData();
});

app.post('/auth/register/v3', (req: Request, res: Response) => {
  const { email, password, nameFirst, nameLast } = req.body;
  res.json(authRegisterV3(email, password, nameFirst, nameLast));
  storeData();
});

app.post('/auth/logout/v2', (req: Request, res: Response) => {
  const token = req.header('token');
  res.json(authLogOutV2(token));
  storeData();
});

app.post('/channels/create/v3', (req: Request, res: Response) => {
  const token = req.header('token');
  const { name, isPublic } = req.body;
  res.json(channelsCreateV3(token, name, isPublic));
  storeData();
});

app.get('/channels/list/v3', (req: Request, res: Response) => {
  const token = req.header('token');
  res.json(channelsListV3(token));
  storeData();
});

app.get('/channels/listall/v3', (req: Request, res: Response) => {
  const token = req.header('token');
  res.json(channelsListAllV3(token));
  storeData();
});

app.get('/channel/details/v3', (req: Request, res: Response) => {
  const token = req.header('token');
  const channelId = parseInt(String(req.query.channelId));
  res.json(channelDetailsV3(token, channelId));
  storeData();
});

app.post('/channel/join/v3', (req: Request, res: Response) => {
  const { channelId } = req.body;
  const token = req.header('token');
  res.json(channelJoinV3(token, channelId));
  storeData();
});

app.post('/channel/invite/v3', (req: Request, res: Response) => {
  const { channelId, uId } = req.body;
  const token = req.header('token');
  res.json(channelInviteV3(token, channelId, uId));
  storeData();
});

app.get('/channel/messages/v3', (req: Request, res: Response) => {
  const token = req.header('token');
  const channelId = parseInt(String(req.query.channelId));
  const start = parseInt(String(req.query.start));
  res.json(channelMessagesV3(token, channelId, start));
  storeData();
});

app.post('/channel/leave/v2', (req: Request, res: Response) => {
  const { channelId } = req.body;
  const token = req.header('token');
  res.json(channelLeaveV2(token, channelId));
  storeData();
});

app.post('/channel/addowner/v2', (req: Request, res: Response) => {
  const { channelId, uId } = req.body;
  const token = req.header('token');
  res.json(channelAddOwnerV2(token, channelId, uId));
  storeData();
});

app.post('/channel/removeowner/v2', (req: Request, res: Response) => {
  const { channelId, uId } = req.body;
  const token = req.header('token');
  res.json(channelRemoveOwnerV2(token, channelId, uId));
  storeData();
});

app.get('/user/profile/v3', (req: Request, res: Response) => {
  const token = req.header('token');
  const uId = parseInt(String(req.query.uId));
  res.json(userProfileV3(token, uId));
  storeData();
});

app.get('/users/all/v2', (req: Request, res: Response) => {
  const token = req.header('token');
  res.json(usersAllV2(token));
  storeData();
});

app.put('/user/profile/setname/v2', (req: Request, res: Response) => {
  const { nameFirst, nameLast } = req.body;
  const token = req.header('token');
  res.json(userProfileSetNameV2(token, nameFirst, nameLast));
  storeData();
});

app.put('/user/profile/setemail/v2', (req: Request, res: Response) => {
  const { email } = req.body;
  const token = req.header('token');
  res.json(userProfileSetEmailV2(token, email));
  storeData();
});

app.put('/user/profile/sethandle/v2', (req: Request, res: Response) => {
  const { handleStr } = req.body;
  const token = req.header('token');
  res.json(userProfileSetHandleV2(token, handleStr));
  storeData();
});

app.post('/message/send/v2', (req: Request, res: Response) => {
  const { channelId, message } = req.body;
  const token = req.header('token');
  res.json(messageSendV2(token, channelId, message));
  storeData();
});

app.put('/message/edit/v2', (req: Request, res: Response) => {
  const { messageId, message } = req.body;
  const token = req.header('token');
  res.json(messageEditV2(token, messageId, message));
  storeData();
});

app.delete('/message/remove/v2', (req: Request, res: Response) => {
  const token = req.header('token');
  const messageId = parseInt(String(req.query.messageId));
  res.json(messageRemoveV2(token, messageId));
  storeData();
});

app.post('/message/senddm/v2', (req: Request, res: Response) => {
  const { dmId, message } = req.body;
  const token = req.header('token');
  res.json(messageSendDmV2(token, dmId, message));
  storeData();
});

app.post('/message/react/v1', (req: Request, res: Response) => {
  const { messageId, reactId } = req.body;
  const token = req.header('token');
  res.json(messageReactV1(token, messageId, reactId));
  storeData();
});

app.post('/message/unreact/v1', (req: Request, res: Response) => {
  const { messageId, reactId } = req.body;
  const token = req.header('token');
  res.json(messageUnReactV1(token, messageId, reactId));
  storeData();
});

app.post('/message/pin/v1', (req: Request, res: Response) => {
  const { messageId } = req.body;
  const token = req.header('token');
  res.json(messagePinV1(token, messageId));
  storeData();
});

app.post('/message/unpin/v1', (req: Request, res: Response) => {
  const { messageId } = req.body;
  const token = req.header('token');
  res.json(messageUnPinV1(token, messageId));
  storeData();
});

app.post('/dm/create/v2', (req: Request, res: Response) => {
  const { uIds } = req.body;
  const token = req.header('token');
  res.json(dmCreateV2(token, uIds));
  storeData();
});

app.get('/dm/list/v2', (req: Request, res: Response) => {
  const token = req.header('token');
  res.json(dmListV2(token));
  storeData();
});

app.delete('/dm/remove/v2', (req: Request, res: Response) => {
  const token = req.header('token');
  const dmId = parseInt(String(req.query.dmId));
  res.json(dmRemoveV2(token, dmId));
  storeData();
});

app.get('/dm/details/v2', (req: Request, res: Response) => {
  const token = req.header('token');
  const dmId = parseInt(String(req.query.dmId));
  res.json(dmDetailsV2(token, dmId));
  storeData();
});

app.post('/dm/leave/v2', (req: Request, res: Response) => {
  const { dmId } = req.body;
  const token = req.header('token');
  res.json(dmLeaveV2(token, dmId));
  storeData();
});

app.get('/dm/messages/v2', (req: Request, res: Response) => {
  const token = req.header('token');
  const dmId = parseInt(String(req.query.dmId));
  const start = parseInt(String(req.query.start));
  res.json(dmMessagesV2(token, dmId, start));
  storeData();
});

app.post('/auth/passwordreset/request/v1', (req: Request, res: Response) => {
  const { email } = req.body;
  res.json(authPasswordresetRequestV1(email));
  storeData();
});

app.post('/auth/passwordreset/reset/v1', (req: Request, res: Response) => {
  const { resetCode, newPassword } = req.body;
  res.json(authPasswordresetResetV1(resetCode, newPassword));
  storeData();
});

app.post('/user/profile/uploadphoto/v1', (req: Request, res: Response) => {
  const { imgUrl, xStart, yStart, xEnd, yEnd } = req.body;
  const token = req.header('token');
  res.json(userProfileUploadPhotoV1(token, imgUrl, xStart, yStart, xEnd, yEnd));
  storeData();
});

app.post('/standup/start/v1', (req: Request, res: Response) => {
  const { channelId, length } = req.body;
  const token = req.header('token');
  res.json(standupStartV1(token, channelId, length));
  storeData();
});

app.get('/standup/active/v1', (req: Request, res: Response) => {
  const token = req.header('token');
  const channelId = parseInt(String(req.query.channelId));
  res.json(standupActiveV1(token, channelId));
  storeData();
});

app.post('/standup/send/v1', (req: Request, res: Response) => {
  const { channelId, message } = req.body;
  const token = req.header('token');
  res.json(standupSendV1(token, channelId, message));
  storeData();
});

app.delete('/clear/v1', (req: Request, res: Response) => {
  res.json(clearV1());
  storeData();
});

if (fs.existsSync('src/data.json')) {
  const syncData = fs.readFileSync('src/data.json', { flag: 'r' });
  setData(JSON.parse(String(syncData)));
}
// Keep this BENEATH route definitions
// handles errors nicely
app.use(errorHandler());

// start server
const server = app.listen(PORT, HOST, () => {
  // DO NOT CHANGE THIS LINE
  console.log(`⚡️ Server started on port ${PORT} at ${HOST}`);
});

// For coverage, handle Ctrl+C gracefully
process.on('SIGINT', () => {
  server.close(() => console.log('Shutting down server gracefully.'));
});
