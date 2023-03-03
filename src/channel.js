function channelDetailsV1(authUserId, channelId) {
  return {
    name: "Hayden",
    ownerMembers: [
      {
        uId: 1,
        email: "example@gmail.com",
        nameFirst: "Hayden",
        nameLast: "Jacobs",
        handleStr: "haydenjacobs",
      },
    ],
    allMembers: [
      {
        uId: 1,
        email: "example@gmail.com",
        nameFirst: "Hayden",
        nameLast: "Jacobs",
        handleStr: "haydenjacobs",
      },
    ],
  };
}

function channelJoinV1(authUserId, channelId) {
  return {};
}

function channelInviteV1(authUserId, channelId, uId) {
  //input check 
  let auth_check = 0;
  let channel_check = 0;
  let uid_check = 0;
  let member_check = 1;
  let temp = 0;
  for (const i of data.users) {
    if (i.uId === authUserId) {
      auth_check = 1;
    }
    if (i.uId === uId) {
      uid_check = 1;
      temp = i;
    }
  }
  for (const i of data.channels) {
    if (i.channelId === channelId) {
      channel_check = 1;
      for (const k of i.allMembers) {
        if (k.uId === uId) {
          member_check = 0;
        }
      }
    }
  }
  if (channel_check * auth_check * uid_check * member_check === 0) {
    return {error: 'error'};
  }
  
  // add member 
  for (const i of data.channels) {
    if (i.channelId === channelId) {
      i.allMembers.push(temp);
      return {};
    }
  }
  return {};
}

function channelMessagesV1(authUserId, channelId, start) {
  return {
    messages: [
      {
        messageId: 1,
        uId: 1,
        message: "Hello world",
        timeSent: 1582426789,
      },
    ],
    start: 0,
    end: 50,
  };
}
