import { getData, setData } from './dataStore';
import validator from 'validator';
import {
  generateHandleStr,
  createUniqueId,
  nameInRange,
  isAvaliableEmail,
  isTokenValid,
  getHashOf,
  SECRET,
  findUser,
} from './helperFunctions/helperFunctions';

import { BAD_REQUEST } from './helperFunctions/helperServer';

import HTTPError from 'http-errors';
import { sendPasswordResetEmail } from './helperFunctions/emailHelper';

const DEFAULT_PROFILE_PIC =
  'https://www.personality-insights.com/wp-content/uploads/2017/12/default-profile-pic-e1513291410505.jpg';

type UIdAndToken = { token: string; authUserId: number }; // Reture object type

/**
 * <Given an email address, if the email address belongs to a registered user,
 * sends them an email containing a secret password reset code. This code, when
 * supplied to auth/passwordreset/reset, shows that the user trying to reset the
 * password is the same user who got sent the email contaning the code. No error
 * should be raised when given an invalid email, as that would pose a
 * security/privacy concern. When a user requests a password reset, they should
 * be logged out of all current sessions.>
 *
 * @param {string} email - email address of the registered users
 *
 * @returns {} - Return type if no error:
 *
 */

export const authPasswordresetRequestV1 = (email: string) => {
  // invalid email raises no errors
  const data = getData();
  const user = data.users.find((user) => user.email === email);
  if (user === undefined) {
    return {};
  }

  const resetCode = getHashOf(`${createUniqueId()}`);

  data.resetCodes.push({
    authUserId: user.authUserId,
    resetCode: resetCode,
    valid: true,
  });

  // Send email for resetting password
  sendPasswordResetEmail(email, resetCode);

  // log user out of all sessions
  data.tokens = data.tokens.filter(
    (existingToken) => existingToken.uId !== user.authUserId
  );

  setData(data);
  return {};
};

/**
 * <Given a reset code for a user, sets that user's new password to the password
 *  provided. Once a reset code has been used, it is then invalidated.>
 *
 * @param {string} email - email address of the registered users
 * @param {string} newPassword - new password of the registered users
 *
 * @returns {} - Return type if no error:
 * @throws {400 ERROR} - when any of:
 * 1. resetCode is not a valid reset code
 * 2. newPassword is less than 6 characters long
 */

export const authPasswordresetResetV1 = (
  resetCode: string,
  newPassword: string
) => {
  const data = getData();

  const storedResetCodes = data.resetCodes.find(
    (storedResetCodes) => storedResetCodes.resetCode === resetCode
  );
  if (storedResetCodes === undefined || storedResetCodes.valid === false) {
    throw HTTPError(BAD_REQUEST, 'resetCode is not a valid reset code');
  } else if (newPassword.length < 6) {
    throw HTTPError(BAD_REQUEST, 'newPassword is less than 6 characters long');
  }

  // invalidate the resetCode and change password for the user
  const user = findUser(storedResetCodes.authUserId);
  user.password = newPassword + SECRET;
  storedResetCodes.valid = false;
  setData(data);
  return {};
};

/**
 * <Allow the existing user to login to the system with their registered email
 * and password, notify user of the incorrect input, and return their authUserId
 * upon success>
 *
 * @param {string} email - email address of the registered users
 * @param {string} password - password of the registered users
 *
 * @returns {UIdAndToken} - there exist an user with matching email and
 * passwords
 * @throws {400 ERROR} - email or password non-exise or mismatch from
 * the stored user informations
 */

export const authLoginV3 = (email: string, password: string): UIdAndToken => {
  const data = getData();

  for (const user of data.users) {
    if (user.email === email && user.password === password) {
      // Create a unique token in numbers and convert it to string
      const token = `${createUniqueId()}`;
      data.tokens.push({
        uId: user.authUserId,
        token: token,
      });

      setData(data);

      return {
        token: getHashOf(token + SECRET),
        authUserId: user.authUserId,
      };
    }
  }

  throw HTTPError(BAD_REQUEST, 'Incorrect emaill or password');
};

/**
 * <Create a new user with input email, password, first and last names. Create
 * unique authUserId and handle string for each user, and store all
 * informations>
 *
 * @param {string} email - email address of the registered users
 * @param {string} password - password of the registered users
 * @param {string} nameFirst - first name of the registered users
 * @param {string} nameLast - last name of the registered users
 *
 * @returns {UIdAndToken} - valid email, password with more than 6
 * characters, and the length of name is between 1 and 50 inclusive
 * @throws {400 ERROR} - invalid or alreade registered email,
 * length of passwor is lower than 6, length of names is outside of the range [1,50]
 */

export const authRegisterV3 = (
  email: string,
  password: string,
  nameFirst: string,
  nameLast: string
): UIdAndToken => {
  const data = getData();

  if (!validator.isEmail(email)) {
    throw HTTPError(BAD_REQUEST, 'Invalid email formate');
  } else if (!nameInRange(nameFirst) || !nameInRange(nameLast)) {
    throw HTTPError(BAD_REQUEST, 'Invalid user name length');
  } else if (!isAvaliableEmail(email, data.users)) {
    throw HTTPError(BAD_REQUEST, 'Email already used');
  } else if (password.length < 6) {
    throw HTTPError(BAD_REQUEST, 'Invalid password length');
  }

  // create a unqiue user id in numbers
  const newUserId = createUniqueId();

  // permissionId for global owner is 1, for member is 2
  const permissionId = data.users.length === 0 ? 1 : 2;

  data.users.push({
    authUserId: newUserId,
    nameFirst: nameFirst,
    nameLast: nameLast,
    email: email,
    handleStr: generateHandleStr(nameFirst, nameLast), // generate handler string based on input name
    password: password,
    channels: [],
    permissionId: permissionId,
    dms: [],
    profileImgUrl: DEFAULT_PROFILE_PIC,
  });

  // create a unique token in numbers and convert it to string
  const token = `${createUniqueId()}`;

  data.tokens.push({
    token: token,
    uId: newUserId,
  });

  setData(data);

  return {
    token: getHashOf(token + SECRET),
    authUserId: newUserId,
  };
};

/**
 * <Given an active token, invalidates the token to log the user out>
 *
 * @param {string} token - token representing a session for an user
 *
 * @returns {{}} - valid email token, where the token would be logged out
 * @throws {400 ERROR} - invalid token
 */

export const authLogOutV2 = (token: string): Record<string, never> => {
  const data = getData();

  const tokenId = isTokenValid(token);

  if (!tokenId) {
    throw HTTPError(BAD_REQUEST, 'Invalid token');
  }

  // find the index of the token that need to be removed, and using splice method
  // to remove it from the data store
  const indexToDelete = data.tokens.findIndex(
    (existingToken) => existingToken.token === tokenId
  );

  data.tokens.splice(indexToDelete, 1);

  setData(data);

  return {};
};
