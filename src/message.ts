import { Error } from './dataStore';

type messageIdObj = {
  messageId: number;
};

export const messageSendV1 = (
  token: string,
  channelId: number,
  message: string
): messageIdObj | Error => {
  return { messageId: 0 };
};

export const messageEditV1 = (
  token: string,
  messageId: number,
  message: string
): Record<string, never> | Error => {
  return {};
};

export const messageRemoveV1 = (
  token: string,
  messageId: number
): Record<string, never> | Error => {
  return {};
};

export const messageSendDmV1 = (
  token: string,
  dmId: number,
  message: string
): messageIdObj | Error => {
  return { messageId: 0 };
};
