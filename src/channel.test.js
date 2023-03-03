import {
  channelDetailsV1,
  channelJoinV1,
  channelInviteV1,
  channelMessagesV1,
} from './channel';
import {
    authRegisterV1,
} from './auth';
import {
    channelsCreateV1,
} from './channels';

const ERROR = {error: "error"};

describe("channelDetailsV1 function testing", () =>{
    beforeEach(() => {
      clearV1();
    });

    test("Test-1: invalid channelId", () =>{    
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
        expect(channelDetailsV1(channel_owner.uId,(new_channel.channelId)+1)).toStrictEqual(ERROR) ;
    });

    test("Test2: uId does not refer to a valid user", () => {
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
        
        expect(channelDetailsV1(channel_owner.uId + 1,new_channel.channelId)).toStrictEqual(ERROR);
    });

    test("Test3: uId does not refer to a exist member of channel", () => {
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
        
        expect(channelDetailsV1(channel_member.uId, new_channel.channelId)).toStrictEqual(ERROR);
    });


    test("Test4: checking return with right input", () => {
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

        channelJoinV1(channel_member.uId, new_channel.channelId);
        
        expect(channelDetailsV1(channel_member.uId, new_channel.channelId)).toStrictEqual({
            name: "create_channel",
            isPublic: true,
            ownerMembers: [{
                uId: channel_owner.uId,
                email: "owner@gmail.com",
                nameFirst: "firstName",
                nameLast: "lastName",
                handleStr: "firstnamelastname0",
            }],
            allMembers: [
                {
                    uId: channel_owner.uId,
                    email: "owner@gmail.com",
                    nameFirst: "firstName",
                    nameLast: "lastName",
                    handleStr: "firstnamelastname0",
                },
                {
                    uId: channel_member.uId,
                    email: "member@gmail.com",
                    nameFirst: "firstName",
                    nameLast: "lastName",
                    handleStr: "firstnamelastname",
                }
            ],
        });
      });
});

describe("channelJoinV1 function testing", () =>{
    beforeEach(() => {
      clearV1();
    });

    test("Test-1: invalid channelId", () =>{    
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
        expect(channelJoinV1(channel_owner.uId,(new_channel.channelId)+1)).toStrictEqual(ERROR) ;
    });

    test("Test2: user with given uId already in channel", () => {
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
        
        expect(channelJoinV1(channel_owner.uId, new_channel.channelId)).toStrictEqual(ERROR);
    });

    test("Test3: private channel, user not in the channel and is not a global owner", () => {
        const channel_owner = authRegisterV1(
            "owner@gmail.com",
            "123455",
            "firstName",
            "lastName"
        );
        
        const channel_member = authRegisterV1(
            "member@gmail.com",
            "123455",
            "firstName",
            "lastName"
        );
    
        const new_channel = channelsCreateV1 (
            channel_owner.uId, 
            "create_channel",
            false,
        );
        
        expect(channelJoinV1(channel_member.uId, new_channel.channelId)).toStrictEqual(ERROR);
    });

    test("Test4: uId does not refer to a valid user", () => {
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
        
        expect(channelJoinV1(channel_owner.uId + 1,new_channel.channelId)).toStrictEqual(ERROR);
    });

    test("Test5: successful join", () => {
        const channel_owner = authRegisterV1(
            "owner@gmail.com",
            "123455",
            "firstName",
            "lastName"
        );
        
        const channel_member = authRegisterV1(
            "member@gmail.com",
            "123455",
            "firstName",
            "lastName"
        );
    
        const new_channel = channelsCreateV1 (
            channel_owner.uId, 
            "create_channel",
            true,
        );
        
        expect(channelJoinV1(channel_member.uId, new_channel.channelId)).toStrictEqual({});
    });

    test("Test6: successful join with global owner", () => {
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
        
        expect(channelJoinV1(channel_member.uId, new_channel.channelId)).toStrictEqual({});
    });
});



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



describe("channelMessageV1 function testing", () =>{
    beforeEach(() => {
      clearV1();
    });
    test("Test1: channelId does not refer to a valid channel", () => {   
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
        
        expect(channelMessagesV1(channel_owner.uId,(new_channel.channelId)+1, 0)).toStrictEqual({
            error: "error",
        });
    });

    test("Test2: start is greater than the total number of messages in the channel", () => {   
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
        const start = new_channel.message.length + 1;
        expect(channelMessagesV1(channel_owner.uId,new_channel.channelId, start)).toStrictEqual({
            error: "error",
        });
    });

    test("Test3: authuseId is not a member of the channel", () => {   
        const channel_owner = authRegisterV1(
            "owner@gmail.com",
            "123455",
            "firstName",
            "lastName"
        );
        const random_person = authRegisterV1(
            "random@gmail.com",
            "123455",
            "firstName",
            "lastName"
        );
        const new_channel = channelsCreateV1 (
            channel_owner.uId, 
            "create_channel",
            true,
        );
        
        expect(channelMessagesV1(random_person.uId,new_channel.channelId, 0)).toStrictEqual({
            error: "error",
        });
    });
    
    test("Test4: authuseId is not valid", () => {   
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
        
        expect(channelMessagesV1(Infinity,new_channel.channelId, 0)).toStrictEqual({
            error: "error",
        });
    });

    test("Test6: checking return with right input, not reach the end", () => {   
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
        for (let i = 0; i < 40; i++) {
            new_channel.message[i] = i;
        }
        const start = new_channel.message.length-60;
        expect(channelMessagesV1(channel_owner.uId,new_channel.channelId,start)).toStrictEqual([new_channel.message, start, start+50]);
    });

    test("Test7: checking return with right input, reach end", () => {   
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
        for (let i = 0; i < 100; i++) {
            new_channel.message[i] = i;
        }
        const start = new_channel.message.length - 40;
        expect(channelMessagesV1(channel_owner.uId,new_channel.channelId,start)).toStrictEqual([new_channel.message, start, -1]);
    });
  });
