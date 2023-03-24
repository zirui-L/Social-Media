import {
  requestAuthRegisterV2,
  requestUserProfileV2,
  requestClearV1,
} from './helperServer';

const OK = 200;
const ERROR = { error: expect.any(String) };

beforeEach(() => {
  requestClearV1();
});

afterEach(() => {
  requestClearV1();
});

describe('Testing requestUserProfileV2', () => {
  test('Test-1: Error, invalid authUserId and valid uId', () => {
    const test1 = requestAuthRegisterV2(
      'test1@gmail.com',
      '123456',
      'Richardo',
      'Lee'
    );

    const userProfileObj = requestUserProfileV2(
      test1.bodyObj.token + 1,
      test1.bodyObj.authUserId
    );
    expect(userProfileObj.statusCode).toBe(OK);
    expect(userProfileObj.bodyObj).toStrictEqual(ERROR);
  });

  test('Test-2: Error, valid authUserId and invalid uId', () => {
    const test1 = requestAuthRegisterV2(
      'test1@gmail.com',
      '123456',
      'Richardo',
      'Lee'
    );

    const userProfileObj = requestUserProfileV2(
      test1.bodyObj.token,
      test1.bodyObj.authUserId + 1
    );
    expect(userProfileObj.statusCode).toBe(OK);
    expect(userProfileObj.bodyObj).toStrictEqual(ERROR);
  });

  test('Test-3: Error, invalid authUserId and invalid uId', () => {
    const userProfileObj = requestUserProfileV2('0', 0);
    expect(userProfileObj.statusCode).toBe(OK);
    expect(userProfileObj.bodyObj).toStrictEqual(ERROR);
  });

  test('Test-4: Sucess case', () => {
    const test1 = requestAuthRegisterV2(
      'test1@gmail.com',
      '123456',
      'Richardo',
      'Lee'
    );
    const test2 = requestAuthRegisterV2(
      'test2@gmail.com',
      '1234567',
      'Shenba',
      'Chen'
    );

    const userProfileObj = requestUserProfileV2(
      test1.bodyObj.token,
      test2.bodyObj.authUserId
    );
    expect(userProfileObj.statusCode).toBe(OK);

    expect(userProfileObj.bodyObj).toStrictEqual({
      user: {
        uId: test2.bodyObj.authUserId,
        email: 'test2@gmail.com',
        nameFirst: 'Shenba',
        nameLast: 'Chen',
        handleStr: 'shenbachen',
      },
    });
  });

  test('Test-5, Success with same authUserId and uId', () => {
    const test1 = requestAuthRegisterV2(
      'test1@gmail.com',
      '123456',
      'Richardo',
      'Lee'
    );

    const userProfileObj = requestUserProfileV2(
      test1.bodyObj.token,
      test1.bodyObj.authUserId
    );
    expect(userProfileObj.statusCode).toBe(OK);

    expect(userProfileObj.bodyObj).toStrictEqual({
      user: {
        uId: test1.bodyObj.authUserId,
        email: 'test1@gmail.com',
        nameFirst: 'Richardo',
        nameLast: 'Lee',
        handleStr: 'richardolee',
      },
    });
  });
});
