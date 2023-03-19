import {
  requestAuthRegisterV2,
  requestChannelDetailsV2,
  requestChannelInviteV2,
  requestChannelJoinV2,
  requestChannelMessagesV2,
  requestChannelsCreateV2,
  requestClearV1,
} from "./helperServer";

const OK = 200;
const ERROR = { error: expect.any(String) };

beforeEach(() => {
  requestClearV1();
});

afterEach(() => {
  requestClearV1();
});

describe("Testing requestChannelDetailsV2", () => {
  test("Test-1: Error, incorrect channelId", () => {
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
      test1.bodyObj.channelId + 1
    );
    expect(channelDetails.statusCode).toBe(OK);
    expect(channelDetails.bodyObj).toStrictEqual(ERROR);
  });

  test("Test-2: Error, incorrect authUserId", () => {
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

describe("Testing requestChannelJoinV2", () => {
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

  test("Test-2: Error, authUserId is invalid", () => {
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

  test("Test-3: Error, authUserId is already a member of the channel", () => {
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

  test("Test-3: Error, private channel, and authUser is not a global owner", () => {
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

  test("Test-5: private channel, but authUser is a global owner", () => {
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

describe("requestChannelInviteV2 function testing", () => {
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

  test("Test-2: Error, Invalid uId", () => {
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

  test("Test-5: Error, invalid authUserId", () => {
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

describe("Testing requestChannelMessagesV2", () => {
  function messageForTesting(count: number): Array<string> {
    const message = [];
    for (let i = 0; i < count; i++) {
      message.push(`Test line`);
    }
    return message;
  }
  test("Test-1: Error, invalid channelId", () => {
    const test1 = requestAuthRegisterV2(
      "test1@gmail.com",
      "123456",
      "Richardo",
      "Lee"
    );

    const channel = requestChannelsCreateV2(
      test1.bodyObj.token + 1,
      "RicardoChannel",
      true
    );

    const channelMessageObj = requestChannelMessagesV2(
      test1.bodyObj.token,
      0,
      0
    );
    expect(channelMessageObj.statusCode).toBe(OK);
    expect(channelMessageObj.bodyObj).toStrictEqual(ERROR);
  });

  test("Test-2: Error, Invalid uId", () => {
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
      test1.bodyObj.token + 1,
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
});
