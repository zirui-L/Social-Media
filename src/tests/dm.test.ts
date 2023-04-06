import {
  requestAuthRegisterV2,
  requestClearV1,
  requestDmCreateV1,
  requestDmListV1,
  requestDmRemoveV1,
  requestDmDetailsV1,
  requestDmLeaveV1,
  requestDmMessagesV1,
  requestMessageSendDmV1,
} from '../helperFunctions/helperServer';

const OK = 200;
const ERROR = { error: expect.any(String) };

beforeEach(() => {
  requestClearV1();
});

afterEach(() => {
  requestClearV1();
});

describe('Testing /dm/create/v1', () => {
  test('Test-1: Error, incorrect uId in uIds', () => {
    const user1 = requestAuthRegisterV2(
      'test1@gmail.com',
      '123456',
      'Richardo',
      'Li'
    ).bodyObj;
    const user2 = requestAuthRegisterV2(
      'test2@gmail.com',
      '1234567',
      'Shenba',
      'Chen'
    ).bodyObj;
    const DmCreate = requestDmCreateV1(user1.token, [user2.authUserId + 1]);
    expect(DmCreate.statusCode).toBe(OK);
    expect(DmCreate.bodyObj).toStrictEqual(ERROR);
  });

  test('Test-2: Error, duplicate uId in uIds', () => {
    const user1 = requestAuthRegisterV2(
      'test1@gmail.com',
      '123456',
      'Richardo',
      'Li'
    ).bodyObj;
    const user2 = requestAuthRegisterV2(
      'test2@gmail.com',
      '1234567',
      'Shenba',
      'Chen'
    ).bodyObj;
    const DmCreate = requestDmCreateV1(user1.token, [
      user2.authUserId,
      user2.authUserId,
    ]);
    expect(DmCreate.statusCode).toBe(OK);
    expect(DmCreate.bodyObj).toStrictEqual(ERROR);
  });

  test('Test-3: Error, creator.uId in uIds', () => {
    const user1 = requestAuthRegisterV2(
      'test1@gmail.com',
      '123456',
      'Richardo',
      'Li'
    ).bodyObj;
    const user2 = requestAuthRegisterV2(
      'test2@gmail.com',
      '1234567',
      'Shenba',
      'Chen'
    ).bodyObj;
    const DmCreate = requestDmCreateV1(user1.token, [
      user1.authUserId,
      user2.authUserId,
    ]);
    expect(DmCreate.statusCode).toBe(OK);
    expect(DmCreate.bodyObj).toStrictEqual(ERROR);
  });

  test('Test-4: Error, invalid token', () => {
    const user1 = requestAuthRegisterV2(
      'test1@gmail.com',
      '123456',
      'Richardo',
      'Li'
    ).bodyObj;
    const user2 = requestAuthRegisterV2(
      'test2@gmail.com',
      '1234567',
      'Shenba',
      'Chen'
    ).bodyObj;
    const DmCreate = requestDmCreateV1(user1.token + 1, [user2.authUserId]);
    expect(DmCreate.statusCode).toBe(OK);
    expect(DmCreate.bodyObj).toStrictEqual(ERROR);
  });

  test('Test-5: Success, correct input parameters', () => {
    const user1 = requestAuthRegisterV2(
      'test1@gmail.com',
      '123456',
      'Richardo',
      'Li'
    ).bodyObj;
    const user2 = requestAuthRegisterV2(
      'test2@gmail.com',
      '1234567',
      'Shenba',
      'Chen'
    ).bodyObj;
    const DmCreate = requestDmCreateV1(user1.token, [user2.authUserId]);
    expect(DmCreate.statusCode).toBe(OK);
    expect(DmCreate.bodyObj).toStrictEqual({ dmId: expect.any(Number) });
  });
});

describe('Testing /dm/list/v1', () => {
  test('Test-1: Error, invalid token', () => {
    const user1 = requestAuthRegisterV2(
      'test1@gmail.com',
      '123456',
      'Richardo',
      'Li'
    ).bodyObj;
    const DmList = requestDmListV1(user1.token + 1);
    expect(DmList.statusCode).toBe(OK);
    expect(DmList.bodyObj).toStrictEqual(ERROR);
  });

  test('Test-2, correct input parameters', () => {
    const user1 = requestAuthRegisterV2(
      'test1@gmail.com',
      '1234567',
      'Shenba',
      'Chen'
    ).bodyObj;
    const user2 = requestAuthRegisterV2(
      'test2@gmail.com',
      '123456',
      'Richardo',
      'Li'
    ).bodyObj;
    const DmCreate = requestDmCreateV1(user1.token, [user2.authUserId]);
    const DmList = requestDmListV1(user1.token);
    expect(DmList.statusCode).toBe(OK);
    expect(DmList.bodyObj).toStrictEqual({
      dms: [
        {
          dmId: DmCreate.bodyObj.dmId,
          name: 'richardoli, shenbachen',
        },
      ],
    });
  });

  test('Test-3, calling dm list with different users', () => {
    const user1 = requestAuthRegisterV2(
      'test1@gmail.com',
      '1234567',
      'Shenba',
      'Chen'
    ).bodyObj;
    const user2 = requestAuthRegisterV2(
      'test2@gmail.com',
      '123456',
      'Richardo',
      'Li'
    ).bodyObj;
    requestDmCreateV1(user1.token, [user2.authUserId]);
    expect(requestDmListV1(user1.token)).toStrictEqual(
      requestDmListV1(user2.token)
    );
  });
});

describe('Testing /dm/remove/v1', () => {
  test('Test-1: Error, invalid dmId', () => {
    const user1 = requestAuthRegisterV2(
      'test1@gmail.com',
      '123456',
      'Richardo',
      'Li'
    ).bodyObj;
    const user2 = requestAuthRegisterV2(
      'test2@gmail.com',
      '1234567',
      'Shenba',
      'Chen'
    ).bodyObj;
    const dmId = requestDmCreateV1(user1.token, [user2.authUserId]).bodyObj
      .dmId;
    const DmRemove = requestDmRemoveV1(user1.token, dmId + 1);
    expect(DmRemove.statusCode).toBe(OK);
    expect(DmRemove.bodyObj).toStrictEqual(ERROR);
  });

  test('Test-2: Error, authorised user is not DM creator', () => {
    const user1 = requestAuthRegisterV2(
      'test1@gmail.com',
      '123456',
      'Richardo',
      'Li'
    ).bodyObj;
    const user2 = requestAuthRegisterV2(
      'test2@gmail.com',
      '1234567',
      'Shenba',
      'Chen'
    ).bodyObj;
    const dmId = requestDmCreateV1(user1.token, [user2.authUserId]).bodyObj
      .dmId;
    const DmRemove = requestDmRemoveV1(user2.token, dmId);
    expect(DmRemove.statusCode).toBe(OK);
    expect(DmRemove.bodyObj).toStrictEqual(ERROR);
  });

  test('Test-3: Error, authorised user no longer in the DM', () => {
    const user1 = requestAuthRegisterV2(
      'test1@gmail.com',
      '123456',
      'Richardo',
      'Li'
    ).bodyObj;
    const user2 = requestAuthRegisterV2(
      'test2@gmail.com',
      '1234567',
      'Shenba',
      'Chen'
    ).bodyObj;
    const dmId = requestDmCreateV1(user1.token, [user2.authUserId]).bodyObj
      .dmId;
    requestDmLeaveV1(user1.token, dmId);
    const DmRemove = requestDmRemoveV1(user1.token, dmId);
    expect(DmRemove.statusCode).toBe(OK);
    expect(DmRemove.bodyObj).toStrictEqual(ERROR);
  });

  test('Test-4: Error, invalid token', () => {
    const user1 = requestAuthRegisterV2(
      'test1@gmail.com',
      '123456',
      'Richardo',
      'Li'
    ).bodyObj;
    const user2 = requestAuthRegisterV2(
      'test2@gmail.com',
      '1234567',
      'Shenba',
      'Chen'
    ).bodyObj;
    const dmId = requestDmCreateV1(user1.token, [user2.authUserId]).bodyObj
      .dmId;
    const DmRemove = requestDmRemoveV1(user1.token + 1, dmId);
    expect(DmRemove.statusCode).toBe(OK);
    expect(DmRemove.bodyObj).toStrictEqual(ERROR);
  });

  test('Test-5, correct input parameters', () => {
    const user1 = requestAuthRegisterV2(
      'test1@gmail.com',
      '123456',
      'Richardo',
      'Li'
    ).bodyObj;
    const user2 = requestAuthRegisterV2(
      'test2@gmail.com',
      '1234567',
      'Shenba',
      'Chen'
    ).bodyObj;
    const dmId = requestDmCreateV1(user1.token, [user2.authUserId]).bodyObj
      .dmId;
    const DmRemove = requestDmRemoveV1(user1.token, dmId);
    expect(DmRemove.statusCode).toBe(OK);
    expect(DmRemove.bodyObj).toStrictEqual({});
  });
});

describe('Testing /dm/details/v1', () => {
  test('Test-1: Error, invalid dmId', () => {
    const user1 = requestAuthRegisterV2(
      'test1@gmail.com',
      '123456',
      'Richardo',
      'Li'
    ).bodyObj;
    const user2 = requestAuthRegisterV2(
      'test2@gmail.com',
      '1234567',
      'Shenba',
      'Chen'
    ).bodyObj;
    const dmId = requestDmCreateV1(user1.token, [user2.authUserId]).bodyObj
      .dmId;
    const DmDetails = requestDmDetailsV1(user1.token, dmId + 1);
    expect(DmDetails.statusCode).toBe(OK);
    expect(DmDetails.bodyObj).toStrictEqual(ERROR);
  });

  test('Test-2: Error, authorised user is not a member', () => {
    const user1 = requestAuthRegisterV2(
      'test1@gmail.com',
      '123456',
      'Richardo',
      'Li'
    ).bodyObj;
    const user2 = requestAuthRegisterV2(
      'test2@gmail.com',
      '1234567',
      'Shenba',
      'Chen'
    ).bodyObj;
    const user3 = requestAuthRegisterV2(
      'test3@gmail.com',
      '12345678',
      'Kunda',
      'Yu'
    ).bodyObj;
    const dmId = requestDmCreateV1(user1.token, [user2.authUserId]).bodyObj
      .dmId;
    const DmDetails = requestDmDetailsV1(user3.token, dmId);
    expect(DmDetails.statusCode).toBe(OK);
    expect(DmDetails.bodyObj).toStrictEqual(ERROR);
  });

  test('Test-3: Error, invalid token', () => {
    const user1 = requestAuthRegisterV2(
      'test1@gmail.com',
      '123456',
      'Richardo',
      'Li'
    ).bodyObj;
    const user2 = requestAuthRegisterV2(
      'test2@gmail.com',
      '1234567',
      'Shenba',
      'Chen'
    ).bodyObj;
    const dmId = requestDmCreateV1(user1.token, [user2.authUserId]).bodyObj
      .dmId;
    const DmDetails = requestDmDetailsV1(user1.token + 1, dmId);
    expect(DmDetails.statusCode).toBe(OK);
    expect(DmDetails.bodyObj).toStrictEqual(ERROR);
  });

  test('Test-4, correct input parameters', () => {
    const user1 = requestAuthRegisterV2(
      'test1@gmail.com',
      '123456',
      'Richardo',
      'Li'
    ).bodyObj;
    const user2 = requestAuthRegisterV2(
      'test2@gmail.com',
      '1234567',
      'Shenba',
      'Chen'
    ).bodyObj;
    const user3 = requestAuthRegisterV2(
      'test3@gmail.com',
      '12345678',
      'Kunda',
      'Yu'
    ).bodyObj;
    const dmId = requestDmCreateV1(user1.token, [
      user2.authUserId,
      user3.authUserId,
    ]).bodyObj.dmId;
    const DmDetails = requestDmDetailsV1(user3.token, dmId);
    expect(DmDetails.statusCode).toBe(OK);
    expect(DmDetails.bodyObj).toStrictEqual({
      name: 'kundayu, richardoli, shenbachen',
      members: [
        {
          uId: user1.authUserId,
          email: 'test1@gmail.com',
          nameFirst: 'Richardo',
          nameLast: 'Li',
          handleStr: 'richardoli',
        },
        {
          uId: user2.authUserId,
          email: 'test2@gmail.com',
          nameFirst: 'Shenba',
          nameLast: 'Chen',
          handleStr: 'shenbachen',
        },
        {
          uId: user3.authUserId,
          email: 'test3@gmail.com',
          nameFirst: 'Kunda',
          nameLast: 'Yu',
          handleStr: 'kundayu',
        },
      ],
    });
  });

  test('Test-5, calling dm details with different users', () => {
    const user1 = requestAuthRegisterV2(
      'test1@gmail.com',
      '123456',
      'Richardo',
      'Li'
    ).bodyObj;
    const user2 = requestAuthRegisterV2(
      'test2@gmail.com',
      '1234567',
      'Shenba',
      'Chen'
    ).bodyObj;
    const user3 = requestAuthRegisterV2(
      'test3@gmail.com',
      '12345678',
      'Kunda',
      'Yu'
    ).bodyObj;
    const dmId = requestDmCreateV1(user1.token, [
      user2.authUserId,
      user3.authUserId,
    ]).bodyObj.dmId;
    expect(requestDmDetailsV1(user1.token, dmId)).toStrictEqual(
      requestDmDetailsV1(user3.token, dmId)
    );
  });
});

describe('Testing /dm/leave/v1', () => {
  test('Test-1: Error, invalid dmId', () => {
    const user1 = requestAuthRegisterV2(
      'test1@gmail.com',
      '123456',
      'Richardo',
      'Li'
    ).bodyObj;
    const user2 = requestAuthRegisterV2(
      'test2@gmail.com',
      '1234567',
      'Shenba',
      'Chen'
    ).bodyObj;
    const dmId = requestDmCreateV1(user1.token, [user2.authUserId]).bodyObj
      .dmId;
    const DmLeave = requestDmLeaveV1(user1.token, dmId + 1);
    expect(DmLeave.statusCode).toBe(OK);
    expect(DmLeave.bodyObj).toStrictEqual(ERROR);
  });

  test('Test-2: Error, authorised user is not a member', () => {
    const user1 = requestAuthRegisterV2(
      'test1@gmail.com',
      '123456',
      'Richardo',
      'Li'
    ).bodyObj;
    const user2 = requestAuthRegisterV2(
      'test2@gmail.com',
      '1234567',
      'Shenba',
      'Chen'
    ).bodyObj;
    const user3 = requestAuthRegisterV2(
      'test3@gmail.com',
      '12345678',
      'Kunda',
      'Yu'
    ).bodyObj;
    const dmId = requestDmCreateV1(user1.token, [user2.authUserId]).bodyObj
      .dmId;
    const DmLeave = requestDmLeaveV1(user3.token, dmId);
    expect(DmLeave.statusCode).toBe(OK);
    expect(DmLeave.bodyObj).toStrictEqual(ERROR);
  });

  test('Test-3: Error, invalid token', () => {
    const user1 = requestAuthRegisterV2(
      'test1@gmail.com',
      '123456',
      'Richardo',
      'Li'
    ).bodyObj;
    const user2 = requestAuthRegisterV2(
      'test2@gmail.com',
      '1234567',
      'Shenba',
      'Chen'
    ).bodyObj;
    const dmId = requestDmCreateV1(user1.token, [user2.authUserId]).bodyObj
      .dmId;
    const DmLeave = requestDmLeaveV1(user1.token + 1, dmId);
    expect(DmLeave.statusCode).toBe(OK);
    expect(DmLeave.bodyObj).toStrictEqual(ERROR);
  });

  test('Test-4, correct input parameters', () => {
    const user1 = requestAuthRegisterV2(
      'test1@gmail.com',
      '123456',
      'Richardo',
      'Li'
    ).bodyObj;
    const user2 = requestAuthRegisterV2(
      'test2@gmail.com',
      '1234567',
      'Shenba',
      'Chen'
    ).bodyObj;
    const user3 = requestAuthRegisterV2(
      'test3@gmail.com',
      '12345678',
      'Kunda',
      'Yu'
    ).bodyObj;
    const dmId = requestDmCreateV1(user1.token, [
      user2.authUserId,
      user3.authUserId,
    ]).bodyObj.dmId;
    const DmLeave = requestDmLeaveV1(user1.token, dmId);
    expect(DmLeave.statusCode).toBe(OK);
    expect(DmLeave.bodyObj).toStrictEqual({});

    // dm displayed without the user that left
    expect(requestDmDetailsV1(user2.token, dmId).bodyObj).toStrictEqual({
      name: 'kundayu, richardoli, shenbachen',
      members: [
        {
          uId: user2.authUserId,
          email: 'test2@gmail.com',
          nameFirst: 'Shenba',
          nameLast: 'Chen',
          handleStr: 'shenbachen',
        },
        {
          uId: user3.authUserId,
          email: 'test3@gmail.com',
          nameFirst: 'Kunda',
          nameLast: 'Yu',
          handleStr: 'kundayu',
        },
      ],
    });
  });
});

describe('Testing /dm/messages/v1', () => {
  test('Test-1: Error, invalid dmId', () => {
    const user1 = requestAuthRegisterV2(
      'test1@gmail.com',
      '123456',
      'Richardo',
      'Li'
    ).bodyObj;
    const user2 = requestAuthRegisterV2(
      'test2@gmail.com',
      '1234567',
      'Shenba',
      'Chen'
    ).bodyObj;
    const dmId = requestDmCreateV1(user1.token, [user2.authUserId]).bodyObj
      .dmId;
    const DmMessages = requestDmMessagesV1(user1.token, dmId + 1, 0);
    expect(DmMessages.statusCode).toBe(OK);
    expect(DmMessages.bodyObj).toStrictEqual(ERROR);
  });

  test('Test-2: Error, start greater than total number of messages', () => {
    const user1 = requestAuthRegisterV2(
      'test1@gmail.com',
      '123456',
      'Richardo',
      'Li'
    ).bodyObj;
    const user2 = requestAuthRegisterV2(
      'test2@gmail.com',
      '1234567',
      'Shenba',
      'Chen'
    ).bodyObj;
    const dmId = requestDmCreateV1(user1.token, [user2.authUserId]).bodyObj
      .dmId;
    const DmMessages = requestDmMessagesV1(user1.token, dmId, 100);
    expect(DmMessages.statusCode).toBe(OK);
    expect(DmMessages.bodyObj).toStrictEqual(ERROR);
  });

  test('Test-3: Error, authorised user not a member', () => {
    const user1 = requestAuthRegisterV2(
      'test1@gmail.com',
      '123456',
      'Richardo',
      'Li'
    ).bodyObj;
    const user2 = requestAuthRegisterV2(
      'test2@gmail.com',
      '1234567',
      'Shenba',
      'Chen'
    ).bodyObj;
    const user3 = requestAuthRegisterV2(
      'test3@gmail.com',
      '12345678',
      'Kunda',
      'Yu'
    ).bodyObj;
    const dmId = requestDmCreateV1(user1.token, [user2.authUserId]).bodyObj
      .dmId;
    const DmMessages = requestDmMessagesV1(user3.token, dmId, 0);
    expect(DmMessages.statusCode).toBe(OK);
    expect(DmMessages.bodyObj).toStrictEqual(ERROR);
  });

  test('Test-4: Error, invalid token', () => {
    const user1 = requestAuthRegisterV2(
      'test1@gmail.com',
      '123456',
      'Richardo',
      'Li'
    ).bodyObj;
    const user2 = requestAuthRegisterV2(
      'test2@gmail.com',
      '1234567',
      'Shenba',
      'Chen'
    ).bodyObj;
    const dmId = requestDmCreateV1(user1.token, [user2.authUserId]).bodyObj
      .dmId;
    const DmMessages = requestDmMessagesV1(user1.token + 1, dmId, 0);
    expect(DmMessages.statusCode).toBe(OK);
    expect(DmMessages.bodyObj).toStrictEqual(ERROR);
  });

  test('Test-5, Success, start is 0, and there are in total 0 messages', () => {
    const user1 = requestAuthRegisterV2(
      'test1@gmail.com',
      '123456',
      'Richardo',
      'Li'
    ).bodyObj;
    const user2 = requestAuthRegisterV2(
      'test2@gmail.com',
      '1234567',
      'Shenba',
      'Chen'
    ).bodyObj;
    const dmId = requestDmCreateV1(user1.token, [user2.authUserId]).bodyObj
      .dmId;
    const DmMessages = requestDmMessagesV1(user1.token, dmId, 0);
    expect(DmMessages.statusCode).toBe(OK);
    expect(DmMessages.bodyObj).toStrictEqual({
      messages: expect.any(Array),
      start: 0,
      end: -1,
    });
  });

  test('Test-6: Success, start is 0, and there are in total 50 messages', () => {
    const user1 = requestAuthRegisterV2(
      'test1@gmail.com',
      '123456',
      'Richardo',
      'Li'
    ).bodyObj;
    const user2 = requestAuthRegisterV2(
      'test2@gmail.com',
      '1234567',
      'Shenba',
      'Chen'
    ).bodyObj;
    const dmId = requestDmCreateV1(user1.token, [user2.authUserId]).bodyObj
      .dmId;
    createMessages(user1.token, dmId, 50);
    const DmMessages = requestDmMessagesV1(user1.token, dmId, 0);
    expect(DmMessages.statusCode).toBe(OK);
    expect(DmMessages.bodyObj).toStrictEqual({
      messages: expect.any(Array),
      start: 0,
      end: -1,
    });
    // Ensure the returned messages are from most recent to least recent
    expect(DmMessages.bodyObj.messages[0].message).toBe('49');
    expect(DmMessages.bodyObj.messages[49].message).toBe('0');
  });

  test('Test-7: Success, start is 60, and there are in total 60 messages', () => {
    const user1 = requestAuthRegisterV2(
      'test1@gmail.com',
      '123456',
      'Richardo',
      'Li'
    ).bodyObj;
    const user2 = requestAuthRegisterV2(
      'test2@gmail.com',
      '1234567',
      'Shenba',
      'Chen'
    ).bodyObj;
    const dmId = requestDmCreateV1(user1.token, [user2.authUserId]).bodyObj
      .dmId;
    createMessages(user1.token, dmId, 60);
    const DmMessages = requestDmMessagesV1(user1.token, dmId, 60);
    expect(DmMessages.statusCode).toBe(OK);
    expect(DmMessages.bodyObj).toStrictEqual({
      messages: expect.any(Array),
      start: 60,
      end: -1,
    });
  });

  test('Test-8: Success, start is 0, and there are in total 51 messages', () => {
    const user1 = requestAuthRegisterV2(
      'test1@gmail.com',
      '123456',
      'Richardo',
      'Li'
    ).bodyObj;
    const user2 = requestAuthRegisterV2(
      'test2@gmail.com',
      '1234567',
      'Shenba',
      'Chen'
    ).bodyObj;
    const dmId = requestDmCreateV1(user1.token, [user2.authUserId]).bodyObj
      .dmId;
    createMessages(user1.token, dmId, 51);
    const DmMessages1 = requestDmMessagesV1(user1.token, dmId, 0);
    const DmMessages2 = requestDmMessagesV1(user1.token, dmId, 50);
    expect(DmMessages1.statusCode).toBe(OK);
    expect(DmMessages1.bodyObj).toStrictEqual({
      messages: expect.any(Array),
      start: 0,
      end: 50,
    });
    expect(DmMessages2.statusCode).toBe(OK);
    expect(DmMessages2.bodyObj).toStrictEqual({
      messages: expect.any(Array),
      start: 50,
      end: -1,
    });
    // Ensure the returned messages are from most recent to least recent
    expect(DmMessages1.bodyObj.messages[0].message).toBe('50');
    expect(DmMessages1.bodyObj.messages[49].message).toBe('1');
    expect(DmMessages2.bodyObj.messages[0].message).toBe('0');
    const expectedTimeSent = Math.floor(Date.now() / 1000);
    // make sure the message sent has a time before now
    expect(DmMessages1.bodyObj.messages[0].timeSent / 1000).toBeLessThanOrEqual(
      expectedTimeSent
    );
  });
});

const createMessages = (
  token: string,
  dmId: number,
  repetition: number
): void => {
  for (let count = 0; count < repetition; count++) {
    requestMessageSendDmV1(token, dmId, `${count}`);
  }
};
