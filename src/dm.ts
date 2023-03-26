import { getData, setData, Error, User, paginatedMessage } from './dataStore';
import {
  isTokenValid,
  findUserFromToken,
  findUser,
  createUniqueId,
  findDm,
  findMessageFromId,
  isUIdsValid,
  isDmValid,
  isDuplicate,
  isDmOwner,
  isDmMember,
} from './helperFunctions';

type DmId = {
  dmId: number;
};

type DmObject = {
  dmId: number;
  name: string;
};

type DmDetails = {
  members: Array<User>;
  name: string;
};

/**
 * <Create a new dm and returns its dm Id.>
 *
 * @param {string} token - token for the requesting user
 * @param {array<integer>} uIds - uIds of the dm members
 *
 * @returns {DmId} - object return when
 * authUserIds are valid and
 * there are no duplicate 'uId's in uIds
 * @returns {Error} - when authUserId
 * is invalid or there are duplicate 'uId's in uIds
 */

export const dmCreateV1 = (token: string, uIds: Array<number>): DmId | Error => {
  const data = getData();
  if (!isTokenValid(token)) {
    return { error: 'Invalid token' };
  } else if (isDuplicate(uIds)) {
    return { error: 'Duplicate uIds' };
  } else if (!isUIdsValid(uIds)) {
    return { error: 'Invalid uId(s)' };
  }

  const authUserId = findUserFromToken(token);
  const dmId = createUniqueId();
  uIds.unshift(authUserId);

  const users = [];
  for (const uId of uIds) {
    users.push(findUser(uId));
  }
  users.sort((user1, user2) => user1.handleStr.localeCompare(user2.handleStr));
  let dmName = '';
  for (const user of users) {
    dmName += `${user.handleStr}, `;
    user.dms.push(dmId);
  }
  data.dms.push({
    dmId: dmId,
    name: dmName.substring(0, dmName.length - 2),
    ownerMembers: [authUserId],
    allMembers: uIds,
    messages: [],
  });
  setData(data);
  return { dmId: dmId };
};

/**
 * <Returns the list of DMs that the user is a member of.>
 *
 * @param {string} token - token for the requesting user
 *
 * @returns {dms} - object return when authUserId is valid
 * @returns {Error} - when authUserId is invalid
 */

export const dmListV1 = (token: string): { dms: Array<DmObject> } | Error => {
  if (!isTokenValid(token)) {
    return { error: 'Invalid token' };
  }
  const authUserId = findUserFromToken(token);
  const authUser = findUser(authUserId);
  const dmList = [];
  for (const dmId of authUser.dms) {
    dmList.push({
      dmId: dmId,
      name: findDm(dmId).name,
    });
  }
  return { dms: dmList };
};

/**
 * <Remove an existing DM, so all members are no longer in the DM.
 * This can only be done by the original creator of the DM.>
 *
 * @param {string} token - token for the requesting user
 * @param {integer} dmId - dmId
 *
 * @returns {} - object return when
 * dmId/authUserId is valid and
 * authorised user is an owner of the dm
 * @returns {Error} - when dmId/authUserId
 * is invalid or authorised user is not a owner/member of the dm
 */

export const dmRemoveV1 = (token: string, dmId: number): Record<string, never> | Error => {
  const data = getData();
  if (!isDmValid(dmId)) {
    return { error: 'Invalid dmId' };
  } else if (!isTokenValid(token)) {
    return { error: 'Invalid token' };
  }
  const authUserId = findUserFromToken(token);
  if (!isDmOwner(authUserId, dmId)) {
    return { error: 'The authorised user is not the owner of the DM' };
  } else if (!isDmMember(authUserId, dmId)) {
    return { error: 'The authorised user is not in the DM' };
  }
  const Dm = findDm(dmId);
  for (const uId of Dm.allMembers) {
    const user = findUser(uId);
    user.dms = user.dms.filter((DmId) => DmId !== dmId);
  }
  data.dms = data.dms.filter((Dm) => Dm.dmId !== dmId);
  setData(data);
  return {};
};

/**
 * <Given a dm with ID dmId that the authorised user
 * is a member of, provides basic details about the dm.>
 *
 * @param {string} token - token for the requesting user
 * @param {integer} dmId - dmId
 *
 * @returns {dmDetails} - object return when
 * dmId/authUserId is valid and
 * authorised user is a member of the dm
 * @returns {Error} - when dmId/authUserId
 * is invalid or authorised user is not a member of the dm
 */

export const dmDetailsV1 = (token: string, dmId: number): DmDetails | Error => {
  if (!isDmValid(dmId)) {
    return { error: 'Invalid dmId' };
  } else if (!isTokenValid(token)) {
    return { error: 'Invalid token' };
  }
  const authUserId = findUserFromToken(token);
  if (!isDmMember(authUserId, dmId)) {
    return { error: 'The authorised user is not in the DM' };
  }
  const Dm = findDm(dmId);
  const members = [];
  for (const uId of Dm.allMembers) {
    const member = findUser(uId);
    members.push({
      uId: member.authUserId,
      email: member.email,
      nameFirst: member.nameFirst,
      nameLast: member.nameLast,
      handleStr: member.handleStr,
    });
  }
  return {
    name: Dm.name,
    members: members,
  };
};

/**
 * <Given a DM ID, the user is removed as a member of this DM.
 * The creator is allowed to leave and the DM will still exist
 * if this happens. This does not update the name of the DM.>
 *
 * @param {string} token - token for the requesting user
 * @param {integer} dmId - dmId
 *
 * @returns {} - object return when
 * dmId/authUserId is valid and
 * authorised user is a member of the dm
 * @returns {Error} - when dmId/authUserId
 * is invalid or authorised user is not a member of the dm
 */

export const dmLeaveV1 = (token: string, dmId: number): Record<string, never> | Error => {
  const data = getData();
  if (!isDmValid(dmId)) {
    return { error: 'Invalid dmId' };
  } else if (!isTokenValid(token)) {
    return { error: 'Invalid token' };
  }
  const authUserId = findUserFromToken(token);
  if (!isDmMember(authUserId, dmId)) {
    return { error: 'The authorised user is not in the DM' };
  }
  const user = findUser(authUserId);
  user.dms = user.dms.filter((DmId) => DmId !== dmId);

  const Dm = findDm(dmId);
  Dm.allMembers = Dm.allMembers.filter((uId) => uId !== authUserId);
  Dm.ownerMembers = Dm.ownerMembers.filter((uId) => uId !== authUserId);
  setData(data);
  return {};
};

/**
 * <Given a DM with ID dmId that the authorised user is a member of,
 * return up to 50 messages between index "start" and "start + 50".>
 *
 * @param {string} token - token for the requesting user
 * @param {integer} dmId - dmId
 * @param {integer} start - start index
 *
 * @returns {paginatedMessage} - object return when
 * dmId/authUserId is valid and
 * authorised user is a member of the dm and
 * start is less than the total number of messages in the dm
 * @returns {Error} - when dmId/authUserId
 * is invalid or authorised user is not a member of the dm
 * or start is greater than the total number of messages in the dm
 */

export const dmMessagesV1 = (
  token: string,
  dmId: number,
  start: number
): paginatedMessage | Error => {
  if (!isDmValid(dmId)) {
    return { error: 'Invalid dmId' };
  } else if (!isTokenValid(token)) {
    return { error: 'Invalid token' };
  }
  const authUserId = findUserFromToken(token);
  const Dm = findDm(dmId);
  if (!isDmMember(authUserId, dmId)) {
    return { error: 'The authorised user is not in the DM' };
  } else if (start > Dm.messages.length) {
    return { error: 'Start is greater than the total number of messages' };
  }
  let lengthOfMessage;
  let end;
  if (Dm.messages.length - start <= 50) {
    lengthOfMessage = Dm.messages.length - start;
    end = -1;
  } else {
    lengthOfMessage = 50;
    end = start + 50;
  }
  const paginatedMessages = [];
  for (let i = start; i < start + lengthOfMessage; i++) {
    paginatedMessages.push(findMessageFromId(Dm.messages[i]));
  }
  return {
    messages: paginatedMessages,
    start: start,
    end: end,
  };
};
