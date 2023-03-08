const ERROR = { error: "error" };
import { getData, setData } from "./dataStore.js";

/**
 * Given a channel with ID channelId that the authorised user
 * is a member of, provides basic details about the channel.
 *
 * @param {integer} authUserId - userId
 * @param {integer} channelId - channelId
 *
 * @returns {{name, isPublic, ownerMembers, allMembers}} - object return when hannelId/authUserId
 * is valid and authorised user is a member of the channel
 * @returns {{error: 'error'}} - when channelId/authUserId
 * is invalid or authorised user is not a member of the channel
 */

export function channelDetailsV1(authUserId, channelId) {
  const data = getData();

  if (
    !isAuthUserIdValid(data, authUserId) ||
    !isChannelValid(data, channelId) ||
    !isMember(data, authUserId, channelId)
  ) {
    return ERROR;
  }

  const newChannel = findChannel(data, channelId);

  const ownerMembers = new Array();
  const allMembers = new Array();

  for (const user of newChannel.ownerMembers) {
    const currentUser = findUser(data, user);
    ownerMembers.push({
      uId: currentUser.authUserId,
      email: currentUser.email,
      nameFirst: currentUser.nameFirst,
      nameLast: currentUser.nameLast,
      handleStr: currentUser.handleStr,
    });
  }

  for (const user of newChannel.allMembers) {
    const currentUser = findUser(data, user);
    allMembers.push({
      uId: currentUser.authUserId,
      email: currentUser.email,
      nameFirst: currentUser.nameFirst,
      nameLast: currentUser.nameLast,
      handleStr: currentUser.handleStr,
    });
  }

  return {
    name: newChannel.name,
    isPublic: newChannel.isPublic,
    ownerMembers: ownerMembers,
    allMembers: allMembers,
  };
}

/**
 * Given a channelId of a channel that the authorised user
 * can join, adds them to that channel.
 *
 * @param {integer} authUserId - userId
 * @param {integer} channelId - channelId
 * ...
 * @returns {{}} - return empty object if channelId/authUserId are valid, authorised is
 * not a member of the public channel. (or global owner joining a private channel)
 * @returns {{error: 'error'}} - when channelId/authUserId
 * is invalid or authorised user is a member of the channel
 * or the channel is private and when the authorised user is
 * not a channel member and is not a global owner
 */

export function channelJoinV1(authUserId, channelId) {
  const data = getData();
  if (
    !isAuthUserIdValid(data, authUserId) ||
    !isChannelValid(data, channelId) ||
    isMember(data, authUserId, channelId)
  ) {
    return ERROR;
  }

  const newUser = findUser(data, authUserId);
  const newChannel = findChannel(data, channelId);

  if (!newChannel.isPublic && newUser.permissionId !== 1) {
    return ERROR;
  }

  newChannel.allMembers.push(authUserId);
  newUser.channels.push(channelId);

  setData(data);

  return {};
}

/**
 * Invites a user with ID uId to join a channel with ID channelId.
 *
 * @param {integer} authUserId - userId
 * @param {integer} channelId - inviting channelId
 * @param {integer} uId -- userId of the user being invited
 * ...
 *
 * @returns {} - return empty object is no error occurs
 * @returns {{error: 'error'}} - error is being returned if
 *                               1.  channelId does not exist
 *                               2. uid/autherId is not valid
 *                               3. channel Id is valid but the authorised
 *                                  user is not a member of the channel
 *                               4. uId refers to a user who is already a
 *                                  member of the channel
 */

export function channelInviteV1(authUserId, channelId, uId) {
  const data = getData();
  if (
    !isAuthUserIdValid(data, authUserId) ||
    !isChannelValid(data, channelId) ||
    !isAuthUserIdValid(data, uId) ||
    !isMember(data, authUserId, channelId) ||
    isMember(data, uId, channelId)
  ) {
    return ERROR;
  }
  const newUser = findUser(data, authUserId);
  const newChannel = findChannel(data, channelId);
  newUser.channels.push(channelId);
  newChannel.allMembers.push(uId);

  setData(data);

  return {};
}

/**
 * Given a channel with ID channelId that the authorised user is a member of,
 * returns up to 50 messages between index "start" and "start + 50".
 * @param {integer} authuserId - userId
 * @param {integer} channelId - channelId
 * @param {integer} start -- index of starting message
 * ...
 *
 * @returns {{message,start,end}} - all message between index start and end.
 * If return end equals to -1, user has reached end of message. (return if no
 * error has occured)
 * @returns  {{error: 'error'}} - error returned if
 *                                1. channelId does not refer to a valid channel
 *                                2. start is greater than the total number of
 *                                   messages in the channel
 *                                3. channelId is valid but autherorised user is
 *                                   not a member of channel
 *                                4. autherId is invalid
 */

export function channelMessagesV1(authUserId, channelId, start) {
  const data = getData();
  if (
    !isAuthUserIdValid(data, authUserId) ||
    !isChannelValid(data, channelId) ||
    !isMember(data, authUserId, channelId)
  ) {
    return ERROR;
  }

  const newChannel = findChannel(data, channelId);

  if (newChannel.messages.length < start) {
    return ERROR;
  }

  let end;
  let lengthOfMessage;

  if (newChannel.messages.length - start <= 50) {
    lengthOfMessage = newChannel.messages.length - start;
    end = -1;
  } else {
    lengthOfMessage = 50;
    end = start + 50;
  }

  return {
    messages: newChannel.messages.slice(start, start + lengthOfMessage),
    start: start,
    end: end,
  };
}

function isAuthUserIdValid(data, authUserId) {
  for (const user of data.users) {
    if (user.authUserId === authUserId) {
      return true;
    }
  }

  return false;
}

function isChannelValid(data, channelId) {
  for (const channel of data.channels) {
    if (channel.channelId === channelId) {
      return true;
    }
  }

  return false;
}

function isMember(data, authUserId, channelId) {
  const channelIndex = data.channels.findIndex(
    (channel) => channel.channelId === channelId
  );

  return data.channels[channelIndex].allMembers.includes(authUserId);
}

function findUser(data, authUserId) {
  return data.users.find((user) => user.authUserId === authUserId);
}

function findChannel(data, channelId) {
  return data.channels.find((channel) => channel.channelId === channelId);
}
