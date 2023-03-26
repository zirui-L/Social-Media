import {
  requestAuthRegisterV2,
  requestChannelDetailsV2,
  requestChannelInviteV2,
  requestChannelJoinV2,
  requestChannelAddOwnerV1,
  requestChannelLeaveV1,
  requestChannelRemoveOwnerV1,
  requestChannelMessagesV2,
  requestChannelsCreateV2,
  requestChannelsListAllV2,
  requestClearV1,
  requestMessageSendV1,
} from "./helperServer";

const OK = 200;
const ERROR = { error: expect.any(String) };

beforeEach(() => {
  requestClearV1();
});

afterEach(() => {
  requestClearV1();
});

describe("Testing /channel/details/v2", () => {
  test("Test-1: Error, incorrect channelId", () => {
    const test1 = requestAuthRegisterV2(
      "test1@gmail.com",
      "123456",
      "Richardo",
      "Li"
    );
    requestChannelsCreateV2(test1.bodyObj.token, "RicardoChannel", true);
    const channelDetails = requestChannelDetailsV2(
      test1.bodyObj.token,
      test1.bodyObj.channelId + 1
    );
    expect(channelDetails.statusCode).toBe(OK);
    expect(channelDetails.bodyObj).toStrictEqual(ERROR);
  });

  test("Test-2: Error, invalid token", () => {
    const test1 = requestAuthRegisterV2(
      "test1@gmail.com",
      "123456",
      "Richardo",
      "Li"
    );
    const channelId = requestChannelsCreateV2(
      test1.bodyObj.token,
      "RicardoChannel",
      true
    );
    const channelDetails = requestChannelDetailsV2(
      test1.bodyObj.token + 1,
      channelId.bodyObj.channelId
    );
    expect(channelDetails.statusCode).toBe(OK);
    expect(channelDetails.bodyObj).toStrictEqual(ERROR);
  });

  test("Test-3: Error, User inputed is not in the existing channel", () => {
    const test1 = requestAuthRegisterV2(
      "test1@gmail.com",
      "123456",
      "Richardo",
      "Li"
    );
    const test2 = requestAuthRegisterV2(
      "test2@gmail.com",
      "1234567",
      "Shenba",
      "Chen"
    );
    const channelId = requestChannelsCreateV2(
      test1.bodyObj.token,
      "RicardoChannel",
      true
    );
    const channelDetails = requestChannelDetailsV2(
      test2.bodyObj.token,
      channelId.bodyObj.channelId
    );
    expect(channelDetails.statusCode).toBe(OK);
    expect(channelDetails.bodyObj).toStrictEqual(ERROR);
  });

  test("Test-4, correct input parameters", () => {
    const test1 = requestAuthRegisterV2(
      "test1@gmail.com",
      "123456",
      "Richardo",
      "Li"
    );
    const channelId = requestChannelsCreateV2(
      test1.bodyObj.token,
      "RicardoChannel",
      true
    );
    const channelDetails = requestChannelDetailsV2(
      test1.bodyObj.token,
      channelId.bodyObj.channelId
    );

    expect(channelDetails.statusCode).toBe(OK);
    expect(channelDetails.bodyObj).toStrictEqual({
      name: "RicardoChannel",
      isPublic: true,
      ownerMembers: [
        {
          uId: test1.bodyObj.authUserId,
          email: "test1@gmail.com",
          nameFirst: "Richardo",
          nameLast: "Li",
          handleStr: "richardoli",
        },
      ],
      allMembers: [
        {
          uId: test1.bodyObj.authUserId,
          email: "test1@gmail.com",
          nameFirst: "Richardo",
          nameLast: "Li",
          handleStr: "richardoli",
        },
      ],
    });
  });

  test("Test-5, correct input parameters, but with multiple members", () => {
    const test1 = requestAuthRegisterV2(
      "test1@gmail.com",
      "123456",
      "Richardo",
      "Li"
    );
    const test2 = requestAuthRegisterV2(
      "test2@gmail.com",
      "1234567",
      "Shenba",
      "Chen"
    );
    const test3 = requestAuthRegisterV2(
      "test3@gmail.com",
      "12345678",
      "Kunda",
      "Yu"
    );
    const channelId = requestChannelsCreateV2(
      test1.bodyObj.token,
      "RicardoChannel",
      true
    );

    requestChannelJoinV2(test2.bodyObj.token, channelId.bodyObj.channelId);
    requestChannelJoinV2(test3.bodyObj.token, channelId.bodyObj.channelId);

    const channelDetails = requestChannelDetailsV2(
      test1.bodyObj.token,
      channelId.bodyObj.channelId
    );

    expect(channelDetails.statusCode).toBe(OK);
    expect(channelDetails.bodyObj).toStrictEqual({
      name: "RicardoChannel",
      isPublic: true,
      ownerMembers: [
        {
          uId: test1.bodyObj.authUserId,
          email: "test1@gmail.com",
          nameFirst: "Richardo",
          nameLast: "Li",
          handleStr: "richardoli",
        },
      ],
      allMembers: [
        {
          uId: test1.bodyObj.authUserId,
          email: "test1@gmail.com",
          nameFirst: "Richardo",
          nameLast: "Li",
          handleStr: "richardoli",
        },
        {
          uId: test2.bodyObj.authUserId,
          email: "test2@gmail.com",
          nameFirst: "Shenba",
          nameLast: "Chen",
          handleStr: "shenbachen",
        },
        {
          uId: test3.bodyObj.authUserId,
          email: "test3@gmail.com",
          nameFirst: "Kunda",
          nameLast: "Yu",
          handleStr: "kundayu",
        },
      ],
    });
  });
});

describe("Testing /channel/join/v2", () => {
  test("Test-1: Error, channelId does not refer to a valid channel", () => {
    const user1 = requestAuthRegisterV2(
      "ricky@gmail.com",
      "123455",
      "Ricky",
      "Li"
    );

    const user2 = requestAuthRegisterV2(
      "libro@gmail.com",
      "123455",
      "libro",
      "Zhang"
    );

    const channel1 = requestChannelsCreateV2(
      user2.bodyObj.token,
      "Rickychannel",
      true
    );

    const channelJoinObj = requestChannelJoinV2(
      user1.bodyObj.token,
      channel1.bodyObj.channelId + 5
    );
    expect(channelJoinObj.statusCode).toBe(OK);
    expect(channelJoinObj.bodyObj).toStrictEqual(ERROR);
  });

  test("Test-2: Error, token is invalid", () => {
    const user1 = requestAuthRegisterV2(
      "ricky@gmail.com",
      "123455",
      "Ricky",
      "Li"
    );

    const channel1 = requestChannelsCreateV2(
      user1.bodyObj.token,
      "Rickychannel",
      true
    );

    const channelJoinObj = requestChannelJoinV2(
      user1.bodyObj.token + 1,
      channel1.bodyObj.channelId
    );
    expect(channelJoinObj.statusCode).toBe(OK);
    expect(channelJoinObj.bodyObj).toStrictEqual(ERROR);
  });

  test("Test-3: Error, user is already a member of the channel", () => {
    const user1 = requestAuthRegisterV2(
      "ricky@gmail.com",
      "123455",
      "Ricky",
      "Li"
    );

    const channel1 = requestChannelsCreateV2(
      user1.bodyObj.token,
      "Rickychannel",
      true
    );

    const channelJoinObj = requestChannelJoinV2(
      user1.bodyObj.token,
      channel1.bodyObj.channelId
    );
    expect(channelJoinObj.statusCode).toBe(OK);
    expect(channelJoinObj.bodyObj).toStrictEqual(ERROR);
  });

  test("Test-3: Error, private channel, and user is not a global owner", () => {
    const user1 = requestAuthRegisterV2(
      "ricky@gmail.com",
      "123455",
      "Ricky",
      "Li"
    );

    const user2 = requestAuthRegisterV2(
      "libro@gmail.com",
      "123455",
      "libro",
      "Zhang"
    );

    const channel1 = requestChannelsCreateV2(
      user1.bodyObj.token,
      "Rickychannel",
      false
    );

    const channelJoinObj = requestChannelJoinV2(
      user2.bodyObj.token,
      channel1.bodyObj.channelId
    );
    expect(channelJoinObj.statusCode).toBe(OK);
    expect(channelJoinObj.bodyObj).toStrictEqual(ERROR);
  });

  test("Test-4: successiful case", () => {
    const user1 = requestAuthRegisterV2(
      "ricky@gmail.com",
      "123455",
      "Ricky",
      "Li"
    );

    const user2 = requestAuthRegisterV2(
      "libro@gmail.com",
      "123455",
      "libro",
      "Zhang"
    );
    const channel1 = requestChannelsCreateV2(
      user1.bodyObj.token,
      "Rickychannel",
      true
    );

    const channelJoinObj = requestChannelJoinV2(
      user2.bodyObj.token,
      channel1.bodyObj.channelId
    );
    expect(channelJoinObj.statusCode).toBe(OK);
    expect(channelJoinObj.bodyObj).toStrictEqual({});
  });

  test("Test-5: private channel, but the user is a global owner", () => {
    const user1 = requestAuthRegisterV2(
      "ricky@gmail.com",
      "123455",
      "Ricky",
      "Li"
    );

    const user2 = requestAuthRegisterV2(
      "libro@gmail.com",
      "123455",
      "libro",
      "Zhang"
    );
    const channel1 = requestChannelsCreateV2(
      user2.bodyObj.token,
      "Rickychannel",
      false
    );

    const channelJoinObj = requestChannelJoinV2(
      user1.bodyObj.token,
      channel1.bodyObj.channelId
    );
    expect(channelJoinObj.statusCode).toBe(OK);
    expect(channelJoinObj.bodyObj).toStrictEqual({});
  });
});

describe("/channel/invite/v2 testing", () => {
  test("Test-1: Error, invalid channelId", () => {
    const test1 = requestAuthRegisterV2(
      "test1@gmail.com",
      "123456",
      "Richardo",
      "Lee"
    );
    const test2 = requestAuthRegisterV2(
      "test2@gmail.com",
      "1234567",
      "Shenba",
      "Chen"
    );

    const channelInviteObj = requestChannelInviteV2(
      test1.bodyObj.token,
      0,
      test2.bodyObj.authUserId
    );
    expect(channelInviteObj.statusCode).toBe(OK);
    expect(channelInviteObj.bodyObj).toStrictEqual(ERROR);
  });

  test("Test-2: Error, Invalid uIs", () => {
    const test1 = requestAuthRegisterV2(
      "test1@gmail.com",
      "123456",
      "Richardo",
      "Lee"
    );
    const channel = requestChannelsCreateV2(
      test1.bodyObj.token,
      "LeeChannel",
      true
    );

    const channelInviteObj = requestChannelInviteV2(
      test1.bodyObj.token,
      channel.bodyObj.channelId,
      test1.bodyObj.authUserId + 1
    );
    expect(channelInviteObj.statusCode).toBe(OK);
    expect(channelInviteObj.bodyObj).toStrictEqual(ERROR);
  });

  test("Test-3: Error, uId belong to a user who is already in the channel", () => {
    const test1 = requestAuthRegisterV2(
      "test1@gmail.com",
      "123456",
      "Richardo",
      "Lee"
    );
    const test2 = requestAuthRegisterV2(
      "test2@gmail.com",
      "1234567",
      "Shenba",
      "Chen"
    );
    const channel = requestChannelsCreateV2(
      test1.bodyObj.token,
      "LeeChannel",
      true
    );
    requestChannelJoinV2(test2.bodyObj.token, channel.bodyObj.channelId);

    const channelInviteObj = requestChannelInviteV2(
      test1.bodyObj.token,
      channel.bodyObj.channelId,
      test2.bodyObj.authUserId
    );
    expect(channelInviteObj.statusCode).toBe(OK);
    expect(channelInviteObj.bodyObj).toStrictEqual(ERROR);
  });

  test("Test-4: Error, channelId is valid and the authorised user is not a member of the channel", () => {
    const test1 = requestAuthRegisterV2(
      "test1@gmail.com",
      "123456",
      "Richardo",
      "Lee"
    );
    const test2 = requestAuthRegisterV2(
      "test2@gmail.com",
      "1234567",
      "Shenba",
      "Chen"
    );
    const test3 = requestAuthRegisterV2(
      "test3@gmail.com",
      "12345678",
      "Kunda",
      "Yu"
    );
    const channel = requestChannelsCreateV2(
      test1.bodyObj.token,
      "LeeChannel",
      true
    );

    const channelInviteObj = requestChannelInviteV2(
      test2.bodyObj.token,
      channel.bodyObj.channelId,
      test3.bodyObj.authUserId
    );
    expect(channelInviteObj.statusCode).toBe(OK);
    expect(channelInviteObj.bodyObj).toStrictEqual(ERROR);
  });

  test("Test-5: Error, invalid token", () => {
    const test1 = requestAuthRegisterV2(
      "test@gmail.com",
      "123456",
      "Ricardo",
      "Lee"
    );
    const channel = requestChannelsCreateV2(
      test1.bodyObj.token,
      "LeeChannel",
      true
    );

    const channelInviteObj = requestChannelInviteV2(
      test1.bodyObj.token + 1,
      channel.bodyObj.channelId,
      test1.bodyObj.authUserId
    );
    expect(channelInviteObj.statusCode).toBe(OK);
    expect(channelInviteObj.bodyObj).toStrictEqual(ERROR);
  });

  test("Test-6: Error, user inviting themselves", () => {
    const test1 = requestAuthRegisterV2(
      "test1@gmail.com",
      "123456",
      "Richardo",
      "Lee"
    );
    const channel = requestChannelsCreateV2(
      test1.bodyObj.token,
      "LeeChannel",
      true
    );

    const channelInviteObj = requestChannelInviteV2(
      test1.bodyObj.token,
      channel.bodyObj.channelId,
      test1.bodyObj.authUserId
    );
    expect(channelInviteObj.statusCode).toBe(OK);
    expect(channelInviteObj.bodyObj).toStrictEqual(ERROR);
  });

  test("Test-7: Successful invite", () => {
    const test1 = requestAuthRegisterV2(
      "test1@gmail.com",
      "123456",
      "Richardo",
      "Lee"
    );
    const test2 = requestAuthRegisterV2(
      "test2@gmail.com",
      "1234567",
      "Shenba",
      "Chen"
    );
    const channel = requestChannelsCreateV2(
      test1.bodyObj.token,
      "LeeChannel",
      true
    );

    const channelInviteObj = requestChannelInviteV2(
      test1.bodyObj.token,
      channel.bodyObj.channelId,
      test2.bodyObj.authUserId
    );
    expect(channelInviteObj.statusCode).toBe(OK);
    expect(channelInviteObj.bodyObj).toStrictEqual({});

    const channelDetailObj = requestChannelDetailsV2(
      test1.bodyObj.token,
      channel.bodyObj.channelId
    );

    expect(channelDetailObj.bodyObj).toStrictEqual({
      name: "LeeChannel",
      isPublic: true,
      ownerMembers: [
        {
          uId: test1.bodyObj.authUserId,
          email: "test1@gmail.com",
          nameFirst: "Richardo",
          nameLast: "Lee",
          handleStr: "richardolee",
        },
      ],
      allMembers: [
        {
          uId: test1.bodyObj.authUserId,
          email: "test1@gmail.com",
          nameFirst: "Richardo",
          nameLast: "Lee",
          handleStr: "richardolee",
        },
        {
          uId: test2.bodyObj.authUserId,
          email: "test2@gmail.com",
          nameFirst: "Shenba",
          nameLast: "Chen",
          handleStr: "shenbachen",
        },
      ],
    });
  });

  test("Inviting global owner into the channel", () => {
    const test1 = requestAuthRegisterV2(
      "test1@gmail.com",
      "123456",
      "Richardo",
      "Lee"
    );
    const test2 = requestAuthRegisterV2(
      "test2@gmail.com",
      "1234567",
      "Shenba",
      "Chen"
    );
    const channel = requestChannelsCreateV2(
      test2.bodyObj.token,
      "ShenbaChannel",
      false
    );

    const channelInviteObj = requestChannelInviteV2(
      test2.bodyObj.token,
      channel.bodyObj.channelId,
      test1.bodyObj.authUserId
    );
    expect(channelInviteObj.statusCode).toBe(OK);
    expect(channelInviteObj.bodyObj).toStrictEqual({});

    const channelDetailObj = requestChannelDetailsV2(
      test1.bodyObj.token,
      channel.bodyObj.channelId
    );

    expect(channelDetailObj.bodyObj).toStrictEqual({
      name: "ShenbaChannel",
      isPublic: false,
      ownerMembers: [
        {
          uId: test2.bodyObj.authUserId,
          email: "test2@gmail.com",
          nameFirst: "Shenba",
          nameLast: "Chen",
          handleStr: "shenbachen",
        },
      ],
      allMembers: [
        {
          uId: test2.bodyObj.authUserId,
          email: "test2@gmail.com",
          nameFirst: "Shenba",
          nameLast: "Chen",
          handleStr: "shenbachen",
        },
        {
          uId: test1.bodyObj.authUserId,
          email: "test1@gmail.com",
          nameFirst: "Richardo",
          nameLast: "Lee",
          handleStr: "richardolee",
        },
      ],
    });
  });
});

describe("Testing /channel/messages/v2", () => {
  test("Test-1: Error, invalid channelId", () => {
    const test1 = requestAuthRegisterV2(
      "test1@gmail.com",
      "123456",
      "Richardo",
      "Lee"
    );

    const channel = requestChannelsCreateV2(
      test1.bodyObj.token,
      "RicardoChannel",
      true
    );

    const channelMessageObj = requestChannelMessagesV2(
      test1.bodyObj.token,
      channel.bodyObj.channelId + 1,
      0
    );
    expect(channelMessageObj.statusCode).toBe(OK);
    expect(channelMessageObj.bodyObj).toStrictEqual(ERROR);
  });

  test("Test-2: Error, Invalid token", () => {
    const test1 = requestAuthRegisterV2(
      "test1@gmail.com",
      "123456",
      "Richardo",
      "Lee"
    );

    const channel = requestChannelsCreateV2(
      test1.bodyObj.token,
      "RicardoChannel",
      true
    );

    const channelMessageObj = requestChannelMessagesV2(
      test1.bodyObj.token + "1",
      channel.bodyObj.channelId,
      0
    );
    expect(channelMessageObj.statusCode).toBe(OK);
    expect(channelMessageObj.bodyObj).toStrictEqual(ERROR);
  });

  test("Test-3: Error, channel is valid but authorised user is not in the channel", () => {
    const test1 = requestAuthRegisterV2(
      "test1@gmail.com",
      "123456",
      "Richardo",
      "Lee"
    );
    const test2 = requestAuthRegisterV2(
      "test2@gmail.com",
      "1234567",
      "Shenba",
      "Chen"
    );
    const channel = requestChannelsCreateV2(
      test1.bodyObj.token,
      "LeeChannel",
      true
    );

    const channelMessageObj = requestChannelMessagesV2(
      test2.bodyObj.token,
      channel.bodyObj.channelId,
      0
    );
    expect(channelMessageObj.statusCode).toBe(OK);
    expect(channelMessageObj.bodyObj).toStrictEqual(ERROR);
  });

  test("Test-4: Error, Start greater than total numebr of messages", () => {
    const test1 = requestAuthRegisterV2(
      "test1@gmail.com",
      "123456",
      "Richardo",
      "Lee"
    );
    const channel = requestChannelsCreateV2(
      test1.bodyObj.token,
      "LeeChannel",
      true
    );

    const channelMessageObj = requestChannelMessagesV2(
      test1.bodyObj.token,
      channel.bodyObj.channelId,
      5
    );
    expect(channelMessageObj.statusCode).toBe(OK);
    expect(channelMessageObj.bodyObj).toStrictEqual(ERROR);
  });

  test("Test-5: Success, 0 message output", () => {
    const test1 = requestAuthRegisterV2(
      "test1@gmail.com",
      "123456",
      "Richardo",
      "Lee"
    );
    const channel = requestChannelsCreateV2(
      test1.bodyObj.token,
      "LeeChannel",
      true
    );

    const channelMessageObj = requestChannelMessagesV2(
      test1.bodyObj.token,
      channel.bodyObj.channelId,
      0
    );
    expect(channelMessageObj.statusCode).toBe(OK);
    expect(channelMessageObj.bodyObj).toStrictEqual({
      messages: [],
      start: 0,
      end: -1,
    });
  });

  test("Test-6: Success, start is 0, and there are in total 50 messages", () => {
    const test1 = requestAuthRegisterV2(
      "test1@gmail.com",
      "123456",
      "Richardo",
      "Lee"
    );
    const channel = requestChannelsCreateV2(
      test1.bodyObj.token,
      "LeeChannel",
      true
    );

    createMessages(test1.bodyObj.token, channel.bodyObj.channelId, 50);

    const channelMessageObj = requestChannelMessagesV2(
      test1.bodyObj.token,
      channel.bodyObj.channelId,
      0
    );

    expect(channelMessageObj.statusCode).toBe(OK);
    expect(channelMessageObj.bodyObj).toStrictEqual({
      messages: expect.anything(),
      start: 0,
      end: -1,
    });
  });

  test("Test-7: Success, start is 60, and there are in total 60 messages", () => {
    const test1 = requestAuthRegisterV2(
      "test1@gmail.com",
      "123456",
      "Richardo",
      "Lee"
    );
    const channel = requestChannelsCreateV2(
      test1.bodyObj.token,
      "LeeChannel",
      true
    );

    createMessages(test1.bodyObj.token, channel.bodyObj.channelId, 60);

    const channelMessageObj = requestChannelMessagesV2(
      test1.bodyObj.token,
      channel.bodyObj.channelId,
      60
    );

    expect(channelMessageObj.statusCode).toBe(OK);
    expect(channelMessageObj.bodyObj).toStrictEqual({
      messages: [],
      start: 60,
      end: -1,
    });
  });

  test("Test-8: Success, start is 0, and there are in total 51 messages", () => {
    const test1 = requestAuthRegisterV2(
      "test1@gmail.com",
      "123456",
      "Richardo",
      "Lee"
    );
    const channel = requestChannelsCreateV2(
      test1.bodyObj.token,
      "LeeChannel",
      true
    );

    createMessages(test1.bodyObj.token, channel.bodyObj.channelId, 51);

    const channelMessageObj1 = requestChannelMessagesV2(
      test1.bodyObj.token,
      channel.bodyObj.channelId,
      0
    );

    const channelMessageObj2 = requestChannelMessagesV2(
      test1.bodyObj.token,
      channel.bodyObj.channelId,
      50
    );

    expect(channelMessageObj1.statusCode).toBe(OK);
    expect(channelMessageObj2.statusCode).toBe(OK);
    expect(channelMessageObj1.bodyObj).toStrictEqual({
      messages: expect.anything(),
      start: 0,
      end: 50,
    });
    expect(channelMessageObj2.bodyObj).toStrictEqual({
      messages: expect.anything(),
      start: 50,
      end: -1,
    });
  });

  test("Test-9: Success, 3 channel message request to a channel with 124 messages", () => {
    const test1 = requestAuthRegisterV2(
      "test1@gmail.com",
      "123456",
      "Richardo",
      "Lee"
    );
    const channel = requestChannelsCreateV2(
      test1.bodyObj.token,
      "LeeChannel",
      true
    );

    createMessages(test1.bodyObj.token, channel.bodyObj.channelId, 124);

    const channelMessageObj1 = requestChannelMessagesV2(
      test1.bodyObj.token,
      channel.bodyObj.channelId,
      0
    );

    const channelMessageObj2 = requestChannelMessagesV2(
      test1.bodyObj.token,
      channel.bodyObj.channelId,
      50
    );

    const channelMessageObj3 = requestChannelMessagesV2(
      test1.bodyObj.token,
      channel.bodyObj.channelId,
      100
    );

    expect(channelMessageObj1.statusCode).toBe(OK);
    expect(channelMessageObj2.statusCode).toBe(OK);
    expect(channelMessageObj3.statusCode).toBe(OK);
    expect(channelMessageObj1.bodyObj).toStrictEqual({
      messages: expect.anything(),
      start: 0,
      end: 50,
    });
    expect(channelMessageObj2.bodyObj).toStrictEqual({
      messages: expect.anything(),
      start: 50,
      end: 100,
    });
    expect(channelMessageObj3.bodyObj).toStrictEqual({
      messages: expect.anything(),
      start: 100,
      end: -1,
    });
  });
});

describe("Testing /channel/leave/v1", () => {
  test("Test-1: Error, invalid channelId", () => {
    const test1 = requestAuthRegisterV2(
      "test1@gmail.com",
      "123456",
      "Richardo",
      "Lee"
    );

    const channel = requestChannelsCreateV2(
      test1.bodyObj.token,
      "RicardoChannel",
      true
    );

    const channelLeaveObj = requestChannelLeaveV1(
      test1.bodyObj.token,
      channel.bodyObj.channelId + 1
    );
    expect(channelLeaveObj.statusCode).toBe(OK);
    expect(channelLeaveObj.bodyObj).toStrictEqual(ERROR);
  });

  test("Test-2: Error, channelId is valid and the authorised user is not a member of the channel", () => {
    const ChannelMember = requestAuthRegisterV2(
      "test1@gmail.com",
      "123456",
      "Richardo",
      "Lee"
    );

    const NotChannelMmember = requestAuthRegisterV2(
      "test2@gmail.com",
      "123456",
      "firstName",
      "lastName"
    );

    const channel = requestChannelsCreateV2(
      ChannelMember.bodyObj.token,
      "RicardoChannel",
      true
    );

    const channelLeaveObj = requestChannelLeaveV1(
      NotChannelMmember.bodyObj.token,
      channel.bodyObj.channelId
    );
    expect(channelLeaveObj.statusCode).toBe(OK);
    expect(channelLeaveObj.bodyObj).toStrictEqual(ERROR);
  });

  test("Test-3: Error, token is invalid", () => {
    const user = requestAuthRegisterV2(
      "test1@gmail.com",
      "123456",
      "Richardo",
      "Lee"
    );

    const channel = requestChannelsCreateV2(
      user.bodyObj.token,
      "RicardoChannel",
      true
    );

    const channelLeaveObj = requestChannelLeaveV1(
      user.bodyObj.token + "1",
      channel.bodyObj.channelId
    );
    expect(channelLeaveObj.statusCode).toBe(OK);
    expect(channelLeaveObj.bodyObj).toStrictEqual(ERROR);
  });

  test("Test-4: Success case of leave channel", () => {
    const test1 = requestAuthRegisterV2(
      "test1@gmail.com",
      "123456",
      "Richardo",
      "Lee"
    );

    const test2 = requestAuthRegisterV2(
      "test2@gmail.com",
      "123456",
      "firstName",
      "lastName"
    );

    const channel = requestChannelsCreateV2(
      test1.bodyObj.token,
      "RicardoChannel",
      true
    );

    requestChannelJoinV2(test2.bodyObj.token, channel.bodyObj.channelId);
    const messageSendObj = requestMessageSendV1(
      test2.bodyObj.token,
      channel.bodyObj.channelId,
      "Froot"
    );

    const channelLeaveObj = requestChannelLeaveV1(
      test2.bodyObj.token,
      channel.bodyObj.channelId
    );
    expect(channelLeaveObj.statusCode).toBe(OK);
    expect(channelLeaveObj.bodyObj).toStrictEqual({});

    expect(
      requestChannelDetailsV2(test1.bodyObj.token, channel.bodyObj.channelId)
        .bodyObj
    ).toStrictEqual({
      name: "RicardoChannel",
      isPublic: true,
      ownerMembers: [
        {
          uId: test1.bodyObj.authUserId,
          email: "test1@gmail.com",
          nameFirst: "Richardo",
          nameLast: "Lee",
          handleStr: "richardolee",
        },
      ],
      allMembers: [
        {
          uId: test1.bodyObj.authUserId,
          email: "test1@gmail.com",
          nameFirst: "Richardo",
          nameLast: "Lee",
          handleStr: "richardolee",
        },
      ],
    });

    const message = requestChannelMessagesV2(
      test1.bodyObj.token,
      channel.bodyObj.channelId,
      0
    );
    expect(message.bodyObj.messages).toStrictEqual([
      {
        messageId: messageSendObj.bodyObj.messageId,
        uId: test2.bodyObj.authUserId,
        message: "Froot",
        timeSent: expect.any(Number),
      },
    ]);
  });

  test("Test-5: Success case of the owner leave channel", () => {
    const test1 = requestAuthRegisterV2(
      "test1@gmail.com",
      "123456",
      "Richardo",
      "Lee"
    );

    const test2 = requestAuthRegisterV2(
      "test2@gmail.com",
      "123456",
      "firstName",
      "lastName"
    );

    const channel = requestChannelsCreateV2(
      test1.bodyObj.token,
      "RicardoChannel",
      true
    );

    requestChannelJoinV2(test2.bodyObj.token, channel.bodyObj.channelId);

    const channelLeaveObj = requestChannelLeaveV1(
      test1.bodyObj.token,
      channel.bodyObj.channelId
    );
    expect(channelLeaveObj.statusCode).toBe(OK);
    expect(channelLeaveObj.bodyObj).toStrictEqual({});

    expect(
      requestChannelDetailsV2(test2.bodyObj.token, channel.bodyObj.channelId)
        .bodyObj
    ).toStrictEqual({
      name: "RicardoChannel",
      isPublic: true,
      ownerMembers: [],
      allMembers: [
        {
          uId: test2.bodyObj.authUserId,
          email: "test2@gmail.com",
          nameFirst: "firstName",
          nameLast: "lastName",
          handleStr: "firstnamelastname",
        },
      ],
    });
  });

  test("Test-6: Success case of the all members leaves the channel (check the channel list)", () => {
    const test1 = requestAuthRegisterV2(
      "test1@gmail.com",
      "123456",
      "Richardo",
      "Lee"
    );

    const test2 = requestAuthRegisterV2(
      "test2@gmail.com",
      "123456",
      "firstName",
      "lastName"
    );

    const channel = requestChannelsCreateV2(
      test1.bodyObj.token,
      "RicardoChannel",
      true
    );

    requestChannelJoinV2(test2.bodyObj.token, channel.bodyObj.channelId);

    const channelLeaveObj = requestChannelLeaveV1(
      test1.bodyObj.token,
      channel.bodyObj.channelId
    );
    const channelLeaveObj2 = requestChannelLeaveV1(
      test2.bodyObj.token,
      channel.bodyObj.channelId
    );
    expect(channelLeaveObj.statusCode).toBe(OK);
    expect(channelLeaveObj.bodyObj).toStrictEqual({});
    expect(channelLeaveObj2.statusCode).toBe(OK);
    expect(channelLeaveObj2.bodyObj).toStrictEqual({});

    expect(requestChannelsListAllV2(test1.bodyObj.token).bodyObj).toStrictEqual(
      {
        channels: [
          {
            channelId: channel.bodyObj.channelId,
            name: "RicardoChannel",
          },
        ],
      }
    );
  });
});

describe("Testing /channel/addowner/v1", () => {
  test("Test-1: Error, invalid channelId", () => {
    const test1 = requestAuthRegisterV2(
      "test1@gmail.com",
      "123456",
      "Richardo",
      "Lee"
    );

    const test2 = requestAuthRegisterV2(
      "test2@gmail.com",
      "123456",
      "firstName",
      "lastName"
    );

    const channel = requestChannelsCreateV2(
      test1.bodyObj.token,
      "RicardoChannel",
      true
    );

    requestChannelJoinV2(test2.bodyObj.token, channel.bodyObj.channelId);

    const channelAddOwnerObj = requestChannelAddOwnerV1(
      test1.bodyObj.token,
      channel.bodyObj.channelId + 1,
      test2.bodyObj.authUserId
    );
    expect(channelAddOwnerObj.statusCode).toBe(OK);
    expect(channelAddOwnerObj.bodyObj).toStrictEqual(ERROR);
  });

  test("Test-2: Error, uId does not refer to a valid user", () => {
    const test1 = requestAuthRegisterV2(
      "test1@gmail.com",
      "123456",
      "Richardo",
      "Lee"
    );

    const channel = requestChannelsCreateV2(
      test1.bodyObj.token,
      "RicardoChannel",
      true
    );

    const channelAddOwnerObj = requestChannelAddOwnerV1(
      test1.bodyObj.token,
      channel.bodyObj.channelId,
      test1.bodyObj.authUserId + 1
    );
    expect(channelAddOwnerObj.statusCode).toBe(OK);
    expect(channelAddOwnerObj.bodyObj).toStrictEqual(ERROR);
  });

  test("Test-3: Error, uId refers to a user who is not a member of the channel", () => {
    const test1 = requestAuthRegisterV2(
      "test1@gmail.com",
      "123456",
      "Richardo",
      "Lee"
    );

    const test2 = requestAuthRegisterV2(
      "test2@gmail.com",
      "123456",
      "firstName",
      "lastName"
    );

    const channel = requestChannelsCreateV2(
      test1.bodyObj.token,
      "RicardoChannel",
      true
    );

    const channelAddOwnerObj = requestChannelAddOwnerV1(
      test1.bodyObj.token,
      channel.bodyObj.channelId,
      test2.bodyObj.authUserId
    );
    expect(channelAddOwnerObj.statusCode).toBe(OK);
    expect(channelAddOwnerObj.bodyObj).toStrictEqual(ERROR);
  });

  test("Test-4: Error, uId refers to a user who is already an owner of the channel", () => {
    const test1 = requestAuthRegisterV2(
      "test1@gmail.com",
      "123456",
      "Richardo",
      "Lee"
    );

    const channel = requestChannelsCreateV2(
      test1.bodyObj.token,
      "RicardoChannel",
      true
    );

    const channelAddOwnerObj = requestChannelAddOwnerV1(
      test1.bodyObj.token,
      channel.bodyObj.channelId,
      test1.bodyObj.authUserId
    );
    expect(channelAddOwnerObj.statusCode).toBe(OK);
    expect(channelAddOwnerObj.bodyObj).toStrictEqual(ERROR);
  });

  test("Test-5: Error, channelId is valid and the authorised user does not have owner permissions in the channel", () => {
    const test1 = requestAuthRegisterV2(
      "test1@gmail.com",
      "123456",
      "Richardo",
      "Lee"
    );

    const channel = requestChannelsCreateV2(
      test1.bodyObj.token,
      "RicardoChannel",
      true
    );

    const test2 = requestAuthRegisterV2(
      "test2@gmail.com",
      "123456",
      "firstName",
      "lastName"
    );

    requestChannelJoinV2(test2.bodyObj.token, channel.bodyObj.channelId);

    const channelAddOwnerObj = requestChannelAddOwnerV1(
      test2.bodyObj.token,
      channel.bodyObj.channelId,
      test2.bodyObj.authUserId
    );
    expect(channelAddOwnerObj.statusCode).toBe(OK);
    expect(channelAddOwnerObj.bodyObj).toStrictEqual(ERROR);
  });

  test("Test-6: Error, token is invalid", () => {
    const test1 = requestAuthRegisterV2(
      "test1@gmail.com",
      "123456",
      "Richardo",
      "Lee"
    );

    const test2 = requestAuthRegisterV2(
      "test2@gmail.com",
      "123456",
      "firstName",
      "lastName"
    );

    const channel = requestChannelsCreateV2(
      test1.bodyObj.token,
      "RicardoChannel",
      true
    );

    requestChannelJoinV2(test2.bodyObj.token, channel.bodyObj.channelId);

    const channelAddOwnerObj = requestChannelAddOwnerV1(
      test1.bodyObj.token + "1",
      channel.bodyObj.channelId,
      test2.bodyObj.authUserId
    );
    expect(channelAddOwnerObj.statusCode).toBe(OK);
    expect(channelAddOwnerObj.bodyObj).toStrictEqual(ERROR);
  });

  test("Test-6: Success, member been added as a owner", () => {
    const test1 = requestAuthRegisterV2(
      "test1@gmail.com",
      "123456",
      "Richardo",
      "Lee"
    );

    const test2 = requestAuthRegisterV2(
      "test2@gmail.com",
      "123456",
      "firstName",
      "lastName"
    );

    const channel = requestChannelsCreateV2(
      test1.bodyObj.token,
      "RicardoChannel",
      true
    );

    requestChannelJoinV2(test2.bodyObj.token, channel.bodyObj.channelId);

    const channelAddOwnerObj = requestChannelAddOwnerV1(
      test1.bodyObj.token,
      channel.bodyObj.channelId,
      test2.bodyObj.authUserId
    );
    expect(channelAddOwnerObj.statusCode).toBe(OK);
    expect(channelAddOwnerObj.bodyObj).toStrictEqual({});
    expect(
      requestChannelDetailsV2(test1.bodyObj.token, channel.bodyObj.channelId)
        .bodyObj
    ).toStrictEqual({
      name: "RicardoChannel",
      isPublic: true,
      ownerMembers: [
        {
          uId: test1.bodyObj.authUserId,
          email: "test1@gmail.com",
          nameFirst: "Richardo",
          nameLast: "Lee",
          handleStr: "richardolee",
        },
        {
          uId: test2.bodyObj.authUserId,
          email: "test2@gmail.com",
          nameFirst: "firstName",
          nameLast: "lastName",
          handleStr: "firstnamelastname",
        },
      ],
      allMembers: [
        {
          uId: test1.bodyObj.authUserId,
          email: "test1@gmail.com",
          nameFirst: "Richardo",
          nameLast: "Lee",
          handleStr: "richardolee",
        },
        {
          uId: test2.bodyObj.authUserId,
          email: "test2@gmail.com",
          nameFirst: "firstName",
          nameLast: "lastName",
          handleStr: "firstnamelastname",
        },
      ],
    });
  });

  test("Test-7: add multiple owners", () => {
    const owner = requestAuthRegisterV2(
      "test0@gmail.com",
      "123456",
      "firstname0",
      "lastname0"
    );
    const member1 = requestAuthRegisterV2(
      "test1@gmail.com",
      "123456",
      "firstname1",
      "lastname1"
    );
    const member2 = requestAuthRegisterV2(
      "test2@gmail.com",
      "123456",
      "firstname2",
      "lastname2"
    );
    const member3 = requestAuthRegisterV2(
      "test3@gmail.com",
      "123456",
      "firstname3",
      "lastname3"
    );
    const member4 = requestAuthRegisterV2(
      "test4@gmail.com",
      "123456",
      "firstname4",
      "lastname4"
    );
    const member5 = requestAuthRegisterV2(
      "test5@gmail.com",
      "123456",
      "firstname5",
      "lastname5"
    );
    const channel = requestChannelsCreateV2(
      owner.bodyObj.token,
      "channelName",
      true
    );

    requestChannelJoinV2(member1.bodyObj.token, channel.bodyObj.channelId);
    requestChannelJoinV2(member2.bodyObj.token, channel.bodyObj.channelId);
    requestChannelJoinV2(member3.bodyObj.token, channel.bodyObj.channelId);
    requestChannelJoinV2(member4.bodyObj.token, channel.bodyObj.channelId);
    requestChannelJoinV2(member5.bodyObj.token, channel.bodyObj.channelId);

    // add member1, member3, member5 to owner
    requestChannelAddOwnerV1(
      owner.bodyObj.token,
      channel.bodyObj.channelId,
      member1.bodyObj.authUserId
    );
    requestChannelAddOwnerV1(
      owner.bodyObj.token,
      channel.bodyObj.channelId,
      member3.bodyObj.authUserId
    );
    const multipleOwner = requestChannelAddOwnerV1(
      owner.bodyObj.token,
      channel.bodyObj.channelId,
      member5.bodyObj.authUserId
    );
    expect(multipleOwner.statusCode).toBe(OK);
    expect(multipleOwner.bodyObj).toStrictEqual({});
    expect(
      requestChannelDetailsV2(owner.bodyObj.token, channel.bodyObj.channelId)
        .bodyObj
    ).toStrictEqual({
      name: "channelName",
      isPublic: true,
      ownerMembers: [
        {
          uId: owner.bodyObj.authUserId,
          email: "test0@gmail.com",
          nameFirst: "firstname0",
          nameLast: "lastname0",
          handleStr: "firstname0lastname0",
        },
        {
          uId: member1.bodyObj.authUserId,
          email: "test1@gmail.com",
          nameFirst: "firstname1",
          nameLast: "lastname1",
          handleStr: "firstname1lastname1",
        },
        {
          uId: member3.bodyObj.authUserId,
          email: "test3@gmail.com",
          nameFirst: "firstname3",
          nameLast: "lastname3",
          handleStr: "firstname3lastname3",
        },
        {
          uId: member5.bodyObj.authUserId,
          email: "test5@gmail.com",
          nameFirst: "firstname5",
          nameLast: "lastname5",
          handleStr: "firstname5lastname5",
        },
      ],
      allMembers: [
        {
          uId: owner.bodyObj.authUserId,
          email: "test0@gmail.com",
          nameFirst: "firstname0",
          nameLast: "lastname0",
          handleStr: "firstname0lastname0",
        },
        {
          uId: member1.bodyObj.authUserId,
          email: "test1@gmail.com",
          nameFirst: "firstname1",
          nameLast: "lastname1",
          handleStr: "firstname1lastname1",
        },
        {
          uId: member2.bodyObj.authUserId,
          email: "test2@gmail.com",
          nameFirst: "firstname2",
          nameLast: "lastname2",
          handleStr: "firstname2lastname2",
        },
        {
          uId: member3.bodyObj.authUserId,
          email: "test3@gmail.com",
          nameFirst: "firstname3",
          nameLast: "lastname3",
          handleStr: "firstname3lastname3",
        },
        {
          uId: member4.bodyObj.authUserId,
          email: "test4@gmail.com",
          nameFirst: "firstname4",
          nameLast: "lastname4",
          handleStr: "firstname4lastname4",
        },
        {
          uId: member5.bodyObj.authUserId,
          email: "test5@gmail.com",
          nameFirst: "firstname5",
          nameLast: "lastname5",
          handleStr: "firstname5lastname5",
        },
      ],
    });
  });
});

describe("Testing /channel/removeowner/v1", () => {
  test("Test-1: Error, invalid channelId", () => {
    const test1 = requestAuthRegisterV2(
      "test1@gmail.com",
      "123456",
      "Richardo",
      "Lee"
    );

    const channel = requestChannelsCreateV2(
      test1.bodyObj.token,
      "RicardoChannel",
      true
    );

    const channelRemoveOwnerObj = requestChannelRemoveOwnerV1(
      test1.bodyObj.token,
      channel.bodyObj.channelId + 1,
      test1.bodyObj.authUserId
    );
    expect(channelRemoveOwnerObj.statusCode).toBe(OK);
    expect(channelRemoveOwnerObj.bodyObj).toStrictEqual(ERROR);
  });

  test("Test-2: Error, uId does not refer to a valid user", () => {
    const test1 = requestAuthRegisterV2(
      "test1@gmail.com",
      "123456",
      "Richardo",
      "Lee"
    );

    const channel = requestChannelsCreateV2(
      test1.bodyObj.token,
      "RicardoChannel",
      true
    );

    const channelRemoveOwnerObj = requestChannelRemoveOwnerV1(
      test1.bodyObj.token,
      channel.bodyObj.channelId,
      test1.bodyObj.authUserId + 1
    );
    expect(channelRemoveOwnerObj.statusCode).toBe(OK);
    expect(channelRemoveOwnerObj.bodyObj).toStrictEqual(ERROR);
  });

  test("Test-3: Error, uId refers to a user who is not an owner of the channel", () => {
    const test1 = requestAuthRegisterV2(
      "test1@gmail.com",
      "123456",
      "Richardo",
      "Lee"
    );

    const test2 = requestAuthRegisterV2(
      "test2@gmail.com",
      "123456",
      "firstName",
      "lastName"
    );

    const channel = requestChannelsCreateV2(
      test1.bodyObj.token,
      "RicardoChannel",
      true
    );

    requestChannelJoinV2(test2.bodyObj.token, channel.bodyObj.channelId);

    const channelRemoveOwnerObj = requestChannelRemoveOwnerV1(
      test1.bodyObj.token,
      channel.bodyObj.channelId,
      test2.bodyObj.authUserId
    );
    expect(channelRemoveOwnerObj.statusCode).toBe(OK);
    expect(channelRemoveOwnerObj.bodyObj).toStrictEqual(ERROR);
  });

  test("Test-4: Error, uId refers to a user who is currently the only owner of the channel", () => {
    const test1 = requestAuthRegisterV2(
      "test1@gmail.com",
      "123456",
      "Richardo",
      "Lee"
    );

    const test2 = requestAuthRegisterV2(
      "test2@gmail.com",
      "123456",
      "firstName",
      "lastName"
    );

    const channel = requestChannelsCreateV2(
      test1.bodyObj.token,
      "RicardoChannel",
      true
    );

    requestChannelJoinV2(test2.bodyObj.token, channel.bodyObj.channelId);

    const channelRemoveOwnerObj = requestChannelRemoveOwnerV1(
      test1.bodyObj.token,
      channel.bodyObj.channelId,
      test1.bodyObj.authUserId
    );
    expect(channelRemoveOwnerObj.statusCode).toBe(OK);
    expect(channelRemoveOwnerObj.bodyObj).toStrictEqual(ERROR);
  });

  test("Test-5: Error, channelId is valid and the authorised user does not have owner permissions in the channel", () => {
    const test1 = requestAuthRegisterV2(
      "test1@gmail.com",
      "123456",
      "Richardo",
      "Lee"
    );

    const test2 = requestAuthRegisterV2(
      "test2@gmail.com",
      "123456",
      "firstName",
      "lastName"
    );

    const test3 = requestAuthRegisterV2(
      "test3@gmail.com",
      "123456",
      "firstName3",
      "lastName3"
    );

    const channel = requestChannelsCreateV2(
      test1.bodyObj.token,
      "RicardoChannel",
      true
    );

    requestChannelJoinV2(test2.bodyObj.token, channel.bodyObj.channelId);
    requestChannelJoinV2(test3.bodyObj.token, channel.bodyObj.channelId);
    requestChannelAddOwnerV1(
      test1.bodyObj.token,
      channel.bodyObj.channelId,
      test2.bodyObj.autherUserId
    );

    const channelRemoveOwnerObj = requestChannelRemoveOwnerV1(
      test3.bodyObj.token,
      channel.bodyObj.channelId,
      test2.bodyObj.authUserId
    );
    expect(channelRemoveOwnerObj.statusCode).toBe(OK);
    expect(channelRemoveOwnerObj.bodyObj).toStrictEqual(ERROR);
  });

  test("Test-6: Error, token is invalid", () => {
    const test1 = requestAuthRegisterV2(
      "test1@gmail.com",
      "123456",
      "Richardo",
      "Lee"
    );

    const test2 = requestAuthRegisterV2(
      "test2@gmail.com",
      "123456",
      "firstName",
      "lastName"
    );

    const channel = requestChannelsCreateV2(
      test1.bodyObj.token,
      "RicardoChannel",
      true
    );

    requestChannelJoinV2(test2.bodyObj.token, channel.bodyObj.channelId);

    const channelRemoveOwnerObj = requestChannelRemoveOwnerV1(
      test1.bodyObj.token + 1,
      channel.bodyObj.channelId,
      test2.bodyObj.authUserId
    );
    expect(channelRemoveOwnerObj.statusCode).toBe(OK);
    expect(channelRemoveOwnerObj.bodyObj).toStrictEqual(ERROR);
  });

  test("Test-7: Success case with removing a owner", () => {
    const test1 = requestAuthRegisterV2(
      "test1@gmail.com",
      "123456",
      "Richardo",
      "Lee"
    );

    const test2 = requestAuthRegisterV2(
      "test2@gmail.com",
      "123456",
      "firstName",
      "lastName"
    );

    const channel = requestChannelsCreateV2(
      test1.bodyObj.token,
      "RicardoChannel",
      true
    );

    requestChannelJoinV2(test2.bodyObj.token, channel.bodyObj.channelId);

    requestChannelAddOwnerV1(
      test1.bodyObj.token,
      channel.bodyObj.channelId,
      test2.bodyObj.authUserId
    );

    const channelRemoveOwnerObj = requestChannelRemoveOwnerV1(
      test1.bodyObj.token,
      channel.bodyObj.channelId,
      test2.bodyObj.authUserId
    );
    expect(channelRemoveOwnerObj.statusCode).toBe(OK);
    expect(channelRemoveOwnerObj.bodyObj).toStrictEqual({});

    expect(
      requestChannelDetailsV2(test1.bodyObj.token, channel.bodyObj.channelId)
        .bodyObj
    ).toStrictEqual({
      name: "RicardoChannel",
      isPublic: true,
      ownerMembers: [
        {
          uId: test1.bodyObj.authUserId,
          email: "test1@gmail.com",
          nameFirst: "Richardo",
          nameLast: "Lee",
          handleStr: "richardolee",
        },
      ],
      allMembers: [
        {
          uId: test1.bodyObj.authUserId,
          email: "test1@gmail.com",
          nameFirst: "Richardo",
          nameLast: "Lee",
          handleStr: "richardolee",
        },
        {
          uId: test2.bodyObj.authUserId,
          email: "test2@gmail.com",
          nameFirst: "firstName",
          nameLast: "lastName",
          handleStr: "firstnamelastname",
        },
      ],
    });
  });

  test("Test-8: remove multiple owners", () => {
    const owner = requestAuthRegisterV2(
      "test0@gmail.com",
      "123456",
      "firstname0",
      "lastname0"
    );
    const member1 = requestAuthRegisterV2(
      "test1@gmail.com",
      "123456",
      "firstname1",
      "lastname1"
    );
    const member2 = requestAuthRegisterV2(
      "test2@gmail.com",
      "123456",
      "firstname2",
      "lastname2"
    );
    const member3 = requestAuthRegisterV2(
      "test3@gmail.com",
      "123456",
      "firstname3",
      "lastname3"
    );
    const member4 = requestAuthRegisterV2(
      "test4@gmail.com",
      "123456",
      "firstname4",
      "lastname4"
    );
    const member5 = requestAuthRegisterV2(
      "test5@gmail.com",
      "123456",
      "firstname5",
      "lastname5"
    );
    const channel = requestChannelsCreateV2(
      owner.bodyObj.token,
      "channelName",
      true
    );
    requestChannelJoinV2(member1.bodyObj.token, channel.bodyObj.channelId);
    requestChannelJoinV2(member2.bodyObj.token, channel.bodyObj.channelId);
    requestChannelJoinV2(member3.bodyObj.token, channel.bodyObj.channelId);
    requestChannelJoinV2(member4.bodyObj.token, channel.bodyObj.channelId);
    requestChannelJoinV2(member5.bodyObj.token, channel.bodyObj.channelId);
    // add all memmber to owner
    requestChannelAddOwnerV1(
      owner.bodyObj.token,
      channel.bodyObj.channelId,
      member1.bodyObj.authUserId
    );
    requestChannelAddOwnerV1(
      owner.bodyObj.token,
      channel.bodyObj.channelId,
      member2.bodyObj.authUserId
    );
    requestChannelAddOwnerV1(
      owner.bodyObj.token,
      channel.bodyObj.channelId,
      member3.bodyObj.authUserId
    );
    requestChannelAddOwnerV1(
      owner.bodyObj.token,
      channel.bodyObj.channelId,
      member4.bodyObj.authUserId
    );
    requestChannelAddOwnerV1(
      owner.bodyObj.token,
      channel.bodyObj.channelId,
      member5.bodyObj.authUserId
    );
    // remove member1, member3, member5 from owner
    requestChannelRemoveOwnerV1(
      owner.bodyObj.token,
      channel.bodyObj.channelId,
      member1.bodyObj.authUserId
    );
    requestChannelRemoveOwnerV1(
      owner.bodyObj.token,
      channel.bodyObj.channelId,
      member3.bodyObj.authUserId
    );
    const removeMultiple = requestChannelRemoveOwnerV1(
      owner.bodyObj.token,
      channel.bodyObj.channelId,
      member5.bodyObj.authUserId
    );
    expect(removeMultiple.statusCode).toBe(OK);
    expect(removeMultiple.bodyObj).toStrictEqual({});
    const channelDetail = requestChannelDetailsV2(
      owner.bodyObj.token,
      channel.bodyObj.channelId
    );
    expect(channelDetail.bodyObj).toStrictEqual({
      name: "channelName",
      isPublic: true,
      ownerMembers: [
        {
          uId: owner.bodyObj.authUserId,
          email: "test0@gmail.com",
          nameFirst: "firstname0",
          nameLast: "lastname0",
          handleStr: "firstname0lastname0",
        },
        {
          uId: member2.bodyObj.authUserId,
          email: "test2@gmail.com",
          nameFirst: "firstname2",
          nameLast: "lastname2",
          handleStr: "firstname2lastname2",
        },
        {
          uId: member4.bodyObj.authUserId,
          email: "test4@gmail.com",
          nameFirst: "firstname4",
          nameLast: "lastname4",
          handleStr: "firstname4lastname4",
        },
      ],
      allMembers: [
        {
          uId: owner.bodyObj.authUserId,
          email: "test0@gmail.com",
          nameFirst: "firstname0",
          nameLast: "lastname0",
          handleStr: "firstname0lastname0",
        },
        {
          uId: member1.bodyObj.authUserId,
          email: "test1@gmail.com",
          nameFirst: "firstname1",
          nameLast: "lastname1",
          handleStr: "firstname1lastname1",
        },
        {
          uId: member2.bodyObj.authUserId,
          email: "test2@gmail.com",
          nameFirst: "firstname2",
          nameLast: "lastname2",
          handleStr: "firstname2lastname2",
        },
        {
          uId: member3.bodyObj.authUserId,
          email: "test3@gmail.com",
          nameFirst: "firstname3",
          nameLast: "lastname3",
          handleStr: "firstname3lastname3",
        },
        {
          uId: member4.bodyObj.authUserId,
          email: "test4@gmail.com",
          nameFirst: "firstname4",
          nameLast: "lastname4",
          handleStr: "firstname4lastname4",
        },
        {
          uId: member5.bodyObj.authUserId,
          email: "test5@gmail.com",
          nameFirst: "firstname5",
          nameLast: "lastname5",
          handleStr: "firstname5lastname5",
        },
      ],
    });
  });
});

const createMessages = (
  token: string,
  channelId: number,
  repetition: number
): void => {
  for (let count = 0; count < repetition; count++) {
    requestMessageSendV1(token, channelId, `Testing line ${count}`);
  }
};
