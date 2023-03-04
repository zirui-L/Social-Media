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
return {}
}

function channelMessagesV1(authUserId, channelId, start) {
    //input check 
    let channel_check = 0;
    let member_check = 0;
    const start_check = 0;
    let right_channel;

    for (const i of data.channels) {
      if (i.channelId === channelId) {
        channel_check = 1;
        right_channel = i;
        if (start <= i.message.length) {
          start_check = 1;
        }
        for (const k of i.allMembers) {
          if (k.uId === authUserId) {
            member_check = 1;
          }
        }
      }
    }
    if (channel_check * member_check * start_check === 0) {
      return {error: 'error'};
    }
    
    //message
    let end = 0; 
    let message = '';
    if (start+50 < right_channel.message.length) {
      end = start +50;
      for (let i = 0; i < 50; i++) {
        message += right_channel.message[i];
      }
    } else {
      end = -1;
      for (let i = 0; i < right_channel.message.length; i++) {
        message += right_channel.message[i];
      }
    }
    return {message,start,end};
}
