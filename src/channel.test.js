import {
  channelDetailsV1,
  channelJoinV1,
  channelInviteV1,
  channelMessagesV1,
} from './channel';



describe("channelInviteV1 function testing", () =>{
  beforeEach(() => {
    clearV1();
  });

  test("Test-1: invalid channelId", () =>{
    const channel_member = authRegisterV1(
        "member@gmail.com",
        "123455",
        "firstName",
        "lastName"
    );

    const channel_owner = authRegisterV1(
        "owner@gmail.com",
        "123455",
        "firstName",
        "lastName"
    );
    const new_channel = channelsCreateV1 (
        channel_owner.uId, 
        "create_channel",
        true,
    );
    
  
    expect(channelInviteV1(channel_owner.uId,(new_channel.channelId)+1, channel_member.uId)).toStrictEqual({
        error: "error",
    }) ;
  });

  test("Test2: uId does not refer to a valid user", () => {
    const channel_member = authRegisterV1(
        "member@gmail.com",
        "123455",
        "firstName",
        "lastName"
    );

    const channel_owner = authRegisterV1(
        "owner@gmail.com",
        "123455",
        "firstName",
        "lastName"
    );
    const new_channel = channelsCreateV1 (
        channel_owner.uId, 
        "create_channel",
        true,
    );
    
    expect(channelInviteV1(channel_owner.uId,new_channel.channelId, (channel_member.uId)+1)).toStrictEqual({
        error: "error",
    }) ;
  });


  test("Test3: uId refers to a exist member of channel", () => {
    const channel_member = authRegisterV1(
        "member@gmail.com",
        "123455",
        "firstName",
        "lastName"
    );

    const channel_owner = authRegisterV1(
        "owner@gmail.com",
        "123455",
        "firstName",
        "lastName"
    );

    const new_channel = channelsCreateV1 (
        channel_owner.uId, 
        "create_channel",
        true,
    );

    //channelJoinV1(channel_member.uId, new_channel.channelId);
    
    expect(channelInviteV1(channel_owner.uId,new_channel.channelId, channel_owner.uId)).toStrictEqual({
        error: "error",
    }) ;
  });

  test("Test4: channelId refersto a private channel", () => {
    const channel_member = authRegisterV1(
        "member@gmail.com",
        "123455",
        "firstName",
        "lastName"
    );

    const channel_owner = authRegisterV1(
        "owner@gmail.com",
        "123455",
        "firstName",
        "lastName"
    );

    const new_channel = channelsCreateV1 (
        channel_owner.uId, 
        "create_channel",
        false,
    );
    
    expect(channelInviteV1(channel_owner.uId,new_channel.channelId, channel_member.uId)).toStrictEqual({
        error: "error",
    });
  });

  test("Test5: autherId is invalid", () => {
    const channel_member = authRegisterV1(
        "member@gmail.com",
        "123455",
        "firstName",
        "lastName"
    );

    const channel_owner = authRegisterV1(
        "owner@gmail.com",
        "123455",
        "firstName",
        "lastName"
    );

    const new_channel = channelsCreateV1 (
        channel_owner.uId, 
        "create_channel",
        true,
    );
    
    expect(channelInviteV1((channel_owner.uId)+1,new_channel.channelId, channel_member.uId)).toStrictEqual({
        error: "error",
    }) ;
  });

  test("Test5: checking return with right input", () => {
    const channel_member = authRegisterV1(
        "member@gmail.com",
        "123455",
        "firstName",
        "lastName"
    );

    const channel_owner = authRegisterV1(
        "owner@gmail.com",
        "123455",
        "firstName",
        "lastName"
    );

    const new_channel = channelsCreateV1 (
        channel_owner.uId, 
        "create_channel",
        true,
    );
    
    expect(channelInviteV1(channel_owner.uId,new_channel.channelId, channel_member.uId)).toStrictEqual({}) ;
  });

  test("Test6: checking member is added with right input", () => {
    const channel_member = authRegisterV1(
        "member@gmail.com",
        "123455",
        "firstName",
        "lastName"
    );

    const channel_owner = authRegisterV1(
        "owner@gmail.com",
        "123455",
        "firstName",
        "lastName"
    );

    const new_channel = channelsCreateV1 (
        channel_owner.uId, 
        "create_channel",
        true,
    );
    
    channelInviteV1(channel_owner.uId,new_channel.channelId, channel_member.uId);
    expect(new_channel.allMembers.include(channel.channel_member.uId));
  });

});


