import request, { HttpVerb } from 'sync-request';
import { port, url } from '../config.json';
const SERVER_URL = `${url}:${port}`;

export const OK = 200;
export const BAD_REQUEST = 400;
export const FORBIDDEN = 403;

type routeReturn = {
  statusCode: number;
  bodyObj: any;
};

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
  parameters: unknown
): routeReturn => {
  let requestObject = {};
  if (method === 'GET' || method === 'DELETE') {
    requestObject = { qs: parameters };
  } else if (method === 'PUT' || method === 'POST') {
    requestObject = { json: parameters };
  }
  const res = request(method, SERVER_URL + path, requestObject);
  const statusCode = res.statusCode;
  let bodyObj = {};
  if (statusCode !== OK) {
    return { statusCode, bodyObj };
  }
  bodyObj = JSON.parse(res.getBody() as string);
  return { statusCode, bodyObj };
};

// Following funciton are written to simplify the syntax in testing file, which
// receive parameters and make relevant http requests.

export const requestAuthLogin = (email: string, password: string) => {
  return httpRequestHandle('POST', '/auth/login/v3', { email, password });
};

export const requestAuthRegister = (
  email: string,
  password: string,
  nameFirst: string,
  nameLast: string
) => {
  return httpRequestHandle('POST', '/auth/register/v3', {
    email,
    password,
    nameFirst,
    nameLast,
  });
};

export const requestChannelsCreate = (
  token: string,
  name: string,
  isPublic: boolean
) => {
  return httpRequestHandle('POST', '/channels/create/v3', {
    token,
    name,
    isPublic,
  });
};

export const requestChannelsList = (token: string) => {
  return httpRequestHandle('GET', '/channels/list/v3', { token });
};

export const requestChannelsListAll = (token: string) => {
  return httpRequestHandle('GET', '/channels/listall/v3', { token });
};

export const requestChannelDetails = (token: string, channelId: number) => {
  return httpRequestHandle('GET', '/channel/details/v3', { token, channelId });
};

export const requestChannelJoin = (token: string, channelId: number) => {
  return httpRequestHandle('POST', '/channel/join/v3', { token, channelId });
};

export const requestChannelInvite = (
  token: string,
  channelId: number,
  uId: number
) => {
  return httpRequestHandle('POST', '/channel/invite/v3', {
    token,
    channelId,
    uId,
  });
};

export const requestChannelMessages = (
  token: string,
  channelId: number,
  start: number
) => {
  return httpRequestHandle('GET', '/channel/messages/v3', {
    token,
    channelId,
    start,
  });
};

export const requestUserProfile = (token: string, uId: number) => {
  return httpRequestHandle('GET', '/user/profile/v3', { token, uId });
};

export const requestClear = () => {
  return httpRequestHandle('DELETE', '/clear/v1', {});
};

export const requestAuthLogOut = (token: string) => {
  return httpRequestHandle('POST', '/auth/logout/v2', { token });
};

export const requestChannelLeave = (token: string, channelId: number) => {
  return httpRequestHandle('POST', '/channel/leave/v2', { token, channelId });
};

export const requestChannelAddOwner = (
  token: string,
  channelId: number,
  uId: number
) => {
  return httpRequestHandle('POST', '/channel/addowner/v2', {
    token,
    channelId,
    uId,
  });
};

export const requestChannelRemoveOwner = (
  token: string,
  channelId: number,
  uId: number
) => {
  return httpRequestHandle('POST', '/channel/removeowner/v2', {
    token,
    channelId,
    uId,
  });
};

export const requestMessageSend = (
  token: string,
  channelId: number,
  message: string
) => {
  return httpRequestHandle('POST', '/message/send/v2', {
    token,
    channelId,
    message,
  });
};

export const requestMessageEdit = (
  token: string,
  messageId: number,
  message: string
) => {
  return httpRequestHandle('PUT', '/message/edit/v2', {
    token,
    messageId,
    message,
  });
};

export const requestMessageRemove = (token: string, messageId: number) => {
  return httpRequestHandle('DELETE', '/message/remove/v2', {
    token,
    messageId,
  });
};

export const requestMessageReact = (
  token: string,
  messageId: number,
  reactId: number
) => {
  return httpRequestHandle('POST', '/message/react/v1', {
    token,
    messageId,
    reactId,
  });
};

export const requestMessageUnReact = (
  token: string,
  messageId: number,
  reactId: number
) => {
  return httpRequestHandle('POST', '/message/unreact/v1', {
    token,
    messageId,
    reactId,
  });
};

export const requestMessagePin = (token: string, messageId: number) => {
  return httpRequestHandle('POST', '/message/pin/v1', {
    token,
    messageId,
  });
};

export const requestMessageUnPin = (token: string, messageId: number) => {
  return httpRequestHandle('POST', '/message/unpin/v1', {
    token,
    messageId,
  });
};

export const requestDmCreate = (token: string, uIds: Array<number>) => {
  return httpRequestHandle('POST', '/dm/create/v2', { token, uIds });
};

export const requestDmList = (token: string) => {
  return httpRequestHandle('GET', '/dm/list/v2', { token });
};

export const requestDmRemove = (token: string, dmId: number) => {
  return httpRequestHandle('DELETE', '/dm/remove/v2', { token, dmId });
};

export const requestDmDetails = (token: string, dmId: number) => {
  return httpRequestHandle('GET', '/dm/details/v2', { token, dmId });
};

export const requestDmLeave = (token: string, dmId: number) => {
  return httpRequestHandle('POST', '/dm/leave/v2', { token, dmId });
};

export const requestDmMessages = (
  token: string,
  dmId: number,
  start: number
) => {
  return httpRequestHandle('GET', '/dm/messages/v2', { token, dmId, start });
};

export const requestMessageSendDm = (
  token: string,
  dmId: number,
  message: string
) => {
  return httpRequestHandle('POST', '/message/senddm/v2', {
    token,
    dmId,
    message,
  });
};

export const requestUsersAll = (token: string) => {
  return httpRequestHandle('GET', '/users/all/v2', { token });
};

export const requestUserProfileSetName = (
  token: string,
  nameFirst: string,
  nameLast: string
) => {
  return httpRequestHandle('PUT', '/user/profile/setname/v2', {
    token,
    nameFirst,
    nameLast,
  });
};

export const requestUserProfileSetEmail = (token: string, email: string) => {
  return httpRequestHandle('PUT', '/user/profile/setemail/v2', {
    token,
    email,
  });
};

export const requestUserProfileSetHandle = (
  token: string,
  handleStr: string
) => {
  return httpRequestHandle('PUT', '/user/profile/sethandle/v2', {
    token,
    handleStr,
  });
};
