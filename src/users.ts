import { getData } from "./dataStore.js";
import { isAuthUserIdValid } from "./helperFunctions.js";

const ERROR = { error: "error" };

/**
 * <Create a new user with input email, password, first and last names. Create
 * unique authUserId and handle string for each user, and store all informations>
 *
 * @param {string} integer - email address of the registered users
 * @param {string} integer - password of the registered users
 *
 * @returns {{ authUserId }} - return if the autherUserId and uId are both valid
 *  @returns {{ error: "error" }} - return if there is invalid autherUserId or invalid uId
 */

export const userProfileV1 = (authUserId: number, uId: number) => {
  const data = getData();

  if (!isAuthUserIdValid(data, authUserId) || !isAuthUserIdValid(data, uId))
    return ERROR;

  for (const user of data.users) {
    if (user.authUserId === uId) {
      return {
        user: {
          uId: user.authUserId,
          email: user.email,
          nameFirst: user.nameFirst,
          nameLast: user.nameLast,
          handleStr: user.handleStr,
        },
      };
    }
  }
};
