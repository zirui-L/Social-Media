const ERROR = { error: "error" };

import { channel } from "diagnostics_channel";
import { getData, setData } from "./dataStore.js";

/**
 * Given a channel with ID channelId that the authorised user
 * is a member of, provides basic details about the channel.
 *
 * @param {integer} authUserId - userId
 * @param {integer} channelId - channelId
 * ...
 * @returns {{name, isPublic, ownerMembers, allMembers}} - object
 * @returns {{error: 'error'}} - when channelId/authUserId
 * is invalid or authorised user is not a member of the channel
 */

export function channelDetailsV1(authUserId, channelId) {
  const data = getData();

  if (
    !isUserValid(data, authUserId) ||
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
 * @returns {{}} - return empty object
 * @returns {{error: 'error'}} - when channelId/authUserId
 * is invalid or authorised user is not a member of the channel
 * or the channel is private and when the authorised user is
 * not a channel member and is not a global owner
 */

export function channelJoinV1(authUserId, channelId) {
  const data = getData();
  if (
    !isUserValid(data, authUserId) ||
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
 * <Brief description of what the function does>
 *
 * @param {data type} name - description of paramter
 * @param {data type} name - description of parameter
 * ...
 *
 * @returns {data type} - description of condition for return
 * @returns {data type} - description of condition for return
 */

export function channelInviteV1(authUserId, channelId, uId) {
  const data = getData();
  if (
    !isUserValid(data, authUserId) ||
    !isChannelValid(data, channelId) ||
    !isUserValid(data, uId) ||
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
 * <Brief description of what the function does>
 *
 * @param {data type} name - description of paramter
 * @param {data type} name - description of parameter
 * ...
 *
 * @returns {data type} - description of condition for return
 * @returns {data type} - description of condition for return
 */

export function channelMessagesV1(authUserId, channelId, start) {
  const data = getData();
  if (
    !isUserValid(data, authUserId) ||
    !isChannelValid(data, channelId) ||
    !isMember(data, authUserId, channelId)
  ) {
    return ERROR;
  }

  const newChannel = findChannel(data, channelId);

  if (newChannel.messages.length < start) {
    return ERROR;
  }

  let lengthOfMessage = 50;

  let end = start + 50;

  if (newChannel.messages.length - start <= 50) {
    lengthOfMessage = newChannel.messages.length - start;
    end = -1;
  }

  let returnMessage = newChannel.messages.slice(start, start + lengthOfMessage);

  return {
    messages: returnMessage,
    start: start,
    end: end,
  };
}

function isUserValid(data, authUserId) {
  for (const user of data.users) {
    if (user.authUserId === authUserId) {
      return true;
    }
  }

  return false;
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
