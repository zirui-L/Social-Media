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

export const dmCreateV1 = (token: string, uIds: Array<number>): DmId | Error => {
  const data = getData();
  if (!isTokenValid(data, token)) {
    return { error: 'Invalid token' };
  } else if (isDuplicate(uIds)) {
    return { error: 'Duplicate uIds' };
  } else if (!isUIdsValid(data, uIds)) {
    return { error: 'Invalid uId(s)' };
  }

  const authUserId = findUserFromToken(data, token);
  const dmId = createUniqueId();
  uIds.unshift(authUserId);

  const users = [];
  for (const uId of uIds) {
    users.push(findUser(data, uId));
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

export const dmListV1 = (token: string): { dms: Array<DmObject> } | Error => {
  const data = getData();
  if (!isTokenValid(data, token)) {
    return { error: 'Invalid token' };
  }
  const authUserId = findUserFromToken(data, token);
  const authUser = findUser(data, authUserId);
  const dmList = [];
  for (const dmId of authUser.dms) {
    dmList.push({
      dmId: dmId,
      name: findDm(data, dmId).name,
    });
  }
  return { dms: dmList };
};

export const dmRemoveV1 = (token: string, dmId: number): Record<string, never> | Error => {
  const data = getData();
  if (!isDmValid(data, dmId)) {
    return { error: 'Invalid dmId' };
  } else if (!isTokenValid(data, token)) {
    return { error: 'Invalid token' };
  }
  const authUserId = findUserFromToken(data, token);
  if (!isDmOwner(data, authUserId, dmId)) {
    return { error: 'The authorised user is not the owner of the DM' };
  } else if (!isDmMember(data, authUserId, dmId)) {
    return { error: 'The authorised user is not in the DM' };
  }
  const Dm = findDm(data, dmId);
  for (const uId of Dm.allMembers) {
    const user = findUser(data, uId);
    user.dms = user.dms.filter((DmId) => DmId !== dmId);
  }
  data.dms = data.dms.filter((Dm) => Dm.dmId !== dmId);
  setData(data);
  return {};
};

export const dmDetailsV1 = (token: string, dmId: number): DmDetails | Error => {
  const data = getData();
  if (!isDmValid(data, dmId)) {
    return { error: 'Invalid dmId' };
  } else if (!isTokenValid(data, token)) {
    return { error: 'Invalid token' };
  }
  const authUserId = findUserFromToken(data, token);
  if (!isDmMember(data, authUserId, dmId)) {
    return { error: 'The authorised user is not in the DM' };
  }
  const Dm = findDm(data, dmId);
  const members = [];
  for (const uId of Dm.allMembers) {
    const member = findUser(data, uId);
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

export const dmLeaveV1 = (token: string, dmId: number): Record<string, never> | Error => {
  const data = getData();
  if (!isDmValid(data, dmId)) {
    return { error: 'Invalid dmId' };
  } else if (!isTokenValid(data, token)) {
    return { error: 'Invalid token' };
  }
  const authUserId = findUserFromToken(data, token);
  if (!isDmMember(data, authUserId, dmId)) {
    return { error: 'The authorised user is not in the DM' };
  }
  const user = findUser(data, authUserId);
  user.dms = user.dms.filter((DmId) => DmId !== dmId);

  const Dm = findDm(data, dmId);
  Dm.allMembers = Dm.allMembers.filter((uId) => uId !== authUserId);
  Dm.ownerMembers = Dm.ownerMembers.filter((uId) => uId !== authUserId);
  setData(data);
  return {};
};

export const dmMessagesV1 = (
  token: string,
  dmId: number,
  start: number
): paginatedMessage | Error => {
  const data = getData();
  if (!isDmValid(data, dmId)) {
    return { error: 'Invalid dmId' };
  } else if (!isTokenValid(data, token)) {
    return { error: 'Invalid token' };
  }
  const authUserId = findUserFromToken(data, token);
  const Dm = findDm(data, dmId);
  if (!isDmMember(data, authUserId, dmId)) {
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
    paginatedMessages.push(findMessageFromId(data, Dm.messages[i]));
  }
  return {
    messages: paginatedMessages,
    start: start,
    end: end,
  };
};
