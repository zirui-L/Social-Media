import { getData } from "./dataStore";
import { clearV1 } from "./other.js";

test("clear all register channels", () => {
  const data = getData();

  data.channels.push({
    name: "jeffchannel",
    channelId: 404,
    isPublic: true,
    allMembers: [201, 202, 203],
    ownerMembers: [201, 202, 203],
    message: [
      {
        messageId: 9000,
        uId: 100,
        message: "I Love COMP1531",
        timeSent: 1677712906,
      },
      {
        messageId: 8999,
        uId: 200,
        message: "I Love COMP1531 very much",
        timeSent: 1677712922,
      },
    ],
  });

  clearV1();

  expect(data.users).toStrictEqual([]);
  expect(data.channels).toStrictEqual([]);
});

test("clear all register users", () => {
  const data = getData();

  data.users.push({
    authUserId: 100,
    nameFirst: "Jeff",
    nameLast: "Zhang",
    handleStr: "jeffzhang",
    email: "jeffzhang@gmail.com",
    password: "password",
    channels: [1, 2],
    permissionId: "1",
  });

  clearV1();

  expect(data.users).toStrictEqual([]);
  expect(data.channels).toStrictEqual([]);
});

test("clear created channels and users", () => {
  const data = getData();

  data.users.push({
    authUserId: 100,
    nameFirst: "Jeff",
    nameLast: "Zhang",
    handleStr: "jeffzhang",
    email: "jeffzhang@gmail.com",
    password: "password",
    channels: [1, 2],
    permissionId: "1",
  });

  data.channels.push({
    name: "jeffchannel",
    channelId: 404,
    isPublic: true,
    allMembers: [201, 202, 203],
    ownerMembers: [201, 202, 203],
    message: [
      {
        messageId: 9000,
        uId: 100,
        message: "I Love COMP1531",
        timeSent: 1677712906,
      },
      {
        messageId: 8999,
        uId: 200,
        message: "I Love COMP1531 very much",
        timeSent: 1677712922,
      },
    ],
  });

  clearV1();

  expect(data.users).toStrictEqual([]);
  expect(data.channels).toStrictEqual([]);
});
