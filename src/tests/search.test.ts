import {
  requestClear,
  requestAuthRegister,
  requestChannelsCreate,
  requestMessageSend,
  requestSearch,
  requestDmCreate,
  requestMessageSendDm,
  OK,
  BAD_REQUEST,
  FORBIDDEN,
  requestChannelJoin,
} from '../helperFunctions/helperServer';
import { createString } from './testHelper';

beforeEach(() => {
  requestClear();
});

afterEach(() => {
  requestClear();
});

describe('Testing search/v1', () => {
  test('Test-1: success case', () => {
    const test1 = requestAuthRegister(
      'test1@gmail.com',
      '123456',
      'firstName1',
      'lastName1'
    );
    const test2 = requestAuthRegister(
      'test2@gmail.com',
      '1234567',
      'firstName2',
      'lastName2'
    );
    const channel1 = requestChannelsCreate(
      test1.bodyObj.token,
      'firstChannel',
      true
    );
    const message1 = requestMessageSend(
      test1.bodyObj.token,
      channel1.bodyObj.channelId,
      'firstMessage'
    );
    const dm1 = requestDmCreate(test1.bodyObj.token, [
      test2.bodyObj.authUserId,
    ]).bodyObj;
    const message2 = requestMessageSendDm(
      test2.bodyObj.token,
      dm1.dmId,
      'secondMessage'
    );
    requestMessageSendDm(test2.bodyObj.token, dm1.dmId, 'comp1531');

    const search = requestSearch(test1.bodyObj.token, 'Message');
    expect(search.statusCode).toBe(OK);
    expect(search.bodyObj).toStrictEqual({
      messages: [
        {
          messageId: message2.bodyObj.messageId,
          uId: test2.bodyObj.authUserId,
          message: 'secondMessage',
          timeSent: expect.any(Number),
          reacts: [],
          isPinned: false,
        },
        {
          messageId: message1.bodyObj.messageId,
          uId: test1.bodyObj.authUserId,
          message: 'firstMessage',
          timeSent: expect.any(Number),
          reacts: [],
          isPinned: false,
        },
      ],
    });
  });

  test('Test-2: success, no messages returned', () => {
    const test1 = requestAuthRegister(
      'test1@gmail.com',
      '123456',
      'firstName1',
      'lastName1'
    );
    const test2 = requestAuthRegister(
      'test2@gmail.com',
      '1234567',
      'firstName2',
      'lastName2'
    );
    const channel1 = requestChannelsCreate(
      test1.bodyObj.token,
      'firstChannel',
      true
    );
    requestChannelJoin(test2.bodyObj.token, channel1.bodyObj.channelId);

    const search = requestSearch(test1.bodyObj.token, 'hello');
    expect(search.statusCode).toBe(OK);
    expect(search.bodyObj).toStrictEqual({ messages: [] });
  });

  test('Test-3: Error, length of queryStr is less than 1 or over 1000 characters', () => {
    const test1 = requestAuthRegister(
      'test1@gmail.com',
      '123456',
      'firstName1',
      'lastName1'
    );
    const channel1 = requestChannelsCreate(
      test1.bodyObj.token,
      'firstChannel',
      true
    );
    requestMessageSend(
      test1.bodyObj.token,
      channel1.bodyObj.channelId,
      'firstMessage'
    );
    expect(requestSearch(test1.bodyObj.token, '').statusCode).toBe(BAD_REQUEST);
    expect(
      requestSearch(test1.bodyObj.token, createString(1001)).statusCode
    ).toBe(BAD_REQUEST);
  });

  test('Test-4: Error, invalid token', () => {
    const test1 = requestAuthRegister(
      'test1@gmail.com',
      '123456',
      'firstName1',
      'lastName1'
    );
    const channel1 = requestChannelsCreate(
      test1.bodyObj.token,
      'firstChannel',
      true
    );
    requestMessageSend(
      test1.bodyObj.token,
      channel1.bodyObj.channelId,
      'hello'
    );
    expect(requestSearch(test1.bodyObj.token + '1', 'Message').statusCode).toBe(
      FORBIDDEN
    );
  });
});
