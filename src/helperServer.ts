import request, { HttpVerb } from "sync-request";
import { port, url } from "./config.json";
const SERVER_URL = `${url}:${port}`;

const httpRequestHandle = (
  method: HttpVerb,
  path: string,
  parameters: unknown
) => {
  let requestObject = {};
  if (method === "GET" || method === "DELETE") {
    requestObject = { qs: parameters };
  } else if (method === "PUT" || method === "POST") {
    requestObject = { json: parameters };
  }
  const res = request(method, SERVER_URL + path, requestObject);
  const bodyObj = JSON.parse(res.getBody() as string);
  const statusCode = res.statusCode;
  return { statusCode, bodyObj };
};

export const requestAuthLoginV2 = (email: string, password: string) => {
  return httpRequestHandle("POST", "/auth/login/v2", { email, password });
};

export const requestAuthRegisterV2 = (
  email: string,
  password: string,
  nameFirst: string,
  nameLast: string
) => {
  return httpRequestHandle("POST", "/auth/register/v2", {
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
  return httpRequestHandle("POST", "/channels/create/v2", {
    token,
    name,
    isPublic,
  });
};

export const requestChannelsListV2 = (token: string) => {
  return httpRequestHandle("GET", "/channels/list/v2", { token });
};

export const requestChannelsListAllV2 = (token: string) => {
  return httpRequestHandle("GET", "/channels/listall/v2", { token });
};

export const requestChannelDetailsV2 = (token: string, channelId: number) => {
  return httpRequestHandle("GET", "/channel/details/v2", { token, channelId });
};

export const requestChannelJoinV2 = (token: string, channelId: number) => {
  return httpRequestHandle("POST", "/channel/join/v2", { token, channelId });
};

export const requestChannelInviteV2 = (
  token: string,
  channelId: number,
  uId: number
) => {
  return httpRequestHandle("POST", "/channel/invite/v2", {
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
  return httpRequestHandle("GET", "/channel/messages/v2", {
    token,
    channelId,
    start,
  });
};

export const requestUserProfileV2 = (token: string, uId: number) => {
  return httpRequestHandle("GET", "/user/profile/v2", { token, uId });
};

export const requestClearV1 = () => {
  return httpRequestHandle("DELETE", "/clear/v1", {});
};
