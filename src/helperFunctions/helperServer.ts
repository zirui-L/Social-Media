import request, { HttpVerb } from 'sync-request';
import { port, url } from '../config.json';
export const SERVER_URL = `${url}:${port}`;

export const OK = 200;
export const BAD_REQUEST = 400;
export const FORBIDDEN = 403;

/**
 * <Make request base on given method and route>
 *
 * @param {HttpVerb} method - Methods of 'GET', 'DELETE', 'PUT', and 'POST'
 * @param {string} path - the route or path for the request
 * @param {unknown} parameters - request parameters
 *
 * @returns {{ statusCode, bodyObj }} - returns a object containing:
 * 1. status code - to indicate the status of the server for debugging
 * 2. body object - the return value for each request
 */
const httpRequestHandle = (
  method: HttpVerb,
  path: string,
  payload: unknown,
  token: string
) => {
  // request object is query parameter or body parameter
  let requestObject = {};
  if (method === 'GET' || method === 'DELETE') {
    requestObject = { qs: payload, headers: { token } };
  } else if (method === 'PUT' || method === 'POST') {
    requestObject = { json: payload, headers: { token } };
  }
  const res = request(method, SERVER_URL + path, requestObject);
  const statusCode = res.statusCode;
  if (statusCode === OK) {
    const bodyObj = JSON.parse(String(res.getBody()));
    return { bodyObj, statusCode };
  }
  return { statusCode };
};

// Following funciton are written to simplify the syntax in testing file, which
// receive parameters and make relevant http requests.

export const requestAuthLogin = (email: string, password: string) => {
  return httpRequestHandle('POST', '/auth/login/v3', { email, password }, '');
};

export const requestAuthRegister = (
  email: string,
  password: string,
  nameFirst: string,
  nameLast: string
) => {
  return httpRequestHandle(
    'POST',
    '/auth/register/v3',
    {
      email,
      password,
      nameFirst,
      nameLast,
    },
    ''
  );
};

export const requestChannelsCreate = (
  token: string,
  name: string,
  isPublic: boolean
) => {
  return httpRequestHandle(
    'POST',
    '/channels/create/v3',
    {
      name,
      isPublic,
    },
    token
  );
};

export const requestChannelsList = (token: string) => {
  return httpRequestHandle('GET', '/channels/list/v3', {}, token);
};

export const requestChannelsListAll = (token: string) => {
  return httpRequestHandle('GET', '/channels/listall/v3', {}, token);
};

export const requestChannelDetails = (token: string, channelId: number) => {
  return httpRequestHandle('GET', '/channel/details/v3', { channelId }, token);
};

export const requestChannelJoin = (token: string, channelId: number) => {
  return httpRequestHandle('POST', '/channel/join/v3', { channelId }, token);
};

export const requestChannelInvite = (
  token: string,
  channelId: number,
  uId: number
) => {
  return httpRequestHandle(
    'POST',
    '/channel/invite/v3',
    {
      channelId,
      uId,
    },
    token
  );
};

export const requestChannelMessages = (
  token: string,
  channelId: number,
  start: number
) => {
  return httpRequestHandle(
    'GET',
    '/channel/messages/v3',
    {
      channelId,
      start,
    },
    token
  );
};

export const requestUserProfile = (token: string, uId: number) => {
  return httpRequestHandle('GET', '/user/profile/v3', { uId }, token);
};

export const requestClear = () => {
  return httpRequestHandle('DELETE', '/clear/v1', {}, '');
};

export const requestAuthLogOut = (token: string) => {
  return httpRequestHandle('POST', '/auth/logout/v2', {}, token);
};

export const requestChannelLeave = (token: string, channelId: number) => {
  return httpRequestHandle('POST', '/channel/leave/v2', { channelId }, token);
};

export const requestChannelAddOwner = (
  token: string,
  channelId: number,
  uId: number
) => {
  return httpRequestHandle(
    'POST',
    '/channel/addowner/v2',
    {
      channelId,
      uId,
    },
    token
  );
};

export const requestChannelRemoveOwner = (
  token: string,
  channelId: number,
  uId: number
) => {
  return httpRequestHandle(
    'POST',
    '/channel/removeowner/v2',
    {
      channelId,
      uId,
    },
    token
  );
};

export const requestMessageSend = (
  token: string,
  channelId: number,
  message: string
) => {
  return httpRequestHandle(
    'POST',
    '/message/send/v2',
    {
      channelId,
      message,
    },
    token
  );
};

export const requestMessageEdit = (
  token: string,
  messageId: number,
  message: string
) => {
  return httpRequestHandle(
    'PUT',
    '/message/edit/v2',
    {
      messageId,
      message,
    },
    token
  );
};

export const requestMessageRemove = (token: string, messageId: number) => {
  return httpRequestHandle(
    'DELETE',
    '/message/remove/v2',
    {
      messageId,
    },
    token
  );
};

export const requestMessageReact = (
  token: string,
  messageId: number,
  reactId: number
) => {
  return httpRequestHandle(
    'POST',
    '/message/react/v1',
    {
      messageId,
      reactId,
    },
    token
  );
};

export const requestMessageUnReact = (
  token: string,
  messageId: number,
  reactId: number
) => {
  return httpRequestHandle(
    'POST',
    '/message/unreact/v1',
    {
      messageId,
      reactId,
    },
    token
  );
};

export const requestMessagePin = (token: string, messageId: number) => {
  return httpRequestHandle(
    'POST',
    '/message/pin/v1',
    {
      messageId,
    },
    token
  );
};

export const requestMessageUnPin = (token: string, messageId: number) => {
  return httpRequestHandle(
    'POST',
    '/message/unpin/v1',
    {
      messageId,
    },
    token
  );
};

export const requestDmCreate = (token: string, uIds: Array<number>) => {
  return httpRequestHandle('POST', '/dm/create/v2', { uIds }, token);
};

export const requestDmList = (token: string) => {
  return httpRequestHandle('GET', '/dm/list/v2', {}, token);
};

export const requestDmRemove = (token: string, dmId: number) => {
  return httpRequestHandle('DELETE', '/dm/remove/v2', { dmId }, token);
};

export const requestDmDetails = (token: string, dmId: number) => {
  return httpRequestHandle('GET', '/dm/details/v2', { dmId }, token);
};

export const requestDmLeave = (token: string, dmId: number) => {
  return httpRequestHandle('POST', '/dm/leave/v2', { dmId }, token);
};

export const requestDmMessages = (
  token: string,
  dmId: number,
  start: number
) => {
  return httpRequestHandle('GET', '/dm/messages/v2', { dmId, start }, token);
};

export const requestMessageSendDm = (
  token: string,
  dmId: number,
  message: string
) => {
  return httpRequestHandle(
    'POST',
    '/message/senddm/v2',
    {
      dmId,
      message,
    },
    token
  );
};

export const requestUsersAll = (token: string) => {
  return httpRequestHandle('GET', '/users/all/v2', {}, token);
};

export const requestUserProfileSetName = (
  token: string,
  nameFirst: string,
  nameLast: string
) => {
  return httpRequestHandle(
    'PUT',
    '/user/profile/setname/v2',
    {
      nameFirst,
      nameLast,
    },
    token
  );
};

export const requestUserProfileSetEmail = (token: string, email: string) => {
  return httpRequestHandle(
    'PUT',
    '/user/profile/setemail/v2',
    {
      email,
    },
    token
  );
};

export const requestUserProfileSetHandle = (
  token: string,
  handleStr: string
) => {
  return httpRequestHandle(
    'PUT',
    '/user/profile/sethandle/v2',
    {
      handleStr,
    },
    token
  );
};
export const requestAuthPasswordresetRequest = (email: string) => {
  return httpRequestHandle(
    'POST',
    '/auth/passwordreset/request/v1',
    { email },
    ''
  );
};

export const requestAuthPasswordresetReset = (
  resetCode: string,
  newPassword: string
) => {
  return httpRequestHandle(
    'POST',
    '/auth/passwordreset/reset/v1',
    { resetCode, newPassword },
    ''
  );
};

export const requestUserProfileUploadPhoto = (
  token: string,
  imgUrl: string,
  xStart: number,
  yStart: number,
  xEnd: number,
  yEnd: number
) => {
  return httpRequestHandle(
    'POST',
    '/user/profile/uploadphoto/v1',
    { imgUrl, xStart, yStart, xEnd, yEnd },
    token
  );
};
