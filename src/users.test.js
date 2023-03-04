import { userProfileV1 } from './users.js';
import { authRegisterV1 } from './auth.js';
// import { getData } from "./dataStore";


// tests for invalid input
test('Test 1: authUserId not integer (char unput)', () => {
        let getUserProfile1 = userProfileV1(
                "a",
                "42"
        )
        expect(getUserProfile1).toStrictEqual({
                error: "error",
        });
});

test('Test 2: uId not integer (char input)', () => {
        let getUserProfile2 = userProfileV1(
                "41",
                "b"
        )
        expect(getUserProfile2).toStrictEqual({
                error: "error",
        });
});

test('Test 3: authUserId and uId not integers', () => {
        let getUserProfile3 = userProfileV1(
                "abc",
                "def"
        )
        expect(getUserProfile3).toStrictEqual({
                error: "error",
                });
});

// tests for valid input but users not registered

test('Test 4: Neither authUser nor target uId registered', () => {
        let getUserProfile3 = userProfileV1(
                "13",
                "42"
        )
        expect(getUserProfile3).toStrictEqual({
                error: "error",
        });
});

test('Test 5: Only authUser registered', () => {

        const myAuthUser = authRegisterV1(
                "myAuthUser@unsw.edu.au",
                "abc123",
                "authFirstName",
                "authLastName"
        )

        let getUserProfile3 = userProfileV1(
                myAuthUser,
                "42"
        )
        expect(getUserProfile3).toStrictEqual({
                error: "error",
        });
});

test('Test 6: Only target uID registered', () => {

        const myUserId = authRegisterV1(
                "myUser@unsw.edu.au",
                "def456",
                "myFirstName",
                "myLastName"
        )

        let getUserProfile3 = userProfileV1(
                "13",
                myUserId
        )
        expect(getUserProfile3).toStrictEqual({
                error: "error",
        });
});


// tests for input without errors


test('Test 7: authUser and uId both valid and registered, function should work', () => {
        const myAuthUser = authRegisterV1(
                "myAuthUser@unsw.edu.au",
                "abc123",
                "authFirstName",
                "authLastName"
        )

        const myUser = authRegisterV1(
                "myUser@unsw.edu.au",
                "def456",
                "myFirstName",
                "myLastName" 
        )
      
        const getUserProfile = userProfileV1(
                myAuthUser,
                myUser
        )
      
        // is this correct?
       /* expect(getUserProfile).toBe({ 
                myAuthUser, 
                "myFirstName", //
                "myLastName",
                "myUser@unsw.edu.au",
                "myfirstnamemylastname" // is this the correct expected handle?
        }); */

        // not sure what the protocol is for testing multiple things, can i test all of the user type in one statement?
        expect(getUserProfile.uId).toEqual(myUser) &&
        expect(getUserProfile.firstName).toEqual("myFirstName") &&
        expect(getUserProfile.lastName).toEqual("myLastName") &&
        expect(getUserProfile.email).toEqual("myUser@unsw.edu.au") &&
        expect(getUserProfile.handleStr).toEqual("myfirstnamemylastname");
      });