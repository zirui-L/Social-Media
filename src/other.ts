import { getData, setData } from './dataStore';
import HTTPError from 'http-errors';
import { BAD_REQUEST, FORBIDDEN } from './helperFunctions/helperFunctions';
import {
  findChannel,
  findDm,
  findStoredMessageFromId,
  findUser,
  findUserFromToken,
  isTokenValid,
} from './helperFunctions/helperFunctions';

/**
 * <Create a new user with input email, password, first and last names. Create
 * unique authUserId and handle string for each user, and store all informations>
 *
 * @param none
 *
 * @returns {{}} - if the function successifully clear the data stored
 */

export const clearV1 = (): Record<string, never> => {
  const data = getData();
  data.channels.length = 0;
  data.users.length = 0;
  data.messages.length = 0;
  data.dms.length = 0;
  data.tokens.length = 0;
  data.reactIds = [1];
  data.resetCodes.length = 0;
  data.globalOwners.length = 0;
  setData(data);
  return {};
};

/**
 * <Returns the user's most recent 20 notifications, ordered from most recent to
 *  least recent.>
 *
 * @param N/A
 *
 * @returns {Error} - returns when any of:
 * 1. Token is invalid
 * @returns { notifications } - return if all error cases are avoided
 *
 */
export const notificationsGetV1 = (token: string) => {
  const tokenId = isTokenValid(token);

  if (!tokenId) {
    throw HTTPError(FORBIDDEN, 'Invalid token');
  }

  const uId = findUserFromToken(tokenId);

  const user = findUser(uId);

  const notifications = [];
  const notificationTemp = user.notifications.slice();

  // return the most recent 20 notifications
  for (const notification of notificationTemp) {
    if (notifications.length === 20) {
      break;
    }
    notifications.push(notification);
  }
  return { notifications };
};

/**
 * <Given a query substring, returns a collection of messages in all of the
 * channels/DMs that the user has joined that contain the query
 * (case-insensitive).>
 *
 * @param {string} queryStr - query string
 *
 * @returns {Error} - returns when any of:
 * 1. Token is invalid
 * 2. length of queryStr is less than 1 or over 1000 characters
 * @returns { messages } - return if all error cases are avoided
 *
 */
export const searchV1 = (token: string, queryStr: string) => {
  const tokenId = isTokenValid(token);

  if (!tokenId) {
    throw HTTPError(FORBIDDEN, 'Invalid token');
  }

  if (queryStr.length < 1 || queryStr.length > 1000) {
    throw HTTPError(BAD_REQUEST, 'Error');
  }

  const uId = findUserFromToken(tokenId);

  const user = findUser(uId);

  const messages = [];

  // find all matching dm messages
  for (const dmId of user.dms) {
    const dm = findDm(dmId);
    for (const messageId of dm.messages) {
      const message = findStoredMessageFromId(messageId);
      const msg = message.message.toLowerCase();
      if (msg.includes(queryStr.toLowerCase()) && message.isSent) {
        messages.push({
          messageId: message.messageId,
          uId: message.uId,
          message: message.message,
          timeSent: message.timeSent,
          reacts: message.reacts,
          isPinned: message.isPinned,
        });
      }
    }
  }

  // find all matching channel messages
  for (const channelId of user.channels) {
    const channel = findChannel(channelId);
    for (const messageId of channel.messages) {
      const message = findStoredMessageFromId(messageId);

      const msg = message.message.toLowerCase();

      if (msg.includes(queryStr.toLowerCase()) && message.isSent) {
        messages.push({
          messageId: message.messageId,
          uId: message.uId,
          message: message.message,
          timeSent: message.timeSent,
          reacts: message.reacts,
          isPinned: message.isPinned,
        });
      }
    }
  }

  return { messages };
};
