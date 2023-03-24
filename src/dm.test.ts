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
  requestDmCreateV1,
  requestDmListV1,
  requestDmRemoveV1,
  requestDmDetailsV1,
  requestDmLeaveV1,
  requestDmMessagesV1,
} from "./helperServer";

const OK = 200;
const ERROR = { error: expect.any(String) };

beforeEach(() => {
  requestClearV1();
});

afterEach(() => {
  requestClearV1();
});

describe("Testing /dm/create/v1", () => {
  test("Test-1: Error, incorrect uId in uIds", () => {
    const user1 = requestAuthRegisterV2("test1@gmail.com", "123456", "Richardo", "Li").bodyObj;
    const user2 = requestAuthRegisterV2("test2@gmail.com", "1234567", "Shenba", "Chen").bodyObj;
    const DmCreate = requestDmCreateV1(user1.token, [user2.authUserId + 1]);
    expect(DmCreate.statusCode).toBe(OK);
    expect(DmCreate.bodyObj).toStrictEqual(ERROR);
  });

  test("Test-2: Error, duplicate uId in uIds", () => {
    const user1 = requestAuthRegisterV2("test1@gmail.com", "123456", "Richardo", "Li").bodyObj;
    const user2 = requestAuthRegisterV2("test2@gmail.com", "1234567", "Shenba", "Chen").bodyObj;
    const DmCreate = requestDmCreateV1(user1.token, [user2.authUserId, user2.authUserId]);
    expect(DmCreate.statusCode).toBe(OK);
    expect(DmCreate.bodyObj).toStrictEqual(ERROR);
  });

  test("Test-3: Error, invalid token", () => {
    const user1 = requestAuthRegisterV2("test1@gmail.com", "123456", "Richardo", "Li").bodyObj;
    const user2 = requestAuthRegisterV2("test2@gmail.com", "1234567", "Shenba", "Chen").bodyObj;
    const DmCreate = requestDmCreateV1(user1.token + 1, [user2.authUserId]);
    expect(DmCreate.statusCode).toBe(OK);
    expect(DmCreate.bodyObj).toStrictEqual(ERROR);
  });

  test("Test-4, correct input parameters", () => {
    const user1 = requestAuthRegisterV2("test1@gmail.com", "123456", "Richardo", "Li").bodyObj;
    const user2 = requestAuthRegisterV2("test2@gmail.com", "1234567", "Shenba", "Chen").bodyObj;
    const DmCreate = requestDmCreateV1(user1.token, [user2.authUserId]);
    expect(DmCreate.statusCode).toBe(OK);
    expect(DmCreate.bodyObj).toStrictEqual({dmId: expect.any(Number)});
  });
});