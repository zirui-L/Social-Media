import { getData, setData } from "./dataStore.js";
import validator from "validator";
const ERROR_PHRASE = { error: "error" };

// stub function for the authLoginV1 function
function authLoginV1(email, password) {
  return {
    authUserId: 1,
  };
}

// stub function for the authRegisterV1 function
function authRegisterV1(email, password, nameFirst, nameLast) {
  return {
    authUserId: 1,
  };
}
