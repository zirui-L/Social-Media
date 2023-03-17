import { getData, setData } from "./dataStore.js";
import { isAuthUserIdValid } from "./helperFunctions.js";

const ERROR = { error: "error" };

/**
 * channelsCreateV1 creates a new channel and returns its channel Id.
 *
 * @param {integer} authUserId - The Id of the owner of the channel to be created
 * @param {string} name - The name of channel to be created
 * @param {boolean} isPublic - Whether the channel will be public
 *
 * @returns {{error: "error"}} - Error case: Either the length of channel name
 * is non-compliant or the authUserId is invalid
 * @returns {{channelId}} - Returns the Id of the created channel
 */

export const channelsCreateV1 = (
  authUserId: number,
  name: string,
  isPublic: boolean
) => {
  const data = getData();
  if (
    name.length < 1 ||
    name.length > 20 ||
    !isAuthUserIdValid(data, authUserId)
  ) {
    return ERROR;
  }

  const channelId = data.channels.length * 5;

  const userIndex = data.users.findIndex(
    (user) => user.authUserId === authUserId
  );

  data.users[userIndex].channels.push(channelId);

  data.channels.push({
    name: name,
    channelId: channelId,
    isPublic: isPublic,
    ownerMembers: [authUserId],
    allMembers: [authUserId],
    messages: [],
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
 * @returns {{error: "error"}} - Error case when the input user Id is invalid
 * @returns {{channels}} - A array of channels and their details that the user
 * is part of
 */

export const channelsListV1 = (authUserId: number) => {
  const data = getData();

  if (!isAuthUserIdValid(data, authUserId)) {
    return ERROR;
  }

  const getChannels = [];

  for (const channel of data.channels) {
    if (channel.allMembers.includes(authUserId)) {
      getChannels.push({
        channelId: channel.channelId,
        name: channel.name,
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
 * @returns {{error : "error"}}} - Error case when the input user Id is invalid
 * @returns {{channels}} - A array of all channels and their details
 */

export const channelsListAllV1 = (authUserId: number) => {
  const data = getData();

  if (!isAuthUserIdValid(data, authUserId)) {
    return ERROR;
  }

  const getChannels = [];

  for (const channel of data.channels) {
    getChannels.push({
      channelId: channel.channelId,
      name: channel.name,
    });
  }
  return {
    channels: getChannels,
  };
};
