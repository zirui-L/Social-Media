import {
  Channel,
  Data,
  storedUser,
  Message,
  Error,
  getData,
} from "./dataStore";
import fs from "fs";

export const storeData = () => {
  const data = getData();
  if (fs.existsSync("src/data.json")) {
    fs.unlinkSync("src/data.json");
  }
  fs.writeFileSync("src/data.json", JSON.stringify(data), { flag: "w" });
};

/**
 * <Create a unique id by utilise combination of timestampe and random number, which avoid repetition and collision>
 *
 * @param N/A
 *
 * @returns {number} - returns a unique id
 */
export const createUniqueId = (): number => {
  const timestamp = Date.now();
  const randomNum = Math.floor(Math.random() * 100);
  const id = parseInt(`${timestamp}${randomNum}`);
  return id;
};

// Determine whether a name has length between 1 and 50 inclusive
export const nameInRange = (name: string): boolean => {
  return !(name.length < 1 || name.length > 50);
};

// Determine whether a email is registed in the system or not
export const isAvaliableEmail = (email: string, users: any): boolean => {
  for (const user of users) {
    if (user.email === email) {
      return false;
    }
  }
  return true;
};

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
export const generateHandleStr = (
  nameFirst: string,
  nameLast: string,
  data: Data
): string => {
  let handleString = nameFirst.toLowerCase() + nameLast.toLowerCase();

  handleString = handleString.replace(/[^0-9a-z]/gi, "");

  if (handleString.length > 20) {
    handleString = handleString.substr(0, 20);
  }

  let numberCat = 0;

  while (!isAvaliableHandleString(handleString, data)) {
    handleString += numberCat.toString();
    numberCat += 1;
  }

  return handleString;
};

// Search up the dataStore to see if a handler string already exist or not
const isAvaliableHandleString = (newHandleStr: string, data: Data): boolean => {
  for (const user of data.users) {
    if (user.handleStr === newHandleStr) {
      return false;
    }
  }
  return true;
};

/**
 * <Check whether a user is registed>
 *
 * @param {{ users: [], channels: [],}} data - object that stores informations
 * about user and channels
 * @param {number} authUserId - user id of the enquiring user
 *
 * @returns {true} - if user with such authUserId is registered
 * @returns {false} - if user with such authUserId is not registered
 */
export const isAuthUserIdValid = (data: Data, authUserId: number): boolean => {
  for (const user of data.users) {
    if (user.authUserId === authUserId) {
      return true;
    }
  }

  return false;
};

/**
 * <Check whether a token is valid or not>
 *
 * @param {Data} data - object that stores informations
 * about user and channels
 * @param {string} token - user id of the enquiring user
 *
 * @returns {true} - if user with such token is logged in
 * @returns {false} - if user with such token is not logged in
 */
export const isTokenValid = (data: Data, token: string): boolean => {
  for (const existingtoken of data.tokens) {
    if (existingtoken.token === token) {
      return true;
    }
  }

  return false;
};

/**
 * <Check whether a channel is registed>
 *
 * @param {Data} data - object that stores informations
 * about user and channels
 * @param {number} channelId - channel id
 *
 * @returns {true} - if the channel with such channelId is registered
 * @returns {false} - if the channel with such channelId is not registered
 */
export const isChannelValid = (data: Data, channelId: number): boolean => {
  for (const channel of data.channels) {
    if (channel.channelId === channelId) {
      return true;
    }
  }

  return false;
};

/**
 * <Check if a specfoc user belong to a channel>
 *
 * @param {Data} data - object that stores informations
 * about user and channels
 * @param {string} authUserId - user id of the enquiring user
 * @param {string} channelId - channel id
 *
 * @returns {true} - valid email, password with more than 6 characters, and the
 * length of name is between 1 and 50 inclusive
 * @returns {false} - invalid or alreade registered email, length of passwor is
 * lower than 6, length of names is outside of the range [1,50]
 */
export const isMember = (data: Data, authUserId: number, channelId: number) => {
  const channelIndex = data.channels.findIndex(
    (channel) => channel.channelId === channelId
  );

  return data.channels[channelIndex].allMembers.includes(authUserId);
};

/**
 * <Find a user object with given authUserId>
 *
 * @param {Data} data - object that stores informations
 * about user and channels
 * @param {string} authUserId - user id of the enquiring user
 *
 * @returns {{ user }} - if there exist a user with given authUserId
 * @returns { undefined } - if there doesn't exist a user with given authUserId
 */
export const findUser = (data: Data, authUserId: number): storedUser => {
  return data.users.find((user) => user.authUserId === authUserId);
};

/**
 * <Find a channel object with given channelId>
 *
 * @param {Data} data - object that stores informations
 * about user and channels
 * @param {string} channelId - channel id
 *
 * @returns {{ channel }} - if there exist a channel with given channelId
 * @returns { undefined } - if there doesn't exist a channel with given
 * channelId
 */
export const findChannel = (data: Data, channelId: number): Channel => {
  return data.channels.find((channel) => channel.channelId === channelId);
};

/**
 * <Find a user id with given token>
 *
 * @param {Data} data - object that stores informations
 * about user and channels
 * @param {string} token - token for the user
 *
 * @returns {{ channel }} - if there exist a user with given token
 * @returns { undefined } - if there doesn't exist a user with given
 * token
 */
export const findUserFromToken = (data: Data, token: string): number => {
  return data.tokens.find((existingtoken) => existingtoken.token === token).uId;
};

/**
 * <Find a message with given message id>
 *
 * @param {Data} data - object that stores informations
 * about user and channels
 * @param {number} messageId - id for the message
 *
 * @returns {Message} - if there exist a message with given id
 * @returns {Error} - if there doesn't exist a message with given
 * id
 */
export const findMessageFromId = (
  data: Data,
  messageId: number
): Message | Error => {
  const message = data.messages.find(
    (existingMessage) => existingMessage.messageId === messageId
  );

  if (!message) {
    return { error: "Message does not exist" };
  }

  return {
    messageId: message.messageId,
    uId: message.uId,
    message: message.message,
    timeSent: message.timeSent,
  };
};
