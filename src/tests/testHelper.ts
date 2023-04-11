import { requestMessageSend } from '../helperFunctions/helperServer';

export const createMessages = (
  token: string,
  channelId: number,
  repetition: number
): void => {
  for (let count = 0; count < repetition; count++) {
    requestMessageSend(token, channelId, `${count}`);
  }
};

export function createString(length: number) {
  let result = '';
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  return result;
}
