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
  isChannelValid,
  isDmValid,
  isDmMember,
  getTimeNow,
} from './helperFunctions/helperFunctions';
import HTTPError from 'http-errors';
import { BAD_REQUEST, FORBIDDEN } from './helperFunctions/helperServer';
import {
  addNotification,
  findTaggedUsers,
  notifyTaggedUsers,
} from './helperFunctions/notificationHelper';

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
) => {
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
    taggedUsers: findTaggedUsers(channelId, true, message).uIds,
    isSent: true,
  });

  channel.messages.unshift(messageId); // unshift the most recent message to the front

  const user = findUser(uId);
  user.messages.unshift(messageId);
  setData(data);
  notifyTaggedUsers(uId, channelId, true, messageId, []);

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

  const messageToEdit = findStoredMessageFromId(messageId);

  const uId = findUserFromToken(tokenId);
  const user = findUser(uId);

  // messageId does not refer to a valid message within a channel/DM
  // that the authorised user has joined
  if (
    !user.channels.includes(messageToEdit.dmOrChannelId) &&
    !user.dms.includes(messageToEdit.dmOrChannelId)
  ) {
    throw HTTPError(BAD_REQUEST, "Message is not in user's chat");
  }

  // the message was not sent by the authorised user making this request and
  // the user does not have owner permissions in the channel/DM
  if (messageToEdit.isChannelMessage) {
    // Channel messages
    if (
      uId !== messageToEdit.uId &&
      !isOwner(uId, messageToEdit.dmOrChannelId) &&
      findUser(uId).permissionId !== 1 // user is not global owner
    ) {
      throw HTTPError(BAD_REQUEST, "User doesn't have permission");
    }
  } else {
    // Dm messages
    if (
      uId !== messageToEdit.uId &&
      !isDmOwner(uId, messageToEdit.dmOrChannelId)
    ) {
      throw HTTPError(BAD_REQUEST, "User doesn't have permission");
    }
  }

  if (message.length === 0) {
    // If the new message is an empty string, the message is deleted
    messageRemoveV2(token, messageId);
  } else {
    // Edit the message
    messageToEdit.message = message;

    notifyTaggedUsers(
      messageToEdit.uId,
      messageToEdit.dmOrChannelId,
      messageToEdit.isChannelMessage,
      messageId,
      messageToEdit.taggedUsers
    );

    messageToEdit.taggedUsers = findTaggedUsers(
      messageToEdit.dmOrChannelId,
      messageToEdit.isChannelMessage,
      message
    ).uIds;
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
) => {
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
    taggedUsers: findTaggedUsers(dmId, false, message).uIds,
    isSent: true,
  });
  Dm.messages.unshift(messageId); // unshift the most recent message to the front

  const user = findUser(uId);
  user.messages.unshift(messageId);
  setData(data);
  notifyTaggedUsers(uId, dmId, false, messageId, []);

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

  if (uId !== message.uId) {
    addNotification(
      uId,
      message.uId,
      message.dmOrChannelId,
      message.isChannelMessage,
      'react',
      ''
    );
  }
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
    message.reacts.splice(
      message.reacts.findIndex((reactObj) => reactObj.reactId === reactId),
      1
    );
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

export const messageShareV1 = (
  token: string,
  ogMessageId: number,
  message: string,
  channelId: number,
  dmId: number
) => {
  const tokenId = isTokenValid(token);

  if (!tokenId) {
    throw HTTPError(BAD_REQUEST, 'Invalid token');
  }
  if (channelId !== -1 && dmId !== -1) {
    throw HTTPError(BAD_REQUEST, 'Can\'t share to both channel and dm');
  } else if (!isChannelValid(channelId) && !isDmValid(dmId)) {
    throw HTTPError(BAD_REQUEST, 'Invalid channelId and dmId');
  } else if (message.length > 1000) {
    throw HTTPError(BAD_REQUEST, 'message length over 1000');
  } else if (!isMessageValid(ogMessageId)) {
    throw HTTPError(BAD_REQUEST, 'invalid ogMessageId');
  }
  const uId = findUserFromToken(tokenId);
  if (dmId === -1 && !isMember(uId, channelId)) {
    // ChannelId is valid and the authorised user is not a member of the channel
    throw HTTPError(FORBIDDEN, 'The user is not a member of the channel');
  } else if (channelId === -1 && !isDmMember(uId, dmId)) {
    // ChannelId is valid and the authorised user is not a member of the channel
    throw HTTPError(FORBIDDEN, 'The user is not a member of the dm');
  }
  const storedUser = findUser(uId);
  const ogMessage = findStoredMessageFromId(ogMessageId);
  if (
    !storedUser.channels.includes(ogMessage.dmOrChannelId) &&
      !storedUser.dms.includes(ogMessage.dmOrChannelId)
  ) {
    throw HTTPError(BAD_REQUEST, "Message is not in user's chat");
  }
  const newMessage = ogMessage.message + '\n' + '  ' + message;
  if (channelId === -1) {
    const sharedMessageId = messageSendDmV2(token, dmId, newMessage).messageId;
    return { sharedMessageId };
  } else {
    const sharedMessageId = messageSendV2(token, channelId, newMessage).messageId;
    return { sharedMessageId };
  }
};

export const messageSendLaterV1 = (
  token: string,
  channelId: number,
  message: string,
  timeSent: number
) => {
  const data = getData();
  const tokenId = isTokenValid(token);

  if (!tokenId) {
    throw HTTPError(BAD_REQUEST, 'Invalid token');
  }

  if (!isChannelValid(channelId)) {
    throw HTTPError(BAD_REQUEST, 'Invalid channelId');
  } else if (message.length > 1000 || message.length < 1) {
    throw HTTPError(BAD_REQUEST, 'Invalid message length');
  } else if (timeSent < getTimeNow()) {
    throw HTTPError(BAD_REQUEST, 'invalid ogMessageId');
  }
  const authUserId = findUserFromToken(tokenId);
  if (!isMember(authUserId, channelId)) {
    // ChannelId is valid and the authorised user is not a member of the channel
    throw HTTPError(FORBIDDEN, 'The user is not a member of the channel');
  }
  const messageId = createUniqueId();
  const channel = findChannel(channelId);

  channel.messages.push(messageId);
  data.messages.push({
    messageId: messageId,
    uId: authUserId,
    dmOrChannelId: channelId,
    isChannelMessage: true,
    message: message,
    timeSent: timeSent,
    reacts: [],
    taggedUsers: findTaggedUsers(channelId, true, message).uIds,
    isPinned: false,
    isSent: false,
  });

  const user = findUser(authUserId);
  user.messages.push(messageId);

  setTimeout(() => {
    const messageObj = findStoredMessageFromId(messageId);
    messageObj.isSent = true;
    notifyTaggedUsers(authUserId, channelId, true, messageId, []);
  }, (timeSent - getTimeNow()) * 1000);

  setData(data);
  return { messageId };
};

export const messageSendLaterDmV1 = (
  token: string,
  dmId: number,
  message: string,
  timeSent: number
) => {
  const data = getData();
  const tokenId = isTokenValid(token);

  if (!tokenId) {
    throw HTTPError(BAD_REQUEST, 'Invalid token');
  }

  if (!isDmValid(dmId)) {
    throw HTTPError(BAD_REQUEST, 'Invalid channelId');
  } else if (message.length > 1000 || message.length < 1) {
    throw HTTPError(BAD_REQUEST, 'Invalid message length');
  } else if (timeSent < getTimeNow()) {
    throw HTTPError(BAD_REQUEST, 'invalid ogMessageId');
  }
  const authUserId = findUserFromToken(tokenId);
  if (!isDmMember(authUserId, dmId)) {
    // ChannelId is valid and the authorised user is not a member of the channel
    throw HTTPError(FORBIDDEN, 'The user is not a member of the channel');
  }
  const messageId = createUniqueId();
  const dm = findDm(dmId);

  dm.messages.push(messageId);
  data.messages.push({
    messageId: messageId,
    uId: authUserId,
    dmOrChannelId: dmId,
    isChannelMessage: false,
    message: message,
    timeSent: timeSent,
    reacts: [],
    taggedUsers: findTaggedUsers(dmId, false, message).uIds,
    isPinned: false,
    isSent: false,
  });

  const user = findUser(authUserId);
  user.messages.push(messageId);

  setTimeout(() => {
    const messageObj = findStoredMessageFromId(messageId);
    messageObj.isSent = true;
    notifyTaggedUsers(authUserId, dmId, false, messageId, []);
  }, (timeSent - getTimeNow()) * 1000);

  setData(data);
  return { messageId };
};
