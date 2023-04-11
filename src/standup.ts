import { getData, setData } from './dataStore';
import HTTPError from 'http-errors';

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
  return {};
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
  return {};
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
 * 2. ength of message is over 1000 characters
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
  return {};
};
