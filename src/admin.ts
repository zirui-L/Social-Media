import { getData, setData } from './dataStore';
import HTTPError from 'http-errors';
import {
  findChannel,
  findDm,
  findStoredMessageFromId,
  findUser,
  findUserFromToken,
  isAuthUserIdValid,
  isTokenValid,
} from './helperFunctions/helperFunctions';
import { BAD_REQUEST, FORBIDDEN } from './helperFunctions/helperFunctions';

/**
 * <Given a user by their uId, removes them from Memes.>
 *
 * @param {string} token - token for the requesting user
 * @param {integer} uId - uId of the user to be removed
 *
 * @returns {} - return is no error
 * @throws {Error} - when any of:
 * 1. Invalid Token
 * 2. uId does not refer to a valid user
 * 3. uId refers to a user who is the only global owner
 * 4. the authorised user is not a global owner
 */

export const adminUserRemoveV1 = (token: string, uId: number) => {
  const data = getData();

  const tokenId = isTokenValid(token);
  if (!tokenId) {
    throw HTTPError(FORBIDDEN, 'Invalid token');
  }

  const authUserId = findUserFromToken(tokenId);

  const authUser = findUser(authUserId);

  const user = findUser(uId);

  if (authUser.permissionId !== 1) {
    throw HTTPError(FORBIDDEN, 'the authorised user is not a global owner');
  } else if (!isAuthUserIdValid(uId)) {
    throw HTTPError(BAD_REQUEST, 'uId does not refer to a valid user');
  } else if (user.permissionId === 1 && data.globalOwners.length === 1) {
    throw HTTPError(
      BAD_REQUEST,
      'uId refers to a user who is the only global owner'
    );
  }

  // Remove the user from the UNSW MEMes
  user.isRemoved = true;

  // Remove user from all belonging dms
  for (const dmId of user.dms) {
    const dm = findDm(dmId);
    // Remove userId from dm.allMembers
    const allMembersIndex = dm.allMembers.findIndex(
      (storedUserId) => storedUserId === uId
    );
    dm.allMembers.splice(allMembersIndex, 1);

    if (dm.ownerMembers[0] === authUserId) {
      dm.ownerMembers.length = 0;
    }
  }

  user.dms.length = 0;

  // Remove user from all belonging channels
  for (const channelId of user.channels) {
    const channel = findChannel(channelId);
    const allMembersIndex = channel.allMembers.findIndex(
      (storedUserId) => storedUserId === uId
    );
    channel.allMembers.splice(allMembersIndex, 1);

    const ownerMembersIndex = channel.ownerMembers.findIndex(
      (storedUserId) => storedUserId === uId
    );

    if (ownerMembersIndex !== -1) {
      channel.ownerMembers.splice(ownerMembersIndex, 1);
    }
  }

  user.channels.length = 0;

  // Change the content of all messages sent by user
  for (const messageId of user.messages) {
    const messageObj = findStoredMessageFromId(messageId);
    messageObj.message = 'Removed user';
  }

  // Change nameFirst and nameLast of user
  user.nameFirst = 'Removed';
  user.nameLast = 'user';

  data.tokens = data.tokens.filter(
    (existingToken) => existingToken.uId !== uId
  );

  setData(data);
  return {};
};

/**
 * <Given a user by their uID, sets their permissions to new permissions
 * described by permissionId.>
 *
 * @param {string} token - token for the requesting user
 * @param {integer} uId - uId of the user to be removed
 * @param {integer} permissionId - permissionId
 *
 * @returns {} - return is no error
 * @throws {Error} - when any of:
 * 1. Invalid Token
 * 2. uId does not refer to a valid user
 * 3. uId refers to a user who is the only global owner and they are being
 *    demoted to a user
 * 4. permissionId is invalid
 * 5. the user already has the permissions level of permissionId
 * 6. the authorised user is not a global owner
 */

export const adminUserpermissionChangeV1 = (
  token: string,
  uId: number,
  permissionId: number
) => {
  const data = getData();

  const tokenId = isTokenValid(token);

  if (!tokenId) {
    throw HTTPError(FORBIDDEN, 'Invalid token');
  }

  const authUserId = findUserFromToken(tokenId);

  const authUser = findUser(authUserId);

  const user = findUser(uId);

  if (authUser.permissionId !== 1) {
    throw HTTPError(FORBIDDEN, 'the authorised user is not a global owner');
  } else if (!isAuthUserIdValid(uId)) {
    throw HTTPError(BAD_REQUEST, 'uId does not refer to a valid user');
  } else if (
    user.permissionId === 1 &&
    data.globalOwners.length === 1 &&
    permissionId === 2
  ) {
    throw HTTPError(
      BAD_REQUEST,
      'uId refers to a user who is the only global owner and they are being demoted to a user'
    );
  } else if (![1, 2].includes(permissionId)) {
    throw HTTPError(BAD_REQUEST, 'permissionId is invalid');
  } else if (user.permissionId === permissionId) {
    throw HTTPError(
      BAD_REQUEST,
      'the user already has the permissions level of permissionId'
    );
  }

  user.permissionId = permissionId;

  if (permissionId === 1) {
    data.globalOwners.push(uId);
  }

  setData(data);
  return {};
};
