import { userProfileV1 } from "./users.js";
import { authRegisterV1 } from "./auth.js";
import { clearV1 } from "./other.js";

beforeEach(() => {
  clearV1();
});

describe("Testing userProfileV1", () => {
  test("Test-1: Error, invalid authUserId and valid uId", () => {
    const test1 = authRegisterV1(
      "test1@gmail.com",
      "123456",
      "Richardo",
      "Lee"
    );
    expect(userProfileV1(test1.authUserId + 1, test1.authUserId)).toStrictEqual(
      { error: "error" }
    );
  });

  test("Test-2: Error, valid authUserId and invalid uId", () => {
    const test1 = authRegisterV1(
      "test1@gmail.com",
      "123456",
      "Richardo",
      "Lee"
    );
    expect(userProfileV1(test1.authUserId, test1.authUserId + 1)).toStrictEqual(
      { error: "error" }
    );
  });

  test("Test-3: Error, invalid authUserId and invalid uId", () => {
    expect(userProfileV1(0, 0)).toStrictEqual({ error: "error" });
  });

  test("Test-4: Sucess case", () => {
    const test1 = authRegisterV1(
      "test1@gmail.com",
      "123456",
      "Richardo",
      "Lee"
    );
    const test2 = authRegisterV1(
      "test2@gmail.com",
      "1234567",
      "Shenba",
      "Chen"
    );
    expect(userProfileV1(test1.authUserId, test2.authUserId)).toStrictEqual({
      user: {
        uId: test2.authUserId,
        email: "test2@gmail.com",
        nameFirst: "Shenba",
        nameLast: "Chen",
        handleStr: "shenbachen",
      },
    });
  });

  test("Test-5, Success with same authUserId and uId", () => {
    const test1 = authRegisterV1(
      "test1@gmail.com",
      "123456",
      "Richardo",
      "Lee"
    );
    expect(userProfileV1(test1.authUserId, test1.authUserId)).toStrictEqual({
      user: {
        uId: test1.authUserId,
        email: "test1@gmail.com",
        nameFirst: "Richardo",
        nameLast: "Lee",
        handleStr: "richardolee",
      },
    });
  });
});
