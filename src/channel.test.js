import { clearV1 } from "./other.js";
import {
  channelDetailsV1,
  channelJoinV1,
  channelInviteV1,
  channelMessagesV1,
} from "./channel.js";
import { authLoginV1, authRegisterV1 } from "./auth.js";
import {
  channelsCreateV1,
  channelsListV1,
  channelsListallV1,
} from "./channels.js";

describe("Testing channelDetailsV1", () => {
  beforeEach(() => {
    clearV1();
  });

  test("Test-1: Error, incorrect channelId", () => {
    const test1 = authRegisterV1("test1@gmail.com", "123456", "Richardo", "Li");
    const channelId = channelsCreateV1(
      test1.authUserId,
      "RicardoChannel",
      true
    );
    const channelDetails = channelDetailsV1(test1.authUserId, "Incorrect");
    expect(channelDetails).toStrictEqual({ error: "error" });
  });

  test("Test-2: Error, incorrect authUserId", () => {
    const test1 = authRegisterV1("test1@gmail.com", "123456", "Richardo", "Li");
    const channelId = channelsCreateV1(
      test1.authUserId,
      "RicardoChannel",
      true
    );
    const channelDetails = channelDetailsV1(
      uId1.authUserId + 3,
      channelId.channelId
    );
    expect(channelDetails).toStrictEqual({ error: "error" });
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
    expect(channelDetails).toStrictEqual({ error: "error" });
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
  beforeEach(() => {
    clearV1();
  });

  test("Test-1: Error, channelId does not refer to a valid channel", () => {
    const uId1 = authRegisterV1(
      "z5400001@unsw.edu.au",
      "password1",
      "Molix",
      "Fe"
    );
    const uId2 = authRegisterV1(
      "z5400002@unsw.edu.au",
      "password2",
      "Ryan",
      "Lu"
    );
    const channel1 = channelsCreateV1(uId2.authUserId, "firstChannel", true);

    let result = channelJoinV1(uId1.authUserId, channel1.channelId + 1);
    expect(result).toStrictEqual({ error: "error" });
  });

  test("Test-2: Error, authUserId is already a member of the channel", () => {
    const uId1 = authRegisterV1(
      "z5400001@unsw.edu.au",
      "password1",
      "Molix",
      "Fe"
    );
    const channel1 = channelsCreateV1(uId1.authUserId, "firstChannel", true);

    let result = channelJoinV1(uId1.authUserId, channel1);
    expect(result).toStrictEqual({ error: "error" });
  });

  test("Test-3: Error, private channel, and authUser is not a global owner", () => {
    const uId1 = authRegisterV1(
      "z5400001@unsw.edu.au",
      "password1",
      "Molix",
      "Fe"
    );
    const uId2 = authRegisterV1(
      "z5400002@unsw.edu.au",
      "password2",
      "Ryan",
      "Lu"
    );
    const channel1 = channelsCreateV1(uId1.authUserId, "firstChannel", true);
    const channel2 = channelsCreateV1(uId2.authUserId, "firstChannel", false);

    let result = channelJoinV1(uId2.authUserId, channel2.channelId);
    expect(result).toStrictEqual({ error: "error" });
  });

  test("Test-4: successiful case", () => {
    const uId1 = authRegisterV1(
      "z5400001@unsw.edu.au",
      "password1",
      "Molix",
      "Fe"
    );
    const uId2 = authRegisterV1(
      "z5400002@unsw.edu.au",
      "password2",
      "Ryan",
      "Lu"
    );
    const channel1 = channelsCreateV1(uId2.authUserId, "firstChannel", true);

    let result = channelJoinV1(uId1.authUserId, channel1.channelId);
    expect(result).toStrictEqual({});
  });

  test("Test-5: private channel, but authUser is a global owner", () => {
    const uId1 = authRegisterV1(
      "z5400001@unsw.edu.au",
      "password1",
      "Molix",
      "Fe"
    );
    const uId2 = authRegisterV1(
      "z5400002@unsw.edu.au",
      "password2",
      "Ryan",
      "Lu"
    );
    const channel1 = channelsCreateV1(uId2.authUserId, "firstChannel", false);

    let result = channelJoinV1(uId1.authUserId, channel1.channelId);
    expect(result).toStrictEqual({});
    expect(channelDetailsV1(uId1.authUserId, channel1.channelId)).toStrictEqual(
      {
        name: "firstChannel",
        isPublic: false,
        ownerMembers: [
          {
            uId: uId2.authUserId,
            email: "z5400002@unsw.edu.au",
            nameFirst: "Ryan",
            nameLast: "Lu",
            handleStr: "ryanlu",
          },
        ],
        allMembers: [
          {
            uId: uId2.authUserId,
            email: "z5400002@unsw.edu.au",
            nameFirst: "Ryan",
            nameLast: "Lu",
            handleStr: "ryanlu",
          },
          {
            uId: uId1.authUserId,
            email: "z5400001@unsw.edu.au",
            nameFirst: "Molix",
            nameLast: "Fe",
            handleStr: "molixfe",
          },
        ],
      }
    );
  });
});

describe("channelInviteV1 function testing", () => {
  beforeEach(() => {
    clearV1();
  });

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
      error: "error",
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
      channelInviteV1(test1.authUserId, channel.channelId, test1.authUserId + 3)
    ).toStrictEqual({ error: "error" });
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
    ).toStrictEqual({ error: "error" });
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
    ).toStrictEqual({ error: "error" });
  });

  test("Test-5: Error, invalid authUserId", () => {
    const test1 = authRegisterV1("test@gmail.com", "123456", "Ricardo", "Lee");
    const channel = channelsCreateV1(test1.authUserId, "LeeChannel", true);
    expect(
      channelInviteV1(test1.authUserId + 1, channel.channelId, test1.authUserId)
    ).toStrictEqual({ error: "error" });
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
    ).toStrictEqual({ error: "error" });
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

  //   test("Test-8", () => {
  //     });
  //   });
});

describe("Testing channelMessagesV1", () => {
  beforeEach(() => {
    clearV1();
  });

  function messagesGenerator(number) {
    const message = [];
    for (let i = 0; i < number; i++) {
      message.push("Hello world!");
    }
    return message;
  }

  test("Error 1: authUserId not valid", () => {
    const uId1 = authRegisterV1(
      "z5400001@unsw.edu.au",
      "password1",
      "Molix",
      "Fe"
    );
    const channel = channelsCreateV1(uId1.authUserId, "firstChannel", true);
    expect(
      channelMessagesV1(uId1.authUserId + 1, channel.channelId, 0)
    ).toStrictEqual({ error: "error" });
  });

  test("Error 2: channelId not valid", () => {
    const uId1 = authRegisterV1(
      "z5400001@unsw.edu.au",
      "password1",
      "Molix",
      "Fe"
    );
    expect(channelMessagesV1(uId1.authUserId, 0, 0)).toStrictEqual({
      error: "error",
    });
  });

  test("Error 3: channel is valid but authorised user is not in the channel", () => {
    const uId1 = authRegisterV1(
      "z5400001@unsw.edu.au",
      "password1",
      "Molix",
      "Fe"
    );
    const uId2 = authRegisterV1(
      "z5400002@unsw.edu.au",
      "password2",
      "Ryan",
      "Lu"
    );
    const channel = channelsCreateV1(uId1.authUserId, "firstChannel", true);
    expect(
      channelMessagesV1(uId2.authUserId, channel.channelId, 0)
    ).toStrictEqual({ error: "error" });
  });

  test("Error 4: Start greater than total numebr of messages", () => {
    const uId1 = authRegisterV1(
      "z5400001@unsw.edu.au",
      "password1",
      "Molix",
      "Fe"
    );
    const channel = channelsCreateV1(uId1.authUserId, "firstChannel", true);
    expect(
      channelMessagesV1(uId1.authUserId, channel.channelId, 1)
    ).toStrictEqual({ error: "error" });
  });

  test("Start equals to total number of messages (both 0)", () => {
    const uId1 = authRegisterV1(
      "z5400001@unsw.edu.au",
      "password1",
      "Molix",
      "Fe"
    );
    const channel = channelsCreateV1(uId1.authUserId, "firstChannel", true);
    expect(
      channelMessagesV1(uId1.authUserId, channel.channelId, 0)
    ).toStrictEqual({
      messages: [],
      start: 0,
      end: -1,
    });
  });

  test("Start equals to total number of messages (both 50)", () => {
    const data = getData();
    const uId1 = authRegisterV1(
      "z5400001@unsw.edu.au",
      "password1",
      "Molix",
      "Fe"
    );
    const channel = channelsCreateV1(uId1.authUserId, "firstChannel", true);
    for (let i = 0; i < 50; i++) {
      data.channels[0].messages.push("Hello world!");
    }
    expect(
      channelMessagesV1(uId1.authUserId, channel.channelId, 50)
    ).toStrictEqual({
      messages: [],
      start: 50,
      end: -1,
    });
  });

  test("Start equals to total number of messages (both 101)", () => {
    const data = getData();
    const uId1 = authRegisterV1(
      "z5400001@unsw.edu.au",
      "password1",
      "Molix",
      "Fe"
    );
    const channel = channelsCreateV1(uId1.authUserId, "firstChannel", true);
    for (let i = 0; i < 101; i++) {
      data.channels[0].messages.push("Hello world!");
    }
    expect(
      channelMessagesV1(uId1.authUserId, channel.channelId, 101)
    ).toStrictEqual({
      messages: [],
      start: 101,
      end: -1,
    });
  });

  test("Successfully return 5 messages", () => {
    const data = getData();
    const uId1 = authRegisterV1(
      "z5400001@unsw.edu.au",
      "password1",
      "Molix",
      "Fe"
    );
    const channel = channelsCreateV1(uId1.authUserId, "firstChannel", true);
    for (let j = 0; j < 5; j++) {
      data.channels[0].messages.push("Hello world!");
    }
    expect(
      channelMessagesV1(uId1.authUserId, channel.channelId, 0)
    ).toStrictEqual({
      messages: messagesGenerator(5),
      start: 0,
      end: -1,
    });
  });

  test("Successfully return 50 messages (index 0 to 49) with onlky 50 messages in the channel", () => {
    const data = getData();
    const uId1 = authRegisterV1(
      "z5400001@unsw.edu.au",
      "password1",
      "Molix",
      "Fe"
    );
    const channel = channelsCreateV1(uId1.authUserId, "firstChannel", true);
    for (let j = 0; j < 50; j++) {
      data.channels[0].messages.push("Hello world!");
    }
    expect(
      channelMessagesV1(uId1.authUserId, channel.channelId, 0)
    ).toStrictEqual({
      messages: messagesGenerator(50),
      start: 0,
      end: -1,
    });
  });

  test("Successfully return 50 messages (index 1 to 50) with only 51 messages in the channel", () => {
    const data = getData();
    const uId1 = authRegisterV1(
      "z5400001@unsw.edu.au",
      "password1",
      "Molix",
      "Fe"
    );
    const channel = channelsCreateV1(uId1.authUserId, "firstChannel", true);
    for (let j = 0; j < 51; j++) {
      data.channels[0].messages.push("Hello world!");
    }
    expect(
      channelMessagesV1(uId1.authUserId, channel.channelId, 1)
    ).toStrictEqual({
      messages: messagesGenerator(50),
      start: 1,
      end: -1,
    });
  });

  test("Successfully return 50 messages (index 1 to 50) with 52 messages in the channel", () => {
    const data = getData();
    const uId1 = authRegisterV1(
      "z5400001@unsw.edu.au",
      "password1",
      "Molix",
      "Fe"
    );
    const channel = channelsCreateV1(uId1.authUserId, "firstChannel", true);
    for (let j = 0; j < 52; j++) {
      data.channels[0].messages.push("Hello world!");
    }
    expect(
      channelMessagesV1(uId1.authUserId, channel.channelId, 1)
    ).toStrictEqual({
      messages: messagesGenerator(50),
      start: 1,
      end: 51,
    });
  });

  test("Successfully return 50 messages (index 76 to 125) with 200 messages in the channel", () => {
    const data = getData();
    const uId1 = authRegisterV1(
      "z5400001@unsw.edu.au",
      "password1",
      "Molix",
      "Fe"
    );
    const channel = channelsCreateV1(uId1.authUserId, "firstChannel", true);
    for (let j = 0; j < 200; j++) {
      data.channels[0].messages.push("Hello world!");
    }
    expect(
      channelMessagesV1(uId1.authUserId, channel.channelId, 76)
    ).toStrictEqual({
      messages: messagesGenerator(50),
      start: 76,
      end: 126,
    });
  });

  test("Return 36 messages (index 76 to 111) with 112 messages in the channel", () => {
    const data = getData();
    const uId1 = authRegisterV1(
      "z5400001@unsw.edu.au",
      "password1",
      "Molix",
      "Fe"
    );
    const channel = channelsCreateV1(uId1.authUserId, "firstChannel", true);
    for (let j = 0; j < 112; j++) {
      data.channels[0].messages.push("Hello world!");
    }
    expect(
      channelMessagesV1(uId1.authUserId, channel.channelId, 76)
    ).toStrictEqual({
      messages: messagesGenerator(36),
      start: 76,
      end: -1,
    });
  });

  test("Return all 124 messages - spec section 6.5", () => {
    const data = getData();
    const uId1 = authRegisterV1(
      "z5400001@unsw.edu.au",
      "password1",
      "Molix",
      "Fe"
    );
    const channel = channelsCreateV1(uId1.authUserId, "firstChannel", true);
    for (let j = 0; j < 124; j++) {
      data.channels[0].messages.push("Hello world!");
    }
    expect(
      channelMessagesV1(uId1.authUserId, channel.channelId, 0)
    ).toStrictEqual({
      messages: messagesGenerator(50),
      start: 0,
      end: 50,
    });
    expect(
      channelMessagesV1(uId1.authUserId, channel.channelId, 50)
    ).toStrictEqual({
      messages: messagesGenerator(50),
      start: 50,
      end: 100,
    });
    expect(
      channelMessagesV1(uId1.authUserId, channel.channelId, 100)
    ).toStrictEqual({
      messages: messagesGenerator(24),
      start: 100,
      end: -1,
    });
  });
});
