import { Error, getData, setData } from './dataStore';
import {
  isMember,
  isOwner,
  isDmOwner,
  isMessageValid,
  isTokenValid,
  createUniqueId,
  findChannel,
  findUserFromToken,
  findStoredMessageFromId,
  findUser,
  findDm,
} from './helperFunctions';

type messageIdObj = {
  messageId: number;
};

/**
 * <Send a message from authorised user to the channel specified by channelId.>
 *
 * @param {string} token - token representing a session for an user
 * @param {number} channelId - Id of the channel
 * @param {string} message - Message sent
 *
 * @returns {Error} - returns when any of:
 * 1. channelId does not refer to a valid channel
 * 2. length of message is less than 1 or over 1000 characters
 * 3. channelId is valid and the authorised user is not a member of the channel
 * 4. token is invalid
 * @returns {messageIdObj} - return if all error cases are avoided
 *
 */
export const messageSendV1 = (
  token: string,
  channelId: number,
  message: string
): messageIdObj | Error => {
  const data = getData();
  const channel = findChannel(data, channelId);
  if (!isTokenValid(data, token)) {
    return { error: 'Invalid token' };
  } else if (channel === undefined) {
    return { error: 'Invalid channelId' };
  } else if (message.length < 1 || message.length > 1000) {
    return { error: 'Invalid message length' };
  }
  const uId = findUserFromToken(data, token);
  if (!isMember(data, uId, channelId)) {
    return { error: 'The user is not a member of the channel' };
  }
  const messageId = createUniqueId();
  data.messages.unshift({
    messageId,
    uId,
    message,
    timeSent: Date.now() / 1000,
    isChannelMessage: true,
    dmOrChannelId: channelId
  });
  channel.messages.unshift(messageId);
  setData(data);
  return { messageId };
};

/**
 * <Given a message, update its text with new text. If the new message is an
 * empty string, the message is deleted.>
 *
 * @param {string} token - token representing a session for an user
 * @param {number} messageId - Id of the message
 * @param {string} message - Message sent
 *
 * @returns {Error} - returns when any of:
 * 1. length of message is over 1000 characters
 * 2. messageId does not refer to a valid message within a channel/DM that the
 *    authorised user has joined
 * 3. the message was not sent by the authorised user making this request and
 *    the user does not have owner permissions in the channel/DM
 * 4. token is invalid
 *
 * @returns {} - return if all error cases are avoided
 *
 */
export const messageEditV1 = (
  token: string,
  messageId: number,
  message: string
): Record<string, never> | Error => {
  const data = getData();

  if (!isTokenValid(data, token)) {
    return { error: 'Invalid token' };
  } else if (!isMessageValid(data, messageId)) {
    return { error: 'Invalid massage Id' };
  } else if (message.length > 1000) {
    return { error: 'Invalid message length' };
  }

  const MessageToEdit = findStoredMessageFromId(data, messageId);
  const uId = findUserFromToken(data, token);
  const User = findUser(data, uId);

  if (!User.channels.includes(MessageToEdit.dmOrChannelId) &&
  !User.dms.includes(MessageToEdit.dmOrChannelId)) {
    return { error: "Message is not in user's chat" };
  }
  if (MessageToEdit.isChannelMessage) {
    if (uId !== MessageToEdit.uId &&
      !isOwner(data, uId, MessageToEdit.dmOrChannelId) &&
      findUser(data, uId).permissionId !== 1) {
      return { error: "User doesn't have permission" };
    }
  } else {
    if (uId !== MessageToEdit.uId &&
      !isDmOwner(data, uId, MessageToEdit.dmOrChannelId)) {
      return { error: "User doesn't have permission" };
    }
  }

  if (message.length === 0) {
    messageRemoveV1(token, messageId);
  } else {
    MessageToEdit.message = message;
  }
  setData(data);
  return {};
};

/**
 * <Given a messageId for a message, this message is removed from the
 * channel/DM>
 *
 * @param {string} token - token representing a session for an user
 * @param {number} messageId - Id of the message
 *
 * @returns {Error} - returns when any of:
 * 1. messageId does not refer to a valid message within a channel/DM that
 *    the authorised user has joined
 * 2. the message was not sent by the authorised user making this request and
 *    the user does not have owner permissions in the channel/DM
 * 3. token is invalid
 * @returns {} - return if all error cases are avoided
 *
 */
export const messageRemoveV1 = (
  token: string,
  messageId: number
): Record<string, never> | Error => {
  const data = getData();

  if (!isTokenValid(data, token)) {
    return { error: 'Invalid token' };
  } else if (!isMessageValid(data, messageId)) {
    return { error: 'Invalid massage Id' };
  }

  const MessageToDelete = findStoredMessageFromId(data, messageId);
  const uId = findUserFromToken(data, token);
  const storedUser = findUser(data, uId);

  if (!storedUser.channels.includes(MessageToDelete.dmOrChannelId) &&
  !storedUser.dms.includes(MessageToDelete.dmOrChannelId)) {
    return { error: "Message is not in user's chat" };
  }
  if (MessageToDelete.isChannelMessage) {
    if (uId !== MessageToDelete.uId &&
      !isOwner(data, uId, MessageToDelete.dmOrChannelId) &&
      findUser(data, uId).permissionId !== 1) {
      return { error: "User doesn't have permission" };
    }
  } else {
    if (uId !== MessageToDelete.uId &&
      !isDmOwner(data, uId, MessageToDelete.dmOrChannelId)) {
      return { error: "User doesn't have permission" };
    }
  }
  
  if (MessageToDelete.isChannelMessage) {
    const channel = findChannel(data, MessageToDelete.dmOrChannelId);
    channel.messages = channel.messages.filter(
      (message) => message !== messageId
    );
  } else {
    const Dm = findDm(data, MessageToDelete.dmOrChannelId);
    Dm.messages = Dm.messages.filter(
      (message) => message !== messageId
    );
  }
  data.messages = data.messages.filter(
    (message) => message.messageId !== messageId
  );
  return {};
};

/**
 * <Send a message from authorised user to the DM specified by dmId.>
 *
 * @param {string} token - token representing a session for an user
 * @param {number} dmId - Id of the dm chat
 * @param {string} message - Message sent
 *
 * @returns {Error} - returns when any of:
 * 1. dmId does not refer to a valid DM
 * 2. length of message is less than 1 or over 1000 characters
 * 3. dmId is valid and the authorised user is not a member of the DM
 * 4. token is invalid
 * @returns {messageIdObj} - return if all error cases are avoided
 *
 */
export const messageSendDmV1 = (
  token: string,
  dmId: number,
  message: string
): messageIdObj | Error => {
  const data = getData();
  const Dm = findDm(data, dmId);
  if (!isTokenValid(data, token)) {
    return { error: 'Invalid token' };
  } else if (Dm === undefined) {
    return { error: 'Invalid DmId' };
  } else if (message.length < 1 || message.length > 1000) {
    return { error: 'Invalid message length' };
  }
  const uId = findUserFromToken(data, token);
  if (!Dm.allMembers.includes(uId)) {
    return { error: 'The user is not a member of the channel' };
  }
  const messageId = createUniqueId();
  data.messages.unshift({
    messageId,
    uId,
    message,
    timeSent: Date.now() / 1000,
    isChannelMessage: true,
    dmOrChannelId: dmId
  });
  Dm.messages.unshift(messageId);
  setData(data);
  return { messageId };
};
