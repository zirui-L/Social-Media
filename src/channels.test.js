import {
  channelsCreateV1,
  channelsListV1,
  channelsListAllV1,
} from './channels';

import {
  authRegisterV1
} from './auth'

import {
  channelJoinV1
} from './channel'

import {
  clearV1
} from './other'

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
    const user = authRegisterV1(
			"test@gmail.com",
			"123455",
			"firstName",
			"lastName"
	);
	const name = "valid_name";
		expect(channelsCreateV1(user.uId + 1, name, true)).toStrictEqual({
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

describe("channelsListV1 function testing", () => {
	beforeEach(() => {
    clearV1();
  });
	test("Test-1: Invalid authUserId", () =>{
    const user1 = authRegisterV1(
			"ricky@gmail.com",
			"123455",
			"Ricky",
			"Li"
    );
		expect(channelsListV1(user1.uId + 1)).toStrictEqual({
			error: "error",
		});
	});

	test("Test-2: Successful function implementation", () =>{
		const user1 = authRegisterV1(
			"ricky@gmail.com",
			"123455",
			"Ricky",
			"Li"
    );

    const user2 = authRegisterV1(
			"libro@gmail.com",
			"123455",
			"libro",
			"Zhang"
    );
    const channel1 = channelsCreateV1(user1.uId, "Rickychannel", true);
    channelJoinV1(user2.uId, channel1.channelId);
    const channel2 = channelsCreateV1(user2.uId, "Librochannel", true);
    const channel3 = channelsCreateV1(user2.uId, "Henrychannel", false);


		expect(
			channelsListV1(user2.uID)
			).toEqual(
				{
          'name': 'Rickychannel',
          'channelId': expect.any(Number),
          'isPublic': true,
          'allMembers': [user1.uId, user2.uId],
          'ownerMembers': [user1.uId],
          'message': [],
        },
        {
          'name': 'Librochannel',
          'channelId': expect.any(Number),
          'isPublic': true,
          'allMembers': [user2.uId],
          'ownerMembers': [user2.uId],
          'message': [],
        },
        {
          'name': 'Henrychannel',
          'channelId': expect.any(Number),
          'isPublic': false,
          'allMembers': [user2.uId],
          'ownerMembers': [user2.uId3],
          'message': [],
        }
		  );
  })
});

describe("channelsListAllV1 function testing", () => {
	beforeEach(() => {
    clearV1();
  });
	test("Test-1: Invalid authUserId", () =>{
    const user1 = authRegisterV1(
			"ricky@gmail.com",
			"123455",
			"Ricky",
			"Li"
    );
		expect(channelsListAllV1(user1.uId + 1)).toStrictEqual({
			error: "error",
		});
	});

	test("Test-2: Successful function implementation", () =>{
		const user1 = authRegisterV1(
			"ricky@gmail.com",
			"123455",
			"Ricky",
			"Li"
    );

    const user2 = authRegisterV1(
			"libro@gmail.com",
			"123455",
			"libro",
			"Zhang"
    );
    const channel1 = channelsCreateV1(user1.uId, "Rickychannel", true);
    channelJoinV1(user2.uId, channel1.channelId);
    const channel2 = channelsCreateV1(user2.uId, "Librochannel", true);
    const channel3 = channelsCreateV1(user2.uId, "Henrychannel", false);


		expect(
			channelsListV1(user1.uID)
			).toEqual(
				{
          'name': 'Rickychannel',
          'channelId': expect.any(Number),
          'isPublic': true,
          'allMembers': [user1.uId, user2.uId],
          'ownerMembers': [user1.uId],
          'message': [],
        },
        {
          'name': 'Librochannel',
          'channelId': expect.any(Number),
          'isPublic': true,
          'allMembers': [user2.uId],
          'ownerMembers': [user2.uId],
          'message': [],
        },
        {
          'name': 'Henrychannel',
          'channelId': expect.any(Number),
          'isPublic': false,
          'allMembers': [user2.uId],
          'ownerMembers': [user2.uId3],
          'message': [],
        }
		  );
  })
});