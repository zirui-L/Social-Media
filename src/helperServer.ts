import request, { HttpVerb } from 'sync-request';
import { port, url } from './config.json';
const SERVER_URL = `${url}:${port}`;

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
  const bodyObj = JSON.parse(res.getBody() as string);
  const statusCode = res.statusCode;
  return { statusCode, bodyObj };
};

// Following funciton are written to simplify the syntax in testing file, which
// receive parameters and make relevant http requests.

export const requestAuthLoginV2 = (email: string, password: string) => {
  return httpRequestHandle('POST', '/auth/login/v2', { email, password });
};

export const requestAuthRegisterV2 = (
  email: string,
  password: string,
  nameFirst: string,
  nameLast: string
) => {
  return httpRequestHandle('POST', '/auth/register/v2', {
    email,
    password,
    nameFirst,
    nameLast,
  });
};

export const requestChannelsCreateV2 = (
  token: string,
  name: string,
  isPublic: boolean
) => {
  return httpRequestHandle('POST', '/channels/create/v2', {
    token,
    name,
    isPublic,
  });
};

export const requestChannelsListV2 = (token: string) => {
  return httpRequestHandle('GET', '/channels/list/v2', { token });
};

export const requestChannelsListAllV2 = (token: string) => {
  return httpRequestHandle('GET', '/channels/listall/v2', { token });
};

export const requestChannelDetailsV2 = (token: string, channelId: number) => {
  return httpRequestHandle('GET', '/channel/details/v2', { token, channelId });
};

export const requestChannelJoinV2 = (token: string, channelId: number) => {
  return httpRequestHandle('POST', '/channel/join/v2', { token, channelId });
};

export const requestChannelInviteV2 = (
  token: string,
  channelId: number,
  uId: number
) => {
  return httpRequestHandle('POST', '/channel/invite/v2', {
    token,
    channelId,
    uId,
  });
};

export const requestChannelMessagesV2 = (
  token: string,
  channelId: number,
  start: number
) => {
  return httpRequestHandle('GET', '/channel/messages/v2', {
    token,
    channelId,
    start,
  });
};

export const requestUserProfileV2 = (token: string, uId: number) => {
  return httpRequestHandle('GET', '/user/profile/v2', { token, uId });
};

export const requestClearV1 = () => {
  return httpRequestHandle('DELETE', '/clear/v1', {});
};

export const requestAuthLogOutV1 = (token: string) => {
  return httpRequestHandle('POST', '/auth/logout/v1', { token });
};

export const requestChannelLeaveV1 = (token: string, channelId: number) => {
  return httpRequestHandle('POST', '/channel/leave/v1', { token, channelId });
};

export const requestChannelAddOwnerV1 = (
  token: string,
  channelId: number,
  uId: number
) => {
  return httpRequestHandle('POST', '/channel/addowner/v1', {
    token,
    channelId,
    uId,
  });
};

export const requestChannelRemoveOwnerV1 = (
  token: string,
  channelId: number,
  uId: number
) => {
  return httpRequestHandle('POST', '/channel/removeowner/v1', {
    token,
    channelId,
    uId,
  });
};

export const requestMessageSendV1 = (
  token: string,
  channelId: number,
  message: string
) => {
  return httpRequestHandle('POST', '/message/send/v1', {
    token,
    channelId,
    message,
  });
};

export const requestMessageEditV1 = (
  token: string,
  messageId: number,
  message: string
) => {
  return httpRequestHandle('PUT', '/message/edit/v1', {
    token,
    messageId,
    message,
  });
};

export const requestMessageRemoveV1 = (token: string, messageId: number) => {
  return httpRequestHandle('DELETE', '/message/remove/v1', {
    token,
    messageId,
  });
};

export const requestDmCreateV1 = (token: string, uIds: Array<number>) => {
  return httpRequestHandle('POST', '/dm/create/v1', { token, uIds });
};

export const requestDmListV1 = (token: string) => {
  return httpRequestHandle('GET', '/dm/list/v1', { token });
};

export const requestDmRemoveV1 = (token: string, dmId: number) => {
  return httpRequestHandle('DELETE', '/dm/remove/v1', { token, dmId });
};

export const requestDmDetailsV1 = (token: string, dmId: number) => {
  return httpRequestHandle('GET', '/dm/details/v1', { token, dmId });
};

export const requestDmLeaveV1 = (token: string, dmId: number) => {
  return httpRequestHandle('POST', '/dm/leave/v1', { token, dmId });
};

export const requestDmMessagesV1 = (
  token: string,
  dmId: number,
  start: number
) => {
  return httpRequestHandle('GET', '/dm/messages/v1', { token, dmId, start });
};

export const requestMessageSendDmV1 = (
  token: string,
  dmId: number,
  message: string
) => {
  return httpRequestHandle('POST', '/message/senddm/v1', {
    token,
    dmId,
    message,
  });
};

export const requestUsersAllV1 = (token: string) => {
  return httpRequestHandle('GET', '/users/all/v1', { token });
};

export const requestUserProfileSetNameV1 = (
  token: string,
  nameFirst: string,
  nameLast: string
) => {
  return httpRequestHandle('PUT', '/user/profile/setname/v1', {
    token,
    nameFirst,
    nameLast,
  });
};

export const requestUserProfileSetEmailV1 = (token: string, email: string) => {
  return httpRequestHandle('PUT', '/user/profile/setemail/v1', {
    token,
    email,
  });
};

export const requestUserProfileSetHandleV1 = (
  token: string,
  handleStr: string
) => {
  return httpRequestHandle('PUT', '/user/profile/sethandle/v1', {
    token,
    handleStr,
  });
};
