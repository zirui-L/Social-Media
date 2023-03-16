import { clearV1 } from "./other.js";
import { authRegisterV1, authLoginV1 } from "./auth.js";
import { channelsCreateV1, channelsListAllV1 } from "./channels.js";
const ERROR = { error: expect.any(String) };

beforeEach(() => {
  clearV1();
});

test("clear all register channels", () => {
  const test1 = authRegisterV1("test1@gmail.com", "123456", "Richardo", "Li");
  const channelId = channelsCreateV1(test1.authUserId, "RicardoChannel", true);
  const channelId2 = channelsCreateV1(
    test1.authUserId,
    "RicardoChannel2",
    true
  );

  clearV1();

  expect(channelsListAllV1(test1)).toStrictEqual(ERROR);
  expect(channelsCreateV1(test1, "COMP1531", true)).toStrictEqual(ERROR);
  expect(authLoginV1("test1@gmail.com", "123456")).toStrictEqual(ERROR);
});

test("clear all register users", () => {
  const test1 = authRegisterV1("test1@gmail.com", "123456", "Richardo", "Li");
  const test2 = authRegisterV1("test2@gmail.com", "1234567", "Shenba", "Chen");
  const test3 = authRegisterV1("test3@gmail.com", "12345678", "Kunda", "Yu");

  clearV1();

  expect(channelsListAllV1(test1)).toStrictEqual(ERROR);
  expect(channelsCreateV1(test1, "COMP1531", true)).toStrictEqual(ERROR);
  expect(authLoginV1("test1@gmail.com", "123456")).toStrictEqual(ERROR);
});

test("clear created channels and multiple users", () => {
  const test1 = authRegisterV1("test1@gmail.com", "123456", "Richardo", "Li");
  const test2 = authRegisterV1("test2@gmail.com", "1234567", "Shenba", "Chen");
  const test3 = authRegisterV1("test3@gmail.com", "12345678", "Kunda", "Yu");
  const channelId1 = channelsCreateV1(test1.authUserId, "RicardoChannel", true);
  const channelId2 = channelsCreateV1(test2.authUserId, "ShenbaChannel", true);
  const channelId3 = channelsCreateV1(test3.authUserId, "KundaChannel", true);

  clearV1();

  expect(channelsListAllV1(test1)).toStrictEqual(ERROR);
  expect(channelsCreateV1(test1, "COMP1531", true)).toStrictEqual(ERROR);
  expect(authLoginV1("test1@gmail.com", "123456")).toStrictEqual(ERROR);
});

test("clear empty channels and users", () => {
  clearV1();

  expect(channelsListAllV1("test1")).toStrictEqual(ERROR);
  expect(channelsCreateV1("test1", "COMP1531", true)).toStrictEqual(ERROR);
  expect(authLoginV1("test1@gmail.com", "123456")).toStrictEqual(ERROR);
});
