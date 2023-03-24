import { Error, getData } from "./dataStore";
import { findChannel,
         isMember,
         findUserFromToken,
         isTokenValid,
         createUniqueId,
} from "./helperFunctions";

type messageIdObj = {
  messageId: number;
};

export const messageSendV1 = (
  token: string,
  channelId: number,
  message: string
): messageIdObj | Error => {
  const data = getData(); 
  const uId = findUserFromToken(data, token);
  if (!isTokenValid(data, token)) {
    return { error: "Invalid token" };
  } else if (findChannel(data, channelId) === undefined) {
    return { error: "Invalid channelId" };
  } else if (message.length < 1 || message.length > 1000) {
    return { error: "Invalid message length" };
  } else if (!isMember(data, uId, channelId)) {
    return { error: "The user is not a member of the channel"};
  }
  const messageId = createUniqueId();
  data.messages.unshift({
    messageId,
    uId,
    message,
    timeSent: Date,
    isChannelMessage: boolean;
    dmOrChannelId: number;
  })

  return { messageId: 0 };
};

export const messageEditV1 = (
  token: string,
  messageId: number,
  message: string
): {} | Error => {
  return {};
};

export const messageRemoveV1 = (
  token: string,
  messageId: number
): {} | Error => {
  return {};
};

export const messageSendDmV1 = (
  token: string,
  dmId: number,
  message: string
): messageIdObj | Error => {
  return { messageId: 0 };
};
