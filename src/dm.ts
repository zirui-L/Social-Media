import { Error, User, paginatedMessage } from './dataStore';

type DmIdObj = {
  dmId: number;
};

type DmObj = {
  dmId: number;
  name: string;
};

type DmDetailsObj = {
  members: Array<User>;
  name: string;
};

export const dmCreateV1 = (
  token: string,
  uIds: Array<number>
): DmIdObj | Error => {
  return { dmId: 0 };
};

export const dmListV1 = (token: string): Array<DmObj> | Error => {
  return [];
};

export const dmRemoveV1 = (token: string, dmId: number): {} | Error => {
  return {};
};

export const dmDetailsV1 = (
  token: string,
  dmId: number
): DmDetailsObj | Error => {
  return { name: 'void', members: [] };
};

export const dmLeaveV1 = (token: string, dmId: number): {} | Error => {
  return {};
};

export const dmMessagesV1 = (
  token: string,
  dmId: number,
  start: number
): paginatedMessage | Error => {
  return { messages: [], start: 0, end: 0 };
};
