import { authRegisterV3, authLoginV3, authLogOutV2 } from './auth';
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
} from './users';
import {
  messageEditV2,
  messageRemoveV2,
  messageSendDmV2,
  messageSendV2,
  messageReactV1,
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
  const { token } = req.body;
  res.json(authLogOutV2(token));
  storeData();
});

app.post('/channels/create/v3', (req: Request, res: Response) => {
  const { token, name, isPublic } = req.body;
  res.json(channelsCreateV3(token, name, isPublic));
  storeData();
});

app.get('/channels/list/v3', (req: Request, res: Response) => {
  const token = String(req.query.token);
  res.json(channelsListV3(token));
  storeData();
});

app.get('/channels/listall/v3', (req: Request, res: Response) => {
  const token = String(req.query.token);
  res.json(channelsListAllV3(token));
  storeData();
});

app.get('/channel/details/v3', (req: Request, res: Response) => {
  const token = String(req.query.token);
  const channelId = parseInt(String(req.query.channelId));
  res.json(channelDetailsV3(token, channelId));
  storeData();
});

app.post('/channel/join/v3', (req: Request, res: Response) => {
  const { token, channelId } = req.body;
  res.json(channelJoinV3(token, channelId));
  storeData();
});

app.post('/channel/invite/v3', (req: Request, res: Response) => {
  const { token, channelId, uId } = req.body;
  res.json(channelInviteV3(token, channelId, uId));
  storeData();
});

app.get('/channel/messages/v3', (req: Request, res: Response) => {
  const token = String(req.query.token);
  const channelId = parseInt(String(req.query.channelId));
  const start = parseInt(String(req.query.start));
  res.json(channelMessagesV3(token, channelId, start));
  storeData();
});

app.post('/channel/leave/v2', (req: Request, res: Response) => {
  const { token, channelId } = req.body;
  res.json(channelLeaveV2(token, channelId));
  storeData();
});

app.post('/channel/addowner/v2', (req: Request, res: Response) => {
  const { token, channelId, uId } = req.body;
  res.json(channelAddOwnerV2(token, channelId, uId));
  storeData();
});

app.post('/channel/removeowner/v2', (req: Request, res: Response) => {
  const { token, channelId, uId } = req.body;
  res.json(channelRemoveOwnerV2(token, channelId, uId));
  storeData();
});

app.get('/user/profile/v3', (req: Request, res: Response) => {
  const token = String(req.query.token);
  const uId = parseInt(String(req.query.uId));
  res.json(userProfileV3(token, uId));
  storeData();
});

app.get('/users/all/v2', (req: Request, res: Response) => {
  const token = String(req.query.token);
  res.json(usersAllV2(token));
  storeData();
});

app.put('/user/profile/setname/v2', (req: Request, res: Response) => {
  const { token, nameFirst, nameLast } = req.body;
  res.json(userProfileSetNameV2(token, nameFirst, nameLast));
  storeData();
});

app.put('/user/profile/setemail/v2', (req: Request, res: Response) => {
  const { token, email } = req.body;
  res.json(userProfileSetEmailV2(token, email));
  storeData();
});

app.put('/user/profile/sethandle/v2', (req: Request, res: Response) => {
  const { token, handleStr } = req.body;
  res.json(userProfileSetHandleV2(token, handleStr));
  storeData();
});

app.post('/message/send/v2', (req: Request, res: Response) => {
  const { token, channelId, message } = req.body;
  res.json(messageSendV2(token, channelId, message));
  storeData();
});

app.put('/message/edit/v2', (req: Request, res: Response) => {
  const { token, messageId, message } = req.body;
  res.json(messageEditV2(token, messageId, message));
  storeData();
});

app.delete('/message/remove/v2', (req: Request, res: Response) => {
  const token = String(req.query.token);
  const messageId = parseInt(String(req.query.messageId));
  res.json(messageRemoveV2(token, messageId));
  storeData();
});

app.post('/message/senddm/v2', (req: Request, res: Response) => {
  const { token, dmId, message } = req.body;
  res.json(messageSendDmV2(token, dmId, message));
  storeData();
});

app.post('/message/react/v1', (req: Request, res: Response) => {
  const { token, messageId, reactId } = req.body;
  res.json(messageReactV1(token, messageId, reactId));
  storeData();
});

app.post('/dm/create/v2', (req: Request, res: Response) => {
  const { token, uIds } = req.body;
  res.json(dmCreateV2(token, uIds));
  storeData();
});

app.get('/dm/list/v2', (req: Request, res: Response) => {
  const token = String(req.query.token);
  res.json(dmListV2(token));
  storeData();
});

app.delete('/dm/remove/v2', (req: Request, res: Response) => {
  const token = String(req.query.token);
  const dmId = parseInt(String(req.query.dmId));
  res.json(dmRemoveV2(token, dmId));
  storeData();
});

app.get('/dm/details/v2', (req: Request, res: Response) => {
  const token = String(req.query.token);
  const dmId = parseInt(String(req.query.dmId));
  res.json(dmDetailsV2(token, dmId));
  storeData();
});

app.post('/dm/leave/v2', (req: Request, res: Response) => {
  const { token, dmId } = req.body;
  res.json(dmLeaveV2(token, dmId));
  storeData();
});

app.get('/dm/messages/v2', (req: Request, res: Response) => {
  const token = String(req.query.token);
  const dmId = parseInt(String(req.query.dmId));
  const start = parseInt(String(req.query.start));
  res.json(dmMessagesV2(token, dmId, start));
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
