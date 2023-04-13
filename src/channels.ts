import { getData, setData, Error } from './dataStore';
import {
  isTokenValid,
  createUniqueId,
  findUserFromToken,
  findUser,
} from './helperFunctions/helperFunctions';

import { BAD_REQUEST } from './helperFunctions/helperServer';
import HTTPError from 'http-errors';

type ChannelId = {
  channelId: number;
};

type Channel = {
  channelId: number;
  name: string;
};

type Channels = {
  channels: Array<Channel>;
};

/**
 * channelsCreateV1 creates a new channel and returns its channel Id.
 *
 * @param {integer} authUserId - The Id of the owner of the channel to be created
 * @param {string} name - The name of channel to be created
 * @param {boolean} isPublic - Whether the channel will be public
 *
 * @throws {Error} - Error case: Either the length of channel name
 * is non-compliant or the authUserId is invalid
 * @returns {{channelId}} - Returns the Id of the created channel
 */

export const channelsCreateV3 = (
  token: string,
  name: string,
  isPublic: boolean
): ChannelId | Error => {
  const data = getData();
  if (name.length < 1 || name.length > 20) {
    throw HTTPError(BAD_REQUEST, 'Invalid channel name length');
  }

  const tokenId = isTokenValid(token);
  if (!tokenId) {
    throw HTTPError(BAD_REQUEST, 'Invalid token');
  }

  const channelId = createUniqueId();
  const authUserId = findUserFromToken(tokenId);
  const user = findUser(authUserId);

  user.channels.push(channelId);

  data.channels.push({
    channelName: name,
    channelId: channelId,
    isPublic: isPublic,
    ownerMembers: [authUserId],
    allMembers: [authUserId],
    messages: [],
    standUp: {
      starter: null,
      isActive: false,
      finishingTime: null,
      messages: [],
    },
  });

  setData(data);

  return {
    channelId: channelId,
  };
};

/**
 * channelsListV1 returns an array of all channels (and their associated
 * details) that the input authorised user is part of
 *
 * @param {integer} authUserId - The Id of the user that participates in the
 * returned channels
 *
 * @throws {Error} - Error case when the input user Id is invalid
 * @returns {{channels}} - A array of channels and their details that the user
 * is part of
 */

export const channelsListV3 = (token: string): Channels | Error => {
  const data = getData();

  const tokenId = isTokenValid(token);
  if (!tokenId) {
    throw HTTPError(BAD_REQUEST, 'Invalid token');
  }

  const authUserId = findUserFromToken(tokenId);

  const getChannels = [];

  for (const channel of data.channels) {
    if (channel.allMembers.includes(authUserId)) {
      getChannels.push({
        channelId: channel.channelId,
        name: channel.channelName,
      });
    }
  }

  return {
    channels: getChannels,
  };
};

/**
 * Provides an array of all channels, including private channels (and their
 * associated details)
 *
 * @param {integer} authUserId - The user Id
 *
 * @throws {Error} - Error case when the input user Id is invalid
 * @returns {{channels}} - A array of all channels and their details
 */

export const channelsListAllV3 = (token: string): Channels => {
  const data = getData();

  const tokenId = isTokenValid(token);
  if (!tokenId) {
    throw HTTPError(BAD_REQUEST, 'Invalid token');
  }

  const getChannels = [];

  for (const channel of data.channels) {
    getChannels.push({
      channelId: channel.channelId,
      name: channel.channelName,
    });
  }
  return {
    channels: getChannels,
  };
};
