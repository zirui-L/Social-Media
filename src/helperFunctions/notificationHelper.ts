import { getData, setData } from '../dataStore';
import {
  findChannel,
  findDm,
  findStoredMessageFromId,
  findUser,
  isDmMember,
  isMember,
} from './helperFunctions';

export const findTaggedUsers = (
  dmOrChannelId: number,
  isChannelMessage: boolean,
  msg: string
) => {
  const data = getData();
  const lowerCaseMessage = msg.toLowerCase();

  const handleStrings = lowerCaseMessage.match(/@[0-9a-z]+/g);

  const uIds: Array<number> = [];

  if (!handleStrings) {
    return { uIds };
  }

  for (const handleString of handleStrings) {
    const user = data.users.find(
      (user) => user.handleStr === handleString.slice(1)
    );

    if (!user) {
      // User doesn't exist
      continue;
    } else if (isChannelMessage && !isMember(user.authUserId, dmOrChannelId)) {
      // user does not belong to the channel
      continue;
    } else if (
      !isChannelMessage &&
      !isDmMember(user.authUserId, dmOrChannelId)
    ) {
      // user does not belong to the dm
      continue;
    } else if (uIds.includes(user.authUserId)) {
      // user already tagged in the message
      continue;
    }

    uIds.push(user.authUserId);
  }

  return { uIds };
};

export function notifyTaggedUsers(
  senderUserId: number,
  dmOrChannelId: number,
  isChannelMessage: boolean,
  messageId: number,
  usersTaggedBefore: Array<number>
) {
  const data = getData();

  const storedMessage = findStoredMessageFromId(messageId);

  // Only notify users which were not previously notified by the message before edit
  for (const user of findTaggedUsers(
    storedMessage.dmOrChannelId,
    storedMessage.isChannelMessage,
    storedMessage.message
  ).uIds) {
    if (!usersTaggedBefore.includes(user)) {
      addNotification(
        senderUserId,
        user,
        dmOrChannelId,
        isChannelMessage,
        'tag',
        storedMessage.message
      );
    }
  }

  setData(data);
  return {};
}

export function addNotification(
  senderUserId: number,
  receiverUserId: number,
  dmOrChannelId: number,
  isChannelMessage: boolean,
  type: string,
  message: string
) {
  const data = getData();

  const sender = findUser(senderUserId);

  let dmOrChannelName = '';
  if (isChannelMessage) {
    const channel = findChannel(dmOrChannelId);
    if (!isMember(receiverUserId, dmOrChannelId)) {
      return {};
    }
    dmOrChannelName = channel.channelName;
  } else {
    const dm = findDm(dmOrChannelId);
    if (!isDmMember(receiverUserId, dmOrChannelId)) {
      return {};
    }
    dmOrChannelName = dm.name;
  }

  let notificationMessage;
  if (type === 'tag') {
    notificationMessage = `${
      sender.handleStr
    } tagged you in ${dmOrChannelName}: ${message.substring(0, 20)}`;
  } else if (type === 'react') {
    notificationMessage = `${sender.handleStr} reacted to your message in ${dmOrChannelName}`;
  } else {
    notificationMessage = `${sender.handleStr} added you to ${dmOrChannelName}`;
  }

  const receiver = findUser(receiverUserId);

  receiver.notifications.unshift({
    channelId: isChannelMessage ? dmOrChannelId : -1,
    dmId: !isChannelMessage ? dmOrChannelId : -1,
    notificationMessage: notificationMessage,
  });
  setData(data);
  return {};
}
