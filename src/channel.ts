import { getData, setData, Error, paginatedMessage } from './dataStore';
import {
  isTokenValid,
  findUserFromToken,
  isAuthUserIdValid,
  isChannelValid,
  isMember,
  findUser,
  findChannel,
  findMessageFromId,
  isOwner,
} from './helperFunctions';

type ChannelDetails = {
  name: string;
  isPublic: boolean;
  ownerMembers: Array<number>;
  allMembers: Array<number>;
};

/**
 * <Given a channel with ID channelId that the authorised user
 * is a member of, provides basic details about the channel.>
 *
 * @param {string} token - token for the requesting user
 * @param {integer} channelId - channelId
 *
 * @returns {ChannelDetails} - object return when
 * hannelId/authUserId
 * is valid and authorised user is a member of the channel
 * @returns {Error} - when channelId/authUserId
 * is invalid or authorised user is not a member of the channel
 */

export const channelDetailsV2 = (
  token: string,
  channelId: number
): ChannelDetails | Error => {
  const data = getData();

  if (!isTokenValid(data, token)) {
    return { error: 'Invalid token' };
  } else if (!isChannelValid(data, channelId)) {
    return { error: 'Invalid channel' };
  }

  const authUserId = findUserFromToken(data, token);

  if (!isMember(data, authUserId, channelId)) {
    return { error: 'User is not a member of the channel' };
  }

  const newChannel = findChannel(data, channelId);

  const ownerMembers = [];
  const allMembers = [];

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
    name: newChannel.channelName,
    isPublic: newChannel.isPublic,
    ownerMembers: ownerMembers,
    allMembers: allMembers,
  };
};

/**
 * <Given a channelId of a channel that the authorised user
 * can join, adds them to that channel.>
 *
 * @param {string} token - token for the requesting user
 * @param {integer} channelId - channelId
 *
 * @returns {{}} - return empty object if channelId/authUserId are valid,
 * authorised is not a member of the public channel. (or global owner joining a
 * private channel)
 * @returns {Error} - when channelId/authUserId
 * is invalid or authorised user is a member of the channel
 * or the channel is private and when the authorised user is
 * not a channel member and is not a global owner
 */

export const channelJoinV2 = (token: string, channelId: number): {} | Error => {
  const data = getData();

  if (!isTokenValid(data, token)) {
    return { error: 'Invalid token' };
  } else if (!isChannelValid(data, channelId)) {
    return { error: 'Invalid channel' };
  }

  const authUserId = findUserFromToken(data, token);

  if (isMember(data, authUserId, channelId)) {
    return { error: 'User is already a member of the channel' };
  }

  const newUser = findUser(data, authUserId);
  const newChannel = findChannel(data, channelId);

  if (!newChannel.isPublic && newUser.permissionId !== 1) {
    return { error: 'Private channel, and user is not global' };
  }

  newChannel.allMembers.push(authUserId);
  newUser.channels.push(channelId);

  setData(data);

  return {};
};

/**
 * <Invites a user with ID uId to join a channel with ID channelId.>
 *
 * @param {string} token - token for the requesting user
 * @param {integer} channelId - inviting channelId
 * @param {integer} uId -- userId of the user being invited
 *
 * @returns {} - return empty object is no error occurs
 * @returns {Error} - error is being returned if
 *                               1.  channelId does not exist
 *                               2. uid/autherId is not valid
 *                               3. channel Id is valid but the authorised
 *                                  user is not a member of the channel
 *                               4. uId refers to a user who is already a
 *                                  member of the channel
 */

export const channelInviteV2 = (
  token: string,
  channelId: number,
  uId: number
): {} | Error => {
  const data = getData();

  if (!isTokenValid(data, token)) {
    return { error: 'Invalid token' };
  } else if (!isChannelValid(data, channelId)) {
    return { error: 'Invalid channel' };
  } else if (!isAuthUserIdValid(data, uId)) {
    return { error: 'Invalid user id' };
  } else if (isMember(data, uId, channelId)) {
    return { error: 'Invited user is already a member' };
  }

  const authUserId = findUserFromToken(data, token);

  if (!isMember(data, authUserId, channelId)) {
    return { error: 'Requested by a user with invalid token (not a member)' };
  }

  const newUser = findUser(data, authUserId);
  const newChannel = findChannel(data, channelId);
  newUser.channels.push(channelId);
  newChannel.allMembers.push(uId);

  setData(data);

  return {};
};

/**
 * <Given a channel with ID channelId that the authorised user is a member of,
 * returns up to 50 messages between index "start" and "start + 50".>
 *
 * @param {string} token - token for the requesting user
 * @param {integer} channelId - channelId
 * @param {integer} start -- index of starting message
 *
 * @returns {paginatedMessage} - all message between index start and end.
 * If return end equals to -1, user has reached end of message. (return if no
 * error has occured)
 *
 * @returns  {Error} - error returned if
 * 1. channelId does not refer to a valid channel
 * 2. start is greater than the total number of messages in the channel
 * 3. channelId is valid but autherorised user is not a member of channel
 * 4. autherId is invalid
 *
 */

export const channelMessagesV2 = (
  token: string,
  channelId: number,
  start: number
): paginatedMessage | Error => {
  const data = getData();

  if (!isTokenValid(data, token)) {
    return { error: 'Invalid token' };
  } else if (!isChannelValid(data, channelId)) {
    return { error: 'Invalid channel' };
  }

  const authUserId = findUserFromToken(data, token);

  if (!isMember(data, authUserId, channelId)) {
    return { error: 'User is not a member of the channel' };
  }

  const newChannel = findChannel(data, channelId);

  if (newChannel.messages.length < start) {
    return { error: 'start is greater than the total number of messages' };
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

  const paginatedMessages = [];

  for (let i = start; i < start + lengthOfMessage; i++) {
    paginatedMessages.push(findMessageFromId(data, newChannel.messages[i]));
  }

  return {
    messages: paginatedMessages,
    start: start,
    end: end,
  };
};

/**
 * <Given a channel with ID channelId that the authorised user is a member of,
 * remove them as a member of the channel. Their messages should remain in the
 * channel. If the only channel owner leaves, the channel will remain.>
 *
 * @param {string} token - token for a requesting user
 * @param {integer} channelId - channelId
 *
 * @returns  {Error} -  Return eror object when any of:
 * 1. channelId does not refer to a valid channel
 * 2. channelId is valid and the authorised user is not a member of the channel
 * 3. token is invalid
 * @returns {{}} - Return {} upon success, when all error cases are avoided
 *
 */
export const channelLeaveV1 = (
  token: string,
  channelId: number
): {} | Error => {
  const data = getData();

  if (!isTokenValid(data, token)) {
    return { error: 'Invalid token' };
  } else if (!isChannelValid(data, channelId)) {
    return { error: 'Invalid channel' };
  }

  const authUserId = findUserFromToken(data, token);

  if (!isMember(data, authUserId, channelId)) {
    return { error: 'User is not a member of the channel' };
  }

  const channel = findChannel(data, channelId);

  channel.allMembers = channel.allMembers.filter((user) => user !== authUserId);
  channel.ownerMembers = channel.ownerMembers.filter(
    (user) => user !== authUserId
  );

  const user = findUser(data, authUserId);

  user.channels.filter((channel) => channel !== channelId);

  setData(data);

  return {};
};

/**
 * <Given a channel with ID channelId that the authorised user is a member of,
 * remove them as a member of the channel. Their messages should remain in the
 * channel. If the only channel owner leaves, the channel will remain.>
 *
 * @param {string} token - token for a requesting user
 * @param {integer} channelId - channelId
 * @param {integer} uId - user Id that is added as a new owner of the channel
 *
 * @returns  {Error} -  Return eror object when any of:
 * 1. channelId does not refer to a valid channel
 * 2. uId does not refer to a valid user
 * 3. token is invalid
 * 4. uId refers to a user who is not a member of the channel
 * 5. uId refers to a user who is already an owner of the channel
 * 6. channelId is valid and the authorised user does not have owner permissions
 *    in the channel
 * @returns {{}} - Return {} upon success, when all error cases are avoided
 *
 */
export const channelAddOwnerV1 = (
  token: string,
  channelId: number,
  uId: number
): {} | Error => {
  const data = getData();

  if (!isTokenValid(data, token)) {
    return { error: 'Invalid token' };
  } else if (!isChannelValid(data, channelId)) {
    return { error: 'Invalid channel' };
  } else if (!isAuthUserIdValid(data, uId)) {
    return { error: 'Invalid uId' };
  } else if (!isMember(data, uId, channelId)) {
    return { error: 'UId refer to user that is not a member of the channel' };
  }

  if (isOwner(data, uId, channelId)) {
    return { error: 'User is already an owner' };
  }

  const authUserId = findUserFromToken(data, token);

  if (!isOwner(data, authUserId, channelId)) {
    return { error: 'The authorised user is not an owner of the channel' };
  }

  const channel = findChannel(data, channelId);

  channel.ownerMembers.push(uId);

  setData(data);

  return {};
};

/**
 * <Given a channel with ID channelId that the authorised user is a member of,
 * remove them as a member of the channel. Their messages should remain in the
 * channel. If the only channel owner leaves, the channel will remain.>
 *
 * @param {string} token - token for a requesting user
 * @param {integer} channelId - channelId
 *
 * @returns  {Error} -  Return eror object when any of:
 * 1. channelId does not refer to a valid channel
 * 2. uId does not refer to a valid user
 * 3. token is invalid
 * 4. uId refers to a user who is not an owner of the channel
 * 5. uId refers to a user who is currently the only owner of the channel
 * 6. channelId is valid and the authorised user does not have owner permissions
 *    in the channel
 * @returns {{}} - Return {} upon success, when all error cases are avoided
 *
 */

export const channelRemoveOwnerV1 = (
  token: string,
  channelId: number,
  uId: number
): {} | Error => {
  const data = getData();

  if (!isTokenValid(data, token)) {
    return { error: 'Invalid token' };
  } else if (!isChannelValid(data, channelId)) {
    return { error: 'Invalid channel' };
  } else if (!isAuthUserIdValid(data, uId)) {
    return { error: 'Invalid uId' };
  } else if (!isOwner(data, uId, channelId)) {
    const channel = findChannel(data, channelId);
    console.log(channel);
    console.log(uId);
    return { error: 'User is not an owner of the channel' };
  }

  const authUserId = findUserFromToken(data, token);

  if (!isOwner(data, authUserId, channelId)) {
    return { error: 'The authorised user is not an owner of the channel' };
  }

  const channel = findChannel(data, channelId);
  if (channel.ownerMembers.length === 1) {
    return { error: 'Uer is the only owner of the channel' };
  }

  channel.ownerMembers = channel.ownerMembers.filter((user) => user !== uId);

  setData(data);

  return {};
};
