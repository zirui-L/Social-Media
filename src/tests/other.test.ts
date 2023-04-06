import {
  requestAuthRegisterV2,
  requestClearV1,
  requestUserProfileV2,
} from '../helperFunctions/helperServer';

const OK = 200;
const ERROR = { error: expect.any(String) };

beforeEach(() => {
  requestClearV1();
});

afterEach(() => {
  requestClearV1();
});

test('clear all register users', () => {
  const test1 = requestAuthRegisterV2(
    'test1@gmail.com',
    '123456',
    'Richardo',
    'Li'
  );

  const clearObj = requestClearV1();
  expect(clearObj.statusCode).toBe(OK);
  expect(clearObj.bodyObj).toStrictEqual({});

  const userProfileObj = requestUserProfileV2(
    test1.bodyObj.token,
    test1.bodyObj.authUserId
  );

  expect(userProfileObj.bodyObj).toStrictEqual(ERROR);
});

test('clear empty channels and users', () => {
  const clearObj = requestClearV1();
  expect(clearObj.statusCode).toBe(OK);
  expect(clearObj.bodyObj).toStrictEqual({});
});
