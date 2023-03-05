import { authLoginV1, authRegisterV1 } from "./auth.js";
import { userProfileV1 } from "./users.js";
import { clearV1 } from "./other.js";

describe("authLoginV1 function testing", () => {
  beforeEach(() => {
    clearV1();
  });

  test("Test-1: correct login email and password", () => {
    const registerAuthUserId = authRegisterV1(
      "test@gmail.com",
      "123455",
      "firstName",
      "lastName"
    );
    const loginAuthUserId = authLoginV1("test@gmail.com", "123455");
    expect(registerAuthUserId).toStrictEqual(loginAuthUserId);
  });

  test("Test-2: correct login email but incorrect password", () => {
    const registerAuthUserId = authRegisterV1(
      "test@gmail.com",
      "123456",
      "firstName",
      "lastName"
    );
    expect(authLoginV1("test@gmail.com", "54321")).toStrictEqual({
      error: "error",
    });
  });

  test("Test-3: login with non-existing email and existing password", () => {
    const registerAuthUserId = authRegisterV1(
      "test@gmail.com",
      "123456",
      "firstName",
      "lastName"
    );
    expect(authLoginV1("another@gmail.com", "12345")).toStrictEqual({
      error: "error",
    });
  });

  test("Test4: log in with non-existing email and password", () => {
    expect(authLoginV1("test@gmail.com", "12345")).toStrictEqual({
      error: "error",
    });
  });
});

describe("authRegisterV1 function testing - generating authUserId", () => {
  beforeEach(() => {
    clearV1();
  });
  test.each([
    {
      email: "test@gmail.com",
      password: "123456",
      nameFirst: "firstName",
      nameLast: "lastName",
      expected: expect.objectContaining({ authUserId: expect.any(Number) }),
    },
    {
      email: "###email_not_valid###",
      password: "123456",
      nameFirst: "firstName",
      nameLast: "lastName",
      expected: { error: "error" },
    },
    {
      email: "test@gmail.com",
      password: "123",
      nameFirst: "firstName",
      nameLast: "lastName",
      expected: { error: "error" },
    },
    {
      email: "test@gmail.com",
      password: "123456",
      nameFirst:
        "3.1415926535897932384626433832795028841971693993751058209749445923078164062862089986280348253421170679",
      nameLast: "lastName",
      expected: { error: "error" },
    },
    {
      email: "test@gmail.com",
      password: "123456",
      nameFirst: "",
      nameLast: "lastName",
      expected: { error: "error" },
    },
    {
      email: "test@gmail.com",
      password: "123456",
      nameFirst: "3",
      nameLast: "lastName",
      expected: expect.objectContaining({ authUserId: expect.any(Number) }),
    },
    {
      email: "test@gmail.com",
      password: "123456",
      nameFirst: "3.1415926535897932384626433832795028841971693993",
      nameLast: "lastName",
      expected: expect.objectContaining({ authUserId: expect.any(Number) }),
    },
    {
      email: "test@gmail.com",
      password: "123456",
      nameFirst: "firstName",
      nameLast:
        "3.1415926535897932384626433832795028841971693993751058209749445923078164062862089986280348253421170679",
      expected: { error: "error" },
    },
    {
      email: "test@gmail.com",
      password: "123456",
      nameFirst: "firstName",
      nameLast: "",
      expected: { error: "error" },
    },
    {
      email: "test@gmail.com",
      password: "123456",
      nameFirst: "firstName",
      nameLast: "3",
      expected: expect.objectContaining({ authUserId: expect.any(Number) }),
    },
    {
      email: "test@gmail.com",
      password: "123456",
      nameFirst: "firstName",
      nameLast: "3.1415926535897932384626433832795028841971693993",
      expected: expect.objectContaining({ authUserId: expect.any(Number) }),
    },
  ])(
    "authRegisterV1 function testing",
    ({ email, password, nameFirst, nameLast, expected }) => {
      expect(
        authRegisterV1(email, password, nameFirst, nameLast)
      ).toStrictEqual(expected);
    }
  );
});

describe("authRegisterV1 function testing - generating handle string / email duplication", () => {
  beforeEach(() => {
    clearV1();
  });

  test("Test-1: concatenation of casted-to-lowercase alphaumeric first/last name, and cut off if it is longer than 20", () => {
    const detail = authRegisterV1(
      "test@gmail.com",
      "123456",
      "firstName",
      "lastName31415"
    );
    expect(
      userProfileV1(detail.authUserId, detail.authUserId).user.handleStr
    ).toBe("firstnamelastname314");
  });

  test("Test-2: Remove all non-alphanumeric characters", () => {
    const detail = authRegisterV1(
      "test@gmail.com",
      "password",
      "R****i^^^^^c%%%%%h$$$$#r#####d",
      "L######i"
    );
    expect(
      userProfileV1(detail.authUserId, detail.authUserId).user.handleStr
    ).toBe("richardli");
  });

  test("Test-3: already taken handlers", () => {
    const detail1 = authRegisterV1(
      "test1@gmail.com",
      "123456",
      "firstName",
      "lastName"
    );
    const detail2 = authRegisterV1(
      "test2@gmail.com",
      "123456",
      "firstName",
      "lastName"
    );
    expect(
      userProfileV1(detail2.authUserId, detail2.authUserId).user.handleStr
    ).toBe("firstnamelastname0");
  });

  test("Test-4: already taken handler string exceeds 20 characters limit", () => {
    const detail1 = authRegisterV1(
      "test1@gmail.com",
      "123456",
      "firstName314",
      "lastName"
    );
    const detail2 = authRegisterV1(
      "test2@gmail.com",
      "123456",
      "firstName314",
      "lastName"
    );
    expect(
      userProfileV1(detail1.authUserId, detail2.authUserId).user.handleStr
    ).toBe("firstname314lastname0");
  });

  test("authRegisterV1 function testing with duplication in email", () => {
    const detail = authRegisterV1(
      "test@gmail.com",
      "123456",
      "firstName",
      "lastName"
    );
    expect(
      authRegisterV1("test@gmail.com", "1234561", "firstName#", "lastName#")
    ).toStrictEqual({ error: "error" });
  });
});
