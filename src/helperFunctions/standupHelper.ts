import { getData, setData } from '../dataStore';
import {
  createUniqueId,
  findChannel,
  findUser,
  getTimeNow,
  isMember,
} from './helperFunctions';

export const isStandupActive = (channelId: number) => {
  const channel = findChannel(channelId);
  return channel.standUp.isActive;
};

export const packMessage = (channelId: number) => {
  const channel = findChannel(channelId);
  let packedMessage = '';
  for (const message of channel.standUp.messages) {
    packedMessage += `${message.sender}: ${message.message}\n`;
  }
  return packedMessage.trimEnd();
};

export const recordStandupEnd = (
  authUserId: number,
  channelId: number,
  length: number
) => {
  const data = getData();
  const channel = findChannel(channelId);
  setTimeout(() => {
    const message = packMessage(channelId);
    // Send the message if and only if user started standup is still in the chat, and the message is not empty
    if (isMember(authUserId, channelId) && message !== '') {
      // Cannot use messageSend since the packed message may be greater than 1000 characters
      const messageId = createUniqueId();
      channel.messages.unshift(messageId);
      data.messages.unshift({
        messageId: messageId,
        uId: authUserId,
        message: message,
        timeSent: getTimeNow(),
        isChannelMessage: true,
        dmOrChannelId: channelId,
        reacts: [],
        isPinned: false,
        taggedUsers: [],
        isSent: true,
      });
      const user = findUser(authUserId);

      user.messages.unshift(messageId);
    }

    channel.standUp.starter = null;

    channel.standUp.isActive = false;

    channel.standUp.finishingTime = null;

    channel.standUp.messages.length = 0;

    setData(data);
  }, length * 1000);
};
