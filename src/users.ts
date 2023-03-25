import { getData, Error, User } from './dataStore';
import { isAuthUserIdValid, isTokenValid } from './helperFunctions';

type UserObject = {
  user: User;
};

type UsersObject = {
  users: Array<User>;
};

/**
 * <Create a new user with input email, password, first and last names. Create
 * unique authUserId and handle string for each user, and store all informations>
 *
 * @param {string} token - token for the requested user
 * @param {number} uId - id for the checked user
 *
 * @returns {UserObject} - return if the token and uId are both valid
 *  @returns {Error} - return if there is invalid autherUserId or invalid uId
 */

export const userProfileV2 = (
  token: string,
  uId: number
): UserObject | Error => {
  const data = getData();

  if (!isTokenValid(data, token)) {
    return { error: 'Invalid token' };
  } else if (!isAuthUserIdValid(data, uId)) {
    return { error: 'uId does not refer to a valid user' };
  }

  for (const user of data.users) {
    if (user.authUserId === uId) {
      return {
        user: {
          uId: user.authUserId,
          email: user.email,
          nameFirst: user.nameFirst,
          nameLast: user.nameLast,
          handleStr: user.handleStr,
        },
      };
    }
  }
};

export const usersAllV1 = (token: string): UsersObject | Error => {
  return { users: [] };
};

export const userProfileSetNameV1 = (
  token: string,
  nameFirst: string,
  nameLast: string
): Record<string, never> | Error => {
  return {};
};

export const userProfileSetEmailV1 = (
  token: string,
  email: string
): Record<string, never> | Error => {
  return {};
};

export const userProfileSetHandleV1 = (
  token: string,
  handleStr: string
): Record<string, never> | Error => {
  return {};
};
