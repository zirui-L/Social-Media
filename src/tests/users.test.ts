import {
  requestAuthRegisterV2,
  requestUserProfileV2,
  requestUserProfileSetEmailV1,
  requestUserProfileSetHandleV1,
  requestUserProfileSetNameV1,
  requestUsersAllV1,
  requestClearV1,
} from '../helperFunctions/helperServer';

const OK = 200;
const ERROR = { error: expect.any(String) };
// clear data before each test
beforeEach(() => {
  requestClearV1();
});
// clear data after each test
afterEach(() => {
  requestClearV1();
});

describe('Testing /user/profile/v2 route', () => {
  test('Test-1: Error, invalid token and valid uId', () => {
    // create a new user
    const test1 = requestAuthRegisterV2(
      'test1@gmail.com',
      '123456',
      'Richardo',
      'Lee'
    );
    // test function with invalid token
    const userProfileObj = requestUserProfileV2(
      test1.bodyObj.token + 1,
      test1.bodyObj.authUserId
    );
    // expect funtion to run and return an error
    expect(userProfileObj.statusCode).toBe(OK);
    expect(userProfileObj.bodyObj).toStrictEqual(ERROR);
  });

  test('Test-2: Error, valid token and invalid uId', () => {
    // create a new user
    const test1 = requestAuthRegisterV2(
      'test1@gmail.com',
      '123456',
      'Richardo',
      'Lee'
    );
    // test function with invalid authUserId
    const userProfileObj = requestUserProfileV2(
      test1.bodyObj.token,
      test1.bodyObj.authUserId + 1
    );
    // expect function to run and return an error
    expect(userProfileObj.statusCode).toBe(OK);
    expect(userProfileObj.bodyObj).toStrictEqual(ERROR);
  });

  test('Test-3: Error, invalid token and invalid uId', () => {
    // test function with invalid token and invalid authUserId
    const userProfileObj = requestUserProfileV2('0', 0);
    // expect funtion to run and return an error
    expect(userProfileObj.statusCode).toBe(OK);
    expect(userProfileObj.bodyObj).toStrictEqual(ERROR);
  });

  test('Test-4: Sucess case', () => {
    // create new users
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
    // test function with correct && valid inputs
    const userProfileObj = requestUserProfileV2(
      test1.bodyObj.token,
      test2.bodyObj.authUserId
    );
    // verify output
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
    // create a new user
    const test1 = requestAuthRegisterV2(
      'test1@gmail.com',
      '123456',
      'Richardo',
      'Lee'
    );
    // test function with correct inputs
    const userProfileObj = requestUserProfileV2(
      test1.bodyObj.token,
      test1.bodyObj.authUserId
    );
    // verify output
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
    // create a new user
    const test1 = requestAuthRegisterV2(
      'test1@gmail.com',
      '123456',
      'Richardo',
      'Lee'
    );
    // test function with invalid token
    const usersAllObj = requestUsersAllV1(test1.bodyObj.token + 1);
    // expect function to run and return an error
    expect(usersAllObj.statusCode).toBe(OK);
    expect(usersAllObj.bodyObj).toStrictEqual(ERROR);
  });

  test('Test-2: Success, only one user', () => {
    // create a new user
    const test1 = requestAuthRegisterV2(
      'test1@gmail.com',
      '123456',
      'Richardo',
      'Lee'
    );
    // test function with correct input
    const usersAllObj = requestUsersAllV1(test1.bodyObj.token);
    // verify output
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
    // create new users
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
    // test function with correct input
    const usersAllObj = requestUsersAllV1(test1.bodyObj.token);
    // verify output
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
    // create a new user
    const test1 = requestAuthRegisterV2(
      'test1@gmail.com',
      'password1',
      'firstName1',
      'lastName1'
    );
    // test funciton with invalid token
    const usersProfileSetnameObj = requestUserProfileSetNameV1(
      test1.bodyObj.token + 1,
      'Richardo',
      'Lee'
    );
    // expect function to run and return an error
    expect(usersProfileSetnameObj.statusCode).toBe(OK);
    expect(usersProfileSetnameObj.bodyObj).toStrictEqual(ERROR);
  });

  test('Test-2: Error, length of first name is not between 1 and 50', () => {
    // create a new user
    const test1 = requestAuthRegisterV2(
      'test1@gmail.com',
      'password1',
      'firstName1',
      'lastName1'
    );

    // test function with invalid first name (length lower than 1)
    const usersProfileSetnameObj = requestUserProfileSetNameV1(
      test1.bodyObj.token,
      '',
      'Lee'
    );
    // expect function to run and return an error
    expect(usersProfileSetnameObj.statusCode).toBe(OK);
    expect(usersProfileSetnameObj.bodyObj).toStrictEqual(ERROR);

    // test function with invalid first name (length greater than 50)
    const usersProfileSetnameObj1 = requestUserProfileSetNameV1(
      test1.bodyObj.token,
      '3.1415926535897932384626433832795028841971693993751',
      'Lee'
    );
    // expect function to run and return an error
    expect(usersProfileSetnameObj1.statusCode).toBe(OK);
    expect(usersProfileSetnameObj1.bodyObj).toStrictEqual(ERROR);
  });

  test('Test-3: Error, length of last name is not between 1 and 50', () => {
    // create a new user
    const test1 = requestAuthRegisterV2(
      'test1@gmail.com',
      'password1',
      'firstName1',
      'lastName1'
    );

    // test function with invalid last name (length lower than 1)
    const usersProfileSetnameObj = requestUserProfileSetNameV1(
      test1.bodyObj.token,
      'Richardo',
      ''
    );
    // expect function to run and return an error
    expect(usersProfileSetnameObj.statusCode).toBe(OK);
    expect(usersProfileSetnameObj.bodyObj).toStrictEqual(ERROR);

    //  test funciton with invalid last name (length greater than 50)
    const usersProfileSetnameObj1 = requestUserProfileSetNameV1(
      test1.bodyObj.token,
      'Richardo',
      '3.1415926535897932384626433832795028841971693993751'
    );
    // expect function to run and return an error
    expect(usersProfileSetnameObj1.statusCode).toBe(OK);
    expect(usersProfileSetnameObj1.bodyObj).toStrictEqual(ERROR);
  });

  test('Test-4: Success in resetting name', () => {
    // create a new user
    const test1 = requestAuthRegisterV2(
      'test1@gmail.com',
      'password1',
      'firstName1',
      'lastName1'
    );
    // test function with correct inputs
    const usersProfileSetnameObj = requestUserProfileSetNameV1(
      test1.bodyObj.token,
      'Richardo',
      'Lee'
    );
    // expect funtion to run and return an empty object
    expect(usersProfileSetnameObj.statusCode).toBe(OK);
    expect(usersProfileSetnameObj.bodyObj).toStrictEqual({});
    // verify outputs by using requestUserProfileV2 function
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
    // create a new user
    const test1 = requestAuthRegisterV2(
      'test1@gmail.com',
      'password1',
      'firstName1',
      'lastName1'
    );
    // test function with invalid token
    const usersProfileSetEmailObj = requestUserProfileSetEmailV1(
      test1.bodyObj.token + 1,
      'test1@ad.unsw.edu.au'
    );
    // expect funtion to run and return an error
    expect(usersProfileSetEmailObj.statusCode).toBe(OK);
    expect(usersProfileSetEmailObj.bodyObj).toStrictEqual(ERROR);
  });

  test('Test-2: Error, email entered is not a valid email', () => {
    // create a new user
    const test1 = requestAuthRegisterV2(
      'test1@gmail.com',
      'password1',
      'firstName1',
      'lastName1'
    );
    // test function with invalid email address
    const usersProfileSetEmailObj = requestUserProfileSetEmailV1(
      test1.bodyObj.token,
      'test1##ad.unsw.edu.au'
    );
    // expect funtion to run and return an error
    expect(usersProfileSetEmailObj.statusCode).toBe(OK);
    expect(usersProfileSetEmailObj.bodyObj).toStrictEqual(ERROR);
  });

  test('Test-3: Error, email address is already being used by another user', () => {
    // create new users
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
    // test function with invalid email that is being taken
    const usersProfileSetEmailObj = requestUserProfileSetEmailV1(
      test1.bodyObj.token,
      'test2@gmail.com'
    );
    // expect funtion to run and return an error
    expect(usersProfileSetEmailObj.statusCode).toBe(OK);
    expect(usersProfileSetEmailObj.bodyObj).toStrictEqual(ERROR);
  });

  test('Test-4: Success in resetting email', () => {
    // create a new user
    const test1 = requestAuthRegisterV2(
      'test1@gmail.com',
      'password1',
      'firstName1',
      'lastName1'
    );
    // test fuction with correct inputs
    const usersProfileSetEmailObj = requestUserProfileSetEmailV1(
      test1.bodyObj.token,
      'test1@ad.unsw.edu.au'
    );
    // expect function to run and return an empty object
    expect(usersProfileSetEmailObj.statusCode).toBe(OK);
    expect(usersProfileSetEmailObj.bodyObj).toStrictEqual({});
    // verify email address has been updated by requestUserProfileV2 function
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
    // create a new user
    const test1 = requestAuthRegisterV2(
      'test1@gmail.com',
      'password1',
      'firstName1',
      'lastName1'
    );
    // test function with invalid token
    const usersProfileSetHandleObj = requestUserProfileSetHandleV1(
      test1.bodyObj.token + 1,
      'newhandlestring'
    );
    // expect function to run and return an error

    expect(usersProfileSetHandleObj.statusCode).toBe(OK);
    expect(usersProfileSetHandleObj.bodyObj).toStrictEqual(ERROR);
  });

  test('Test-2: Error, length of handleStr is not between 3 and 20 characters inclusive', () => {
    // create a new user
    const test1 = requestAuthRegisterV2(
      'test1@gmail.com',
      'password1',
      'firstName1',
      'lastName1'
    );

    // test function with invalid handleStr(length of handleStr is less than 3)
    const usersProfileSetHandleObj = requestUserProfileSetHandleV1(
      test1.bodyObj.token,
      '12'
    );
    // expect function to run and return an error
    expect(usersProfileSetHandleObj.statusCode).toBe(OK);
    expect(usersProfileSetHandleObj.bodyObj).toStrictEqual(ERROR);

    // test function with invalid handleStr (length of handleStr is greater than 20)
    const usersProfileSetHandleObj1 = requestUserProfileSetHandleV1(
      test1.bodyObj.token,
      '314159265358979323846264338327'
    );
    // expect function to run and return an error
    expect(usersProfileSetHandleObj1.statusCode).toBe(OK);
    expect(usersProfileSetHandleObj1.bodyObj).toStrictEqual(ERROR);

    // test function with empty handle string
    const usersProfileSetHandleObj2 = requestUserProfileSetHandleV1(
      test1.bodyObj.token,
      ''
    );
    // expect function to run and return an error
    expect(usersProfileSetHandleObj2.statusCode).toBe(OK);
    expect(usersProfileSetHandleObj2.bodyObj).toStrictEqual(ERROR);
  });

  test('Test-3: Error, handleStr contains characters that are not alphanumeric', () => {
    // create a new user
    const test1 = requestAuthRegisterV2(
      'test1@gmail.com',
      'password1',
      'firstName1',
      'lastName1'
    );
    // test function with invalid handleStr (not alphanumeric)
    const usersProfileSetHandleObj = requestUserProfileSetHandleV1(
      test1.bodyObj.token,
      '!@#$%%^&*()(*&^%$#@'
    );
    // expect function to run and return an error
    expect(usersProfileSetHandleObj.statusCode).toBe(OK);
    expect(usersProfileSetHandleObj.bodyObj).toStrictEqual(ERROR);
  });

  test('Test-4: Error, the handle is already used by another user', () => {
    // create new users
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
    // create handleStr for user test1
    const usersProfileSetHandleObj = requestUserProfileSetHandleV1(
      test1.bodyObj.token,
      '12345'
    );

    expect(usersProfileSetHandleObj.bodyObj).toStrictEqual({});
    // test function with invalid handleStr(already taken)
    const usersProfileSetHandleObj1 = requestUserProfileSetHandleV1(
      test2.bodyObj.token,
      '12345'
    );
    // expect function to run and return an error
    expect(usersProfileSetHandleObj1.statusCode).toBe(OK);
    expect(usersProfileSetHandleObj1.bodyObj).toStrictEqual(ERROR);
  });

  test('Test-5: Success in resetting handleStr', () => {
    // create a new user
    const test1 = requestAuthRegisterV2(
      'test1@gmail.com',
      'password1',
      'firstName1',
      'lastName1'
    );
    // test function with correct inputs
    const usersProfileSetHandleObj = requestUserProfileSetHandleV1(
      test1.bodyObj.token,
      '12345'
    );
    // expect function to run and return an empty object
    expect(usersProfileSetHandleObj.statusCode).toBe(OK);
    expect(usersProfileSetHandleObj.bodyObj).toStrictEqual({});
    // verify output by using requestUserProfileV2 function
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
