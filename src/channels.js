import { getData, setData } from "./dataStore.js";
const ERROR = { error: "error" };

/**
 * <Brief description of what the function does>
 *
 * @param {integer} authUserId - description of paramter
 * @param {string} name - description of parameter
 * @param {boolean} isPublic - description of parameter
 * ...
 *
 * @returns {{error: "error"}} - description of condition for return
 * @returns {{channelId}} - description of condition for return
 */

export function channelsCreateV1(authUserId, name, isPublic) {
  const data = getData();
  if (name.length < 1 || name.length > 20 || !isUserValid(data, authUserId)) {
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
}

/**
 * <Brief description of what the function does>
 *
 * @param {data type} name - description of paramter
 * @param {data type} name - description of parameter
 * ...
 *
 * @returns {data type} - description of condition for return
 * @returns {data type} - description of condition for return
 */

export function channelsListV1(authUserId) {
  const data = getData();

  if (!isUserValid(data, authUserId)) {
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
}

/**
 * <Brief description of what the function does>
 *
 * @param {data type} name - description of paramter
 * @param {data type} name - description of parameter
 * ...
 *
 * @returns {data type} - description of condition for return
 * @returns {data type} - description of condition for return
 */

export function channelsListAllV1(authUserId) {
  const data = getData();

  if (!isUserValid(data, authUserId)) {
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
}

function isUserValid(data, authUserId) {
  for (const user of data.users) {
    if (user.authUserId === authUserId) {
      return true;
    }
  }

  return false;
}
