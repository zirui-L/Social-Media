import {
  requestAuthLoginV2,
  requestAuthRegisterV2,
  requestUserProfileV2,
  requestClearV1,
  requestAuthLogOutV1,
} from "./helperServer";

const OK = 200;
const ERROR = { error: expect.any(String) };

beforeEach(() => {
  requestClearV1();
});

afterEach(() => {
  requestClearV1();
});

describe("/auth/login/v2 testing", () => {
  test("Test-1: correct login email and password", () => {
    requestAuthRegisterV2("test@gmail.com", "123455", "firstName", "lastName");
    const loginAuthUserId = requestAuthLoginV2("test@gmail.com", "123455");
    expect(loginAuthUserId.statusCode).toBe(OK);
    expect(loginAuthUserId.bodyObj).toStrictEqual({
      authUserId: expect.any(Number),
      token: expect.any(String),
    });
  });

  test("Test-2: correct login email but incorrect password", () => {
    requestAuthRegisterV2("test@gmail.com", "123456", "firstName", "lastName");
    const loginAuthUserId = requestAuthLoginV2("test@gmail.com", "54321");
    expect(loginAuthUserId.statusCode).toBe(OK);
    expect(loginAuthUserId.bodyObj).toStrictEqual(ERROR);
  });

  test("Test-3: login with non-existing email and existing password", () => {
    requestAuthRegisterV2("test@gmail.com", "123456", "firstName", "lastName");
    const loginAuthUserId = requestAuthLoginV2("another@gmail.com", "123456");
    expect(loginAuthUserId.statusCode).toBe(OK);
    expect(loginAuthUserId.bodyObj).toStrictEqual(ERROR);
  });

  test("Test-4: log in with non-existing email and password", () => {
    const loginAuthUserId = requestAuthLoginV2("test@gmail.com", "12345");
    expect(loginAuthUserId.statusCode).toBe(OK);
    expect(loginAuthUserId.bodyObj).toStrictEqual(ERROR);
  });
});

describe("/auth/register/v2 testing - generating authUserId", () => {
  test.each([
    {
      email: "test@gmail.com", // Success case
      password: "123456",
      nameFirst: "firstName",
      nameLast: "lastName",
      expected: { authUserId: expect.any(Number), token: expect.any(String) },
    },
    {
      email: "###email_not_valid###", // Error, email not valid
      password: "123456",
      nameFirst: "firstName",
      nameLast: "lastName",
      expected: ERROR,
    },
    {
      email: "test@gmail.com", // Error, password lower than 6 characters
      password: "123",
      nameFirst: "firstName",
      nameLast: "lastName",
      expected: ERROR,
    },
    {
      email: "test@gmail.com", // Error, first name exceed 50 characters
      password: "123456",
      nameFirst:
        "3.1415926535897932384626433832795028841971693993751058209749445923078164062862089986280348253421170679",
      nameLast: "lastName",
      expected: ERROR,
    },
    {
      email: "test@gmail.com", // Error, first name lower than 1 character
      password: "123456",
      nameFirst: "",
      nameLast: "lastName",
      expected: ERROR,
    },
    {
      email: "test@gmail.com", // Success, first name with only 1 character
      password: "123456",
      nameFirst: "3",
      nameLast: "lastName",
      expected: { authUserId: expect.any(Number), token: expect.any(String) },
    },
    {
      email: "test@gmail.com", // Success, first name shorter than 50 charaters
      password: "123456",
      nameFirst: "3.1415926535897932384626433832795028841971693993",
      nameLast: "lastName",
      expected: { authUserId: expect.any(Number), token: expect.any(String) },
    },
    {
      email: "test@gmail.com", // Error, last name exceed 50 characters
      password: "123456",
      nameFirst: "firstName",
      nameLast:
        "3.1415926535897932384626433832795028841971693993751058209749445923078164062862089986280348253421170679",
      expected: ERROR,
    },
    {
      email: "test@gmail.com", // Error, last name lower than 1 character
      password: "123456",
      nameFirst: "firstName",
      nameLast: "",
      expected: ERROR,
    },
    {
      email: "test@gmail.com", // Success, last name with only 1 character
      password: "123456",
      nameFirst: "firstName",
      nameLast: "3",
      expected: { authUserId: expect.any(Number), token: expect.any(String) },
    },
    {
      email: "test@gmail.com", // Success, last name shorter than 50 charaters
      password: "123456",
      nameFirst: "firstName",
      nameLast: "3.1415926535897932384626433832795028841971693993",
      expected: { authUserId: expect.any(Number), token: expect.any(String) },
    },
  ])(
    "/auth/register/v2 testing",
    ({ email, password, nameFirst, nameLast, expected }) => {
      const loginDetails = requestAuthRegisterV2(
        email,
        password,
        nameFirst,
        nameLast
      );

      expect(loginDetails.statusCode).toBe(OK);
      expect(loginDetails.bodyObj).toStrictEqual(expected);
    }
  );
});

describe("/auth/register/v2 testing - generating handle string / email duplication", () => {
  test("Test-1: concatenation of casted-to-lowercase alphaumeric first/last name, and cut off if it is longer than 20", () => {
    const detail = requestAuthRegisterV2(
      "test@gmail.com",
      "123456",
      "firstName",
      "lastName31415"
    );
    const userProfile = requestUserProfileV2(
      detail.bodyObj.token,
      detail.bodyObj.authUserId
    );
    expect(userProfile.statusCode).toBe(OK);
    expect(userProfile.bodyObj.user.handleStr).toStrictEqual(
      "firstnamelastname314"
    );
  });

  test("Test-2: Remove all non-alphanumeric characters", () => {
    const detail = requestAuthRegisterV2(
      "test@gmail.com",
      "password",
      "R****i^^^^^c%%%%%ha$$$$#r#####d",
      "L######i"
    );
    const userProfile = requestUserProfileV2(
      detail.bodyObj.token,
      detail.bodyObj.authUserId
    );
    expect(userProfile.statusCode).toBe(OK);
    expect(userProfile.bodyObj.user.handleStr).toStrictEqual("richardli");
  });

  test("Test-3: already taken handlers", () => {
    requestAuthRegisterV2("test1@gmail.com", "123456", "firstName", "lastName");
    const detail2 = requestAuthRegisterV2(
      "test2@gmail.com",
      "123456",
      "firstName",
      "lastName"
    );
    const userProfile = requestUserProfileV2(
      detail2.bodyObj.token,
      detail2.bodyObj.authUserId
    );
    expect(userProfile.statusCode).toBe(OK);
    expect(userProfile.bodyObj.user.handleStr).toStrictEqual(
      "firstnamelastname0"
    );
  });

  test("Test-4: already taken handler string exceeds 20 characters limit", () => {
    const detail1 = requestAuthRegisterV2(
      "test1@gmail.com",
      "123456",
      "firstName314",
      "lastName"
    );

    const detail2 = requestAuthRegisterV2(
      "test2@gmail.com",
      "123456",
      "firstName314",
      "lastName"
    );
    const userProfile = requestUserProfileV2(
      detail1.bodyObj.token,
      detail2.bodyObj.authUserId
    );
    expect(userProfile.statusCode).toBe(OK);
    expect(userProfile.bodyObj.user.handleStr).toStrictEqual(
      "firstname314lastname0"
    );
  });

  test("Test-5: /auth/register/v2 testing with duplication in email", () => {
    requestAuthRegisterV2("test@gmail.com", "123456", "firstName", "lastName");
    const detail2 = requestAuthRegisterV2(
      "test@gmail.com",
      "1234567",
      "firstName0",
      "lastName0"
    );

    expect(detail2.statusCode).toBe(OK);
    expect(detail2.bodyObj).toStrictEqual(ERROR);
  });
});

describe("/auth/logout/v1 testing", () => {
  test("Test-1: Error, Invalid Token", () => {
    const registerAuthUserId = requestAuthRegisterV2(
      "test@gmail.com",
      "123455",
      "firstName",
      "lastName"
    );
    const logoutAuthUserId = requestAuthLogOutV1(
      registerAuthUserId.bodyObj.token + "1"
    );
    expect(logoutAuthUserId.statusCode).toBe(OK);
    expect(logoutAuthUserId.bodyObj).toStrictEqual(ERROR);
  });

  test("Test-2: Error, Log out twice with the same token", () => {
    const registerAuthUserId = requestAuthRegisterV2(
      "test@gmail.com",
      "123455",
      "firstName",
      "lastName"
    );
    const logoutAuthUserId1 = requestAuthLogOutV1(
      registerAuthUserId.bodyObj.token
    );
    expect(logoutAuthUserId1.statusCode).toBe(OK);
    expect(logoutAuthUserId1.bodyObj).toStrictEqual({});

    const logoutAuthUserId2 = requestAuthLogOutV1(
      registerAuthUserId.bodyObj.token
    );
    expect(logoutAuthUserId2.statusCode).toBe(OK);
    expect(logoutAuthUserId2.bodyObj).toStrictEqual(ERROR);
  });

  test("Test-3: Success, Logout 1 person", () => {
    const registerAuthUserId = requestAuthRegisterV2(
      "test@gmail.com",
      "123455",
      "firstName",
      "lastName"
    );
    const logoutAuthUserId = requestAuthLogOutV1(
      registerAuthUserId.bodyObj.token
    );
    expect(logoutAuthUserId.statusCode).toBe(OK);
    expect(logoutAuthUserId.bodyObj).toStrictEqual({});

    const userProfile = requestUserProfileV2(
      registerAuthUserId.bodyObj.token,
      registerAuthUserId.bodyObj.authUserId
    ).bodyObj;
    expect(userProfile).toStrictEqual(ERROR);
  });

  test("Test-4: Success, Logout with 3 people existing", () => {
    const registerAuthUserId1 = requestAuthRegisterV2(
      "test1@gmail.com",
      "123455",
      "firstName",
      "lastName"
    );
    requestAuthRegisterV2("test2@gmail.com", "123455", "firstName", "lastName");
    requestAuthRegisterV2("test3@gmail.com", "123455", "firstName", "lastName");
    const logoutAuthUserId = requestAuthLogOutV1(
      registerAuthUserId1.bodyObj.token
    );
    expect(logoutAuthUserId.statusCode).toBe(OK);
    expect(logoutAuthUserId.bodyObj).toStrictEqual({});

    const userProfile = requestUserProfileV2(
      registerAuthUserId1.bodyObj.token,
      registerAuthUserId1.bodyObj.authUserId
    ).bodyObj;
    expect(userProfile).toStrictEqual(ERROR);
  });
});
