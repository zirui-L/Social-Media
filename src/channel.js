


const ERROR = {error: 'error'};

/**
  * Given a channel with ID channelId that the authorised user 
  * is a member of, provides basic details about the channel.
  * 
  * @param {integer} authUserId - userId
  * @param {integer} channelId - channelId
  * ...
  * @returns {{name, isPublic, ownerMembers, allMembers}} - object
  * @returns {{error: 'error'}} - when channelId/authUserId 
  * is invalid or authorised user is not a member of the channel
*/

function channelDetailsV1(authUserId, channelId) {
  let channelIdisValid = false;
  let UserisMember = false;
  let authUserIdisValid = false;
  for (const channel of data.channels) {
    if (channel.channelId === channelId) {
      channelIdisValid = true;
      if (channel.allMembers.includes(authUserId)) {
        UserisMember = true;
      }
    }
    break;
  }
  for (const user of data.users) {
    if (user.uId === authUserId) {
      authUserIdisValid = true;
    }
    break;
  }
  if (!channelIdisValid || !UserisMember || !authUserIdisValid) {
    return ERROR;
  }

  for (const channel of data.channels) {
    if (channel.channelId === channelId) {
      let channelDetail = {
        name: channel.name,
        isPublic: channel.isPublic,
        ownerMembers: [],
        allMembers: [],
      }
      for (const ownerId of channel.ownerMembers) {
        channelDetail.ownerMembers.push(userProfileV1(ownerId,ownerId));
      }
      for (const memberId of channel.allMembers) {
        channelDetail.allMembers.push(userProfileV1(memberId,memberId));
      }
      return channelDetail;
    }
  }
}


/**
  * Given a channelId of a channel that the authorised user 
  * can join, adds them to that channel.
  * 
  * @param {integer} authUserId - userId
  * @param {integer} channelId - channelId
  * ...
  * @returns {{}} - return empty object
  * @returns {{error: 'error'}} - when channelId/authUserId 
  * is invalid or authorised user is not a member of the channel
  * or the channel is private and when the authorised user is 
  * not a channel member and is not a global owner
*/

function channelJoinV1(authUserId, channelId) {
  let channelIdisValid = false;
  let UserisMember = false;
  let authUserIdisValid = false;
  let UserisGlobalOwner = false;
  for (const channel of data.channels) {
    if (channel.channelId === channelId) {
      channelIdisValid = true;
      if (channel.allMembers.includes(authUserId)) {
        UserisMember = true;
      }
    }
    break;
  }
  for (const user of data.users) {
    if (user.authUserId === authUserId) {
      authUserIdisValid = true;
    }
    if (user.permissionId === 1) {
      UserisGlobalOwner = true;
    }
    break;
  }
  if (!channelIdisValid || UserisMember || !authUserIdisValid ||
      !UserisGlobalOwner) {
    return ERROR;
  }

  for (const channel of data.channels) {
    if (channel.channelId === channelId) {
      channel.allMembers.push(authUserId);
    }
    break;
  }
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
