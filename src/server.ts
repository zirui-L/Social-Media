import { authRegisterV2, authLoginV2, authLogOutV1 } from './auth';
import {
  channelsCreateV2,
  channelsListV2,
  channelsListAllV2,
} from './channels';
import {
  channelDetailsV2,
  channelJoinV2,
  channelInviteV2,
  channelMessagesV2,
  channelLeaveV1,
  channelAddOwnerV1,
  channelRemoveOwnerV1,
} from './channel';
import {
  userProfileV2,
  usersAllV1,
  userProfileSetEmailV1,
  userProfileSetHandleV1,
  userProfileSetNameV1,
} from './users';
import {
  messageEditV1,
  messageRemoveV1,
  messageSendDmV1,
  messageSendV1,
  messageReactV1,
} from './message';
import {
  dmCreateV1,
  dmDetailsV1,
  dmLeaveV1,
  dmListV1,
  dmMessagesV1,
  dmRemoveV1,
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

app.post('/auth/login/v2', (req: Request, res: Response) => {
  const { email, password } = req.body;
  res.json(authLoginV2(email, password));
  storeData();
});

app.post('/auth/register/v2', (req: Request, res: Response) => {
  const { email, password, nameFirst, nameLast } = req.body;
  res.json(authRegisterV2(email, password, nameFirst, nameLast));
  storeData();
});

app.post('/auth/logout/v1', (req: Request, res: Response) => {
  const { token } = req.body;
  res.json(authLogOutV1(token));
  storeData();
});

app.post('/channels/create/v2', (req: Request, res: Response) => {
  const { token, name, isPublic } = req.body;
  res.json(channelsCreateV2(token, name, isPublic));
  storeData();
});

app.get('/channels/list/v2', (req: Request, res: Response) => {
  const token = String(req.query.token);
  res.json(channelsListV2(token));
  storeData();
});

app.get('/channels/listall/v2', (req: Request, res: Response) => {
  const token = String(req.query.token);
  res.json(channelsListAllV2(token));
  storeData();
});

app.get('/channel/details/v2', (req: Request, res: Response) => {
  const token = String(req.query.token);
  const channelId = parseInt(String(req.query.channelId));
  res.json(channelDetailsV2(token, channelId));
  storeData();
});

app.post('/channel/join/v2', (req: Request, res: Response) => {
  const { token, channelId } = req.body;
  res.json(channelJoinV2(token, channelId));
  storeData();
});

app.post('/channel/invite/v2', (req: Request, res: Response) => {
  const { token, channelId, uId } = req.body;
  res.json(channelInviteV2(token, channelId, uId));
  storeData();
});

app.get('/channel/messages/v2', (req: Request, res: Response) => {
  const token = String(req.query.token);
  const channelId = parseInt(String(req.query.channelId));
  const start = parseInt(String(req.query.start));
  res.json(channelMessagesV2(token, channelId, start));
  storeData();
});

app.post('/channel/leave/v1', (req: Request, res: Response) => {
  const { token, channelId } = req.body;
  res.json(channelLeaveV1(token, channelId));
  storeData();
});

app.post('/channel/addowner/v1', (req: Request, res: Response) => {
  const { token, channelId, uId } = req.body;
  res.json(channelAddOwnerV1(token, channelId, uId));
  storeData();
});

app.post('/channel/removeowner/v1', (req: Request, res: Response) => {
  const { token, channelId, uId } = req.body;
  res.json(channelRemoveOwnerV1(token, channelId, uId));
  storeData();
});

app.get('/user/profile/v2', (req: Request, res: Response) => {
  const token = String(req.query.token);
  const uId = parseInt(String(req.query.uId));
  res.json(userProfileV2(token, uId));
  storeData();
});

app.get('/users/all/v1', (req: Request, res: Response) => {
  const token = String(req.query.token);
  res.json(usersAllV1(token));
  storeData();
});

app.put('/user/profile/setname/v1', (req: Request, res: Response) => {
  const { token, nameFirst, nameLast } = req.body;
  res.json(userProfileSetNameV1(token, nameFirst, nameLast));
  storeData();
});

app.put('/user/profile/setemail/v1', (req: Request, res: Response) => {
  const { token, email } = req.body;
  res.json(userProfileSetEmailV1(token, email));
  storeData();
});

app.put('/user/profile/sethandle/v1', (req: Request, res: Response) => {
  const { token, handleStr } = req.body;
  res.json(userProfileSetHandleV1(token, handleStr));
  storeData();
});

app.post('/message/send/v1', (req: Request, res: Response) => {
  const { token, channelId, message } = req.body;
  res.json(messageSendV1(token, channelId, message));
  storeData();
});

app.put('/message/edit/v1', (req: Request, res: Response) => {
  const { token, messageId, message } = req.body;
  res.json(messageEditV1(token, messageId, message));
  storeData();
});

app.delete('/message/remove/v1', (req: Request, res: Response) => {
  const token = String(req.query.token);
  const messageId = parseInt(String(req.query.messageId));
  res.json(messageRemoveV1(token, messageId));
  storeData();
});

app.post('/message/senddm/v1', (req: Request, res: Response) => {
  const { token, dmId, message } = req.body;
  res.json(messageSendDmV1(token, dmId, message));
  storeData();
});

app.post('/message/react/v1', (req: Request, res: Response) => {
  const { token, messageId, reactId } = req.body;
  res.json(messageReactV1(token, messageId, reactId));
  storeData();
});

app.post('/dm/create/v1', (req: Request, res: Response) => {
  const { token, uIds } = req.body;
  res.json(dmCreateV1(token, uIds));
  storeData();
});

app.get('/dm/list/v1', (req: Request, res: Response) => {
  const token = String(req.query.token);
  res.json(dmListV1(token));
  storeData();
});

app.delete('/dm/remove/v1', (req: Request, res: Response) => {
  const token = String(req.query.token);
  const dmId = parseInt(String(req.query.dmId));
  res.json(dmRemoveV1(token, dmId));
  storeData();
});

app.get('/dm/details/v1', (req: Request, res: Response) => {
  const token = String(req.query.token);
  const dmId = parseInt(String(req.query.dmId));
  res.json(dmDetailsV1(token, dmId));
  storeData();
});

app.post('/dm/leave/v1', (req: Request, res: Response) => {
  const { token, dmId } = req.body;
  res.json(dmLeaveV1(token, dmId));
  storeData();
});

app.get('/dm/messages/v1', (req: Request, res: Response) => {
  const token = String(req.query.token);
  const dmId = parseInt(String(req.query.dmId));
  const start = parseInt(String(req.query.start));
  res.json(dmMessagesV1(token, dmId, start));
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
