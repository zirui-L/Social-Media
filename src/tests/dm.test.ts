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
  requestMessageEdit,
} from './testHelper';
import { FORBIDDEN, OK, BAD_REQUEST } from '../helperFunctions/helperFunctions';
import { dmMessagesV2 } from '../dm';

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
    const dmCreate = requestDmCreate(user1.token, [user2.authUserId + 1]);
    expect(dmCreate.statusCode).toBe(BAD_REQUEST);
    expect(dmCreate.bodyObj).toStrictEqual(undefined);
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
    const dmCreate = requestDmCreate(user1.token, [
      user2.authUserId,
      user2.authUserId,
    ]);
    expect(dmCreate.statusCode).toBe(BAD_REQUEST);
    expect(dmCreate.bodyObj).toStrictEqual(undefined);
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
    const dmCreate = requestDmCreate(user1.token, [
      user1.authUserId,
      user2.authUserId,
    ]);
    expect(dmCreate.statusCode).toBe(BAD_REQUEST);
    expect(dmCreate.bodyObj).toStrictEqual(undefined);
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
    const dmCreate = requestDmCreate(user1.token + 1, [user2.authUserId]);
    expect(dmCreate.statusCode).toBe(FORBIDDEN);
    expect(dmCreate.bodyObj).toStrictEqual(undefined);
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
    const dmCreate = requestDmCreate(user1.token, [user2.authUserId]);
    expect(dmCreate.statusCode).toBe(OK);
    expect(dmCreate.bodyObj).toStrictEqual({ dmId: expect.any(Number) });
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
    const dmList = requestDmList(user1.token + 1);
    expect(dmList.statusCode).toBe(FORBIDDEN);
    expect(dmList.bodyObj).toStrictEqual(undefined);
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
    const dmCreate = requestDmCreate(user1.token, [user2.authUserId]);
    const dmList = requestDmList(user1.token);
    expect(dmList.statusCode).toBe(OK);
    expect(dmList.bodyObj).toStrictEqual({
      dms: [
        {
          dmId: dmCreate.bodyObj.dmId,
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
    const dmRemove = requestDmRemove(user1.token, dmId + 1);
    expect(dmRemove.statusCode).toBe(BAD_REQUEST);
    expect(dmRemove.bodyObj).toStrictEqual(undefined);
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
    const dmRemove = requestDmRemove(user2.token, dmId);
    expect(dmRemove.statusCode).toBe(FORBIDDEN);
    expect(dmRemove.bodyObj).toStrictEqual(undefined);
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
    const dmRemove = requestDmRemove(user1.token, dmId);
    expect(dmRemove.statusCode).toBe(FORBIDDEN);
    expect(dmRemove.bodyObj).toStrictEqual(undefined);
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
    const dmRemove = requestDmRemove(user1.token + 1, dmId);
    expect(dmRemove.statusCode).toBe(FORBIDDEN);
    expect(dmRemove.bodyObj).toStrictEqual(undefined);
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
    const message = requestMessageSendDm(user1.token, dmId, 'firstMessage').bodyObj;
    const dmRemove = requestDmRemove(user1.token, dmId);
    expect(dmRemove.statusCode).toBe(OK);
    expect(dmRemove.bodyObj).toStrictEqual({});
    const edit = requestMessageEdit(user1.token, message.messageId, '');
    // should return error since the message is deleted
    expect(edit.statusCode).toBe(BAD_REQUEST);
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
    const dmDetails = requestDmDetails(user1.token, dmId + 1);
    expect(dmDetails.statusCode).toBe(BAD_REQUEST);
    expect(dmDetails.bodyObj).toStrictEqual(undefined);
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
    const dmDetails = requestDmDetails(user3.token, dmId);
    expect(dmDetails.statusCode).toBe(FORBIDDEN);
    expect(dmDetails.bodyObj).toStrictEqual(undefined);
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
    const dmDetails = requestDmDetails(user1.token + 1, dmId);
    expect(dmDetails.statusCode).toBe(FORBIDDEN);
    expect(dmDetails.bodyObj).toStrictEqual(undefined);
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
    const dmDetails = requestDmDetails(user3.token, dmId);
    expect(dmDetails.statusCode).toBe(OK);
    expect(dmDetails.bodyObj).toStrictEqual({
      name: 'kundayu, richardoli, shenbachen',
      members: [
        {
          uId: user1.authUserId,
          email: 'test1@gmail.com',
          nameFirst: 'Richardo',
          nameLast: 'Li',
          handleStr: 'richardoli',
          profileImgUrl: expect.any(String),
        },
        {
          uId: user2.authUserId,
          email: 'test2@gmail.com',
          nameFirst: 'Shenba',
          nameLast: 'Chen',
          handleStr: 'shenbachen',
          profileImgUrl: expect.any(String),
        },
        {
          uId: user3.authUserId,
          email: 'test3@gmail.com',
          nameFirst: 'Kunda',
          nameLast: 'Yu',
          handleStr: 'kundayu',
          profileImgUrl: expect.any(String),
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
    const dmLeave = requestDmLeave(user1.token, dmId + 1);
    expect(dmLeave.statusCode).toBe(BAD_REQUEST);
    expect(dmLeave.bodyObj).toStrictEqual(undefined);
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
    const dmLeave = requestDmLeave(user3.token, dmId);
    expect(dmLeave.statusCode).toBe(FORBIDDEN);
    expect(dmLeave.bodyObj).toStrictEqual(undefined);
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
    const dmLeave = requestDmLeave(user1.token + 1, dmId);
    expect(dmLeave.statusCode).toBe(FORBIDDEN);
    expect(dmLeave.bodyObj).toStrictEqual(undefined);
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
    const dmLeave = requestDmLeave(user1.token, dmId);
    expect(dmLeave.statusCode).toBe(OK);
    expect(dmLeave.bodyObj).toStrictEqual({});

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
          profileImgUrl: expect.any(String),
        },
        {
          uId: user3.authUserId,
          email: 'test3@gmail.com',
          nameFirst: 'Kunda',
          nameLast: 'Yu',
          handleStr: 'kundayu',
          profileImgUrl: expect.any(String),
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
    const dmMessages = requestDmMessages(user1.token, dmId + 1, 0);
    expect(dmMessages.statusCode).toBe(BAD_REQUEST);
    expect(dmMessages.bodyObj).toStrictEqual(undefined);
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
    const dmMessages = requestDmMessages(user1.token, dmId, 100);
    expect(dmMessages.statusCode).toBe(BAD_REQUEST);
    expect(dmMessages.bodyObj).toStrictEqual(undefined);
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
    const dmMessages = requestDmMessages(user3.token, dmId, 0);
    expect(dmMessages.statusCode).toBe(FORBIDDEN);
    expect(dmMessages.bodyObj).toStrictEqual(undefined);
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
    const dmMessages = requestDmMessages(user1.token + 1, dmId, 0);
    expect(dmMessages.statusCode).toBe(FORBIDDEN);
    expect(dmMessages.bodyObj).toStrictEqual(undefined);
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
    const dmMessages = requestDmMessages(user1.token, dmId, 0);
    expect(dmMessages.statusCode).toBe(OK);
    expect(dmMessages.bodyObj).toStrictEqual({
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
    const dmMessages = requestDmMessages(user1.token, dmId, 0);
    expect(dmMessages.statusCode).toBe(OK);
    expect(dmMessages.bodyObj).toStrictEqual({
      messages: expect.any(Array),
      start: 0,
      end: -1,
    });
    // Ensure the returned messages are from most recent to least recent
    expect(dmMessages.bodyObj.messages[0].message).toBe('49');
    expect(dmMessages.bodyObj.messages[49].message).toBe('0');
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
    const dmMessages = requestDmMessages(user1.token, dmId, 60);
    expect(dmMessages.statusCode).toBe(OK);
    expect(dmMessages.bodyObj).toStrictEqual({
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
    const dmMessages1 = requestDmMessages(user1.token, dmId, 0);
    const dmMessages2 = requestDmMessages(user1.token, dmId, 50);
    expect(dmMessages1.statusCode).toBe(OK);
    expect(dmMessages1.bodyObj).toStrictEqual({
      messages: expect.any(Array),
      start: 0,
      end: 50,
    });
    expect(dmMessages2.statusCode).toBe(OK);
    expect(dmMessages2.bodyObj).toStrictEqual({
      messages: expect.any(Array),
      start: 50,
      end: -1,
    });
    // Ensure the returned messages are from most recent to least recent
    expect(dmMessages1.bodyObj.messages[0].message).toBe('50');
    expect(dmMessages1.bodyObj.messages[49].message).toBe('1');
    expect(dmMessages2.bodyObj.messages[0].message).toBe('0');
    const expectedTimeSent = Math.floor(Date.now() / 1000);
    // make sure the message sent has a time before now
    expect(dmMessages1.bodyObj.messages[0].timeSent / 1000).toBeLessThanOrEqual(
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
