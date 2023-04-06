import { STATUS_CODES } from 'http';
import {
  requestAuthLogin,
  requestAuthRegister,
  requestUserProfile,
  requestClear,
  requestAuthLogOut,
  BAD_REQUEST,
  FORBIDDEN,
} from '../helperFunctions/helperServer';

const OK = 200;
const ERROR = { error: expect.any(String) };

beforeEach(() => {
  requestClear();
});

afterEach(() => {
  requestClear();
});

describe('/auth/login/v2 testing', () => {
  test('Test-1: correct login email and password', () => {
    requestAuthRegister('test@gmail.com', '123455', 'firstName', 'lastName');
    const loginAuthUserId = requestAuthLogin('test@gmail.com', '123455');
    expect(loginAuthUserId.statusCode).toBe(OK);
    expect(loginAuthUserId.bodyObj).toStrictEqual({
      authUserId: expect.any(Number),
      token: expect.any(String),
    });
  });

  test('Test-2: correct login email but incorrect password', () => {
    requestAuthRegister('test@gmail.com', '123456', 'firstName', 'lastName');
    const loginAuthUserId = requestAuthLogin('test@gmail.com', '54321');
    expect(loginAuthUserId.statusCode).toBe(BAD_REQUEST);
  });

  test('Test-3: login with non-existing email and existing password', () => {
    requestAuthRegister('test@gmail.com', '123456', 'firstName', 'lastName');
    const loginAuthUserId = requestAuthLogin('another@gmail.com', '123456');
    expect(loginAuthUserId.statusCode).toBe(BAD_REQUEST);
  });

  test('Test-4: log in with non-existing email and password', () => {
    const loginAuthUserId = requestAuthLogin('test@gmail.com', '12345');
    expect(loginAuthUserId.statusCode).toBe(BAD_REQUEST);
  });
});

describe('/auth/register/v2 testing - generating authUserId', () => {
  test.each([
    {
      email: 'test@gmail.com', // Success case
      password: '123456',
      nameFirst: 'firstName',
      nameLast: 'lastName',
      expected: { authUserId: expect.any(Number), token: expect.any(String) },
      statusCode: OK,
    },
    {
      email: '###email_not_valid###', // Error, email not valid
      password: '123456',
      nameFirst: 'firstName',
      nameLast: 'lastName',
      expected: undefined,
      statusCode: BAD_REQUEST,
    },
    {
      email: 'test@gmail.com', // Error, password lower than 6 characters
      password: '123',
      nameFirst: 'firstName',
      nameLast: 'lastName',
      expected: undefined,
      statusCode: BAD_REQUEST,
    },
    {
      email: 'test@gmail.com', // Error, first name exceed 50 characters
      password: '123456',
      nameFirst:
        '3.1415926535897932384626433832795028841971693993751058209749445923078164062862089986280348253421170679',
      nameLast: 'lastName',
      expected: undefined,
      statusCode: BAD_REQUEST,
    },
    {
      email: 'test@gmail.com', // Error, first name lower than 1 character
      password: '123456',
      nameFirst: '',
      nameLast: 'lastName',
      expected: undefined,
      statusCode: BAD_REQUEST,
    },
    {
      email: 'test@gmail.com', // Success, first name with only 1 character
      password: '123456',
      nameFirst: '3',
      nameLast: 'lastName',
      expected: { authUserId: expect.any(Number), token: expect.any(String) },
      statusCode: OK,
    },
    {
      email: 'test@gmail.com', // Success, first name shorter than 50 charaters
      password: '123456',
      nameFirst: '3.1415926535897932384626433832795028841971693993',
      nameLast: 'lastName',
      expected: { authUserId: expect.any(Number), token: expect.any(String) },
      statusCode: OK,
    },
    {
      email: 'test@gmail.com', // Error, last name exceed 50 characters
      password: '123456',
      nameFirst: 'firstName',
      nameLast:
        '3.1415926535897932384626433832795028841971693993751058209749445923078164062862089986280348253421170679',
      expected: undefined,
      statusCode: BAD_REQUEST,
    },
    {
      email: 'test@gmail.com', // Error, last name lower than 1 character
      password: '123456',
      nameFirst: 'firstName',
      nameLast: '',
      expected: undefined,
      statusCode: BAD_REQUEST,
    },
    {
      email: 'test@gmail.com', // Success, last name with only 1 character
      password: '123456',
      nameFirst: 'firstName',
      nameLast: '3',
      expected: { authUserId: expect.any(Number), token: expect.any(String) },
      statusCode: OK,
    },
    {
      email: 'test@gmail.com', // Success, last name shorter than 50 charaters
      password: '123456',
      nameFirst: 'firstName',
      nameLast: '3.1415926535897932384626433832795028841971693993',
      expected: { authUserId: expect.any(Number), token: expect.any(String) },
      statusCode: OK,
    },
  ])(
    '/auth/register/v2 testing',
    ({ email, password, nameFirst, nameLast, expected, statusCode }) => {
      const loginDetails = requestAuthRegister(
        email,
        password,
        nameFirst,
        nameLast
      );

      expect(loginDetails.statusCode).toBe(statusCode);
      expect(loginDetails.bodyObj).toStrictEqual(expected);
    }
  );
});

describe('/auth/register/v2 testing - generating handle string / email duplication', () => {
  test('Test-1: concatenation of casted-to-lowercase alphaumeric first/last name, and cut off if it is longer than 20', () => {
    const detail = requestAuthRegister(
      'test@gmail.com',
      '123456',
      'firstName',
      'lastName31415'
    );
    const userProfile = requestUserProfile(
      detail.bodyObj.token,
      detail.bodyObj.authUserId
    );
    expect(userProfile.statusCode).toBe(OK);
    expect(userProfile.bodyObj.user.handleStr).toStrictEqual(
      'firstnamelastname314'
    );
  });

  test('Test-2: Remove all non-alphanumeric characters', () => {
    const detail = requestAuthRegister(
      'test@gmail.com',
      'password',
      'R****i^^^^^c%%%%%ha$$$$#r#####d',
      'L######i'
    );
    const userProfile = requestUserProfile(
      detail.bodyObj.token,
      detail.bodyObj.authUserId
    );
    expect(userProfile.statusCode).toBe(OK);
    expect(userProfile.bodyObj.user.handleStr).toStrictEqual('richardli');
  });

  test('Test-3: already taken handlers', () => {
    requestAuthRegister('test1@gmail.com', '123456', 'firstName', 'lastName');
    const detail2 = requestAuthRegister(
      'test2@gmail.com',
      '123456',
      'firstName',
      'lastName'
    );
    const userProfile = requestUserProfile(
      detail2.bodyObj.token,
      detail2.bodyObj.authUserId
    );
    expect(userProfile.statusCode).toBe(OK);
    expect(userProfile.bodyObj.user.handleStr).toStrictEqual(
      'firstnamelastname0'
    );
  });

  test('Test-4: already taken 2 handlers', () => {
    requestAuthRegister('test1@gmail.com', '123456', 'firstName', 'lastName');
    requestAuthRegister('test2@gmail.com', '123456', 'firstName', 'lastName');
    const detail = requestAuthRegister(
      'test3@gmail.com',
      '123456',
      'firstName',
      'lastName'
    );
    const user3Profile = requestUserProfile(
      detail.bodyObj.token,
      detail.bodyObj.authUserId
    );
    expect(user3Profile.statusCode).toBe(OK);
    expect(user3Profile.bodyObj.user.handleStr).toStrictEqual(
      'firstnamelastname1'
    );
  });

  test('Test-5: already taken handler string exceeds 20 characters limit', () => {
    const detail1 = requestAuthRegister(
      'test1@gmail.com',
      '123456',
      'firstName314',
      'lastName'
    );

    const detail2 = requestAuthRegister(
      'test2@gmail.com',
      '123456',
      'firstName314',
      'lastName'
    );
    const userProfile = requestUserProfile(
      detail1.bodyObj.token,
      detail2.bodyObj.authUserId
    );
    expect(userProfile.statusCode).toBe(OK);
    expect(userProfile.bodyObj.user.handleStr).toStrictEqual(
      'firstname314lastname0'
    );
  });

  test('Test-6: /auth/register/v2 testing with duplication in email', () => {
    requestAuthRegister('test@gmail.com', '123456', 'firstName', 'lastName');
    const detail2 = requestAuthRegister(
      'test@gmail.com',
      '1234567',
      'firstName0',
      'lastName0'
    );

    expect(detail2.statusCode).toBe(BAD_REQUEST);
  });
});

describe('/auth/logout/v1 testing', () => {
  test('Test-1: Error, Invalid Token', () => {
    const registerAuthUserId = requestAuthRegister(
      'test@gmail.com',
      '123455',
      'firstName',
      'lastName'
    );
    const logoutAuthUserId = requestAuthLogOut(
      registerAuthUserId.bodyObj.token + '1'
    );
    expect(logoutAuthUserId.statusCode).toBe(BAD_REQUEST);
  });

  test('Test-2: Error, Log out twice with the same token', () => {
    const registerAuthUserId = requestAuthRegister(
      'test@gmail.com',
      '123455',
      'firstName',
      'lastName'
    );
    const logoutAuthUserId1 = requestAuthLogOut(
      registerAuthUserId.bodyObj.token
    );
    expect(logoutAuthUserId1.statusCode).toBe(OK);
    expect(logoutAuthUserId1.bodyObj).toStrictEqual({});

    const logoutAuthUserId2 = requestAuthLogOut(
      registerAuthUserId.bodyObj.token
    );
    expect(logoutAuthUserId2.statusCode).toBe(BAD_REQUEST);
  });

  test('Test-3: Success, Logout 1 person', () => {
    const registerAuthUserId = requestAuthRegister(
      'test@gmail.com',
      '123455',
      'firstName',
      'lastName'
    );
    const logoutAuthUserId = requestAuthLogOut(
      registerAuthUserId.bodyObj.token
    );
    expect(logoutAuthUserId.statusCode).toBe(OK);
    expect(logoutAuthUserId.bodyObj).toStrictEqual({});

    const userProfile = requestUserProfile(
      registerAuthUserId.bodyObj.token,
      registerAuthUserId.bodyObj.authUserId
    ).bodyObj;
    expect(userProfile).toStrictEqual(BAD_REQUEST);
  });

  test('Test-4: Success, Logout with 3 people existing', () => {
    const registerAuthUserId1 = requestAuthRegister(
      'test1@gmail.com',
      '123455',
      'firstName',
      'lastName'
    );
    requestAuthRegister('test2@gmail.com', '123455', 'firstName', 'lastName');
    requestAuthRegister('test3@gmail.com', '123455', 'firstName', 'lastName');
    const logoutAuthUserId = requestAuthLogOut(
      registerAuthUserId1.bodyObj.token
    );
    expect(logoutAuthUserId.statusCode).toBe(OK);
    expect(logoutAuthUserId.bodyObj).toStrictEqual({});

    const userProfile = requestUserProfile(
      registerAuthUserId1.bodyObj.token,
      registerAuthUserId1.bodyObj.authUserId
    ).bodyObj;
    expect(userProfile).toStrictEqual(BAD_REQUEST);
  });
});
