import { getData, setData } from './dataStore';
import HTTPError from 'http-errors';
import { BAD_REQUEST, FORBIDDEN } from './helperFunctions/helperServer';
import {
  findChannel,
  findUser,
  findUserFromToken,
  getTimeNow,
  isChannelValid,
  isMember,
  isTokenValid,
} from './helperFunctions/helperFunctions';
import {
  isStandupActive,
  recordStandupEnd,
} from './helperFunctions/standupHelper';
import { chdir } from 'process';

/**
 * <For a given channel, starts a standup period lasting length seconds.>
 *
 * @param {string} token - token for the requested user
 * @param {number} channelId - Id for the input channel
 * @param {number} length - lasting seconds of the standup
 *
 * @throws {Error} - return when any of:
 * 1. channelId does not refer to a valid channel
 * 2. length is a negative integer
 * 3. an active standup is currently running in the channel
 * 4. channelId is valid and the authorised user is not a member of the channel
 * @returns { timeFinish } - return when error condition are avoided
 *
 */
export const standupStartV1 = (
  token: string,
  channelId: number,
  length: number
) => {
  const data = getData();

  const tokenId = isTokenValid(token);

  if (!tokenId) {
    throw HTTPError(FORBIDDEN, 'Invalid token');
  } else if (!isChannelValid(channelId)) {
    throw HTTPError(BAD_REQUEST, 'Invalid channel');
  } else if (length < 0) {
    throw HTTPError(BAD_REQUEST, 'length is a negative integer');
  } else if (isStandupActive(channelId)) {
    throw HTTPError(
      BAD_REQUEST,
      'an active standup is currently running in the channel'
    );
  }

  const authUserId = findUserFromToken(tokenId);

  if (!isMember(authUserId, channelId)) {
    throw HTTPError(FORBIDDEN, 'User is not a member of the channel');
  }

  const channel = findChannel(channelId);

  const finishingTime = getTimeNow() + length;

  channel.standUp.starter = authUserId;

  channel.standUp.finishingTime = finishingTime;

  channel.standUp.isActive = true;

  recordStandupEnd(authUserId, channelId, length);
  setData(data);
  return { timeFinish: finishingTime };
};

/**
 * <For a given channel, returns whether a standup is active in it, and what
 * time the standup finishes. If no standup is active, then timeFinish should
 * be null.>
 *
 * @param {string} token - token for the requested user
 * @param {number} channelId - Id for the input channel
 *
 * @returns {Error} - return when any of:
 * 1. channelId does not refer to a valid channel
 * 2. channelId is valid and the authorised user is not a member of the channel
 *
 * @returns { isActive, timeFinish } - return when error condition are avoided
 *
 */
export const standupActiveV1 = (token: string, channelId: number) => {
  const tokenId = isTokenValid(token);

  if (!tokenId) {
    throw HTTPError(FORBIDDEN, 'Invalid token');
  } else if (!isChannelValid(channelId)) {
    throw HTTPError(BAD_REQUEST, 'Invalid channel');
  }

  const authUserId = findUserFromToken(tokenId);

  if (!isMember(authUserId, channelId)) {
    throw HTTPError(FORBIDDEN, 'User is not a member of the channel');
  }

  const channel = findChannel(channelId);

  return {
    isActive: channel.standUp.isActive,
    timeFinish: channel.standUp.finishingTime,
  };
};

/**
 * <For a given channel, if a standup is currently active in the channel, sends
 * a message to get buffered in the standup queue.>
 *
 * @param {string} token - token for the requested user
 * @param {number} channelId - Id for the input channel
 * @param {string} message - message string
 *
 * @returns {Error} - return when any of:
 * 1. channelId does not refer to a valid channel
 * 2. length of message is over 1000 characters
 * 3. an active standup is not currently running in the channel
 * 4. channelId is valid and the authorised user is not a member of the channel
 * @returns {} - return when error condition are avoided
 *
 */
export const standupSendV1 = (
  token: string,
  channelId: number,
  message: string
) => {
  const data = getData();

  const tokenId = isTokenValid(token);

  if (!tokenId) {
    throw HTTPError(FORBIDDEN, 'Invalid token');
  } else if (!isChannelValid(channelId)) {
    throw HTTPError(BAD_REQUEST, 'Invalid channel');
  } else if (message.length > 1000) {
    throw HTTPError(BAD_REQUEST, 'length of message is over 1000 characters');
  } else if (!isStandupActive(channelId)) {
    throw HTTPError(
      BAD_REQUEST,
      'an active standup is not currently running in the channel'
    );
  }

  const authUserId = findUserFromToken(tokenId);

  if (!isMember(authUserId, channelId)) {
    throw HTTPError(FORBIDDEN, 'User is not a member of the channel');
  }

  const channel = findChannel(channelId);
  const handleStr = findUser(authUserId).handleStr;

  channel.standUp.messages.push({
    sender: handleStr,
    message: message,
  });
  setData(data);
  return {};
};
