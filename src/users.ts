import { getData, Error, User, setData } from './dataStore';
import {
  isAuthUserIdValid,
  isTokenValid,
  nameInRange,
  isAvaliableEmail,
  isAvaliableHandleString,
  findUser,
  findUserFromToken,
} from './helperFunctions/helperFunctions';
import validator from 'validator';

import { BAD_REQUEST, FORBIDDEN } from './helperFunctions/helperServer';
import HTTPError from 'http-errors';

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

export const userProfileV3 = (token: string, uId: number): UserObject => {
  const data = getData();
  // check validity of inputs
  const tokenId = isTokenValid(token);
  if (!tokenId) {
    throw HTTPError(BAD_REQUEST, 'Invalid token');
  } else if (!isAuthUserIdValid(uId)) {
    throw HTTPError(BAD_REQUEST, 'uId does not refer to a valid user');
  }

  // return user's detail
  for (const user of data.users) {
    if (user.authUserId === uId) {
      return {
        user: {
          uId: user.authUserId,
          email: user.email,
          nameFirst: user.nameFirst,
          nameLast: user.nameLast,
          handleStr: user.handleStr,
          profileImgUrl: user.profileImgUrl,
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

export const usersAllV2 = (token: string): UsersObject => {
  const data = getData();
  // check validity of input
  const tokenId = isTokenValid(token);

  if (!tokenId) {
    throw HTTPError(BAD_REQUEST, 'Invalid token');
  }
  // push all users' detail into a new array
  const usersArray = [];

  for (const user of data.users) {
    usersArray.push({
      uId: user.authUserId,
      email: user.email,
      nameFirst: user.nameFirst,
      nameLast: user.nameLast,
      handleStr: user.handleStr,
      profileImgUrl: user.profileImgUrl,
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
export const userProfileSetNameV2 = (
  token: string,
  nameFirst: string,
  nameLast: string
): Record<string, never> => {
  const data = getData();
  // check validity of inputs
  const tokenId = isTokenValid(token);

  if (!tokenId) {
    throw HTTPError(BAD_REQUEST, 'Invalid token');
  } else if (!nameInRange(nameFirst) || !nameInRange(nameLast)) {
    throw HTTPError(BAD_REQUEST, 'Invalid name length');
  }
  // find user
  const autherUserId = findUserFromToken(tokenId);

  const user = findUser(autherUserId);
  // change name
  user.nameFirst = nameFirst;
  user.nameLast = nameLast;
  // update to data
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
export const userProfileSetEmailV2 = (
  token: string,
  email: string
): Record<string, never> | Error => {
  const data = getData();
  // check validaity of inputs
  const tokenId = isTokenValid(token);

  if (!tokenId) {
    throw HTTPError(BAD_REQUEST, 'Invalid token');
  } else if (!validator.isEmail(email)) {
    throw HTTPError(BAD_REQUEST, 'Invalid email');
  } else if (!isAvaliableEmail(email, data.users)) {
    throw HTTPError(BAD_REQUEST, 'Email already exist');
  }
  // Find user
  const autherUserId = findUserFromToken(tokenId);

  const user = findUser(autherUserId);
  // change user's email and updated to data
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
export const userProfileSetHandleV2 = (
  token: string,
  handleStr: string
): Record<string, never> => {
  const data = getData();
  // check validaity of inputs
  const tokenId = isTokenValid(token);

  if (!tokenId) {
    throw HTTPError(BAD_REQUEST, 'Invalid token');
  } else if (handleStr.length < 3 || handleStr.length > 20) {
    throw HTTPError(BAD_REQUEST, 'Invalid handle string length');
  } else if (!/^[0-9a-zA-Z]+$/.test(handleStr)) {
    // test wether the string is alphanumerical using regular expression
    throw HTTPError(
      BAD_REQUEST,
      'handleStr contains characters that are not alphanumeric'
    );
  } else if (!isAvaliableHandleString(handleStr)) {
    throw HTTPError(BAD_REQUEST, 'handle is already used by another user');
  }
  // find user
  const autherUserId = findUserFromToken(tokenId);

  const user = findUser(autherUserId);
  // change handleStr and updated to data
  user.handleStr = handleStr;

  setData(data);
  return {};
};

/**
 * <Given a URL of an image on the internet, crops the image within bounds
 * (xStart, yStart) and (xEnd, yEnd). Position (0,0) is the top left. Please
 * note: the URL needs to be a non-https URL (it should just have "http://" in
 * the URL). We will only test with non-https URLs.>
 *
 * @param {string} token - token for the requested user
 * @param {string} imgUrl - updated user handlerStr
 * @param {number} xStart - updated user handlerStr
 * @param {number} yStart - updated user handlerStr
 * @param {number} xEnd - updated user handlerStr
 * @param {number} yEnd - updated user handlerStr
 *
 * @returns {Error} - return when any of:
 * 1. length of handleStr is not between 3 and 20 characters inclusive
 * 2. handleStr contains characters that are not alphanumeric
 * 3. the handle is already used by another user
 * 4. token is invalid
 * @returns {} - return when error condition are avoided
 *
 */
export const userProfileUploadPhotoV1 = (
  token: string,
  imgUrl: string,
  xStart: number,
  yStart: number,
  xEnd: number,
  yEnd: number
) => {};
