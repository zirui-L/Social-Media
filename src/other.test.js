import { clearV1 } from "./other.js";
import { authRegisterV1 } from "./auth.js";
import { channelsCreateV1 } from "./channels.js";
import { getData } from "./dataStore.js";

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

  expect(getData().users).toStrictEqual([]);
  expect(getData().channels).toStrictEqual([]);
});

test("clear all register users", () => {
  const test1 = authRegisterV1("test1@gmail.com", "123456", "Richardo", "Li");
  const test2 = authRegisterV1("test2@gmail.com", "1234567", "Shenba", "Chen");
  const test3 = authRegisterV1("test3@gmail.com", "12345678", "Kunda", "Yu");

  clearV1();

  expect(getData().users).toStrictEqual([]);
  expect(getData().channels).toStrictEqual([]);
});

test("clear created channels and multiple users", () => {
  const test1 = authRegisterV1("test1@gmail.com", "123456", "Richardo", "Li");
  const test2 = authRegisterV1("test2@gmail.com", "1234567", "Shenba", "Chen");
  const test3 = authRegisterV1("test3@gmail.com", "12345678", "Kunda", "Yu");
  const channelId1 = channelsCreateV1(test1.authUserId, "RicardoChannel", true);
  const channelId2 = channelsCreateV1(test2.authUserId, "ShenbaChannel", true);
  const channelId3 = channelsCreateV1(test3.authUserId, "KundaChannel", true);

  clearV1();

  expect(getData().users).toStrictEqual([]);
  expect(getData().channels).toStrictEqual([]);
});

test("clear empty channels and users", () => {
  clearV1();

  expect(getData().users).toStrictEqual([]);
  expect(getData().channels).toStrictEqual([]);
});
