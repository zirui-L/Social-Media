import { getData, setData, Error } from "./dataStore";
import validator from "validator";
import {
  generateHandleStr,
  createUniqueId,
  nameInRange,
  isAvaliableEmail,
  isTokenValid,
} from "./helperFunctions";

type UIdAndToken = { token: string; authUserId: number };

/**
 * <Allow the existing user to login to the system with their registered email
 * and password, notify user of the incorrect input, and return their authUserId
 * upon success>
 *
 * @param {string} email - email address of the registered users
 * @param {string} password - password of the registered users
 *
 * @returns {{ token, authUserId }} - there exist an user with matching email and
 * passwords
 * @returns {Error} - email or password non-exise or mismatch from
 * the stored user informations
 */

export const authLoginV2 = (
  email: string,
  password: string
): UIdAndToken | Error => {
  const data = getData();

  for (const user of data.users) {
    if (user.email === email && user.password === password) {
      const token = `${createUniqueId()}`;
      data.tokens.push({
        uId: user.authUserId,
        token: token,
      });
      return {
        token: token,
        authUserId: user.authUserId,
      };
    }
  }
  return { error: "Incorrect emaill or password" };
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
 * @returns {{ token, authUserId }} - valid email, password with more than 6
 * characters, and the length of name is between 1 and 50 inclusive
 *  @returns {Error} - invalid or alreade registered email,
 * length of passwor is lower than 6, length of names is outside of the range [1,50]
 */

export const authRegisterV2 = (
  email: string,
  password: string,
  nameFirst: string,
  nameLast: string
): UIdAndToken | Error => {
  const data = getData();

  if (!validator.isEmail(email)) {
    return { error: "Invalid email formate" };
  } else if (!nameInRange(nameFirst) || !nameInRange(nameLast)) {
    return { error: "Invalid user name length" };
  } else if (!isAvaliableEmail(email, data.users)) {
    return { error: "Email already used" };
  } else if (password.length < 6) {
    return {
      error: "Invalid password length",
    };
  }

  let newUserId = createUniqueId();

  let permissionId = data.users.length === 0 ? 1 : 2; // permissionId for owner is 1, for member is 2 ?????????????????

  data.users.push({
    authUserId: newUserId,
    nameFirst: nameFirst,
    nameLast: nameLast,
    email: email,
    handleStr: generateHandleStr(nameFirst, nameLast, data),
    password: password,
    channels: [],
    permissionId: permissionId,
    dms: [],
  });

  const token = `${createUniqueId()}`;

  data.tokens.push({
    token: token,
    uId: newUserId,
  });

  setData(data);

  return {
    token: token,
    authUserId: newUserId,
  };
};

/**
 * <Given an active token, invalidates the token to log the user out>
 *
 * @param {string} token - token representing a session for an user
 *
 * @returns {{ token }} - valid email token, where the token would be logged out
 *  @returns {Error} - invalid token
 */

export const authLogOutV1 = (token: string): {} | Error => {
  const data = getData();

  if (!isTokenValid(data, token)) {
    return { error: "Invalid token" };
  }

  let indexToDelete = data.tokens.findIndex(
    (existingToken) => existingToken.token === token
  );

  data.tokens.splice(indexToDelete, 1);

  setData(data);

  return {};
};
