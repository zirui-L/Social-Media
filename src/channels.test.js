import {
  channelsCreateV1,
  channelsListV1,
  channelsListAllV1,
} from "./channels";

import { authRegisterV1 } from "./auth.js";

import { clearV1 } from "./other.js";

beforeEach(() => {
  clearV1();
});

describe("channelsCreateV1 function testing", () => {
  test("Test-1: lenth of name exceed 20", () => {
    const user = authRegisterV1(
      "test@gmail.com",
      "123455",
      "firstName",
      "lastName"
    );
    const longName = "someNameThatExceedLenthOf20";
    const channelId = channelsCreateV1(user.authUserId, longName, true);
    expect(channelId).toStrictEqual({
      error: expect.any(String),
    });
  });

  test("Test-2: lenth of name less than 1", () => {
    const user = authRegisterV1(
      "test@gmail.com",
      "123455",
      "firstName",
      "lastName"
    );
    const shortName = "";
    const channelId = channelsCreateV1(user.authUserId, shortName, true);
    expect(channelId).toStrictEqual({
      error: expect.any(String),
    });
  });

  test("Test-3: Invalid authUserId", () => {
    const user = authRegisterV1(
      "test@gmail.com",
      "123455",
      "firstName",
      "lastName"
    );
    const name = "validName";
    const channelId = channelsCreateV1(user.authUserId + 1, name, true);
    expect(channelId).toStrictEqual({
      error: expect.any(String),
    });
  });

  test("Test-4: Successful private channel creation", () => {
    const user = authRegisterV1(
      "test@gmail.com",
      "123455",
      "firstName",
      "lastName"
    );
    const name = "validName";
    const channelId = channelsCreateV1(user.authUserId, name, false);
    expect(channelId).toEqual(
      expect.objectContaining({
        channelId: channelId.channelId,
      })
    );
  });

  test("Test-5: Successful public channel creation", () => {
    const user = authRegisterV1(
      "test@gmail.com",
      "123455",
      "firstName",
      "lastName"
    );
    const name = "validName";
    const channelId = channelsCreateV1(user.authUserId, name, true);
    expect(channelId).toEqual(
      expect.objectContaining({
        channelId: channelId.channelId,
      })
    );
  });
});

describe("channelsListV1 function testing", () => {
  test("Test-1: Invalid authUserId", () => {
    const user1 = authRegisterV1("ricky@gmail.com", "123455", "Ricky", "Li");
    expect(channelsListV1(user1.authUserId + 1)).toStrictEqual({
      error: expect.any(String),
    });
  });

  test("Test-2: Testing channelsListV1 with valid authUserId who is a member of one channel", () => {
    const test1 = authRegisterV1(
      "test1@unsw.edu.au",
      "password1",
      "nameFirst1",
      "nameLast1"
    );
    const channel1 = channelsCreateV1(test1.authUserId, "channel", true);
    const arrayList = channelsListV1(test1.authUserId);
    expect(arrayList).toStrictEqual({
      channels: [
        {
          channelId: channel1.channelId,
          name: "channel",
        },
      ],
    });
  });

  test("Test-3: Testing channelsListV1 with no channels", () => {
    const test1 = authRegisterV1(
      "test1@unsw.edu.au",
      "password1",
      "nameFirst1",
      "nameLast1"
    );
    const test2 = authRegisterV1(
      "test2@unsw.edu.au",
      "password2",
      "nameFirst2",
      "nameLast2"
    );
    const channel1 = channelsCreateV1(test2.authUserId, "channel1", true);
    expect(channelsListV1(test1.authUserId)).toStrictEqual({
      channels: [],
    });
  });

  test("Test-4: Member has three channels", () => {
    const test = authRegisterV1(
      "test@unsw.edu.au",
      "123456",
      "nameFirst",
      "nameLast"
    );
    const channel1 = channelsCreateV1(test.authUserId, "channel1", true);
    const channel2 = channelsCreateV1(test.authUserId, "channel2", true);
    const channel3 = channelsCreateV1(test.authUserId, "channel3", true);
    const arrayList = channelsListV1(test.authUserId);
    expect(arrayList).toStrictEqual({
      channels: [
        {
          name: "channel1",
          channelId: channel1.channelId,
        },
        {
          name: "channel2",
          channelId: channel2.channelId,
        },
        {
          name: "channel3",
          channelId: channel3.channelId,
        },
      ],
    });
  });

  test("Test-5: Member of two out of three channels", () => {
    const test1 = authRegisterV1(
      "test1@unsw.edu.au",
      "password1",
      "nameFirst1",
      "nameLast1"
    );
    const test2 = authRegisterV1(
      "test2@unsw.edu.au",
      "password2",
      "nameFirst2",
      "nameLast2"
    );
    const channel1 = channelsCreateV1(test1.authUserId, "channel1", true);
    const channel2 = channelsCreateV1(test2.authUserId, "channel2", true);
    const channel3 = channelsCreateV1(test1.authUserId, "channel3", true);
    const arrayList = channelsListV1(test1.authUserId);
    expect(arrayList).toStrictEqual({
      channels: [
        {
          channelId: channel1.channelId,
          name: "channel1",
        },
        {
          channelId: channel3.channelId,
          name: "channel3",
        },
      ],
    });
  });
});

describe("channelsListAllV1 function testing", () => {
  test("Test-1: Invalid authUserId", () => {
    const user1 = authRegisterV1("ricky@gmail.com", "123455", "Ricky", "Li");
    expect(channelsListAllV1(user1.authUserId + 1)).toStrictEqual({
      error: expect.any(String),
    });
  });

  test("Test-2: Successful function implementation", () => {
    const user1 = authRegisterV1("ricky@gmail.com", "123455", "Ricky", "Li");

    const user2 = authRegisterV1("libro@gmail.com", "123455", "libro", "Zhang");
    const channel1 = channelsCreateV1(user1.authUserId, "Rickychannel", true);
    const channel2 = channelsCreateV1(user2.authUserId, "Librochannel", true);
    const channel3 = channelsCreateV1(user2.authUserId, "Henrychannel", false);

    expect(channelsListAllV1(user1.authUserId)).toEqual({
      channels: [
        {
          name: "Rickychannel",
          channelId: channel1.channelId,
        },
        {
          name: "Librochannel",
          channelId: channel2.channelId,
        },
        {
          name: "Henrychannel",
          channelId: channel3.channelId,
        },
      ],
    });
  });

  test("Test-3: no channels", () => {
    const user1 = authRegisterV1("ricky@gmail.com", "123455", "Ricky", "Li");
    expect(channelsListAllV1(user1.authUserId)).toStrictEqual({
      channels: [],
    });
  });
});
