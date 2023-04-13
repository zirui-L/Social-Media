import { getData, setData, User, paginatedMessage } from './dataStore';
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
} from './helperFunctions/helperFunctions';

import { BAD_REQUEST, FORBIDDEN } from './helperFunctions/helperServer';
import HTTPError from 'http-errors';
import { addNotification } from './helperFunctions/notificationHelper';

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

export const dmCreateV2 = (token: string, uIds: Array<number>): DmId => {
  const data = getData();
  // check input's validity
  const tokenId = isTokenValid(token);

  if (!tokenId) {
    throw HTTPError(BAD_REQUEST, 'Invalid token');
  } else if (!isUIdsValid(uIds)) {
    throw HTTPError(BAD_REQUEST, 'Invalid uId(s)');
  }

  const authUserId = findUserFromToken(tokenId);
  uIds.unshift(authUserId);
  if (isDuplicate(uIds)) {
    throw HTTPError(BAD_REQUEST, 'Duplicate uId');
  }
  const dmId = createUniqueId();

  const users = [];
  for (const uId of uIds) {
    users.push(findUser(uId));
  }
  // sort users alphabetically
  users.sort((user1, user2) => user1.handleStr.localeCompare(user2.handleStr));
  let dmName = '';
  // create the dm's name
  for (const user of users) {
    dmName += `${user.handleStr}, `;
    user.dms.push(dmId);
  }
  data.dms.push({
    dmId: dmId,
    name: dmName.substring(0, dmName.length - 2), // discard the ", " after the last uid
    ownerMembers: [authUserId],
    allMembers: uIds,
    messages: [],
  });
  setData(data);

  for (const uId of uIds) {
    if (uId !== authUserId) {
      addNotification(authUserId, uId, dmId, false, 'added', '');
    }
  }

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

export const dmListV2 = (token: string): { dms: Array<DmObject> } => {
  const tokenId = isTokenValid(token);

  if (!tokenId) {
    throw HTTPError(BAD_REQUEST, 'Invalid token');
  }
  const authUserId = findUserFromToken(tokenId);
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

export const dmRemoveV2 = (
  token: string,
  dmId: number
): Record<string, never> => {
  const data = getData();

  const tokenId = isTokenValid(token);

  if (!tokenId) {
    throw HTTPError(BAD_REQUEST, 'Invalid token');
  }

  if (!isDmValid(dmId)) {
    throw HTTPError(BAD_REQUEST, 'Invalid dmId');
  }

  const authUserId = findUserFromToken(tokenId);
  if (!isDmMember(authUserId, dmId)) {
    throw HTTPError(FORBIDDEN, 'The authorised user is not in the DM');
  } else if (!isDmOwner(authUserId, dmId)) {
    throw HTTPError(
      FORBIDDEN,
      'The authorised user is not the owner of the DM'
    );
  }
  const Dm = findDm(dmId);
  for (const uId of Dm.allMembers) {
    const user = findUser(uId); // Remove dm from user's profile
    user.dms = user.dms.filter((DmId: number) => DmId !== dmId);
  }
  // Remove dm from dm list
  data.dms = data.dms.filter((Dm) => Dm.dmId !== dmId);
  // Remove all messages in the dm
  data.messages = data.messages.filter(
    (message) => !Dm.messages.includes(message.messageId)
  );
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

export const dmDetailsV2 = (token: string, dmId: number): DmDetails => {
  // check validity of input
  const tokenId = isTokenValid(token);

  if (!tokenId) {
    throw HTTPError(BAD_REQUEST, 'Invalid token');
  }

  if (!isDmValid(dmId)) {
    throw HTTPError(BAD_REQUEST, 'Invalid dmId');
  }
  const authUserId = findUserFromToken(tokenId);
  if (!isDmMember(authUserId, dmId)) {
    throw HTTPError(FORBIDDEN, 'The authorised user is not in the DM');
  }
  const Dm = findDm(dmId);
  const members = [];
  // Find the user information that match with the uId in allMember array
  for (const uId of Dm.allMembers) {
    const member = findUser(uId);
    members.push({
      uId: member.authUserId,
      email: member.email,
      nameFirst: member.nameFirst,
      nameLast: member.nameLast,
      handleStr: member.handleStr,
      profileImgUrl: member.profileImgUrl,
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

export const dmLeaveV2 = (
  token: string,
  dmId: number
): Record<string, never> => {
  const data = getData();
  // check validity of input
  const tokenId = isTokenValid(token);

  if (!tokenId) {
    throw HTTPError(BAD_REQUEST, 'Invalid token');
  }

  if (!isDmValid(dmId)) {
    throw HTTPError(BAD_REQUEST, 'Invalid dmId');
  }

  const authUserId = findUserFromToken(tokenId);
  if (!isDmMember(authUserId, dmId)) {
    throw HTTPError(FORBIDDEN, 'The authorised user is not in the DM');
  }
  // remove dm from user's detail
  const user = findUser(authUserId);
  user.dms = user.dms.filter((DmId: number) => DmId !== dmId);

  const Dm = findDm(dmId);
  // remove member from dm
  Dm.allMembers = Dm.allMembers.filter((uId: number) => uId !== authUserId);
  Dm.ownerMembers = Dm.ownerMembers.filter((uId: number) => uId !== authUserId);
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

export const dmMessagesV2 = (
  token: string,
  dmId: number,
  start: number
): paginatedMessage => {
  const tokenId = isTokenValid(token);

  if (!tokenId) {
    throw HTTPError(BAD_REQUEST, 'Invalid token');
  }

  if (!isDmValid(dmId)) {
    throw HTTPError(BAD_REQUEST, 'Invalid dmId');
  }
  const authUserId = findUserFromToken(tokenId);
  const Dm = findDm(dmId);
  if (!isDmMember(authUserId, dmId)) {
    throw HTTPError(FORBIDDEN, 'The authorised user is not in the DM');
  } else if (start > Dm.messages.length) {
    throw HTTPError(
      BAD_REQUEST,
      'Start is greater than the total number of messages'
    );
  }
  let lengthOfMessage;
  let end;

  // return the first 50 message from the start, if there is less than 50
  // messages, return all remainig message and set end to -1.
  if (Dm.messages.length - start <= 50) {
    lengthOfMessage = Dm.messages.length - start;
    end = -1;
  } else {
    lengthOfMessage = 50;
    end = start + 50;
  }
  // Push the message information according to given message Id
  const paginatedMessages = [];
  for (let i = start; i < start + lengthOfMessage; i++) {
    paginatedMessages.push(findMessageFromId(authUserId, Dm.messages[i]));
  }
  return {
    messages: paginatedMessages,
    start: start,
    end: end,
  };
};
