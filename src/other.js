import { getData, setData } from "./dataStore.js";

/**
 * <Create a new user with input email, password, first and last names. Create
 * unique authUserId and handle string for each user, and store all informations>
 *
 * @param none
 *
 * @returns {{}} - if the function successifully clear the data stored
 */

function clearV1() {
  const data = getData();
  data.channels.length = 0;
  data.users.length = 0;
  setData(data);
  return {};
}

export { clearV1 };
