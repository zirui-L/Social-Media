import {
  requestAuthRegisterV2,
  requestUserProfileV2,
  requestUserProfileSetEmailV1,
  requestUserProfileSetHandleV1,
  requestUserProfileSetNameV1,
  requestUsersAllV1,
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

describe('Testing /user/profile/v2 route', () => {
  test('Test-1: Error, invalid token and valid uId', () => {
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

  test('Test-2: Error, valid token and invalid uId', () => {
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

  test('Test-3: Error, invalid token and invalid uId', () => {
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

describe('Testing /users/all/v1 route', () => {
  test('Test-1: Error, invalid token', () => {
    const test1 = requestAuthRegisterV2(
      'test1@gmail.com',
      '123456',
      'Richardo',
      'Lee'
    );

    const usersAllObj = requestUsersAllV1(test1.bodyObj.token + 1);

    expect(usersAllObj.statusCode).toBe(OK);
    expect(usersAllObj.bodyObj).toStrictEqual(ERROR);
  });

  test('Test-2: Success, only one user', () => {
    const test1 = requestAuthRegisterV2(
      'test1@gmail.com',
      '123456',
      'Richardo',
      'Lee'
    );

    const usersAllObj = requestUsersAllV1(test1.bodyObj.token);

    expect(usersAllObj.statusCode).toBe(OK);
    expect(usersAllObj.bodyObj).toStrictEqual({
      users: [
        {
          uId: test1.bodyObj.authUserId,
          email: 'test1@gmail.com',
          nameFirst: 'Richardo',
          nameLast: 'Lee',
          handleStr: 'richardolee',
        },
      ],
    });
  });

  test('Test-3: Success, mutiple users', () => {
    const test1 = requestAuthRegisterV2(
      'test1@gmail.com',
      'password1',
      'firstName1',
      'lastName1'
    );

    const test2 = requestAuthRegisterV2(
      'test2@gmail.com',
      'password2',
      'firstName2',
      'lastName2'
    );

    const test3 = requestAuthRegisterV2(
      'test3@gmail.com',
      'password3',
      'firstName3',
      'lastName3'
    );

    const usersAllObj = requestUsersAllV1(test1.bodyObj.token);

    expect(usersAllObj.statusCode).toBe(OK);
    expect(usersAllObj.bodyObj).toStrictEqual({
      users: [
        {
          uId: test1.bodyObj.authUserId,
          email: 'test1@gmail.com',
          nameFirst: 'firstName1',
          nameLast: 'lastName1',
          handleStr: 'firstname1lastname1',
        },
        {
          uId: test2.bodyObj.authUserId,
          email: 'test2@gmail.com',
          nameFirst: 'firstName2',
          nameLast: 'lastName2',
          handleStr: 'firstname2lastname2',
        },
        {
          uId: test3.bodyObj.authUserId,
          email: 'test3@gmail.com',
          nameFirst: 'firstName3',
          nameLast: 'lastName3',
          handleStr: 'firstname3lastname3',
        },
      ],
    });
  });
});

describe('Testing /user/profile/setname/v1 route', () => {
  test('Test-1: Error, invalid token', () => {
    const test1 = requestAuthRegisterV2(
      'test1@gmail.com',
      'password1',
      'firstName1',
      'lastName1'
    );
    const usersProfileSetnameObj = requestUserProfileSetNameV1(
      test1.bodyObj.token + 1,
      'Richardo',
      'Lee'
    );

    expect(usersProfileSetnameObj.statusCode).toBe(OK);
    expect(usersProfileSetnameObj.bodyObj).toStrictEqual(ERROR);
  });

  test('Test-2: Error, length of first name is not between 1 and 50', () => {
    const test1 = requestAuthRegisterV2(
      'test1@gmail.com',
      'password1',
      'firstName1',
      'lastName1'
    );

    // first name length lower than 1
    const usersProfileSetnameObj = requestUserProfileSetNameV1(
      test1.bodyObj.token,
      '',
      'Lee'
    );

    expect(usersProfileSetnameObj.statusCode).toBe(OK);
    expect(usersProfileSetnameObj.bodyObj).toStrictEqual(ERROR);

    // first name length greater than 50
    const usersProfileSetnameObj1 = requestUserProfileSetNameV1(
      test1.bodyObj.token,
      '3.1415926535897932384626433832795028841971693993751',
      'Lee'
    );

    expect(usersProfileSetnameObj1.statusCode).toBe(OK);
    expect(usersProfileSetnameObj1.bodyObj).toStrictEqual(ERROR);
  });

  test('Test-3: Error, length of last name is not between 1 and 50', () => {
    const test1 = requestAuthRegisterV2(
      'test1@gmail.com',
      'password1',
      'firstName1',
      'lastName1'
    );

    // last name length lower than 1
    const usersProfileSetnameObj = requestUserProfileSetNameV1(
      test1.bodyObj.token,
      'Richardo',
      ''
    );

    expect(usersProfileSetnameObj.statusCode).toBe(OK);
    expect(usersProfileSetnameObj.bodyObj).toStrictEqual(ERROR);

    // last name length greater than 50
    const usersProfileSetnameObj1 = requestUserProfileSetNameV1(
      test1.bodyObj.token,
      'Richardo',
      '3.1415926535897932384626433832795028841971693993751'
    );

    expect(usersProfileSetnameObj1.statusCode).toBe(OK);
    expect(usersProfileSetnameObj1.bodyObj).toStrictEqual(ERROR);
  });

  test('Test-4: Success in resetting name', () => {
    const test1 = requestAuthRegisterV2(
      'test1@gmail.com',
      'password1',
      'firstName1',
      'lastName1'
    );

    const usersProfileSetnameObj = requestUserProfileSetNameV1(
      test1.bodyObj.token,
      'Richardo',
      'Lee'
    );

    expect(usersProfileSetnameObj.statusCode).toBe(OK);
    expect(usersProfileSetnameObj.bodyObj).toStrictEqual({});

    const userProfileObj = requestUserProfileV2(
      test1.bodyObj.token,
      test1.bodyObj.authUserId
    ).bodyObj;

    expect(userProfileObj).toStrictEqual({
      user: {
        uId: test1.bodyObj.authUserId,
        email: 'test1@gmail.com',
        nameFirst: 'Richardo',
        nameLast: 'Lee',
        handleStr: 'firstname1lastname1',
      },
    });
  });
});

describe('Testing /users/all/v1 route', () => {
  test('Test-1: Error, invalid token', () => {
    const test1 = requestAuthRegisterV2(
      'test1@gmail.com',
      '123456',
      'Richardo',
      'Lee'
    );

    const usersAllObj = requestUsersAllV1(test1.bodyObj.token + 1);

    expect(usersAllObj.statusCode).toBe(OK);
    expect(usersAllObj.bodyObj).toStrictEqual(ERROR);
  });

  test('Test-2: Success, only one user', () => {
    const test1 = requestAuthRegisterV2(
      'test1@gmail.com',
      '123456',
      'Richardo',
      'Lee'
    );

    const usersAllObj = requestUsersAllV1(test1.bodyObj.token);

    expect(usersAllObj.statusCode).toBe(OK);
    expect(usersAllObj.bodyObj).toStrictEqual({
      users: [
        {
          uId: test1.bodyObj.authUserId,
          email: 'test1@gmail.com',
          nameFirst: 'Richardo',
          nameLast: 'Lee',
          handleStr: 'richardolee',
        },
      ],
    });
  });

  test('Test-3: Success, mutiple users', () => {
    const test1 = requestAuthRegisterV2(
      'test1@gmail.com',
      'password1',
      'firstName1',
      'lastName1'
    );

    const test2 = requestAuthRegisterV2(
      'test2@gmail.com',
      'password2',
      'firstName2',
      'lastName2'
    );

    const test3 = requestAuthRegisterV2(
      'test3@gmail.com',
      'password3',
      'firstName3',
      'lastName3'
    );

    const usersAllObj = requestUsersAllV1(test1.bodyObj.token);

    expect(usersAllObj.statusCode).toBe(OK);
    expect(usersAllObj.bodyObj).toStrictEqual({
      users: [
        {
          uId: test1.bodyObj.authUserId,
          email: 'test1@gmail.com',
          nameFirst: 'firstName1',
          nameLast: 'lastName1',
          handleStr: 'firstname1lastname1',
        },
        {
          uId: test2.bodyObj.authUserId,
          email: 'test2@gmail.com',
          nameFirst: 'firstName2',
          nameLast: 'lastName2',
          handleStr: 'firstname2lastname2',
        },
        {
          uId: test3.bodyObj.authUserId,
          email: 'test3@gmail.com',
          nameFirst: 'firstName3',
          nameLast: 'lastName3',
          handleStr: 'firstname3lastname3',
        },
      ],
    });
  });
});

describe('Testing /user/profile/setname/v1 route', () => {
  test('Test-1: Error, invalid token', () => {
    const test1 = requestAuthRegisterV2(
      'test1@gmail.com',
      'password1',
      'firstName1',
      'lastName1'
    );
    const usersProfileSetnameObj = requestUserProfileSetNameV1(
      test1.bodyObj.token + 1,
      'Richardo',
      'Lee'
    );

    expect(usersProfileSetnameObj.statusCode).toBe(OK);
    expect(usersProfileSetnameObj.bodyObj).toStrictEqual(ERROR);
  });

  test('Test-2: Error, length of first name is not between 1 and 50', () => {
    const test1 = requestAuthRegisterV2(
      'test1@gmail.com',
      'password1',
      'firstName1',
      'lastName1'
    );

    // first name length lower than 1
    const usersProfileSetnameObj = requestUserProfileSetNameV1(
      test1.bodyObj.token,
      '',
      'Lee'
    );

    expect(usersProfileSetnameObj.statusCode).toBe(OK);
    expect(usersProfileSetnameObj.bodyObj).toStrictEqual(ERROR);

    // first name length greater than 50
    const usersProfileSetnameObj1 = requestUserProfileSetNameV1(
      test1.bodyObj.token,
      '3.1415926535897932384626433832795028841971693993751',
      'Lee'
    );

    expect(usersProfileSetnameObj1.statusCode).toBe(OK);
    expect(usersProfileSetnameObj1.bodyObj).toStrictEqual(ERROR);
  });

  test('Test-3: Error, length of last name is not between 1 and 50', () => {
    const test1 = requestAuthRegisterV2(
      'test1@gmail.com',
      'password1',
      'firstName1',
      'lastName1'
    );

    // last name length lower than 1
    const usersProfileSetnameObj = requestUserProfileSetNameV1(
      test1.bodyObj.token,
      'Richardo',
      ''
    );

    expect(usersProfileSetnameObj.statusCode).toBe(OK);
    expect(usersProfileSetnameObj.bodyObj).toStrictEqual(ERROR);

    // last name length greater than 50
    const usersProfileSetnameObj1 = requestUserProfileSetNameV1(
      test1.bodyObj.token,
      'Richardo',
      '3.1415926535897932384626433832795028841971693993751'
    );

    expect(usersProfileSetnameObj1.statusCode).toBe(OK);
    expect(usersProfileSetnameObj1.bodyObj).toStrictEqual(ERROR);
  });

  test('Test-4: Success in resetting name', () => {
    const test1 = requestAuthRegisterV2(
      'test1@gmail.com',
      'password1',
      'firstName1',
      'lastName1'
    );

    const usersProfileSetnameObj = requestUserProfileSetNameV1(
      test1.bodyObj.token,
      'Richardo',
      'Lee'
    );

    expect(usersProfileSetnameObj.statusCode).toBe(OK);
    expect(usersProfileSetnameObj.bodyObj).toStrictEqual({});

    const userProfileObj = requestUserProfileV2(
      test1.bodyObj.token,
      test1.bodyObj.authUserId
    ).bodyObj;

    expect(userProfileObj).toStrictEqual({
      user: {
        uId: test1.bodyObj.authUserId,
        email: 'test1@gmail.com',
        nameFirst: 'Richardo',
        nameLast: 'Lee',
        handleStr: 'firstname1lastname1',
      },
    });
  });
});

describe('Testing /user/profile/setemail/v1 route', () => {
  test('Test-1: Error, invalid token', () => {
    const test1 = requestAuthRegisterV2(
      'test1@gmail.com',
      'password1',
      'firstName1',
      'lastName1'
    );
    const usersProfileSetEmailObj = requestUserProfileSetEmailV1(
      test1.bodyObj.token + 1,
      'test1@ad.unsw.edu.au'
    );

    expect(usersProfileSetEmailObj.statusCode).toBe(OK);
    expect(usersProfileSetEmailObj.bodyObj).toStrictEqual(ERROR);
  });

  test('Test-2: Error, email entered is not a valid email', () => {
    const test1 = requestAuthRegisterV2(
      'test1@gmail.com',
      'password1',
      'firstName1',
      'lastName1'
    );

    const usersProfileSetEmailObj = requestUserProfileSetEmailV1(
      test1.bodyObj.token,
      'test1##ad.unsw.edu.au'
    );

    expect(usersProfileSetEmailObj.statusCode).toBe(OK);
    expect(usersProfileSetEmailObj.bodyObj).toStrictEqual(ERROR);
  });

  test('Test-3: Error, email address is already being used by another user', () => {
    const test1 = requestAuthRegisterV2(
      'test1@gmail.com',
      'password1',
      'firstName1',
      'lastName1'
    );

    requestAuthRegisterV2(
      'test2@gmail.com',
      'password2',
      'firstName2',
      'lastName2'
    );

    const usersProfileSetEmailObj = requestUserProfileSetEmailV1(
      test1.bodyObj.token,
      'test2@gmail.com'
    );

    expect(usersProfileSetEmailObj.statusCode).toBe(OK);
    expect(usersProfileSetEmailObj.bodyObj).toStrictEqual(ERROR);
  });

  test('Test-4: Success in resetting email', () => {
    const test1 = requestAuthRegisterV2(
      'test1@gmail.com',
      'password1',
      'firstName1',
      'lastName1'
    );

    const usersProfileSetEmailObj = requestUserProfileSetEmailV1(
      test1.bodyObj.token,
      'test1@ad.unsw.edu.au'
    );

    expect(usersProfileSetEmailObj.statusCode).toBe(OK);
    expect(usersProfileSetEmailObj.bodyObj).toStrictEqual({});

    const userProfileObj = requestUserProfileV2(
      test1.bodyObj.token,
      test1.bodyObj.authUserId
    ).bodyObj;

    expect(userProfileObj).toStrictEqual({
      user: {
        uId: test1.bodyObj.authUserId,
        email: 'test1@ad.unsw.edu.au',
        nameFirst: 'firstName1',
        nameLast: 'lastName1',
        handleStr: 'firstname1lastname1',
      },
    });
  });
});

describe('Testing /user/profile/sethandle/v1 route', () => {
  test('Test-1: Error, invalid token', () => {
    const test1 = requestAuthRegisterV2(
      'test1@gmail.com',
      'password1',
      'firstName1',
      'lastName1'
    );
    const usersProfileSetHandleObj = requestUserProfileSetHandleV1(
      test1.bodyObj.token + 1,
      'newhandlestring'
    );

    expect(usersProfileSetHandleObj.statusCode).toBe(OK);
    expect(usersProfileSetHandleObj.bodyObj).toStrictEqual(ERROR);
  });

  test('Test-2: Error, length of handleStr is not between 3 and 20 characters inclusive', () => {
    const test1 = requestAuthRegisterV2(
      'test1@gmail.com',
      'password1',
      'firstName1',
      'lastName1'
    );

    // length of handleStr is less than 3
    const usersProfileSetHandleObj = requestUserProfileSetHandleV1(
      test1.bodyObj.token,
      '12'
    );

    expect(usersProfileSetHandleObj.statusCode).toBe(OK);
    expect(usersProfileSetHandleObj.bodyObj).toStrictEqual(ERROR);

    // length of handleStr is greater than 20
    const usersProfileSetHandleObj1 = requestUserProfileSetHandleV1(
      test1.bodyObj.token,
      '314159265358979323846264338327'
    );

    expect(usersProfileSetHandleObj1.statusCode).toBe(OK);
    expect(usersProfileSetHandleObj1.bodyObj).toStrictEqual(ERROR);

    // empty handle string
    const usersProfileSetHandleObj2 = requestUserProfileSetHandleV1(
      test1.bodyObj.token,
      ''
    );

    expect(usersProfileSetHandleObj2.statusCode).toBe(OK);
    expect(usersProfileSetHandleObj2.bodyObj).toStrictEqual(ERROR);
  });

  test('Test-3: Error, handleStr contains characters that are not alphanumeric', () => {
    const test1 = requestAuthRegisterV2(
      'test1@gmail.com',
      'password1',
      'firstName1',
      'lastName1'
    );

    const usersProfileSetHandleObj = requestUserProfileSetHandleV1(
      test1.bodyObj.token,
      '!@#$%%^&*()(*&^%$#@'
    );

    expect(usersProfileSetHandleObj.statusCode).toBe(OK);
    expect(usersProfileSetHandleObj.bodyObj).toStrictEqual(ERROR);
  });

  test('Test-4: Error, the handle is already used by another user', () => {
    const test1 = requestAuthRegisterV2(
      'test1@gmail.com',
      'password1',
      'firstName1',
      'lastName1'
    );

    const test2 = requestAuthRegisterV2(
      'test2@gmail.com',
      'password2',
      'firstName2',
      'lastName2'
    );

    const usersProfileSetHandleObj = requestUserProfileSetHandleV1(
      test1.bodyObj.token,
      '12345'
    );

    expect(usersProfileSetHandleObj.bodyObj).toStrictEqual({});

    const usersProfileSetHandleObj1 = requestUserProfileSetHandleV1(
      test2.bodyObj.token,
      '12345'
    );

    expect(usersProfileSetHandleObj1.statusCode).toBe(OK);
    expect(usersProfileSetHandleObj1.bodyObj).toStrictEqual(ERROR);
  });

  test('Test-5: Success in resetting email', () => {
    const test1 = requestAuthRegisterV2(
      'test1@gmail.com',
      'password1',
      'firstName1',
      'lastName1'
    );

    const usersProfileSetHandleObj = requestUserProfileSetHandleV1(
      test1.bodyObj.token,
      '12345'
    );

    expect(usersProfileSetHandleObj.statusCode).toBe(OK);
    expect(usersProfileSetHandleObj.bodyObj).toStrictEqual({});

    const userProfileObj = requestUserProfileV2(
      test1.bodyObj.token,
      test1.bodyObj.authUserId
    ).bodyObj;

    expect(userProfileObj).toStrictEqual({
      user: {
        uId: test1.bodyObj.authUserId,
        email: 'test1@gmail.com',
        nameFirst: 'firstName1',
        nameLast: 'lastName1',
        handleStr: '12345',
      },
    });
  });
});
