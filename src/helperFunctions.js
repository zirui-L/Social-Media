import validator from "validator";

/**
 * <Create a new user with input email, password, first and last names. Create
 * unique authUserId and handle string for each user, and store all
 * informations>
 *
 * @param {string} email - email address of the registered users
 * @param {string} password - password of the registered users
 * @param {string} nameFirst - first name of the registered users
 * @param {string} nameLast - last name of the registered users
 * @param {{ users: [], channels: [],}} data - object that stores informations
 * about user and channels
 *
 * @returns {true} - valid email, password with more than 6 characters, and the
 * length of name is between 1 and 50 inclusive
 * @returns {false} - returns false is one of the above argument is false
 */

export function isRegisterValid(email, password, nameFirst, nameLast, data) {
  if (!validator.isEmail(email) || !isAvaliableEmail(email, data.users)) {
    return false;
  } else if (
    password.length < 6 ||
    !nameInRange(nameFirst) ||
    !nameInRange(nameLast)
  ) {
    return false;
  }

  return true;
}

// Determine whether a name has length between 1 and 50 inclusive
function nameInRange(name) {
  return !(name.length < 1 || name.length > 50);
}

// Determine whether a email is email
function isAvaliableEmail(email, users) {
  for (const user of users) {
    if (user.email === email) {
      return false;
    }
  }
  return true;
}

/**
 * <Create a unique handler string according to user names>
 *
 * @param {string} nameFirst - first name of the registered users
 * @param {string} nameLast - last name of the registered users
 * @param {{ users: [], channels: [],}} data - object that stores informations
 * about user and channels
 *
 * @returns {handleString} - returns a unique handler string
 */
export function generateHandleStr(nameFirst, nameLast, data) {
  let handleString = nameFirst.toLowerCase() + nameLast.toLowerCase();

  handleString = handleString.replace(/[^0-9a-z]/gi, "");

  if (handleString.length > 20) {
    handleString = handleString.substr(0, 20);
  }

  let numberCat = 0;

  while (!isAvaliableHandleString(handleString, data.users)) {
    handleString += numberCat.toString();
    numberCat += 1;
  }

  return handleString;
}

// Search up the dataStore to see if a handler string already exist or not
function isAvaliableHandleString(newHandleStr, users) {
  for (const user of users) {
    if (user.handleStr === newHandleStr) {
      return false;
    }
  }
  return true;
}

/**
 * <Check whether a user is registed>
 *
 * @param {{ users: [], channels: [],}} data - object that stores informations
 * about user and channels
 * @param {string} authUserId - user id of the enquiring user
 *
 * @returns {true} - if user with such authUserId is registered
 * @returns {false} - if user with such authUserId is not registered
 */
export function isAuthUserIdValid(data, authUserId) {
  for (const user of data.users) {
    if (user.authUserId === authUserId) {
      return true;
    }
  }

  return false;
}

/**
 * <Check whether a channel is registed>
 *
 * @param {{ users: [], channels: [],}} data - object that stores informations
 * about user and channels
 * @param {string} channelId - channel id
 *
 * @returns {true} - if the channel with such channelId is registered
 * @returns {false} - if the channel with such channelId is not registered
 */
export function isChannelValid(data, channelId) {
  for (const channel of data.channels) {
    if (channel.channelId === channelId) {
      return true;
    }
  }

  return false;
}

/**
 * <Check if a specfoc user belong to a channel>
 *
 * @param {{ users: [], channels: [],}} data - object that stores informations
 * about user and channels
 * @param {string} authUserId - user id of the enquiring user
 * @param {string} channelId - channel id
 *
 * @returns {true} - valid email, password with more than 6 characters, and the
 * length of name is between 1 and 50 inclusive
 * @returns {false} - invalid or alreade registered email, length of passwor is
 * lower than 6, length of names is outside of the range [1,50]
 */
export function isMember(data, authUserId, channelId) {
  const channelIndex = data.channels.findIndex(
    (channel) => channel.channelId === channelId
  );

  return data.channels[channelIndex].allMembers.includes(authUserId);
}

/**
 * <Find a user object with given authUserId>
 *
 * @param {{ users: [], channels: [],}} data - object that stores informations
 * about user and channels
 * @param {string} authUserId - user id of the enquiring user
 *
 * @returns {{ user }} - if there exist a user with given authUserId
 * @returns { undefined } - if there doesn't exist a user with given authUserId
 */
export function findUser(data, authUserId) {
  return data.users.find((user) => user.authUserId === authUserId);
}

/**
 * <Create a new user with input email, password, first and last names. Create
 * unique authUserId and handle string for each user, and store all informations>
 *
 * @param {{ users: [], channels: [],}} data - object that stores informations
 * about user and channels
 * @param {string} channelId - channel id
 *
 * @returns {{ channel }} - if there exist a channel with given channelId
 * @returns { undefined } - if there doesn't exist a channel with given
 * channelId
 */
export function findChannel(data, channelId) {
  return data.channels.find((channel) => channel.channelId === channelId);
}
