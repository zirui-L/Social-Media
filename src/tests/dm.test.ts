import {
  requestAuthRegister,
  requestClear,
  requestDmCreate,
  requestDmList,
  requestDmRemove,
  requestDmDetails,
  requestDmLeave,
  requestDmMessages,
  requestMessageSendDm,
  BAD_REQUEST,
  FORBIDDEN,
  OK,
} from '../helperFunctions/helperServer';

beforeEach(() => {
  requestClear();
});

afterEach(() => {
  requestClear();
});

describe('Testing /dm/create/v2', () => {
  test('Test-1: Error, incorrect uId in uIds', () => {
    const user1 = requestAuthRegister(
      'test1@gmail.com',
      '123456',
      'Richardo',
      'Li'
    ).bodyObj;
    const user2 = requestAuthRegister(
      'test2@gmail.com',
      '1234567',
      'Shenba',
      'Chen'
    ).bodyObj;
    const DmCreate = requestDmCreate(user1.token, [user2.authUserId + 1]);
    expect(DmCreate.statusCode).toBe(BAD_REQUEST);
    expect(DmCreate.bodyObj).toStrictEqual(undefined);
  });

  test('Test-2: Error, duplicate uId in uIds', () => {
    const user1 = requestAuthRegister(
      'test1@gmail.com',
      '123456',
      'Richardo',
      'Li'
    ).bodyObj;
    const user2 = requestAuthRegister(
      'test2@gmail.com',
      '1234567',
      'Shenba',
      'Chen'
    ).bodyObj;
    const DmCreate = requestDmCreate(user1.token, [
      user2.authUserId,
      user2.authUserId,
    ]);
    expect(DmCreate.statusCode).toBe(BAD_REQUEST);
    expect(DmCreate.bodyObj).toStrictEqual(undefined);
  });

  test('Test-3: Error, creator.uId in uIds', () => {
    const user1 = requestAuthRegister(
      'test1@gmail.com',
      '123456',
      'Richardo',
      'Li'
    ).bodyObj;
    const user2 = requestAuthRegister(
      'test2@gmail.com',
      '1234567',
      'Shenba',
      'Chen'
    ).bodyObj;
    const DmCreate = requestDmCreate(user1.token, [
      user1.authUserId,
      user2.authUserId,
    ]);
    expect(DmCreate.statusCode).toBe(BAD_REQUEST);
    expect(DmCreate.bodyObj).toStrictEqual(undefined);
  });

  test('Test-4: Error, invalid token', () => {
    const user1 = requestAuthRegister(
      'test1@gmail.com',
      '123456',
      'Richardo',
      'Li'
    ).bodyObj;
    const user2 = requestAuthRegister(
      'test2@gmail.com',
      '1234567',
      'Shenba',
      'Chen'
    ).bodyObj;
    const DmCreate = requestDmCreate(user1.token + 1, [user2.authUserId]);
    expect(DmCreate.statusCode).toBe(BAD_REQUEST);
    expect(DmCreate.bodyObj).toStrictEqual(undefined);
  });

  test('Test-5: Success, correct input parameters', () => {
    const user1 = requestAuthRegister(
      'test1@gmail.com',
      '123456',
      'Richardo',
      'Li'
    ).bodyObj;
    const user2 = requestAuthRegister(
      'test2@gmail.com',
      '1234567',
      'Shenba',
      'Chen'
    ).bodyObj;
    const DmCreate = requestDmCreate(user1.token, [user2.authUserId]);
    expect(DmCreate.statusCode).toBe(OK);
    expect(DmCreate.bodyObj).toStrictEqual({ dmId: expect.any(Number) });
  });
});

describe('Testing /dm/list/v2', () => {
  test('Test-1: Error, invalid token', () => {
    const user1 = requestAuthRegister(
      'test1@gmail.com',
      '123456',
      'Richardo',
      'Li'
    ).bodyObj;
    const DmList = requestDmList(user1.token + 1);
    expect(DmList.statusCode).toBe(BAD_REQUEST);
    expect(DmList.bodyObj).toStrictEqual(undefined);
  });

  test('Test-2, correct input parameters', () => {
    const user1 = requestAuthRegister(
      'test1@gmail.com',
      '1234567',
      'Shenba',
      'Chen'
    ).bodyObj;
    const user2 = requestAuthRegister(
      'test2@gmail.com',
      '123456',
      'Richardo',
      'Li'
    ).bodyObj;
    const DmCreate = requestDmCreate(user1.token, [user2.authUserId]);
    const DmList = requestDmList(user1.token);
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
    const user1 = requestAuthRegister(
      'test1@gmail.com',
      '1234567',
      'Shenba',
      'Chen'
    ).bodyObj;
    const user2 = requestAuthRegister(
      'test2@gmail.com',
      '123456',
      'Richardo',
      'Li'
    ).bodyObj;
    requestDmCreate(user1.token, [user2.authUserId]);
    expect(requestDmList(user1.token)).toStrictEqual(
      requestDmList(user2.token)
    );
  });
});

describe('Testing /dm/remove/v2', () => {
  test('Test-1: Error, invalid dmId', () => {
    const user1 = requestAuthRegister(
      'test1@gmail.com',
      '123456',
      'Richardo',
      'Li'
    ).bodyObj;
    const user2 = requestAuthRegister(
      'test2@gmail.com',
      '1234567',
      'Shenba',
      'Chen'
    ).bodyObj;
    const dmId = requestDmCreate(user1.token, [user2.authUserId]).bodyObj.dmId;
    const DmRemove = requestDmRemove(user1.token, dmId + 1);
    expect(DmRemove.statusCode).toBe(BAD_REQUEST);
    expect(DmRemove.bodyObj).toStrictEqual(undefined);
  });

  test('Test-2: Error, authorised user is not DM creator', () => {
    const user1 = requestAuthRegister(
      'test1@gmail.com',
      '123456',
      'Richardo',
      'Li'
    ).bodyObj;
    const user2 = requestAuthRegister(
      'test2@gmail.com',
      '1234567',
      'Shenba',
      'Chen'
    ).bodyObj;
    const dmId = requestDmCreate(user1.token, [user2.authUserId]).bodyObj.dmId;
    const DmRemove = requestDmRemove(user2.token, dmId);
    expect(DmRemove.statusCode).toBe(FORBIDDEN);
    expect(DmRemove.bodyObj).toStrictEqual(undefined);
  });

  test('Test-3: Error, authorised user no longer in the DM', () => {
    const user1 = requestAuthRegister(
      'test1@gmail.com',
      '123456',
      'Richardo',
      'Li'
    ).bodyObj;
    const user2 = requestAuthRegister(
      'test2@gmail.com',
      '1234567',
      'Shenba',
      'Chen'
    ).bodyObj;
    const dmId = requestDmCreate(user1.token, [user2.authUserId]).bodyObj.dmId;
    requestDmLeave(user1.token, dmId);
    const DmRemove = requestDmRemove(user1.token, dmId);
    expect(DmRemove.statusCode).toBe(FORBIDDEN);
    expect(DmRemove.bodyObj).toStrictEqual(undefined);
  });

  test('Test-4: Error, invalid token', () => {
    const user1 = requestAuthRegister(
      'test1@gmail.com',
      '123456',
      'Richardo',
      'Li'
    ).bodyObj;
    const user2 = requestAuthRegister(
      'test2@gmail.com',
      '1234567',
      'Shenba',
      'Chen'
    ).bodyObj;
    const dmId = requestDmCreate(user1.token, [user2.authUserId]).bodyObj.dmId;
    const DmRemove = requestDmRemove(user1.token + 1, dmId);
    expect(DmRemove.statusCode).toBe(BAD_REQUEST);
    expect(DmRemove.bodyObj).toStrictEqual(undefined);
  });

  test('Test-5, correct input parameters', () => {
    const user1 = requestAuthRegister(
      'test1@gmail.com',
      '123456',
      'Richardo',
      'Li'
    ).bodyObj;
    const user2 = requestAuthRegister(
      'test2@gmail.com',
      '1234567',
      'Shenba',
      'Chen'
    ).bodyObj;
    const dmId = requestDmCreate(user1.token, [user2.authUserId]).bodyObj.dmId;
    const DmRemove = requestDmRemove(user1.token, dmId);
    expect(DmRemove.statusCode).toBe(OK);
    expect(DmRemove.bodyObj).toStrictEqual({});
  });
});

describe('Testing /dm/details/v2', () => {
  test('Test-1: Error, invalid dmId', () => {
    const user1 = requestAuthRegister(
      'test1@gmail.com',
      '123456',
      'Richardo',
      'Li'
    ).bodyObj;
    const user2 = requestAuthRegister(
      'test2@gmail.com',
      '1234567',
      'Shenba',
      'Chen'
    ).bodyObj;
    const dmId = requestDmCreate(user1.token, [user2.authUserId]).bodyObj.dmId;
    const DmDetails = requestDmDetails(user1.token, dmId + 1);
    expect(DmDetails.statusCode).toBe(BAD_REQUEST);
    expect(DmDetails.bodyObj).toStrictEqual(undefined);
  });

  test('Test-2: Error, authorised user is not a member', () => {
    const user1 = requestAuthRegister(
      'test1@gmail.com',
      '123456',
      'Richardo',
      'Li'
    ).bodyObj;
    const user2 = requestAuthRegister(
      'test2@gmail.com',
      '1234567',
      'Shenba',
      'Chen'
    ).bodyObj;
    const user3 = requestAuthRegister(
      'test3@gmail.com',
      '12345678',
      'Kunda',
      'Yu'
    ).bodyObj;
    const dmId = requestDmCreate(user1.token, [user2.authUserId]).bodyObj.dmId;
    const DmDetails = requestDmDetails(user3.token, dmId);
    expect(DmDetails.statusCode).toBe(FORBIDDEN);
    expect(DmDetails.bodyObj).toStrictEqual(undefined);
  });

  test('Test-3: Error, invalid token', () => {
    const user1 = requestAuthRegister(
      'test1@gmail.com',
      '123456',
      'Richardo',
      'Li'
    ).bodyObj;
    const user2 = requestAuthRegister(
      'test2@gmail.com',
      '1234567',
      'Shenba',
      'Chen'
    ).bodyObj;
    const dmId = requestDmCreate(user1.token, [user2.authUserId]).bodyObj.dmId;
    const DmDetails = requestDmDetails(user1.token + 1, dmId);
    expect(DmDetails.statusCode).toBe(BAD_REQUEST);
    expect(DmDetails.bodyObj).toStrictEqual(undefined);
  });

  test('Test-4, correct input parameters', () => {
    const user1 = requestAuthRegister(
      'test1@gmail.com',
      '123456',
      'Richardo',
      'Li'
    ).bodyObj;
    const user2 = requestAuthRegister(
      'test2@gmail.com',
      '1234567',
      'Shenba',
      'Chen'
    ).bodyObj;
    const user3 = requestAuthRegister(
      'test3@gmail.com',
      '12345678',
      'Kunda',
      'Yu'
    ).bodyObj;
    const dmId = requestDmCreate(user1.token, [
      user2.authUserId,
      user3.authUserId,
    ]).bodyObj.dmId;
    const DmDetails = requestDmDetails(user3.token, dmId);
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
    const user1 = requestAuthRegister(
      'test1@gmail.com',
      '123456',
      'Richardo',
      'Li'
    ).bodyObj;
    const user2 = requestAuthRegister(
      'test2@gmail.com',
      '1234567',
      'Shenba',
      'Chen'
    ).bodyObj;
    const user3 = requestAuthRegister(
      'test3@gmail.com',
      '12345678',
      'Kunda',
      'Yu'
    ).bodyObj;
    const dmId = requestDmCreate(user1.token, [
      user2.authUserId,
      user3.authUserId,
    ]).bodyObj.dmId;
    expect(requestDmDetails(user1.token, dmId)).toStrictEqual(
      requestDmDetails(user3.token, dmId)
    );
  });
});

describe('Testing /dm/leave/v2', () => {
  test('Test-1: Error, invalid dmId', () => {
    const user1 = requestAuthRegister(
      'test1@gmail.com',
      '123456',
      'Richardo',
      'Li'
    ).bodyObj;
    const user2 = requestAuthRegister(
      'test2@gmail.com',
      '1234567',
      'Shenba',
      'Chen'
    ).bodyObj;
    const dmId = requestDmCreate(user1.token, [user2.authUserId]).bodyObj.dmId;
    const DmLeave = requestDmLeave(user1.token, dmId + 1);
    expect(DmLeave.statusCode).toBe(BAD_REQUEST);
    expect(DmLeave.bodyObj).toStrictEqual(undefined);
  });

  test('Test-2: Error, authorised user is not a member', () => {
    const user1 = requestAuthRegister(
      'test1@gmail.com',
      '123456',
      'Richardo',
      'Li'
    ).bodyObj;
    const user2 = requestAuthRegister(
      'test2@gmail.com',
      '1234567',
      'Shenba',
      'Chen'
    ).bodyObj;
    const user3 = requestAuthRegister(
      'test3@gmail.com',
      '12345678',
      'Kunda',
      'Yu'
    ).bodyObj;
    const dmId = requestDmCreate(user1.token, [user2.authUserId]).bodyObj.dmId;
    const DmLeave = requestDmLeave(user3.token, dmId);
    expect(DmLeave.statusCode).toBe(FORBIDDEN);
    expect(DmLeave.bodyObj).toStrictEqual(undefined);
  });

  test('Test-3: Error, invalid token', () => {
    const user1 = requestAuthRegister(
      'test1@gmail.com',
      '123456',
      'Richardo',
      'Li'
    ).bodyObj;
    const user2 = requestAuthRegister(
      'test2@gmail.com',
      '1234567',
      'Shenba',
      'Chen'
    ).bodyObj;
    const dmId = requestDmCreate(user1.token, [user2.authUserId]).bodyObj.dmId;
    const DmLeave = requestDmLeave(user1.token + 1, dmId);
    expect(DmLeave.statusCode).toBe(BAD_REQUEST);
    expect(DmLeave.bodyObj).toStrictEqual(undefined);
  });

  test('Test-4, correct input parameters', () => {
    const user1 = requestAuthRegister(
      'test1@gmail.com',
      '123456',
      'Richardo',
      'Li'
    ).bodyObj;
    const user2 = requestAuthRegister(
      'test2@gmail.com',
      '1234567',
      'Shenba',
      'Chen'
    ).bodyObj;
    const user3 = requestAuthRegister(
      'test3@gmail.com',
      '12345678',
      'Kunda',
      'Yu'
    ).bodyObj;
    const dmId = requestDmCreate(user1.token, [
      user2.authUserId,
      user3.authUserId,
    ]).bodyObj.dmId;
    const DmLeave = requestDmLeave(user1.token, dmId);
    expect(DmLeave.statusCode).toBe(OK);
    expect(DmLeave.bodyObj).toStrictEqual({});

    // dm displayed without the user that left
    expect(requestDmDetails(user2.token, dmId).bodyObj).toStrictEqual({
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

describe('Testing /dm/messages/v2', () => {
  test('Test-1: Error, invalid dmId', () => {
    const user1 = requestAuthRegister(
      'test1@gmail.com',
      '123456',
      'Richardo',
      'Li'
    ).bodyObj;
    const user2 = requestAuthRegister(
      'test2@gmail.com',
      '1234567',
      'Shenba',
      'Chen'
    ).bodyObj;
    const dmId = requestDmCreate(user1.token, [user2.authUserId]).bodyObj.dmId;
    const DmMessages = requestDmMessages(user1.token, dmId + 1, 0);
    expect(DmMessages.statusCode).toBe(BAD_REQUEST);
    expect(DmMessages.bodyObj).toStrictEqual(undefined);
  });

  test('Test-2: Error, start greater than total number of messages', () => {
    const user1 = requestAuthRegister(
      'test1@gmail.com',
      '123456',
      'Richardo',
      'Li'
    ).bodyObj;
    const user2 = requestAuthRegister(
      'test2@gmail.com',
      '1234567',
      'Shenba',
      'Chen'
    ).bodyObj;
    const dmId = requestDmCreate(user1.token, [user2.authUserId]).bodyObj.dmId;
    const DmMessages = requestDmMessages(user1.token, dmId, 100);
    expect(DmMessages.statusCode).toBe(BAD_REQUEST);
    expect(DmMessages.bodyObj).toStrictEqual(undefined);
  });

  test('Test-3: Error, authorised user not a member', () => {
    const user1 = requestAuthRegister(
      'test1@gmail.com',
      '123456',
      'Richardo',
      'Li'
    ).bodyObj;
    const user2 = requestAuthRegister(
      'test2@gmail.com',
      '1234567',
      'Shenba',
      'Chen'
    ).bodyObj;
    const user3 = requestAuthRegister(
      'test3@gmail.com',
      '12345678',
      'Kunda',
      'Yu'
    ).bodyObj;
    const dmId = requestDmCreate(user1.token, [user2.authUserId]).bodyObj.dmId;
    const DmMessages = requestDmMessages(user3.token, dmId, 0);
    expect(DmMessages.statusCode).toBe(FORBIDDEN);
    expect(DmMessages.bodyObj).toStrictEqual(undefined);
  });

  test('Test-4: Error, invalid token', () => {
    const user1 = requestAuthRegister(
      'test1@gmail.com',
      '123456',
      'Richardo',
      'Li'
    ).bodyObj;
    const user2 = requestAuthRegister(
      'test2@gmail.com',
      '1234567',
      'Shenba',
      'Chen'
    ).bodyObj;
    const dmId = requestDmCreate(user1.token, [user2.authUserId]).bodyObj.dmId;
    const DmMessages = requestDmMessages(user1.token + 1, dmId, 0);
    expect(DmMessages.statusCode).toBe(BAD_REQUEST);
    expect(DmMessages.bodyObj).toStrictEqual(undefined);
  });

  test('Test-5, Success, start is 0, and there are in total 0 messages', () => {
    const user1 = requestAuthRegister(
      'test1@gmail.com',
      '123456',
      'Richardo',
      'Li'
    ).bodyObj;
    const user2 = requestAuthRegister(
      'test2@gmail.com',
      '1234567',
      'Shenba',
      'Chen'
    ).bodyObj;
    const dmId = requestDmCreate(user1.token, [user2.authUserId]).bodyObj.dmId;
    const DmMessages = requestDmMessages(user1.token, dmId, 0);
    expect(DmMessages.statusCode).toBe(OK);
    expect(DmMessages.bodyObj).toStrictEqual({
      messages: expect.any(Array),
      start: 0,
      end: -1,
    });
  });

  test('Test-6: Success, start is 0, and there are in total 50 messages', () => {
    const user1 = requestAuthRegister(
      'test1@gmail.com',
      '123456',
      'Richardo',
      'Li'
    ).bodyObj;
    const user2 = requestAuthRegister(
      'test2@gmail.com',
      '1234567',
      'Shenba',
      'Chen'
    ).bodyObj;
    const dmId = requestDmCreate(user1.token, [user2.authUserId]).bodyObj.dmId;
    createMessages(user1.token, dmId, 50);
    const DmMessages = requestDmMessages(user1.token, dmId, 0);
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
    const user1 = requestAuthRegister(
      'test1@gmail.com',
      '123456',
      'Richardo',
      'Li'
    ).bodyObj;
    const user2 = requestAuthRegister(
      'test2@gmail.com',
      '1234567',
      'Shenba',
      'Chen'
    ).bodyObj;
    const dmId = requestDmCreate(user1.token, [user2.authUserId]).bodyObj.dmId;
    createMessages(user1.token, dmId, 60);
    const DmMessages = requestDmMessages(user1.token, dmId, 60);
    expect(DmMessages.statusCode).toBe(OK);
    expect(DmMessages.bodyObj).toStrictEqual({
      messages: expect.any(Array),
      start: 60,
      end: -1,
    });
  });

  test('Test-8: Success, start is 0, and there are in total 51 messages', () => {
    const user1 = requestAuthRegister(
      'test1@gmail.com',
      '123456',
      'Richardo',
      'Li'
    ).bodyObj;
    const user2 = requestAuthRegister(
      'test2@gmail.com',
      '1234567',
      'Shenba',
      'Chen'
    ).bodyObj;
    const dmId = requestDmCreate(user1.token, [user2.authUserId]).bodyObj.dmId;
    createMessages(user1.token, dmId, 51);
    const DmMessages1 = requestDmMessages(user1.token, dmId, 0);
    const DmMessages2 = requestDmMessages(user1.token, dmId, 50);
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
    requestMessageSendDm(token, dmId, `${count}`);
  }
};
