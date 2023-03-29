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
 * 1. Token is invalid
 * 2. ChannelId does not refer to a valid channel
 * 3. Length of message is less than 1 or over 1000 characters
 * 4. ChannelId is valid and the authorised user is not a member of the channel
 * @returns {messageIdObj} - return if all error cases are avoided
 *
 */
export const messageSendV1 = (
  token: string,
  channelId: number,
  message: string
): messageIdObj | Error => {
  const data = getData();
  const channel = findChannel(channelId);
  if (!isTokenValid(token)) {
    return { error: 'Invalid token' };// Token is invalid
  } else if (channel === undefined) {
    return { error: 'Invalid channelId' };// ChannelId does not refer to a valid channel
  } else if (message.length < 1 || message.length > 1000) {
    // Length of message is less than 1 or over 1000 characters
    return { error: 'Invalid message length' };
  }
  const uId = findUserFromToken(token);
  if (!isMember(uId, channelId)) {
    // ChannelId is valid and the authorised user is not a member of the channel
    return { error: 'The user is not a member of the channel' };
  }
  const messageId = createUniqueId();
  data.messages.unshift({
    messageId,
    uId,
    message,
    timeSent: Date.now() / 1000,
    isChannelMessage: true,
    dmOrChannelId: channelId,
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
 * 1. token is invalid
 * 2. messageId does not refer to a valid message within a channel/DM that the
 *    authorised user has joined
 * 3. length of message is over 1000 characters
 * 4. the message was not sent by the authorised user making this request and
 *    the user does not have owner permissions in the channel/DM
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

  if (!isTokenValid(token)) {
    return { error: 'Invalid token' };// token is invalid
  } else if (!isMessageValid(messageId)) {
    // messageId does not refer to a valid message
    return { error: 'Invalid massage Id' };
  } else if (message.length > 1000) {
    // length of message is over 1000 characters
    return { error: 'Invalid message length' };
  }

  const MessageToEdit = findStoredMessageFromId(messageId);
  const uId = findUserFromToken(token);
  const User = findUser(uId);

  // messageId does not refer to a valid message within a channel/DM
  // that the authorised user has joined
  if (
    !User.channels.includes(MessageToEdit.dmOrChannelId) &&
    !User.dms.includes(MessageToEdit.dmOrChannelId)
  ) {
    return { error: "Message is not in user's chat" };
  }

  // the message was not sent by the authorised user making this request and
  // the user does not have owner permissions in the channel/DM
  if (MessageToEdit.isChannelMessage) {
    // Channel messages
    if (
      uId !== MessageToEdit.uId &&
      !isOwner(uId, MessageToEdit.dmOrChannelId) &&
      findUser(uId).permissionId !== 1
    ) {
      return { error: "User doesn't have permission" };
    }
  } else {
    // Dm messages
    if (
      uId !== MessageToEdit.uId &&
      !isDmOwner(uId, MessageToEdit.dmOrChannelId)
    ) {
      return { error: "User doesn't have permission" };
    }
  }

  if (message.length === 0) {
    // If the new message is an empty string, the message is deleted
    messageRemoveV1(token, messageId);
  } else { // Edit the message
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
 * 1. token is invalid
 * 2. messageId does not refer to a valid message within a channel/DM that
 *    the authorised user has joined
 * 3. the message was not sent by the authorised user making this request and
 *    the user does not have owner permissions in the channel/DM
 * @returns {} - return if all error cases are avoided
 *
 */
export const messageRemoveV1 = (
  token: string,
  messageId: number
): Record<string, never> | Error => {
  const data = getData();

  if (!isTokenValid(token)) {
    return { error: 'Invalid token' };// token is invalid
  } else if (!isMessageValid(messageId)) {
    return { error: 'Invalid massage Id' };// messageId does not refer to a valid message
  }

  const MessageToDelete = findStoredMessageFromId(messageId);
  const uId = findUserFromToken(token);
  const storedUser = findUser(uId);

  // messageId does not refer to a valid message within a channel/DM
  // that the authorised user has joined
  if (!storedUser.channels.includes(MessageToDelete.dmOrChannelId) &&
      !storedUser.dms.includes(MessageToDelete.dmOrChannelId)) {
    return { error: "Message is not in user's chat" };
  }
  // the message was not sent by the authorised user making this request
  // and the user does not have owner permissions in the channel/DM
  if (MessageToDelete.isChannelMessage) {
    if (
      uId !== MessageToDelete.uId &&
      !isOwner(uId, MessageToDelete.dmOrChannelId) &&
      findUser(uId).permissionId !== 1
    ) {
      return { error: "User doesn't have permission" };
    }
  } else {
    if (
      uId !== MessageToDelete.uId &&
      !isDmOwner(uId, MessageToDelete.dmOrChannelId)
    ) {
      return { error: "User doesn't have permission" };
    }
  }

  if (MessageToDelete.isChannelMessage) {
    const channel = findChannel(MessageToDelete.dmOrChannelId);
    channel.messages = channel.messages.filter(
      (message) => message !== messageId
    );
  } else {
    const Dm = findDm(MessageToDelete.dmOrChannelId);
    Dm.messages = Dm.messages.filter((message) => message !== messageId);
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
 * 1. token is invalid
 * 1. dmId does not refer to a valid DM
 * 2. length of message is less than 1 or over 1000 characters
 * 3. dmId is valid and the authorised user is not a member of the DM
 * @returns {messageIdObj} - return if all error cases are avoided
 *
 */
export const messageSendDmV1 = (
  token: string,
  dmId: number,
  message: string
): messageIdObj | Error => {
  const data = getData();
  const Dm = findDm(dmId);
  if (!isTokenValid(token)) {
    return { error: 'Invalid token' };// token is invalid
  } else if (Dm === undefined) {
    return { error: 'Invalid DmId' };// dmId does not refer to a valid DM
  } else if (message.length < 1 || message.length > 1000) {
    // length of message is less than 1 or over 1000 characters
    return { error: 'Invalid message length' };
  }
  const uId = findUserFromToken(token);
  if (!Dm.allMembers.includes(uId)) {
    // dmId is valid and the authorised user is not a member of the DM
    return { error: 'The user is not a member of the channel' };
  }
  const messageId = createUniqueId();
  data.messages.unshift({
    messageId,
    uId,
    message,
    timeSent: Date.now() / 1000,
    isChannelMessage: false,
    dmOrChannelId: dmId,
  });
  Dm.messages.unshift(messageId);
  setData(data);
  return { messageId };
};
