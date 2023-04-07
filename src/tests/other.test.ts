import {
  requestAuthRegister,
  requestClear,
  requestUserProfile,
  BAD_REQUEST,
  FORBIDDEN,
  OK,
} from '../helperFunctions/helperServer';

beforeEach(() => {
  requestClear();
});

afterEach(() => {
  requestClear();
});

test('clear all register users', () => {
  const test1 = requestAuthRegister(
    'test1@gmail.com',
    '123456',
    'Richardo',
    'Li'
  );

  const clearObj = requestClear();
  expect(clearObj.statusCode).toBe(OK);
  expect(clearObj.bodyObj).toStrictEqual({});

  const userProfileObj = requestUserProfile(
    test1.bodyObj.token,
    test1.bodyObj.authUserId
  );

  expect(userProfileObj.bodyObj).toStrictEqual(undefined);
});

test('clear empty channels and users', () => {
  const clearObj = requestClear();
  expect(clearObj.statusCode).toBe(OK);
  expect(clearObj.bodyObj).toStrictEqual({});
});
