import {
  channelsCreateV1,
  channelsListV1,
  channelsListAllV1,
} from './channels';

import {
  authRegisterV1
} from './auth.js'

describe("channelsCreateV1 function testing", () => {
	beforeEach(() => {
    clearV1();
  });
  test("Test-1: lenth of name exceed 20", () =>{
		const user = authRegisterV1(
			"test@gmail.com",
			"123455",
			"firstName",
			"lastName"
	);
	const long_name = "some_name_that_exceed_lenth_of_20";
		expect(channelsCreateV1(user.uID, long_name, true)).toStrictEqual({
			error: "error",
		});
	});

	test("Test-2: lenth of name less than 1", () =>{
		const user = authRegisterV1(
			"test@gmail.com",
			"123455",
			"firstName",
			"lastName"
	);
	const short_name = "";
		expect(channelsCreateV1(user.uID, short, true)).toStrictEqual({
			error: "error",
		});
	});

	test("Test-3: Invalid authUserId", () =>{
	const name = "valid_name";
		expect(channelsCreateV1(Infinity, name, true)).toStrictEqual({
			error: "error",
		});
	});

	test("Test-4: Successful private channel creation", () =>{
		const user = authRegisterV1(
			"test@gmail.com",
			"123455",
			"firstName",
			"lastName"
	);
	const name = "valid_name";
		expect(
			channelsCreateV1(user.uID, name, false)
			).toEqual(
				expect.objectContaining({channelId: expect.any(Number)}),
		);
	});

	test("Test-5: Successful public channel creation", () =>{
		const channel_owner = authRegisterV1(
			"owner@gmail.com",
			"123455",
			"firstName",
			"lastName"
	);
	const name = "valid_name";
		expect(
			channelsCreateV1(channel_owner.uID, name, true)
			).toEqual(
				expect.objectContaining({channelId: expect.any(Number)}),
		);
	});
});   

