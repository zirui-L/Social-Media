import { Error, getData, setData, React } from './dataStore';
import {
  isMember,
  isOwner,
  isDmOwner,
  isMessageValid,
  isTokenValid,
  isReactIdValid,
  createUniqueId,
  findChannel,
  findUserFromToken,
  findStoredMessageFromId,
  findUser,
  findDm,
} from './helperFunctions/helperFunctions';
import HTTPError from 'http-errors';
import { BAD_REQUEST, FORBIDDEN } from './helperFunctions/helperServer';

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
export const messageSendV2 = (
  token: string,
  channelId: number,
  message: string
): messageIdObj => {
  const data = getData();
  const channel = findChannel(channelId);

  const tokenId = isTokenValid(token);

  if (!tokenId) {
    throw HTTPError(BAD_REQUEST, 'Invalid token');
  } else if (channel === undefined) {
    throw HTTPError(BAD_REQUEST, 'Invalid channelId'); // ChannelId does not refer to a valid channel
  } else if (message.length < 1 || message.length > 1000) {
    // Length of message is less than 1 or over 1000 characters
    throw HTTPError(BAD_REQUEST, 'Invalid message length');
  }

  const uId = findUserFromToken(tokenId);
  if (!isMember(uId, channelId)) {
    // ChannelId is valid and the authorised user is not a member of the channel
    throw HTTPError(FORBIDDEN, 'The user is not a member of the channel');
  }
  const messageId = createUniqueId();
  data.messages.unshift({
    messageId,
    uId,
    message,
    timeSent: Date.now() / 1000,
    isChannelMessage: true,
    dmOrChannelId: channelId,
    reacts: [],
    isPinned: false,
    taggedUsers: [],
  });
  channel.messages.unshift(messageId); // unshift the most recent message to the front
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
export const messageEditV2 = (
  token: string,
  messageId: number,
  message: string
): Record<string, never> => {
  const data = getData();

  const tokenId = isTokenValid(token);

  if (!tokenId) {
    throw HTTPError(BAD_REQUEST, 'Invalid token');
  } else if (!isMessageValid(messageId)) {
    // messageId does not refer to a valid message
    throw HTTPError(BAD_REQUEST, 'Invalid message Id');
  } else if (message.length > 1000) {
    // length of message is over 1000 characters
    throw HTTPError(BAD_REQUEST, 'Invalid message length');
  }

  const MessageToEdit = findStoredMessageFromId(messageId);
  const uId = findUserFromToken(tokenId);
  const User = findUser(uId);

  // messageId does not refer to a valid message within a channel/DM
  // that the authorised user has joined
  if (
    !User.channels.includes(MessageToEdit.dmOrChannelId) &&
    !User.dms.includes(MessageToEdit.dmOrChannelId)
  ) {
    throw HTTPError(BAD_REQUEST, "Message is not in user's chat");
  }

  // the message was not sent by the authorised user making this request and
  // the user does not have owner permissions in the channel/DM
  if (MessageToEdit.isChannelMessage) {
    // Channel messages
    if (
      uId !== MessageToEdit.uId &&
      !isOwner(uId, MessageToEdit.dmOrChannelId) &&
      findUser(uId).permissionId !== 1 // user is not global owner
    ) {
      throw HTTPError(BAD_REQUEST, "User doesn't have permission");
    }
  } else {
    // Dm messages
    if (
      uId !== MessageToEdit.uId &&
      !isDmOwner(uId, MessageToEdit.dmOrChannelId)
    ) {
      throw HTTPError(BAD_REQUEST, "User doesn't have permission");
    }
  }

  if (message.length === 0) {
    // If the new message is an empty string, the message is deleted
    messageRemoveV2(token, messageId);
  } else {
    // Edit the message
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
export const messageRemoveV2 = (
  token: string,
  messageId: number
): Record<string, never> | Error => {
  const data = getData();

  const tokenId = isTokenValid(token);

  if (!tokenId) {
    throw HTTPError(BAD_REQUEST, 'Invalid token');
  } else if (!isMessageValid(messageId)) {
    throw HTTPError(BAD_REQUEST, 'Invalid message Id');
  }

  const MessageToDelete = findStoredMessageFromId(messageId);
  const uId = findUserFromToken(tokenId);
  const storedUser = findUser(uId);

  // messageId does not refer to a valid message within a channel/DM
  // that the authorised user has joined
  if (
    !storedUser.channels.includes(MessageToDelete.dmOrChannelId) &&
    !storedUser.dms.includes(MessageToDelete.dmOrChannelId)
  ) {
    throw HTTPError(BAD_REQUEST, "Message is not in user's chat");
  }
  // the message was not sent by the authorised user making this request
  // and the user does not have owner permissions in the channel/DM
  if (MessageToDelete.isChannelMessage) {
    if (
      uId !== MessageToDelete.uId &&
      !isOwner(uId, MessageToDelete.dmOrChannelId) &&
      findUser(uId).permissionId !== 1 // User is not global owner
    ) {
      throw HTTPError(BAD_REQUEST, "User doesn't have permission");
    }
  } else {
    if (
      uId !== MessageToDelete.uId &&
      !isDmOwner(uId, MessageToDelete.dmOrChannelId)
    ) {
      throw HTTPError(BAD_REQUEST, "User doesn't have permission");
    }
  }

  if (MessageToDelete.isChannelMessage) {
    const channel = findChannel(MessageToDelete.dmOrChannelId);
    channel.messages = channel.messages.filter(
      (message: number) => message !== messageId
    );
  } else {
    const Dm = findDm(MessageToDelete.dmOrChannelId);
    Dm.messages = Dm.messages.filter(
      (message: number) => message !== messageId
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
 * 1. token is invalid
 * 1. dmId does not refer to a valid DM
 * 2. length of message is less than 1 or over 1000 characters
 * 3. dmId is valid and the authorised user is not a member of the DM
 * @returns {messageIdObj} - return if all error cases are avoided
 *
 */
export const messageSendDmV2 = (
  token: string,
  dmId: number,
  message: string
): messageIdObj | Error => {
  const data = getData();
  const Dm = findDm(dmId);

  const tokenId = isTokenValid(token);

  if (!tokenId) {
    throw HTTPError(BAD_REQUEST, 'Invalid token');
  } else if (Dm === undefined) {
    throw HTTPError(BAD_REQUEST, 'Invalid DmId');
  } else if (message.length < 1 || message.length > 1000) {
    // length of message is less than 1 or over 1000 characters
    throw HTTPError(BAD_REQUEST, 'Invalid message length');
  }
  const uId = findUserFromToken(tokenId);
  if (!Dm.allMembers.includes(uId)) {
    // dmId is valid and the authorised user is not a member of the DM
    throw HTTPError(FORBIDDEN, 'The user is not a member of the dm');
  }
  const messageId = createUniqueId();
  data.messages.unshift({
    messageId,
    uId,
    message,
    timeSent: Date.now() / 1000,
    isChannelMessage: false,
    dmOrChannelId: dmId,
    reacts: [],
    isPinned: false,
    taggedUsers: [],
  });
  Dm.messages.unshift(messageId); // unshift the most recent message to the front
  setData(data);
  return { messageId };
};

export const messageReactV1 = (
  token: string,
  messageId: number,
  reactId: number
): Record<string, never> => {
  const data = getData();

  const tokenId = isTokenValid(token);

  if (!tokenId) {
    throw HTTPError(FORBIDDEN, 'Invalid token');
  } else if (!isMessageValid(messageId)) {
    throw HTTPError(BAD_REQUEST, 'Invalid message id'); // messageId does not refer to a valid message
  } else if (!isReactIdValid(reactId)) {
    throw HTTPError(BAD_REQUEST, 'Invalid react id');
  }

  const message = findStoredMessageFromId(messageId);
  const uId = findUserFromToken(tokenId);
  const user = findUser(uId);

  // messageId does not refer to a valid message within a channel/DM
  // that the authorised user has joined
  if (
    !user.channels.includes(message.dmOrChannelId) &&
    !user.dms.includes(message.dmOrChannelId)
  ) {
    throw HTTPError(BAD_REQUEST, "Message is not in user's chat");
  }

  const react = message.reacts.find(
    (react: React) => react.reactId === reactId
  );
  if (react && react.uIds.includes(uId)) {
    throw HTTPError(BAD_REQUEST, 'Already reacted');
  }

  if (!react) {
    message.reacts.push({
      reactId: reactId,
      uIds: [uId],
    });
  } else {
    react.uIds.push(uId);
  }

  setData(data);
  return {};
};

export const messageUnReactV1 = (
  token: string,
  messageId: number,
  reactId: number
): Record<string, never> => {
  const data = getData();

  const tokenId = isTokenValid(token);

  if (!tokenId) {
    throw HTTPError(FORBIDDEN, 'Invalid token');
  } else if (!isMessageValid(messageId)) {
    throw HTTPError(BAD_REQUEST, 'Invalid message id'); // messageId does not refer to a valid message
  } else if (!isReactIdValid(reactId)) {
    throw HTTPError(BAD_REQUEST, 'Invalid react id');
  }

  const message = findStoredMessageFromId(messageId);
  const uId = findUserFromToken(tokenId);
  const user = findUser(uId);

  // messageId does not refer to a valid message within a channel/DM
  // that the authorised user has joined
  if (
    !user.channels.includes(message.dmOrChannelId) &&
    !user.dms.includes(message.dmOrChannelId)
  ) {
    throw HTTPError(BAD_REQUEST, "Message is not in user's chat");
  }

  const react = message.reacts.find(
    (react: React) => react.reactId === reactId
  );
  if (!react || !react.uIds.includes(uId)) {
    throw HTTPError(BAD_REQUEST, 'Not reacted');
  }

  react.uIds.splice(react.uIds.indexOf(uId), 1);
  if (react.uIds.length === 0) {
    message.reacts.splice(message.reacts.findIndex((reactObj) => reactObj.reactId === reactId), 1);
  }

  setData(data);
  return {};
};

export const messagePinV1 = (
  token: string,
  messageId: number
): Record<string, never> => {
  const data = getData();

  const tokenId = isTokenValid(token);

  if (!tokenId) {
    throw HTTPError(FORBIDDEN, 'Invalid token');
  } else if (!isMessageValid(messageId)) {
    throw HTTPError(BAD_REQUEST, 'Invalid message id'); // messageId does not refer to a valid message
  }

  const message = findStoredMessageFromId(messageId);
  const uId = findUserFromToken(tokenId);
  const user = findUser(uId);

  // messageId does not refer to a valid message within a channel/DM
  // that the authorised user has joined
  if (
    !user.channels.includes(message.dmOrChannelId) &&
    !user.dms.includes(message.dmOrChannelId)
  ) {
    throw HTTPError(BAD_REQUEST, "Message is not in user's chat");
  }

  // Check if the message is already pinned
  if (message.isPinned) {
    throw HTTPError(BAD_REQUEST, 'Already pinned');
  }

  // Check if the user has the requried permission
  if (message.isChannelMessage) {
    if (user.permissionId !== 1 && !isOwner(uId, message.dmOrChannelId)) {
      throw HTTPError(FORBIDDEN, "User doesn't have owner permission");
    }
  } else {
    if (!isDmOwner(uId, message.dmOrChannelId)) {
      throw HTTPError(FORBIDDEN, "User doesn't have owner permission");
    }
  }

  message.isPinned = true;

  setData(data);
  return {};
};

export const messageUnPinV1 = (
  token: string,
  messageId: number
): Record<string, never> => {
  const data = getData();

  const tokenId = isTokenValid(token);

  if (!tokenId) {
    throw HTTPError(FORBIDDEN, 'Invalid token');
  } else if (!isMessageValid(messageId)) {
    throw HTTPError(BAD_REQUEST, 'Invalid message id'); // messageId does not refer to a valid message
  }

  const message = findStoredMessageFromId(messageId);
  const uId = findUserFromToken(tokenId);
  const user = findUser(uId);

  // messageId does not refer to a valid message within a channel/DM
  // that the authorised user has joined
  if (
    !user.channels.includes(message.dmOrChannelId) &&
    !user.dms.includes(message.dmOrChannelId)
  ) {
    throw HTTPError(BAD_REQUEST, "Message is not in user's chat");
  }

  // Check if the message is not already pinned
  if (!message.isPinned) {
    throw HTTPError(BAD_REQUEST, 'Message not pinned');
  }

  // Check if the user has the requried permission
  if (message.isChannelMessage) {
    if (user.permissionId !== 1 && !isOwner(uId, message.dmOrChannelId)) {
      throw HTTPError(FORBIDDEN, "User doesn't have owner permission");
    }
  } else {
    if (!isDmOwner(uId, message.dmOrChannelId)) {
      throw HTTPError(FORBIDDEN, "User doesn't have owner permission");
    }
  }

  message.isPinned = false;

  setData(data);
  return {};
};
