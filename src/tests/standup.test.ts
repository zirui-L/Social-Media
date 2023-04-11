import {
  requestStandupActive,
  requestStandupSend,
  requestStandupStart,
  BAD_REQUEST,
  OK,
  requestClear,
  requestAuthRegister,
  requestChannelsCreate,
  FORBIDDEN,
  requestChannelMessages,
  requestChannelJoin,
  requestMessageEdit,
} from '../helperFunctions/helperServer';

import { createString } from './testHelper';

const sleep = require('sleep');

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
    const test1 = requestAuthRegister(
      'test1@gmail.com',
      'password1',
      'firstName1',
      'lastName'
    );

    const channelId1 = requestChannelsCreate(
      test1.bodyObj.token,
      'firstChannel',
      true
    );

    const res = requestStandupStart(
      test1.bodyObj.token + '1',
      channelId1.bodyObj.channelId,
      1
    );
    expect(res.statusCode).toBe(FORBIDDEN);
  });

  test('Test-2: Error, channelId does not refer to a valid channel', () => {
    const test1 = requestAuthRegister(
      'test1@gmail.com',
      'password1',
      'firstName1',
      'lastName1'
    );

    const channelId1 = requestChannelsCreate(
      test1.bodyObj.token,
      'firstChannel',
      true
    );

    const res = requestStandupStart(
      test1.bodyObj.token,
      channelId1.bodyObj.channelId,
      1
    );
    expect(res.statusCode).toBe(BAD_REQUEST);
  });

  test('Test-3: Error, Length is a negative integer', () => {
    const test1 = requestAuthRegister(
      'test1@gmail.com',
      'password1',
      'firstName1',
      'lastName1'
    );

    const channelId1 = requestChannelsCreate(
      test1.bodyObj.token,
      'firstChannel',
      true
    );

    const res = requestStandupStart(
      test1.bodyObj.token,
      channelId1.bodyObj.channelId,
      -1
    );

    expect(res.statusCode).toBe(BAD_REQUEST);
  });

  test('Test-4: Error, An active standup is currently running in the channel', () => {
    const test1 = requestAuthRegister(
      'test1@gmail.com',
      'password1',
      'firstName1',
      'lastName1'
    );

    const channelId1 = requestChannelsCreate(
      test1.bodyObj.token,
      'firstChannel',
      true
    );
    requestStandupStart(test1.bodyObj.token, channelId1.bodyObj.channelId, 1);
    const res = requestStandupStart(
      test1.bodyObj.token,
      channelId1.bodyObj.channelId,
      0
    );
    expect(res.statusCode).toBe(BAD_REQUEST);
    sleep.msleep(2000);
  });

  test('Test-5: Error, channelId is valid and the authorised user is not a member of the channel', () => {
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

    const channelId1 = requestChannelsCreate(
      test1.bodyObj.token,
      'firstChannel',
      true
    );
    const res = requestStandupStart(
      test2.bodyObj.token,
      channelId1.bodyObj.channelId,
      0
    );
    expect(res.statusCode).toBe(FORBIDDEN);
  });

  test('Test-6: Success, standup start (with no standup sent)', () => {
    const test1 = requestAuthRegister(
      'test1@gmail.com',
      'password1',
      'firstName1',
      'lastName1'
    );

    requestAuthRegister(
      'test2@gmail.com',
      'password2',
      'firstName2',
      'lastName2'
    );

    const channelId1 = requestChannelsCreate(
      test1.bodyObj.token,
      'firstChannel',
      true
    );
    const timeFinish = Math.floor(Date.now() / 1000) + 1;
    const res = requestStandupStart(
      test1.bodyObj.token,
      channelId1.bodyObj.channelId,
      1
    );

    expect(res.bodyObj).toStrictEqual({ timeFinish: expect.any(Number) });

    expect(res.bodyObj.timeFinish).toBeGreaterThanOrEqual(timeFinish);

    sleep.msleep(2000);

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
  });
});

describe('standup/active/V1', () => {
  test('Test-1: Error, invalid token', () => {
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

    const channelId1 = requestChannelsCreate(
      test1.bodyObj.token,
      'firstChannel',
      true
    );

    requestChannelJoin(test2.bodyObj.token, channelId1.bodyObj.channelId1);

    const res = requestStandupActive(
      test1.bodyObj.token + '1',
      channelId1.bodyObj.channelId
    );
    expect(res.statusCode).toBe(FORBIDDEN);
  });

  test('Test-2: Error, channelId does not refer to a valid channel', () => {
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

    const channelId1 = requestChannelsCreate(
      test1.bodyObj.token,
      'firstChannel',
      true
    );

    requestChannelJoin(test2.bodyObj.token, channelId1.bodyObj.channelId1);

    const res = requestStandupActive(
      test1.bodyObj.token,
      channelId1.bodyObj.channelId + 1
    );
    expect(res.statusCode).toBe(BAD_REQUEST);
  });

  test('Test-3: Error, channelId is valid and the authorised user is not a member of the channel', () => {
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

    const channelId1 = requestChannelsCreate(
      test1.bodyObj.token,
      'firstChannel',
      true
    );

    const res = requestStandupActive(
      test2.bodyObj.token,
      channelId1.bodyObj.channelId
    );
    expect(res.statusCode).toBe(FORBIDDEN);
  });

  test('Test-4: Success, with no standup active', () => {
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
    const channelId1 = requestChannelsCreate(
      test1.bodyObj.token,
      'firstChannel',
      true
    );

    requestChannelJoin(test2.bodyObj.token, channelId1.bodyObj.channelId1);

    const res = requestStandupActive(
      test1.bodyObj.token,
      channelId1.bodyObj.channelId
    );

    expect(res.statusCode).toBe(OK);
    expect(res.bodyObj).toStrictEqual({
      isActive: false,
      timeFinish: null,
    });
  });

  test('Test-5: Success, with existing standup active', () => {
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
    const channelId1 = requestChannelsCreate(
      test1.bodyObj.token,
      'firstChannel',
      true
    );
    requestChannelJoin(test2.bodyObj.token, channelId1.bodyObj.channelId);
    const timeFinish = Math.floor(Date.now() / 1000) + 1;

    requestStandupStart(test1.bodyObj.token, channelId1.bodyObj.channelId1, 1);

    const res = requestStandupActive(
      test2.bodyObj.token,
      channelId1.bodyObj.channelId
    );

    expect(res.bodyObj).toStrictEqual({
      isActive: true,
      timeFinish: expect.any(Number),
    });

    expect(res.bodyObj.timeFinish).toBeGreaterThanOrEqual(timeFinish);

    sleep.msleep(2000);
  });
});

describe('standup/send/V1', () => {
  // Tests are combined to save time in the autotest
  test('Test-1: Error invalid token invalid channelId, length of message over 1000 characters, valid channelId but authUser is not in the channel', () => {
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
    const channelId1 = requestChannelsCreate(
      test1.bodyObj.token,
      'firstChannel',
      true
    );

    requestChannelJoin(test2.bodyObj.token, channelId1.bodyObj.channelId);

    requestStandupStart(test1.bodyObj.token, channelId1.bodyObj.channelId, 1);
    const res = requestStandupSend(
      test1.bodyObj.token + 1,
      channelId1.bodyObj.channelId,
      'comp1531'
    );

    expect(res.statusCode).toBe(FORBIDDEN);
    sleep.msleep(2000);
  });

  test('Test-2: Error invalid  channelId', () => {
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
    const channelId1 = requestChannelsCreate(
      test1.bodyObj.token,
      'firstChannel',
      true
    );

    requestChannelJoin(test2.bodyObj.token, channelId1.bodyObj.channelId);

    requestStandupStart(test1.bodyObj.token, channelId1.bodyObj.channelId, 1);
    const res = requestStandupSend(
      test1.bodyObj.token,
      channelId1.bodyObj.channelId + 1,
      'comp1531'
    );

    expect(res.statusCode).toBe(BAD_REQUEST);
    sleep.msleep(2000);
  });

  test('Test-3: Error, length of message over 1000 characters', () => {
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

    expect(res.statusCode).toBe(BAD_REQUEST);
    sleep.msleep(2000);
  });

  test('Test-4: Error, valid channelId but authUser is not in the channel', () => {
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

    expect(res.statusCode).toBe(FORBIDDEN);
    sleep.msleep(2000);
  });

  test('Test-5: Error, an active standup is not currently running in the channel', () => {
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
    expect(res.statusCode).toBe(BAD_REQUEST);
  });

  test('Test-6: Success, standup send', () => {
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
    const channelId1 = requestChannelsCreate(
      test1.bodyObj.token,
      'firstChannel',
      true
    );

    requestChannelJoin(test2.bodyObj.token, channelId1.bodyObj.channelId);

    requestStandupStart(test1.bodyObj.token, channelId1.bodyObj.channelId, 1);

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
    sleep.msleep(2000);

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
            'firstname2lastname2: First\nfirstname2lastname2: Second\nfirstname2lastname2: Thrid',
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
  });
});
