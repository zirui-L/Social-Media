import { getData, Error, User, setData } from './dataStore';
import {
  isAuthUserIdValid,
  isTokenValid,
  nameInRange,
  isAvaliableEmail,
  isAvaliableHandleString,
  findUser,
  findUserFromToken,
} from './helperFunctions';
import validator from 'validator';

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

  if (!isTokenValid(token)) {
    return { error: 'Invalid token' };
  } else if (!isAuthUserIdValid(uId)) {
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

/**
 * <Returns a list of all users and their associated details.>
 *
 * @param {string} token - token for the requested user
 *
 * @returns {UsersObject} - return if the token is valid
 * @returns {Error} - return if the token is invalid
 *
 */

export const usersAllV1 = (token: string): UsersObject | Error => {
  const data = getData();

  if (!isTokenValid(token)) {
    return { error: 'Invalid token' };
  }

  const usersArray = [];

  for (const user of data.users) {
    usersArray.push({
      uId: user.authUserId,
      email: user.email,
      nameFirst: user.nameFirst,
      nameLast: user.nameLast,
      handleStr: user.handleStr,
    });
  }

  return { users: usersArray };
};

/**
 * <Update the authorised user's first and last name>
 *
 * @param {string} token - token for the requested user
 * @param {number} nameFirst - updated user first name
 * @param {number} nameLast - updated user date name
 *
 * @returns {Error} - return when any of:
 * 1. length of nameFirst is not between 1 and 50 characters inclusive
 * 2. length of nameLast is not between 1 and 50 characters inclusive
 * 3. token is invalid
 * @returns {} - return when error condition are avoided
 *
 */
export const userProfileSetNameV1 = (
  token: string,
  nameFirst: string,
  nameLast: string
): Record<string, never> | Error => {
  const data = getData();

  if (!isTokenValid(token)) {
    return { error: 'Invalid token' };
  } else if (!nameInRange(nameFirst) || !nameInRange(nameLast)) {
    return { error: 'Invalid name length' };
  }

  const autherUserId = findUserFromToken(token);

  const user = findUser(autherUserId);

  user.nameFirst = nameFirst;
  user.nameLast = nameLast;

  setData(data);
  return {};
};

/**
 * <Update the authorised user's first and last name>
 *
 * @param {string} token - token for the requested user
 * @param {number} email - updated user email
 *
 * @returns {Error} - return when any of:
 * 1. email entered is not a valid email
 * 2. email address is already being used by another user
 * 3. token is invalid
 * @returns {} - return when error condition are avoided
 *
 */
export const userProfileSetEmailV1 = (
  token: string,
  email: string
): Record<string, never> | Error => {
  const data = getData();

  if (!isTokenValid(token)) {
    return { error: 'Invalid token' };
  } else if (!validator.isEmail(email)) {
    return { error: 'Invalid email' };
  } else if (!isAvaliableEmail(email, data.users)) {
    return { error: 'Email already exist' };
  }

  const autherUserId = findUserFromToken(token);

  const user = findUser(autherUserId);

  user.email = email;

  setData(data);
  return {};
};

/**
 * <Create a new user with input email, password, first and last names. Create
 * unique authUserId and handle string for each user, and store all informations>
 *
 * @param {string} token - token for the requested user
 * @param {number} handlerStr - updated user handlerStr
 *
 * @returns {Error} - return when any of:
 * 1. length of handleStr is not between 3 and 20 characters inclusive
 * 2. handleStr contains characters that are not alphanumeric
 * 3. the handle is already used by another user
 * 4. token is invalid
 * @returns {} - return when error condition are avoided
 *
 */
export const userProfileSetHandleV1 = (
  token: string,
  handleStr: string
): Record<string, never> | Error => {
  const data = getData();

  if (!isTokenValid(token)) {
    return { error: 'Invalid token' };
  } else if (handleStr.length < 3 || handleStr.length > 20) {
    return { error: 'Invalid handle string length' };
  } else if (!/^[0-9a-zA-Z]+$/.test(handleStr)) {
    // test wether the string is alphanumerical using regular expression
    return { error: 'handleStr contains characters that are not alphanumeric' };
  } else if (!isAvaliableHandleString(handleStr)) {
    return { error: 'handle is already used by another user' };
  }

  const autherUserId = findUserFromToken(token);

  const user = findUser(autherUserId);

  user.handleStr = handleStr;

  setData(data);
  return {};
};
