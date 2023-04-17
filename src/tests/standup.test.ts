import { getTimeNow } from '../helperFunctions/helperFunctions';
import {
  requestStandupActive,
  requestStandupSend,
  requestStandupStart,
  requestClear,
  requestAuthRegister,
  requestChannelsCreate,
  requestChannelMessages,
  requestChannelJoin,
  requestMessageEdit,
} from './testHelper';
import { FORBIDDEN, OK, BAD_REQUEST } from '../helperFunctions/helperFunctions';

import { createString } from './testHelper';

import { sleep } from './testHelper';

// clear data before each test
beforeEach(() => {
  requestClear();
});
// clear data after each test
afterEach(() => {
  requestClear();
});

describe('standup/start/V1', () => {
  test('Test-1: Error, invalid token', () => {
    // create a new user
    const test1 = requestAuthRegister(
      'test1@gmail.com',
      'password1',
      'firstName1',
      'lastName'
    );
    // create channel
    const channelId1 = requestChannelsCreate(
      test1.bodyObj.token,
      'firstChannel',
      true
    );
    // verify output with invalid token
    const res = requestStandupStart(
      test1.bodyObj.token + '1',
      channelId1.bodyObj.channelId,
      1
    );
    expect(res.statusCode).toBe(FORBIDDEN);
  });

  test('Test-2: Error, channelId does not refer to a valid channel', () => {
    // create a new user
    const test1 = requestAuthRegister(
      'test1@gmail.com',
      'password1',
      'firstName1',
      'lastName1'
    );
    // create a channel
    const channelId1 = requestChannelsCreate(
      test1.bodyObj.token,
      'firstChannel',
      true
    );
    // verify output with invalid channelId
    const res = requestStandupStart(
      test1.bodyObj.token,
      channelId1.bodyObj.channelId + 1,
      1
    );
    expect(res.statusCode).toBe(BAD_REQUEST);
  });

  test('Test-3: Error, Length is a negative integer', () => {
    // create a new user
    const test1 = requestAuthRegister(
      'test1@gmail.com',
      'password1',
      'firstName1',
      'lastName1'
    );
    // create a new channel
    const channelId1 = requestChannelsCreate(
      test1.bodyObj.token,
      'firstChannel',
      true
    );
    // verify output with invalid length
    const res = requestStandupStart(
      test1.bodyObj.token,
      channelId1.bodyObj.channelId,
      -1
    );

    expect(res.statusCode).toBe(BAD_REQUEST);
  });

  test('Test-4: Error, An active standup is currently running in the channel', () => {
    // create a new user
    const test1 = requestAuthRegister(
      'test1@gmail.com',
      'password1',
      'firstName1',
      'lastName1'
    );
    // create a new channel
    const channelId1 = requestChannelsCreate(
      test1.bodyObj.token,
      'firstChannel',
      true
    );
    // verify output with an active standup is currently running in the channel
    requestStandupStart(test1.bodyObj.token, channelId1.bodyObj.channelId, 1);
    const res = requestStandupStart(
      test1.bodyObj.token,
      channelId1.bodyObj.channelId,
      0
    );
    expect(res.statusCode).toBe(BAD_REQUEST);
    sleep(2);
  });

  test('Test-5: Error, channelId is valid and the authorised user is not a member of the channel', () => {
    // create new users
    const test1 = requestAuthRegister(
      'test1@gmail.com',
      'password1',
      'firstName1',
      'lastName1'
    );

    const test2 = requestAuthRegister(
      'test2@gmail.com',
      'password2',
      'firstName2',
      'lastName2'
    );
    // create channel
    const channelId1 = requestChannelsCreate(
      test1.bodyObj.token,
      'firstChannel',
      true
    );
    // verify output with invalid a user's token who is not a member of the channel
    const res = requestStandupStart(
      test2.bodyObj.token,
      channelId1.bodyObj.channelId,
      0
    );

    expect(res.statusCode).toBe(FORBIDDEN);
  });

  test('Test-6: Success, standup start (with no standup sent)', () => {
    // create a new user
    const test1 = requestAuthRegister(
      'test1@gmail.com',
      'password1',
      'firstName1',
      'lastName1'
    );
    // create channel
    const channelId1 = requestChannelsCreate(
      test1.bodyObj.token,
      'firstChannel',
      true
    );
    // verify output with an empty standup
    const timeFinish = Math.floor(Date.now() / 1000) + 1;
    const res = requestStandupStart(
      test1.bodyObj.token,
      channelId1.bodyObj.channelId,
      1
    );

    expect(res.bodyObj).toStrictEqual({ timeFinish: expect.any(Number) });

    expect(res.bodyObj.timeFinish).toBeGreaterThanOrEqual(timeFinish);

    expect(
      requestChannelMessages(
        test1.bodyObj.token,
        channelId1.bodyObj.channelId,
        0
      ).bodyObj
    ).toStrictEqual({
      messages: [],
      start: 0,
      end: -1,
    });

    sleep(2);
  });
});

describe('standup/active/V1', () => {
  test('Test-1: Error, invalid token', () => {
    // create a new user
    const test1 = requestAuthRegister(
      'test1@gmail.com',
      'password1',
      'firstName1',
      'lastName1'
    );
    // create a new channel
    const channelId1 = requestChannelsCreate(
      test1.bodyObj.token,
      'firstChannel',
      true
    );
    // verify output with invalid token
    const res = requestStandupActive(
      test1.bodyObj.token + '1',
      channelId1.bodyObj.channelId
    );
    expect(res.statusCode).toBe(FORBIDDEN);
  });

  test('Test-2: Error, channelId does not refer to a valid channel', () => {
    // creare a new user
    const test1 = requestAuthRegister(
      'test1@gmail.com',
      'password1',
      'firstName1',
      'lastName1'
    );
    // create a new channel
    const channelId1 = requestChannelsCreate(
      test1.bodyObj.token,
      'firstChannel',
      true
    );
    // verify output with invalid channelId
    const res = requestStandupActive(
      test1.bodyObj.token,
      channelId1.bodyObj.channelId + 1
    );
    expect(res.statusCode).toBe(BAD_REQUEST);
  });

  test('Test-3: Error, channelId is valid and the authorised user is not a member of the channel', () => {
    // create new users
    const test1 = requestAuthRegister(
      'test1@gmail.com',
      'password1',
      'firstName1',
      'lastName1'
    );

    const test2 = requestAuthRegister(
      'test2@gmail.com',
      'password2',
      'firstName2',
      'lastName2'
    );
    // create a channel
    const channelId1 = requestChannelsCreate(
      test1.bodyObj.token,
      'firstChannel',
      true
    );
    // verify output with not permitted token
    const res = requestStandupActive(
      test2.bodyObj.token,
      channelId1.bodyObj.channelId
    );
    expect(res.statusCode).toBe(FORBIDDEN);
  });

  test('Test-4: Success, with no standup active', () => {
    // create a new user
    const test1 = requestAuthRegister(
      'test1@gmail.com',
      'password1',
      'firstName1',
      'lastName1'
    );
    // create a new channel
    const channelId1 = requestChannelsCreate(
      test1.bodyObj.token,
      'firstChannel',
      true
    );

    const res = requestStandupActive(
      test1.bodyObj.token,
      channelId1.bodyObj.channelId
    );
    // verify output with an empty standup
    expect(res.statusCode).toBe(OK);
    expect(res.bodyObj).toStrictEqual({
      isActive: false,
      timeFinish: null,
    });
  });

  test('Test-5: Success, with existing standup active', () => {
    // create new users
    const test1 = requestAuthRegister(
      'test1@gmail.com',
      'password1',
      'firstName1',
      'lastName1'
    );

    const test2 = requestAuthRegister(
      'test2@gmail.com',
      'password2',
      'firstName2',
      'lastName2'
    );
    // create a new channel
    const channelId1 = requestChannelsCreate(
      test1.bodyObj.token,
      'firstChannel',
      true
    );

    requestChannelJoin(test2.bodyObj.token, channelId1.bodyObj.channelId);

    const timeFinish = getTimeNow() + 1;

    const res1 = requestStandupStart(
      test1.bodyObj.token,
      channelId1.bodyObj.channelId,
      1
    );
    // verify output with valid input
    expect(res1.statusCode).toBe(OK);
    const res = requestStandupActive(
      test2.bodyObj.token,
      channelId1.bodyObj.channelId
    );

    expect(res.bodyObj).toStrictEqual({
      isActive: true,
      timeFinish: expect.any(Number),
    });

    expect(res.bodyObj.timeFinish).toBeGreaterThanOrEqual(timeFinish);

    sleep(2);
  });
});

describe('standup/send/V1', () => {
  test('Test-1: Error invalid token invalid channelId, length of message over 1000 characters, valid channelId but authUser is not in the channel', () => {
    // create new users
    const test1 = requestAuthRegister(
      'test1@gmail.com',
      'password1',
      'firstName1',
      'lastName1'
    );

    const test2 = requestAuthRegister(
      'test2@gmail.com',
      'password2',
      'firstName2',
      'lastName2'
    );
    // create a new channel
    const channelId1 = requestChannelsCreate(
      test1.bodyObj.token,
      'firstChannel',
      true
    );

    requestChannelJoin(test2.bodyObj.token, channelId1.bodyObj.channelId);

    requestStandupStart(test1.bodyObj.token, channelId1.bodyObj.channelId, 1);
    // verify output with invalid token
    const res = requestStandupSend(
      test1.bodyObj.token + '1',
      channelId1.bodyObj.channelId,
      'comp1531'
    );

    expect(res.statusCode).toBe(FORBIDDEN);
    sleep(2);
  });

  test('Test-2: Error invalid  channelId', () => {
    // create new users
    const test1 = requestAuthRegister(
      'test1@gmail.com',
      'password1',
      'firstName1',
      'lastName1'
    );

    const test2 = requestAuthRegister(
      'test2@gmail.com',
      'password2',
      'firstName2',
      'lastName2'
    );
    // create a new channel
    const channelId1 = requestChannelsCreate(
      test1.bodyObj.token,
      'firstChannel',
      true
    );

    requestChannelJoin(test2.bodyObj.token, channelId1.bodyObj.channelId);
    // verify output with invalid channelId
    requestStandupStart(test1.bodyObj.token, channelId1.bodyObj.channelId, 1);
    const res = requestStandupSend(
      test1.bodyObj.token,
      channelId1.bodyObj.channelId + 1,
      'comp1531'
    );

    expect(res.statusCode).toBe(BAD_REQUEST);
    sleep(2);
  });

  test('Test-3: Error, length of message over 1000 characters', () => {
    // create new users
    const test1 = requestAuthRegister(
      'test1@gmail.com',
      'password1',
      'firstName1',
      'lastName1'
    );

    const test2 = requestAuthRegister(
      'test2@gmail.com',
      'password2',
      'firstName2',
      'lastName2'
    );
    // create a new channel
    const channelId1 = requestChannelsCreate(
      test1.bodyObj.token,
      'firstChannel',
      true
    );

    requestChannelJoin(test2.bodyObj.token, channelId1.bodyObj.channelId);

    requestStandupStart(test1.bodyObj.token, channelId1.bodyObj.channelId, 1);
    const res = requestStandupSend(
      test1.bodyObj.token,
      channelId1.bodyObj.channelId,
      createString(1001)
    );
    // verify output with invalid message length
    expect(res.statusCode).toBe(BAD_REQUEST);
    sleep(2);
  });

  test('Test-4: Error, valid channelId but authUser is not in the channel', () => {
    // create new users
    const test1 = requestAuthRegister(
      'test1@gmail.com',
      'password1',
      'firstName1',
      'lastName1'
    );

    const test2 = requestAuthRegister(
      'test2@gmail.com',
      'password2',
      'firstName2',
      'lastName2'
    );
    // create a new channel
    const channelId1 = requestChannelsCreate(
      test1.bodyObj.token,
      'firstChannel',
      true
    );

    requestStandupStart(test1.bodyObj.token, channelId1.bodyObj.channelId, 1);

    const res = requestStandupSend(
      test2.bodyObj.token,
      channelId1.bodyObj.channelId,
      'comp1531'
    );
    // verify output with not permitted token
    expect(res.statusCode).toBe(FORBIDDEN);
    sleep(2);
  });

  test('Test-5: Error, an active standup is not currently running in the channel', () => {
    // create users
    const test1 = requestAuthRegister(
      'test1@gmail.com',
      'password1',
      'firstName1',
      'lastName1'
    );

    const test2 = requestAuthRegister(
      'test2@gmail.com',
      'password2',
      'firstName2',
      'lastName2'
    );
    // create a channel
    const channelId1 = requestChannelsCreate(
      test1.bodyObj.token,
      'firstChannel',
      true
    );
    requestChannelJoin(test2.bodyObj.token, channelId1.bodyObj.channelId);
    const res = requestStandupSend(
      test1.bodyObj.token,
      channelId1.bodyObj.channelId,
      'comp1531'
    );
    // verify output with an active standup is not currently running in the channel
    expect(res.statusCode).toBe(BAD_REQUEST);

    sleep(2);
  });

  test('Test-6: Success, standup send', () => {
    // create new users
    const test1 = requestAuthRegister(
      'test1@gmail.com',
      'password1',
      'firstName1',
      'lastName1'
    );

    const test2 = requestAuthRegister(
      'test2@gmail.com',
      'password2',
      'firstName2',
      'lastName2'
    );
    // create a channel
    const channelId1 = requestChannelsCreate(
      test1.bodyObj.token,
      'firstChannel',
      true
    );

    requestChannelJoin(test2.bodyObj.token, channelId1.bodyObj.channelId);
    // run requestStandupStart function
    const timeFinish = requestStandupStart(
      test2.bodyObj.token,
      channelId1.bodyObj.channelId,
      1
    ).bodyObj.timeFinish;

    requestStandupSend(
      test1.bodyObj.token,
      channelId1.bodyObj.channelId,
      'First'
    );
    requestStandupSend(
      test2.bodyObj.token,
      channelId1.bodyObj.channelId,
      'Second'
    );
    requestStandupSend(
      test1.bodyObj.token,
      channelId1.bodyObj.channelId,
      'Thrid'
    );

    sleep(2);
    // verify output by using requestChannelMessages funtion
    const channelMessages = requestChannelMessages(
      test2.bodyObj.token,
      channelId1.bodyObj.channelId,
      0
    ).bodyObj;

    expect(channelMessages).toStrictEqual({
      messages: [
        {
          messageId: expect.any(Number),
          uId: test2.bodyObj.authUserId,
          message:
            'firstname1lastname1: First\nfirstname2lastname2: Second\nfirstname1lastname1: Thrid',
          timeSent: timeFinish,
          reacts: [],
          isPinned: false,
        },
      ],
      start: 0,
      end: -1,
    });
    requestMessageEdit(
      test1.bodyObj.token,
      channelMessages.messages[0].messageId,
      'comp1531'
    );
    expect(
      requestChannelMessages(
        test2.bodyObj.token,
        channelId1.bodyObj.channelId,
        0
      ).bodyObj
    ).toStrictEqual({
      messages: [
        {
          messageId: expect.any(Number),
          uId: test2.bodyObj.authUserId,
          message: 'comp1531',
          timeSent: timeFinish,
          reacts: [],
          isPinned: false,
        },
      ],
      start: 0,
      end: -1,
    });

    sleep(2);
  });
});
