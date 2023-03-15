import { getData, setData } from "./dataStore.js";
import { isRegisterValid, generateHandleStr } from "./helperFunctions.js";
const ERROR = { error: "error" };

/**
 * <Allow the existing user to login to the system with their registered email
 * and password, notify user of the incorrect input, and return their authUserId
 * upon success>
 *
 * @param {string} email - email address of the registered users
 * @param {string} password - password of the registered users
 *
 * @returns {{authUserId}} - there exist an user with matching email and
 * passwords
 * @returns {{ error: "error" }} - email or password non-exise or mismatch from
 * the stored user informations
 */

export function authLoginV1(email, password) {
  const data = getData();

  for (const client of data.users) {
    if (client.email === email && client.password === password) {
      return {
        authUserId: client.authUserId,
      };
    }
  }
  return ERROR;
}

/**
 * <Create a new user with input email, password, first and last names. Create
 * unique authUserId and handle string for each user, and store all
 * informations>
 *
 * @param {string} email - email address of the registered users
 * @param {string} password - password of the registered users
 * @param {string} nameFirst - first name of the registered users
 * @param {string} nameLast - last name of the registered users
 * ...
 *
 * @returns {{ authUserId }} - valid email, password with more than 6
 * characters, and the length of name is between 1 and 50 inclusive
 *  @returns {{ error: "error" }} - invalid or alreade registered email,
 * length of passwor is lower than 6, length of names is outside of the range [1,50]
 */

export function authRegisterV1(email, password, nameFirst, nameLast) {
  const data = getData();

  if (!isRegisterValid(email, password, nameFirst, nameLast, data)) {
    return ERROR;
  }

  let newId = data.users.length * 50;

  let permissionId; // permissionId for owner is 1, for member is 2

  if (data.users.length === 0) {
    permissionId = 1;
  } else {
    permissionId = 2;
  }

  data.users.push({
    authUserId: newId,
    nameFirst: nameFirst,
    nameLast: nameLast,
    email: email,
    handleStr: generateHandleStr(nameFirst, nameLast, data),
    password: password,
    channels: [],
    permissionId: permissionId,
  });

  setData(data);

  return {
    authUserId: newId,
  };
}
