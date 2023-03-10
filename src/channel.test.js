import { clearV1 } from "./other.js";
import {
  channelDetailsV1,
  channelJoinV1,
  channelInviteV1,
  channelMessagesV1,
} from "./channel.js";
import { authRegisterV1 } from "./auth.js";
import { channelsCreateV1 } from "./channels.js";

beforeEach(() => {
  clearV1();
});

describe("Testing channelDetailsV1", () => {
  test("Test-1: Error, incorrect channelId", () => {
    const test1 = authRegisterV1("test1@gmail.com", "123456", "Richardo", "Li");
    const channelId = channelsCreateV1(
      test1.authUserId,
      "RicardoChannel",
      true
    );
    const channelDetails = channelDetailsV1(test1.authUserId, "Incorrect");
    expect(channelDetails).toStrictEqual({ error: expect.any(String) });
  });

  test("Test-2: Error, incorrect authUserId", () => {
    const test1 = authRegisterV1("test1@gmail.com", "123456", "Richardo", "Li");
    const channelId = channelsCreateV1(
      test1.authUserId,
      "RicardoChannel",
      true
    );
    const channelDetails = channelDetailsV1(
      test1.authUserId + 3,
      channelId.channelId
    );
    expect(channelDetails).toStrictEqual({ error: expect.any(String) });
  });

  test("Test-3: Error, User inputed is not in the existing channel", () => {
    const test1 = authRegisterV1("test1@gmail.com", "123456", "Richardo", "Li");
    const test2 = authRegisterV1(
      "test2@gmail.com",
      "1234567",
      "Shenba",
      "Chen"
    );
    const channelId = channelsCreateV1(
      test1.authUserId,
      "RicardoChannel",
      true
    );
    const channelDetails = channelDetailsV1(
      test2.authUserId,
      channelId.channelId
    );
    expect(channelDetails).toStrictEqual({ error: expect.any(String) });
  });

  test("Test-4, correct input parameters", () => {
    const test1 = authRegisterV1("test1@gmail.com", "123456", "Richardo", "Li");
    const channelId = channelsCreateV1(
      test1.authUserId,
      "RicardoChannel",
      true
    );
    const channelDetails = channelDetailsV1(
      test1.authUserId,
      channelId.channelId
    );
    expect(channelDetails).toStrictEqual({
      name: "RicardoChannel",
      isPublic: true,
      ownerMembers: [
        {
          uId: test1.authUserId,
          email: "test1@gmail.com",
          nameFirst: "Richardo",
          nameLast: "Li",
          handleStr: "richardoli",
        },
      ],
      allMembers: [
        {
          uId: test1.authUserId,
          email: "test1@gmail.com",
          nameFirst: "Richardo",
          nameLast: "Li",
          handleStr: "richardoli",
        },
      ],
    });
  });

  test("Test-5, correct input parameters, but with multiple members", () => {
    const test1 = authRegisterV1("test1@gmail.com", "123456", "Richardo", "Li");
    const test2 = authRegisterV1(
      "test2@gmail.com",
      "1234567",
      "Shenba",
      "Chen"
    );
    const test3 = authRegisterV1("test3@gmail.com", "12345678", "Kunda", "Yu");
    const channelId = channelsCreateV1(
      test1.authUserId,
      "RicardoChannel",
      true
    );

    channelJoinV1(test2.authUserId, channelId.channelId);
    channelJoinV1(test3.authUserId, channelId.channelId);

    const channelDetails = channelDetailsV1(
      test1.authUserId,
      channelId.channelId
    );
    expect(channelDetails).toStrictEqual({
      name: "RicardoChannel",
      isPublic: true,
      ownerMembers: [
        {
          uId: test1.authUserId,
          email: "test1@gmail.com",
          nameFirst: "Richardo",
          nameLast: "Li",
          handleStr: "richardoli",
        },
      ],
      allMembers: [
        {
          uId: test1.authUserId,
          email: "test1@gmail.com",
          nameFirst: "Richardo",
          nameLast: "Li",
          handleStr: "richardoli",
        },
        {
          uId: test2.authUserId,
          email: "test2@gmail.com",
          nameFirst: "Shenba",
          nameLast: "Chen",
          handleStr: "shenbachen",
        },
        {
          uId: test3.authUserId,
          email: "test3@gmail.com",
          nameFirst: "Kunda",
          nameLast: "Yu",
          handleStr: "kundayu",
        },
      ],
    });
  });
});

describe("Testing channelJoinV1", () => {
  test("Test-1: Error, channelId does not refer to a valid channel", () => {
    const user1 = authRegisterV1("ricky@gmail.com", "123455", "Ricky", "Li");

    const user2 = authRegisterV1("libro@gmail.com", "123455", "libro", "Zhang");

    const channel1 = channelsCreateV1(user2.authUserId, "Rickychannel", true);

    expect(
      channelJoinV1(user1.authUserId, channel1.channelId + 1)
    ).toStrictEqual({ error: expect.any(String) });
  });

  test("Test-2: Error, authUserId is invalid", () => {
    const user1 = authRegisterV1("ricky@gmail.com", "123455", "Ricky", "Li");

    const channel1 = channelsCreateV1(user1.authUserId, "Rickychannel", true);

    expect(
      channelJoinV1(user1.authUserId + 1, channel1.channelId)
    ).toStrictEqual({ error: expect.any(String) });
  });

  test("Test-3: Error, authUserId is already a member of the channel", () => {
    const user1 = authRegisterV1("ricky@gmail.com", "123455", "Ricky", "Li");

    const channel1 = channelsCreateV1(user1.authUserId, "Rickychannel", true);

    expect(channelJoinV1(user1.authUserId, channel1)).toStrictEqual({
      error: expect.any(String),
    });
  });

  test("Test-3: Error, private channel, and authUser is not a global owner", () => {
    const user1 = authRegisterV1("ricky@gmail.com", "123455", "Ricky", "Li");

    const user2 = authRegisterV1("libro@gmail.com", "123455", "libro", "Zhang");

    const channel1 = channelsCreateV1(user1.authUserId, "Rickychannel", false);

    expect(channelJoinV1(user2.authUserId, channel1.channelId)).toStrictEqual({
      error: expect.any(String),
    });
  });

  test("Test-4: successiful case", () => {
    const user1 = authRegisterV1("ricky@gmail.com", "123455", "Ricky", "Li");

    const user2 = authRegisterV1("libro@gmail.com", "123455", "libro", "Zhang");
    const channel1 = channelsCreateV1(user1.authUserId, "Rickychannel", true);

    let result = channelJoinV1(user2.authUserId, channel1.channelId);
    expect(result).toStrictEqual({});
  });

  test("Test-5: private channel, but authUser is a global owner", () => {
    const user1 = authRegisterV1("ricky@gmail.com", "123455", "Ricky", "Li");

    const user2 = authRegisterV1("libro@gmail.com", "123455", "libro", "Zhang");
    const channel1 = channelsCreateV1(user2.authUserId, "Rickychannel", false);

    expect(channelJoinV1(user1.authUserId, channel1.channelId)).toStrictEqual(
      {}
    );
  });
});

describe("channelInviteV1 function testing", () => {
  test("Test-1: Error, invalid channelId", () => {
    const test1 = authRegisterV1(
      "test1@gmail.com",
      "123456",
      "Richardo",
      "Lee"
    );
    const test2 = authRegisterV1(
      "test2@gmail.com",
      "1234567",
      "Shenba",
      "Chen"
    );
    expect(
      channelInviteV1(test1.authUserId, 0, test2.authUserId)
    ).toStrictEqual({
      error: expect.any(String),
    });
  });

  test("Test-2: Error, Invalid uId", () => {
    const test1 = authRegisterV1(
      "test1@gmail.com",
      "123456",
      "Richardo",
      "Lee"
    );
    const channel = channelsCreateV1(test.authUserId, "LeeChannel", true);
    expect(
      channelInviteV1(test1.authUserId, channel.channelId, test1.authUserId + 1)
    ).toStrictEqual({ error: expect.any(String) });
  });

  test("Test-3: Error, uId belong to a user who is already in the channel", () => {
    const test1 = authRegisterV1(
      "test1@gmail.com",
      "123456",
      "Richardo",
      "Lee"
    );
    const test2 = authRegisterV1(
      "test2@gmail.com",
      "1234567",
      "Shenba",
      "Chen"
    );
    const channel = channelsCreateV1(test1.authUserId, "LeeChannel", true);
    channelJoinV1(test2.authUserId, channel.channelId);
    expect(
      channelInviteV1(test1.authUserId, channel.channelId, test2.authUserId)
    ).toStrictEqual({ error: expect.any(String) });
  });

  test("Test-4: Error, channelId is valid and the authorised user is not a member of the channel", () => {
    const test1 = authRegisterV1(
      "test1@gmail.com",
      "123456",
      "Richardo",
      "Lee"
    );
    const test2 = authRegisterV1(
      "test2@gmail.com",
      "1234567",
      "Shenba",
      "Chen"
    );
    const test3 = authRegisterV1("test3@gmail.com", "12345678", "Kunda", "Yu");
    const channel = channelsCreateV1(test1.authUserId, "LeeChannel", true);
    expect(
      channelInviteV1(test2.authUserId, channel.channelId, test3.authUserId)
    ).toStrictEqual({ error: expect.any(String) });
  });

  test("Test-5: Error, invalid authUserId", () => {
    const test1 = authRegisterV1("test@gmail.com", "123456", "Ricardo", "Lee");
    const channel = channelsCreateV1(test1.authUserId, "LeeChannel", true);
    expect(
      channelInviteV1(test1.authUserId + 1, channel.channelId, test1.authUserId)
    ).toStrictEqual({ error: expect.any(String) });
  });

  test("Test-6: Error, user inviting themselves", () => {
    const test1 = authRegisterV1(
      "test1@gmail.com",
      "123456",
      "Richardo",
      "Lee"
    );
    const channel = channelsCreateV1(test1.authUserId, "LeeChannel", true);
    expect(
      channelInviteV1(test1.authUserId, channel.channelId, test1.authUserId)
    ).toStrictEqual({ error: expect.any(String) });
  });

  test("Test-7: Successful invite", () => {
    const test1 = authRegisterV1(
      "test1@gmail.com",
      "123456",
      "Richardo",
      "Lee"
    );
    const test2 = authRegisterV1(
      "test2@gmail.com",
      "1234567",
      "Shenba",
      "Chen"
    );
    const channel = channelsCreateV1(test1.authUserId, "LeeChannel", true);
    expect(
      channelInviteV1(test1.authUserId, channel.channelId, test2.authUserId)
    ).toStrictEqual({});
    expect(channelDetailsV1(test1.authUserId, channel.channelId)).toStrictEqual(
      {
        name: "LeeChannel",
        isPublic: true,
        ownerMembers: [
          {
            uId: test1.authUserId,
            email: "test1@gmail.com",
            nameFirst: "Richardo",
            nameLast: "Lee",
            handleStr: "richardolee",
          },
        ],
        allMembers: [
          {
            uId: test1.authUserId,
            email: "test1@gmail.com",
            nameFirst: "Richardo",
            nameLast: "Lee",
            handleStr: "richardolee",
          },
          {
            uId: test2.authUserId,
            email: "test2@gmail.com",
            nameFirst: "Shenba",
            nameLast: "Chen",
            handleStr: "shenbachen",
          },
        ],
      }
    );
  });

  test("Inviting global owner into the channel", () => {
    const test1 = authRegisterV1(
      "test1@gmail.com",
      "123456",
      "Richardo",
      "Lee"
    );
    const test2 = authRegisterV1(
      "test2@gmail.com",
      "1234567",
      "Shenba",
      "Chen"
    );
    const channel = channelsCreateV1(test2.authUserId, "ShenbaChannel", false);
    expect(
      channelInviteV1(test2.authUserId, channel.channelId, test1.authUserId)
    ).toStrictEqual({});
    expect(channelDetailsV1(test1.authUserId, channel.channelId)).toStrictEqual(
      {
        name: "ShenbaChannel",
        isPublic: false,
        ownerMembers: [
          {
            uId: test2.authUserId,
            email: "test2@gmail.com",
            nameFirst: "Shenba",
            nameLast: "Chen",
            handleStr: "shenbachen",
          },
        ],
        allMembers: [
          {
            uId: test2.authUserId,
            email: "test2@gmail.com",
            nameFirst: "Shenba",
            nameLast: "Chen",
            handleStr: "shenbachen",
          },
          {
            uId: test1.authUserId,
            email: "test1@gmail.com",
            nameFirst: "Richardo",
            nameLast: "Lee",
            handleStr: "richardolee",
          },
        ],
      }
    );
  });
});

describe("Testing channelMessagesV1", () => {
  function messageForTesting(count) {
    const message = [];
    for (let i = 0; i < count; i++) {
      message.push(`Test line`);
    }
    return message;
  }
  test("Test-1: Error, invalid channelId", () => {
    const test1 = authRegisterV1(
      "test1@gmail.com",
      "123456",
      "Richardo",
      "Lee"
    );

    const channel = channelsCreateV1(
      test1.authUserId + 1,
      "RicardoChannel",
      true
    );

    expect(channelMessagesV1(test1.authUserId, 0, 0)).toStrictEqual({
      error: expect.any(String),
    });
  });

  test("Test-2: Error, Invalid uId", () => {
    const test1 = authRegisterV1(
      "test1@gmail.com",
      "123456",
      "Richardo",
      "Lee"
    );

    const channel = channelsCreateV1(test1.authUserId, "RicardoChannel", true);

    expect(
      channelMessagesV1(test1.authUserId + 1, channel.channelId, 0)
    ).toStrictEqual({
      error: expect.any(String),
    });
  });

  test("Test-3: Error, channel is valid but authorised user is not in the channel", () => {
    const test1 = authRegisterV1(
      "test1@gmail.com",
      "123456",
      "Richardo",
      "Lee"
    );
    const test2 = authRegisterV1(
      "test2@gmail.com",
      "1234567",
      "Shenba",
      "Chen"
    );
    const channel = channelsCreateV1(test1.authUserId, "LeeChannel", true);
    expect(
      channelMessagesV1(test2.authUserId, channel.channelId, 0)
    ).toStrictEqual({ error: expect.any(String) });
  });

  test("Test-4: Error, Start greater than total numebr of messages", () => {
    const test1 = authRegisterV1(
      "test1@gmail.com",
      "123456",
      "Richardo",
      "Lee"
    );
    const channel = channelsCreateV1(test1.authUserId, "LeeChannel", true);
    expect(
      channelMessagesV1(test1.authUserId, channel.channelId, 5)
    ).toStrictEqual({ error: expect.any(String) });
  });

  test("Test-5: Success, 0 message output", () => {
    const test1 = authRegisterV1(
      "test1@gmail.com",
      "123456",
      "Richardo",
      "Lee"
    );
    const channel = channelsCreateV1(test1.authUserId, "LeeChannel", true);
    expect(
      channelMessagesV1(test1.authUserId, channel.channelId, 0)
    ).toStrictEqual({
      messages: [],
      start: 0,
      end: -1,
    });
  });
});
