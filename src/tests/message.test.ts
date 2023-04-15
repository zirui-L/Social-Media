import {
  requestAuthRegister,
  requestChannelJoin,
  requestChannelMessages,
  requestChannelsCreate,
  requestClear,
  requestMessageSend,
  requestMessageEdit,
  requestMessageRemove,
  requestMessageSendDm,
  requestDmMessages,
  requestDmCreate,
  requestMessageReact,
  requestMessageUnReact,
  requestMessagePin,
  requestMessageUnPin,
  requestMessageShare,
  requestMessageSendLater,
  requestMessageSendLaterDm,
} from './testHelper';
import { FORBIDDEN, OK, BAD_REQUEST } from '../helperFunctions/helperFunctions';
import { sleep } from './testHelper';
import { getTimeNow } from '../helperFunctions/helperFunctions';

beforeEach(() => {
  requestClear();
});

afterEach(() => {
  requestClear();
});

describe('Testing /message/send/v2', () => {
  test('Test-1: Error, channelId does not refer to a valid channel', () => {
    const test1 = requestAuthRegister(
      'test1@gmail.com',
      'password1',
      'firstName1',
      'lastName1'
    );
    const channelId = requestChannelsCreate(
      test1.bodyObj.token,
      'RicardoChannel',
      true
    );
    const messageSendObj = requestMessageSend(
      test1.bodyObj.token,
      channelId.bodyObj.channelId + 1,
      'HelloWorld'
    );

    expect(messageSendObj.statusCode).toBe(BAD_REQUEST);
    expect(messageSendObj.bodyObj).toStrictEqual(undefined);
  });

  test('Test-2: Error, length of message is less than 1 or over 1000 characters', () => {
    const test1 = requestAuthRegister(
      'test1@gmail.com',
      'password1',
      'firstName1',
      'lastName1'
    );
    const channelId = requestChannelsCreate(
      test1.bodyObj.token,
      'RicardoChannel',
      true
    );

    // length of the message is less than 1
    const messageSendObj = requestMessageSend(
      test1.bodyObj.token,
      channelId.bodyObj.channelId,
      ''
    );

    expect(messageSendObj.statusCode).toBe(BAD_REQUEST);
    expect(messageSendObj.bodyObj).toStrictEqual(undefined);

    // length of the message is more than 1000
    const messageSendObj1 = requestMessageSend(
      test1.bodyObj.token,
      channelId.bodyObj.channelId,
      'HelloWorld'.repeat(101)
    );

    expect(messageSendObj1.statusCode).toBe(BAD_REQUEST);
    expect(messageSendObj1.bodyObj).toStrictEqual(undefined);
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
    const channelId = requestChannelsCreate(
      test1.bodyObj.token,
      'firstChannel',
      true
    );
    // the authorised user is not a member of the channel
    const messageSendObj = requestMessageSend(
      test2.bodyObj.token,
      channelId.bodyObj.channelId,
      'firstMessage'
    );

    expect(messageSendObj.statusCode).toBe(FORBIDDEN);
    expect(messageSendObj.bodyObj).toStrictEqual(undefined);
  });

  test('Test-4: Error, token is invalid', () => {
    const test1 = requestAuthRegister(
      'test1@gmail.com',
      'password1',
      'firstName1',
      'lastName1'
    );

    const channelId = requestChannelsCreate(
      test1.bodyObj.token,
      'firstChannel',
      true
    );

    const messageSendObj = requestMessageSend(
      test1.bodyObj.token + '1',
      channelId.bodyObj.channelId,
      'firstMessage'
    );

    expect(messageSendObj.statusCode).toBe(FORBIDDEN);
    expect(messageSendObj.bodyObj).toStrictEqual(undefined);
  });

  test('Test-5: Success, send 1 message', () => {
    const test1 = requestAuthRegister(
      'test1@gmail.com',
      'password1',
      'firstName1',
      'lastName1'
    );

    const channelId = requestChannelsCreate(
      test1.bodyObj.token,
      'firstChannel',
      true
    );

    const messageSendObj = requestMessageSend(
      test1.bodyObj.token,
      channelId.bodyObj.channelId,
      'firstMessage'
    );

    expect(messageSendObj.statusCode).toBe(OK);
    expect(messageSendObj.bodyObj).toStrictEqual({
      messageId: expect.any(Number),
    });
    // check the message details
    expect(
      requestChannelMessages(
        test1.bodyObj.token,
        channelId.bodyObj.channelId,
        0
      ).bodyObj
    ).toStrictEqual({
      messages: [
        {
          messageId: messageSendObj.bodyObj.messageId,
          uId: test1.bodyObj.authUserId,
          message: 'firstMessage',
          timeSent: expect.any(Number),
          reacts: [],
          isPinned: false,
        },
      ],
      start: 0,
      end: -1,
    });
  });

  test('Test-6: Success, multiple message from multiple users', () => {
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

    const channelId = requestChannelsCreate(
      test1.bodyObj.token,
      'firstChannel',
      true
    );
    requestChannelJoin(test2.bodyObj.token, channelId.bodyObj.channelId);

    const messageSendObj1 = requestMessageSend(
      test1.bodyObj.token,
      channelId.bodyObj.channelId,
      'firstMessage'
    );

    const messageSendObj2 = requestMessageSend(
      test2.bodyObj.token,
      channelId.bodyObj.channelId,
      'secondMessage'
    );

    const messageSendObj3 = requestMessageSend(
      test2.bodyObj.token,
      channelId.bodyObj.channelId,
      'thirdMessage'
    );

    expect(messageSendObj1.statusCode).toBe(OK);
    expect(messageSendObj2.statusCode).toBe(OK);
    expect(messageSendObj3.statusCode).toBe(OK);
    expect(messageSendObj1.bodyObj).toStrictEqual({
      messageId: expect.any(Number),
    });
    expect(messageSendObj2.bodyObj).toStrictEqual({
      messageId: expect.any(Number),
    });
    expect(messageSendObj3.bodyObj).toStrictEqual({
      messageId: expect.any(Number),
    });

    // check messages details
    expect(
      requestChannelMessages(
        test1.bodyObj.token,
        channelId.bodyObj.channelId,
        0
      ).bodyObj
    ).toStrictEqual({
      messages: [
        {
          messageId: messageSendObj3.bodyObj.messageId,
          uId: test2.bodyObj.authUserId,
          message: 'thirdMessage',
          timeSent: expect.any(Number),
          reacts: [],
          isPinned: false,
        },
        {
          messageId: messageSendObj2.bodyObj.messageId,
          uId: test2.bodyObj.authUserId,
          message: 'secondMessage',
          timeSent: expect.any(Number),
          reacts: [],
          isPinned: false,
        },
        {
          messageId: messageSendObj1.bodyObj.messageId,
          uId: test1.bodyObj.authUserId,
          message: 'firstMessage',
          timeSent: expect.any(Number),
          reacts: [],
          isPinned: false,
        },
      ],
      start: 0,
      end: -1,
    });
  });
});

describe('Testing /message/edit/v2', () => {
  test('Test-1: Error, length of message is over 1000 characters', () => {
    const test1 = requestAuthRegister(
      'test1@gmail.com',
      'password1',
      'firstName1',
      'lastName1'
    );
    const channelId = requestChannelsCreate(
      test1.bodyObj.token,
      'RicardoChannel',
      true
    );
    const messageSendObj1 = requestMessageSend(
      test1.bodyObj.token,
      channelId.bodyObj.channelId,
      'firstMessage'
    );
    const messageEditObj = requestMessageEdit(
      test1.bodyObj.token,
      messageSendObj1.bodyObj.messageId,
      'HelloWorld'.repeat(101)
    );

    expect(messageEditObj.statusCode).toBe(BAD_REQUEST);
    expect(messageEditObj.bodyObj).toStrictEqual(undefined);
  });

  test('Test-2: Error, messageId does not refer to a valid message', () => {
    const test1 = requestAuthRegister(
      'test1@gmail.com',
      'password1',
      'firstName1',
      'lastName1'
    );
    const channelId = requestChannelsCreate(
      test1.bodyObj.token,
      'RicardoChannel',
      true
    );
    const messageSendObj1 = requestMessageSend(
      test1.bodyObj.token,
      channelId.bodyObj.channelId,
      'firstMessage'
    );
    const messageEditObj = requestMessageEdit(
      test1.bodyObj.token,
      messageSendObj1.bodyObj.messageId + 1,
      'HelloWorld'
    );

    expect(messageEditObj.statusCode).toBe(BAD_REQUEST);
    expect(messageEditObj.bodyObj).toStrictEqual(undefined);
  });

  test('Test-3: Error, user not a member of the channel where the message is in', () => {
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
    requestChannelsCreate(test2.bodyObj.token, 'secondChannel', true);
    const messageSendObj1 = requestMessageSend(
      test1.bodyObj.token,
      channelId1.bodyObj.channelId,
      'firstMessage'
    );
    // user is not a member of the channel
    const messageEditObj = requestMessageEdit(
      test2.bodyObj.token,
      messageSendObj1.bodyObj.messageId,
      'HelloWorld'
    );

    expect(messageEditObj.statusCode).toBe(BAD_REQUEST);
    expect(messageEditObj.bodyObj).toStrictEqual(undefined);
  });

  test('Test-4: Error, user not a member of the dm where the message is in', () => {
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
    const test3 = requestAuthRegister(
      'test3@gmail.com',
      'password3',
      'firstName3',
      'lastName3'
    );
    const dmIdObj = requestDmCreate(test2.bodyObj.token, [
      test1.bodyObj.authUserId,
    ]);
    const messageIdObj = requestMessageSendDm(
      test1.bodyObj.token,
      dmIdObj.bodyObj.dmId,
      'firstMessage'
    );
    // user not a member of the dm
    const messageEditObj = requestMessageEdit(
      test3.bodyObj.token,
      messageIdObj.bodyObj.messageId,
      'helloWorld'
    );
    expect(messageEditObj.bodyObj).toStrictEqual(undefined);
    expect(messageEditObj.statusCode).toBe(BAD_REQUEST);
  });

  test('Test-5: Error, the message was not sent by the user (channel), and user is not a owner', () => {
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

    const messageSendObj1 = requestMessageSend(
      test1.bodyObj.token,
      channelId1.bodyObj.channelId,
      'firstMessage'
    );
    const messageEditObj = requestMessageEdit(
      test2.bodyObj.token,
      messageSendObj1.bodyObj.messageId,
      'HelloWorld'
    );

    expect(messageEditObj.statusCode).toBe(BAD_REQUEST);
    expect(messageEditObj.bodyObj).toStrictEqual(undefined);
  });

  test('Test-6: Error, the message was not sent by the user (dm), and user is not a owner', () => {
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

    const dmIdObj = requestDmCreate(test1.bodyObj.token, [
      test2.bodyObj.authUserId,
    ]);

    const messageIdObj = requestMessageSendDm(
      test1.bodyObj.token,
      dmIdObj.bodyObj.dmId,
      'firstMessage'
    );

    const messageEditObj = requestMessageEdit(
      test2.bodyObj.token,
      messageIdObj.bodyObj.messageId,
      'helloWorld'
    );
    expect(messageEditObj.bodyObj).toStrictEqual(undefined);
    expect(messageEditObj.statusCode).toBe(BAD_REQUEST);
  });

  test('Test-7: Error, token is invalid', () => {
    const test1 = requestAuthRegister(
      'test1@gmail.com',
      'password1',
      'firstName1',
      'lastName1'
    );

    const channelId = requestChannelsCreate(
      test1.bodyObj.token,
      'firstChannel',
      true
    );
    const messageSendObj1 = requestMessageSend(
      test1.bodyObj.token,
      channelId.bodyObj.channelId,
      'firstMessage'
    );
    const messageEditObj = requestMessageEdit(
      test1.bodyObj.token + '1',
      messageSendObj1.bodyObj.messageId,
      'HelloWorld'
    );

    expect(messageEditObj.statusCode).toBe(FORBIDDEN);
    expect(messageEditObj.bodyObj).toStrictEqual(undefined);
  });

  test('Test-8: Success, edit message in a channel', () => {
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

    const messageSendObj1 = requestMessageSend(
      test2.bodyObj.token,
      channelId1.bodyObj.channelId,
      'firstMessage'
    );
    const messageEditObj = requestMessageEdit(
      test2.bodyObj.token,
      messageSendObj1.bodyObj.messageId,
      'HelloWorld'
    );

    expect(messageEditObj.statusCode).toBe(OK);
    expect(messageEditObj.bodyObj).toStrictEqual({});

    expect(
      requestChannelMessages(
        test1.bodyObj.token,
        channelId1.bodyObj.channelId,
        0
      ).bodyObj
    ).toStrictEqual({
      messages: [
        {
          messageId: messageSendObj1.bodyObj.messageId,
          uId: test2.bodyObj.authUserId,
          message: 'HelloWorld',
          timeSent: expect.any(Number),
          reacts: [],
          isPinned: false,
        },
      ],
      start: 0,
      end: -1,
    });
  });

  test("Test-9: Success, channel owner edit other user's message in a channel", () => {
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

    const messageSendObj1 = requestMessageSend(
      test2.bodyObj.token,
      channelId1.bodyObj.channelId,
      'firstMessage'
    );
    const messageEditObj = requestMessageEdit(
      test1.bodyObj.token,
      messageSendObj1.bodyObj.messageId,
      'HelloWorld'
    );

    expect(messageEditObj.statusCode).toBe(OK);
    expect(messageEditObj.bodyObj).toStrictEqual({});

    expect(
      requestChannelMessages(
        test1.bodyObj.token,
        channelId1.bodyObj.channelId,
        0
      ).bodyObj
    ).toStrictEqual({
      messages: [
        {
          messageId: messageSendObj1.bodyObj.messageId,
          uId: test2.bodyObj.authUserId,
          message: 'HelloWorld',
          timeSent: expect.any(Number),
          reacts: [],
          isPinned: false,
        },
      ],
      start: 0,
      end: -1,
    });
  });

  test("Test-10: Success, global owner edit other user's message in a channel", () => {
    // test1 is the global owner
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
      test2.bodyObj.token,
      'firstChannel',
      true
    );

    requestChannelJoin(test1.bodyObj.token, channelId1.bodyObj.channelId);

    const messageSendObj1 = requestMessageSend(
      test2.bodyObj.token,
      channelId1.bodyObj.channelId,
      'firstMessage'
    );
    const messageEditObj = requestMessageEdit(
      test1.bodyObj.token,
      messageSendObj1.bodyObj.messageId,
      'HelloWorld'
    );

    expect(messageEditObj.statusCode).toBe(OK);
    expect(messageEditObj.bodyObj).toStrictEqual({});

    expect(
      requestChannelMessages(
        test2.bodyObj.token,
        channelId1.bodyObj.channelId,
        0
      ).bodyObj
    ).toStrictEqual({
      messages: [
        {
          messageId: messageSendObj1.bodyObj.messageId,
          uId: test2.bodyObj.authUserId,
          message: 'HelloWorld',
          timeSent: expect.any(Number),
          reacts: [],
          isPinned: false,
        },
      ],
      start: 0,
      end: -1,
    });
  });

  test('Test-11: Success, edit message in a dm', () => {
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

    const dmIdObj = requestDmCreate(test2.bodyObj.token, [
      test1.bodyObj.authUserId,
    ]);

    const messageSendObj1 = requestMessageSendDm(
      test1.bodyObj.token,
      dmIdObj.bodyObj.dmId,
      'firstMessage'
    );

    const messageEditObj = requestMessageEdit(
      test1.bodyObj.token,
      messageSendObj1.bodyObj.messageId,
      'helloWorld'
    );
    expect(messageEditObj.bodyObj).toStrictEqual({});
    expect(messageEditObj.statusCode).toBe(OK);

    expect(
      requestDmMessages(test1.bodyObj.token, dmIdObj.bodyObj.dmId, 0).bodyObj
    ).toStrictEqual({
      messages: [
        {
          messageId: messageSendObj1.bodyObj.messageId,
          uId: test1.bodyObj.authUserId,
          message: 'helloWorld',
          timeSent: expect.any(Number),
          reacts: [],
          isPinned: false,
        },
      ],
      start: 0,
      end: -1,
    });
  });

  test('Test-12: Success, edit message with 0 length in a channel', () => {
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
  
    const messageSendObj1 = requestMessageSend(
      test2.bodyObj.token,
      channelId1.bodyObj.channelId,
      'firstMessage'
    );
    const messageEditObj = requestMessageEdit(
      test2.bodyObj.token,
      messageSendObj1.bodyObj.messageId,
      ''
    );

    expect(messageEditObj.statusCode).toBe(OK);
    expect(messageEditObj.bodyObj).toStrictEqual({});
  
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
  
  test('Test-13: Success, edit message in a dm with length 0', () => {
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

    const dmIdObj = requestDmCreate(test2.bodyObj.token, [
      test1.bodyObj.authUserId,
    ]);

    const messageSendObj1 = requestMessageSendDm(
      test1.bodyObj.token,
      dmIdObj.bodyObj.dmId,
      'firstMessage'
    );

    const messageEditObj = requestMessageEdit(
      test1.bodyObj.token,
      messageSendObj1.bodyObj.messageId,
      ''
    );
    expect(messageEditObj.bodyObj).toStrictEqual({});
    expect(messageEditObj.statusCode).toBe(OK);

    expect(
      requestDmMessages(test1.bodyObj.token, dmIdObj.bodyObj.dmId, 0).bodyObj
    ).toStrictEqual({
      messages: [],
      start: 0,
      end: -1,
    });
  });

  test("Test-14: Success, owner edit other user's message in a dm", () => {
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

    const dmIdObj = requestDmCreate(test2.bodyObj.token, [
      test1.bodyObj.authUserId,
    ]);

    const messageSendObj1 = requestMessageSendDm(
      test1.bodyObj.token,
      dmIdObj.bodyObj.dmId,
      'firstMessage'
    );

    const messageEditObj = requestMessageEdit(
      test2.bodyObj.token,
      messageSendObj1.bodyObj.messageId,
      'helloWorld'
    );
    expect(messageEditObj.bodyObj).toStrictEqual({});
    expect(messageEditObj.statusCode).toBe(OK);

    expect(
      requestDmMessages(test1.bodyObj.token, dmIdObj.bodyObj.dmId, 0).bodyObj
    ).toStrictEqual({
      messages: [
        {
          messageId: messageSendObj1.bodyObj.messageId,
          uId: test1.bodyObj.authUserId,
          message: 'helloWorld',
          timeSent: expect.any(Number),
          reacts: [],
          isPinned: false,
        },
      ],
      start: 0,
      end: -1,
    });
  });
});

describe('Testing /message/remove/v2', () => {
  test('Test-1: Error, messageId does not refer to a valid message', () => {
    const test1 = requestAuthRegister(
      'test1@gmail.com',
      'password1',
      'firstName1',
      'lastName1'
    );
    const channelId = requestChannelsCreate(
      test1.bodyObj.token,
      'RicardoChannel',
      true
    );
    const messageSendObj1 = requestMessageSend(
      test1.bodyObj.token,
      channelId.bodyObj.channelId,
      'firstMessage'
    );
    const messageRemoveObj = requestMessageRemove(
      test1.bodyObj.token,
      messageSendObj1.bodyObj.messageId + 1
    );

    expect(messageRemoveObj.statusCode).toBe(BAD_REQUEST);
    expect(messageRemoveObj.bodyObj).toStrictEqual(undefined);
  });

  test('Test-2: Error, user is not a member of the channel where the message is in', () => {
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
    requestChannelsCreate(test2.bodyObj.token, 'secondChannel', true);
    const messageSendObj1 = requestMessageSend(
      test1.bodyObj.token,
      channelId1.bodyObj.channelId,
      'firstMessage'
    );
    const messageRemoveObj = requestMessageRemove(
      test2.bodyObj.token,
      messageSendObj1.bodyObj.messageId
    );

    expect(messageRemoveObj.statusCode).toBe(BAD_REQUEST);
    expect(messageRemoveObj.bodyObj).toStrictEqual(undefined);
  });

  test('Test-3: Error, user is not a member of the dm where the message is in', () => {
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
    const test3 = requestAuthRegister(
      'test3@gmail.com',
      'password3',
      'firstName3',
      'lastName3'
    );
    const dmIdObj = requestDmCreate(test2.bodyObj.token, [
      test1.bodyObj.authUserId,
    ]);
    const messageIdObj = requestMessageSendDm(
      test1.bodyObj.token,
      dmIdObj.bodyObj.dmId,
      'firstMessage'
    );

    const messageRemoveObj = requestMessageRemove(
      test3.bodyObj.token,
      messageIdObj.bodyObj.messageId
    );
    expect(messageRemoveObj.bodyObj).toStrictEqual(undefined);
    expect(messageRemoveObj.statusCode).toBe(BAD_REQUEST);
  });

  test('Test-4: Error, the message was not sent by the user (channel), and user is not a owner', () => {
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

    const messageSendObj1 = requestMessageSend(
      test1.bodyObj.token,
      channelId1.bodyObj.channelId,
      'firstMessage'
    );
    const messageRemoveObj = requestMessageRemove(
      test2.bodyObj.token,
      messageSendObj1.bodyObj.messageId
    );

    expect(messageRemoveObj.statusCode).toBe(BAD_REQUEST);
    expect(messageRemoveObj.bodyObj).toStrictEqual(undefined);
  });

  test('Test-5: Error, the message was not sent by the user (dm), and user is not a owner', () => {
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

    const dmIdObj = requestDmCreate(test1.bodyObj.token, [
      test2.bodyObj.authUserId,
    ]);

    const messageIdObj = requestMessageSendDm(
      test1.bodyObj.token,
      dmIdObj.bodyObj.dmId,
      'firstMessage'
    );

    const messageRemoveObj = requestMessageRemove(
      test2.bodyObj.token,
      messageIdObj.bodyObj.messageId
    );
    expect(messageRemoveObj.bodyObj).toStrictEqual(undefined);
    expect(messageRemoveObj.statusCode).toBe(BAD_REQUEST);
  });

  test('Test-6: Error, token is invalid', () => {
    const test1 = requestAuthRegister(
      'test1@gmail.com',
      'password1',
      'firstName1',
      'lastName1'
    );

    const channelId = requestChannelsCreate(
      test1.bodyObj.token,
      'firstChannel',
      true
    );
    const messageSendObj1 = requestMessageSend(
      test1.bodyObj.token,
      channelId.bodyObj.channelId,
      'firstMessage'
    );
    const messageRemoveObj = requestMessageRemove(
      test1.bodyObj.token + '1',
      messageSendObj1.bodyObj.messageId
    );

    expect(messageRemoveObj.statusCode).toBe(FORBIDDEN);
    expect(messageRemoveObj.bodyObj).toStrictEqual(undefined);
  });

  test('Test-7: Success, remove message in a channel', () => {
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

    const messageSendObj1 = requestMessageSend(
      test2.bodyObj.token,
      channelId1.bodyObj.channelId,
      'firstMessage'
    );
    const messageRemoveObj = requestMessageRemove(
      test2.bodyObj.token,
      messageSendObj1.bodyObj.messageId
    );

    expect(messageRemoveObj.statusCode).toBe(OK);
    expect(messageRemoveObj.bodyObj).toStrictEqual({});

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

  test("Test-8: Success, owner remove other user's message in a channel", () => {
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

    const messageSendObj1 = requestMessageSend(
      test2.bodyObj.token,
      channelId1.bodyObj.channelId,
      'firstMessage'
    );
    const messageRemoveObj = requestMessageRemove(
      test1.bodyObj.token,
      messageSendObj1.bodyObj.messageId
    );

    expect(messageRemoveObj.statusCode).toBe(OK);
    expect(messageRemoveObj.bodyObj).toStrictEqual({});

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

  test("Test-9: Success, global owner remove other user's message in a channel", () => {
    // test1 is the global owner
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
      test2.bodyObj.token,
      'firstChannel',
      true
    );

    requestChannelJoin(test1.bodyObj.token, channelId1.bodyObj.channelId);

    const messageSendObj1 = requestMessageSend(
      test2.bodyObj.token,
      channelId1.bodyObj.channelId,
      'firstMessage'
    );
    const messageRemoveObj = requestMessageRemove(
      test1.bodyObj.token,
      messageSendObj1.bodyObj.messageId
    );

    expect(messageRemoveObj.statusCode).toBe(OK);
    expect(messageRemoveObj.bodyObj).toStrictEqual({});

    expect(
      requestChannelMessages(
        test2.bodyObj.token,
        channelId1.bodyObj.channelId,
        0
      ).bodyObj
    ).toStrictEqual({
      messages: [],
      start: 0,
      end: -1,
    });
  });

  test('Test-10: Success, remove message in a dm', () => {
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

    const dmIdObj = requestDmCreate(test2.bodyObj.token, [
      test1.bodyObj.authUserId,
    ]);

    const messageSendObj1 = requestMessageSendDm(
      test1.bodyObj.token,
      dmIdObj.bodyObj.dmId,
      'firstMessage'
    );

    const messageRemoveObj = requestMessageRemove(
      test1.bodyObj.token,
      messageSendObj1.bodyObj.messageId
    );
    expect(messageRemoveObj.bodyObj).toStrictEqual({});
    expect(messageRemoveObj.statusCode).toBe(OK);

    expect(
      requestDmMessages(test1.bodyObj.token, dmIdObj.bodyObj.dmId, 0).bodyObj
    ).toStrictEqual({
      messages: [],
      start: 0,
      end: -1,
    });
  });

  test("Test-11: Success, owner remove other user's message in a dm", () => {
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

    const dmIdObj = requestDmCreate(test2.bodyObj.token, [
      test1.bodyObj.authUserId,
    ]);

    const messageSendObj1 = requestMessageSendDm(
      test1.bodyObj.token,
      dmIdObj.bodyObj.dmId,
      'firstMessage'
    );

    const messageRemoveObj = requestMessageRemove(
      test2.bodyObj.token,
      messageSendObj1.bodyObj.messageId
    );
    expect(messageRemoveObj.bodyObj).toStrictEqual({});
    expect(messageRemoveObj.statusCode).toBe(OK);

    expect(
      requestDmMessages(test1.bodyObj.token, dmIdObj.bodyObj.dmId, 0).bodyObj
    ).toStrictEqual({
      messages: [],
      start: 0,
      end: -1,
    });
  });
});

describe('Testing /message/senddm/v2', () => {
  test('Test-1: Error, dmId does not refer to a valid DM', () => {
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

    const dmIdObj = requestDmCreate(test2.bodyObj.token, [
      test1.bodyObj.authUserId,
    ]);

    const messageSendDmObj1 = requestMessageSendDm(
      test1.bodyObj.token,
      dmIdObj.bodyObj.dmId + 1,
      'firstMessage'
    );

    expect(messageSendDmObj1.bodyObj).toStrictEqual(undefined);
    expect(messageSendDmObj1.statusCode).toBe(BAD_REQUEST);
  });

  test('Test-2: Error, length of message is less than 1 or over 1000 characters', () => {
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

    const dmIdObj = requestDmCreate(test2.bodyObj.token, [
      test1.bodyObj.authUserId,
    ]);

    // length of the message is less than 1
    const messageSendDmObj1 = requestMessageSendDm(
      test1.bodyObj.token,
      dmIdObj.bodyObj.dmId,
      ''
    );

    expect(messageSendDmObj1.bodyObj).toStrictEqual(undefined);
    expect(messageSendDmObj1.statusCode).toBe(BAD_REQUEST);

    // length of the message is more than 1000
    const messageSendDmObj2 = requestMessageSendDm(
      test1.bodyObj.token,
      dmIdObj.bodyObj.dmId,
      'HelloWorld'.repeat(101)
    );

    expect(messageSendDmObj2.bodyObj).toStrictEqual(undefined);
    expect(messageSendDmObj2.statusCode).toBe(BAD_REQUEST);
  });

  test('Test-3: Error, dm is valid and the authorised user is not a member of the dm', () => {
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

    const test3 = requestAuthRegister(
      'test3@gmail.com',
      'password3',
      'firstName3',
      'lastName3'
    );

    const dmIdObj = requestDmCreate(test2.bodyObj.token, [
      test1.bodyObj.authUserId,
    ]);

    const messageSendDmObj1 = requestMessageSendDm(
      test3.bodyObj.token,
      dmIdObj.bodyObj.dmId,
      'helloWorld'
    );

    expect(messageSendDmObj1.bodyObj).toStrictEqual(undefined);
    expect(messageSendDmObj1.statusCode).toBe(FORBIDDEN);
  });

  test('Test-4: Error, token is invalid', () => {
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

    const dmIdObj = requestDmCreate(test2.bodyObj.token, [
      test1.bodyObj.authUserId,
    ]);

    const messageSendDmObj1 = requestMessageSendDm(
      test1.bodyObj.token + 1,
      dmIdObj.bodyObj.dmId,
      'helloWorld'
    );

    expect(messageSendDmObj1.bodyObj).toStrictEqual(undefined);
    expect(messageSendDmObj1.statusCode).toBe(FORBIDDEN);
  });

  test('Test-5: Success, send 1 message', () => {
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

    const dmIdObj = requestDmCreate(test2.bodyObj.token, [
      test1.bodyObj.authUserId,
    ]);

    const messageSendDmObj1 = requestMessageSendDm(
      test1.bodyObj.token,
      dmIdObj.bodyObj.dmId,
      'helloWorld'
    );

    expect(messageSendDmObj1.statusCode).toBe(OK);
    expect(messageSendDmObj1.bodyObj).toStrictEqual({
      messageId: expect.any(Number),
    });

    // check messages details
    expect(
      requestDmMessages(test1.bodyObj.token, dmIdObj.bodyObj.dmId, 0).bodyObj
    ).toStrictEqual({
      messages: [
        {
          messageId: messageSendDmObj1.bodyObj.messageId,
          uId: test1.bodyObj.authUserId,
          message: 'helloWorld',
          timeSent: expect.any(Number),
          reacts: [],
          isPinned: false,
        },
      ],
      start: 0,
      end: -1,
    });
  });

  test('Test-6: Success, multiple messages from multiple users', () => {
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

    const dmIdObj = requestDmCreate(test2.bodyObj.token, [
      test1.bodyObj.authUserId,
    ]);

    const messageSendDmObj1 = requestMessageSendDm(
      test1.bodyObj.token,
      dmIdObj.bodyObj.dmId,
      'firstMessage'
    );
    const messageSendDmObj2 = requestMessageSendDm(
      test2.bodyObj.token,
      dmIdObj.bodyObj.dmId,
      'secondMessage'
    );
    const messageSendDmObj3 = requestMessageSendDm(
      test2.bodyObj.token,
      dmIdObj.bodyObj.dmId,
      'thirdMessage'
    );

    expect(messageSendDmObj1.statusCode).toBe(OK);
    expect(messageSendDmObj2.statusCode).toBe(OK);
    expect(messageSendDmObj3.statusCode).toBe(OK);
    expect(messageSendDmObj1.bodyObj).toStrictEqual({
      messageId: expect.any(Number),
    });
    expect(messageSendDmObj2.bodyObj).toStrictEqual({
      messageId: expect.any(Number),
    });
    expect(messageSendDmObj3.bodyObj).toStrictEqual({
      messageId: expect.any(Number),
    });

    // check messages details
    expect(
      requestDmMessages(test1.bodyObj.token, dmIdObj.bodyObj.dmId, 0).bodyObj
    ).toStrictEqual({
      messages: [
        {
          messageId: messageSendDmObj3.bodyObj.messageId,
          uId: test2.bodyObj.authUserId,
          message: 'thirdMessage',
          timeSent: expect.any(Number),
          reacts: [],
          isPinned: false,
        },
        {
          messageId: messageSendDmObj2.bodyObj.messageId,
          uId: test2.bodyObj.authUserId,
          message: 'secondMessage',
          timeSent: expect.any(Number),
          reacts: [],
          isPinned: false,
        },
        {
          messageId: messageSendDmObj1.bodyObj.messageId,
          uId: test1.bodyObj.authUserId,
          message: 'firstMessage',
          timeSent: expect.any(Number),
          reacts: [],
          isPinned: false,
        },
      ],
      start: 0,
      end: -1,
    });
  });
});

describe('Testing /message/react/v1', () => {
  test('Test-1: Error, token is invalid', () => {
    const test1 = requestAuthRegister(
      'test1@gmail.com',
      'password1',
      'firstName1',
      'lastName1'
    ).bodyObj;

    const channelId = requestChannelsCreate(
      test1.token,
      'firstChannel',
      true
    ).bodyObj;
    const messageSendObj1 = requestMessageSend(
      test1.token,
      channelId.channelId,
      'firstMessage'
    ).bodyObj;

    const res = requestMessageReact(
      test1.token + '1',
      messageSendObj1.messageId,
      1
    );

    expect(res.statusCode).toBe(FORBIDDEN);
  });

  test('Test-2: Error, messageId does not refer to a valid message', () => {
    const test1 = requestAuthRegister(
      'test1@gmail.com',
      'password1',
      'firstName1',
      'lastName1'
    ).bodyObj;
    const channelId = requestChannelsCreate(
      test1.token,
      'RicardoChannel',
      true
    ).bodyObj;
    const messageSendObj1 = requestMessageSend(
      test1.token,
      channelId.channelId,
      'firstMessage'
    ).bodyObj;
    const res = requestMessageReact(
      test1.token,
      messageSendObj1.messageId + 1,
      1
    );

    expect(res.statusCode).toBe(BAD_REQUEST);
  });

  test('Test-3: Error, user is not a member of the channel where the message is in', () => {
    const test1 = requestAuthRegister(
      'test1@gmail.com',
      'password1',
      'firstName1',
      'lastName1'
    ).bodyObj;
    const test2 = requestAuthRegister(
      'test2@gmail.com',
      'password1',
      'firstName1',
      'lastName1'
    ).bodyObj;
    const channelId = requestChannelsCreate(
      test1.token,
      'RicardoChannel',
      true
    ).bodyObj;
    const messageSendObj1 = requestMessageSend(
      test1.token,
      channelId.channelId,
      'firstMessage'
    ).bodyObj;
    const res = requestMessageReact(test2.token, messageSendObj1.messageId, 1);
    expect(res.statusCode).toBe(BAD_REQUEST);
  });

  test('Test-4: Error, user is not a member of the dm where the message is in', () => {
    const test1 = requestAuthRegister(
      'test1@gmail.com',
      'password1',
      'firstName1',
      'lastName1'
    ).bodyObj;
    const test2 = requestAuthRegister(
      'test2@gmail.com',
      'password2',
      'firstName2',
      'lastName2'
    ).bodyObj;
    const test3 = requestAuthRegister(
      'test3@gmail.com',
      'password3',
      'firstName3',
      'lastName3'
    ).bodyObj;
    const dmIdObj = requestDmCreate(test2.token, [test1.authUserId]).bodyObj;
    const messageIdObj = requestMessageSendDm(
      test1.token,
      dmIdObj.dmId,
      'firstMessage'
    ).bodyObj;
    const res = requestMessageReact(test3.token, messageIdObj.messageId, 1);
    expect(res.statusCode).toBe(BAD_REQUEST);
  });

  test('Test-5: Error, invalid reactId', () => {
    const test1 = requestAuthRegister(
      'test1@gmail.com',
      'password1',
      'firstName1',
      'lastName1'
    ).bodyObj;

    const channelId = requestChannelsCreate(
      test1.token,
      'firstChannel',
      true
    ).bodyObj;
    const messageSendObj1 = requestMessageSend(
      test1.token,
      channelId.channelId,
      'firstMessage'
    ).bodyObj;

    const res = requestMessageReact(test1.token, messageSendObj1.messageId, 2);

    expect(res.statusCode).toBe(BAD_REQUEST);
  });

  test('Test-6: Error, already exist reactId', () => {
    const test1 = requestAuthRegister(
      'test1@gmail.com',
      'password1',
      'firstName1',
      'lastName1'
    ).bodyObj;

    const channelId = requestChannelsCreate(
      test1.token,
      'firstChannel',
      true
    ).bodyObj;
    const messageSendObj1 = requestMessageSend(
      test1.token,
      channelId.channelId,
      'firstMessage'
    ).bodyObj;

    requestMessageReact(test1.token, messageSendObj1.messageId, 1);
    const res = requestMessageReact(test1.token, messageSendObj1.messageId, 1);

    expect(res.statusCode).toBe(BAD_REQUEST);
  });

  test('Test-7: Success react in a channel, checking side effects', () => {
    const test1 = requestAuthRegister(
      'test1@gmail.com',
      'password1',
      'firstName1',
      'lastName1'
    ).bodyObj;
    const channelId = requestChannelsCreate(
      test1.token,
      'firstChannel',
      true
    ).bodyObj;
    const messageSendObj1 = requestMessageSend(
      test1.token,
      channelId.channelId,
      'firstMessage'
    ).bodyObj;
    const res = requestMessageReact(test1.token, messageSendObj1.messageId, 1);
    expect(res.statusCode).toStrictEqual(OK);
    expect(res.bodyObj).toStrictEqual({});

    const channelMessages = requestChannelMessages(
      test1.token,
      channelId.channelId,
      0
    );
    expect(channelMessages.bodyObj).toStrictEqual({
      messages: [
        {
          messageId: messageSendObj1.messageId,
          uId: test1.authUserId,
          message: 'firstMessage',
          timeSent: expect.any(Number),
          reacts: [
            {
              reactId: 1,
              uIds: [test1.authUserId],
              isThisUserReacted: true,
            },
          ],
          isPinned: false,
        },
      ],
      start: 0,
      end: -1,
    });
  });

  test('Test-8: Success react in a dm', () => {
    const test1 = requestAuthRegister(
      'test1@gmail.com',
      'password1',
      'firstName1',
      'lastName1'
    ).bodyObj;
    const test2 = requestAuthRegister(
      'test2@gmail.com',
      'password2',
      'firstName2',
      'lastName2'
    ).bodyObj;
    const dmIdObj = requestDmCreate(test1.token, [test2.authUserId]).bodyObj;
    const messageIdObj = requestMessageSendDm(
      test1.token,
      dmIdObj.dmId,
      'firstMessage'
    ).bodyObj;
    const res = requestMessageReact(test2.token, messageIdObj.messageId, 1);
    expect(res.statusCode).toStrictEqual(OK);
    expect(res.bodyObj).toStrictEqual({});

    const dmMessages = requestDmMessages(test1.token, dmIdObj.dmId, 0);
    expect(dmMessages.bodyObj).toStrictEqual({
      messages: [
        {
          messageId: messageIdObj.messageId,
          uId: test1.authUserId,
          message: 'firstMessage',
          timeSent: expect.any(Number),
          reacts: [
            {
              reactId: 1,
              uIds: [test2.authUserId],
              isThisUserReacted: false,
            },
          ],
          isPinned: false,
        },
      ],
      start: 0,
      end: -1,
    });
  });
});

describe('Testing /message/unreact/v1', () => {
  test('Test-1: Error, token is invalid', () => {
    const test1 = requestAuthRegister(
      'test1@gmail.com',
      'password1',
      'firstName1',
      'lastName1'
    ).bodyObj;
    const channelId = requestChannelsCreate(
      test1.token,
      'firstChannel',
      true
    ).bodyObj;
    const messageSendObj1 = requestMessageSend(
      test1.token,
      channelId.channelId,
      'firstMessage'
    ).bodyObj;
    requestMessageReact(test1.token, messageSendObj1.messageId, 1);
    const res = requestMessageUnReact(
      test1.token + '1',
      messageSendObj1.messageId,
      1
    );
    expect(res.statusCode).toBe(FORBIDDEN);
  });

  test('Test-2: Error, messageId does not refer to a valid message', () => {
    const test1 = requestAuthRegister(
      'test1@gmail.com',
      'password1',
      'firstName1',
      'lastName1'
    ).bodyObj;
    const channelId = requestChannelsCreate(
      test1.token,
      'RicardoChannel',
      true
    ).bodyObj;
    const messageSendObj1 = requestMessageSend(
      test1.token,
      channelId.channelId,
      'firstMessage'
    ).bodyObj;
    requestMessageReact(test1.token, messageSendObj1.messageId, 1);
    const res = requestMessageUnReact(
      test1.token,
      messageSendObj1.messageId + 1,
      1
    );
    expect(res.statusCode).toBe(BAD_REQUEST);
  });

  test('Test-3: Error, user is not a member of the channel where the message is in', () => {
    const test1 = requestAuthRegister(
      'test1@gmail.com',
      'password1',
      'firstName1',
      'lastName1'
    ).bodyObj;
    const test2 = requestAuthRegister(
      'test2@gmail.com',
      'password1',
      'firstName1',
      'lastName1'
    ).bodyObj;
    const channelId = requestChannelsCreate(
      test1.token,
      'RicardoChannel',
      true
    ).bodyObj;
    const messageSendObj1 = requestMessageSend(
      test1.token,
      channelId.channelId,
      'firstMessage'
    ).bodyObj;
    requestMessageReact(test1.token, messageSendObj1.messageId, 1);
    const res = requestMessageUnReact(
      test2.token,
      messageSendObj1.messageId,
      1
    );
    expect(res.statusCode).toBe(BAD_REQUEST);
  });

  test('Test-4: Error, user is not a member of the dm where the message is in', () => {
    const test1 = requestAuthRegister(
      'test1@gmail.com',
      'password1',
      'firstName1',
      'lastName1'
    ).bodyObj;
    const test2 = requestAuthRegister(
      'test2@gmail.com',
      'password2',
      'firstName2',
      'lastName2'
    ).bodyObj;
    const test3 = requestAuthRegister(
      'test3@gmail.com',
      'password3',
      'firstName3',
      'lastName3'
    ).bodyObj;
    const dmIdObj = requestDmCreate(test2.token, [test1.authUserId]).bodyObj;
    const messageIdObj = requestMessageSendDm(
      test1.token,
      dmIdObj.dmId,
      'firstMessage'
    ).bodyObj;
    requestMessageReact(test2.token, messageIdObj.messageId, 1);
    const res = requestMessageUnReact(test3.token, messageIdObj.messageId, 1);
    expect(res.statusCode).toBe(BAD_REQUEST);
  });

  test('Test-5: Error, invalid reactId', () => {
    const test1 = requestAuthRegister(
      'test1@gmail.com',
      'password1',
      'firstName1',
      'lastName1'
    ).bodyObj;
    const channelId = requestChannelsCreate(
      test1.token,
      'firstChannel',
      true
    ).bodyObj;
    const messageSendObj1 = requestMessageSend(
      test1.token,
      channelId.channelId,
      'firstMessage'
    ).bodyObj;
    requestMessageReact(test1.token, messageSendObj1.messageId, 1);
    const res = requestMessageUnReact(
      test1.token,
      messageSendObj1.messageId,
      2
    );
    expect(res.statusCode).toBe(BAD_REQUEST);
  });

  test('Test-6: Error, message does not contain react from the user', () => {
    const test1 = requestAuthRegister(
      'test1@gmail.com',
      'password1',
      'firstName1',
      'lastName1'
    ).bodyObj;
    const channelId = requestChannelsCreate(
      test1.token,
      'firstChannel',
      true
    ).bodyObj;
    const messageSendObj1 = requestMessageSend(
      test1.token,
      channelId.channelId,
      'firstMessage'
    ).bodyObj;
    const res = requestMessageUnReact(
      test1.token,
      messageSendObj1.messageId,
      1
    );
    expect(res.statusCode).toBe(BAD_REQUEST);
  });

  test('Test-7: Success unreact in a channel, checking side effects', () => {
    const test1 = requestAuthRegister(
      'test1@gmail.com',
      'password1',
      'firstName1',
      'lastName1'
    ).bodyObj;
    const channelId = requestChannelsCreate(
      test1.token,
      'firstChannel',
      true
    ).bodyObj;
    const messageSendObj1 = requestMessageSend(
      test1.token,
      channelId.channelId,
      'firstMessage'
    ).bodyObj;
    requestMessageReact(test1.token, messageSendObj1.messageId, 1);
    const res = requestMessageUnReact(
      test1.token,
      messageSendObj1.messageId,
      1
    );
    expect(res.statusCode).toStrictEqual(OK);
    expect(res.bodyObj).toStrictEqual({});
    const channelMessages = requestChannelMessages(
      test1.token,
      channelId.channelId,
      0
    );
    expect(channelMessages.bodyObj).toStrictEqual({
      messages: [
        {
          messageId: messageSendObj1.messageId,
          uId: test1.authUserId,
          message: 'firstMessage',
          timeSent: expect.any(Number),
          reacts: [],
          isPinned: false,
        },
      ],
      start: 0,
      end: -1,
    });
  });

  test('Test-8: Success unreact in a dm', () => {
    const test1 = requestAuthRegister(
      'test1@gmail.com',
      'password1',
      'firstName1',
      'lastName1'
    ).bodyObj;
    const test2 = requestAuthRegister(
      'test2@gmail.com',
      'password2',
      'firstName2',
      'lastName2'
    ).bodyObj;
    const dmIdObj = requestDmCreate(test1.token, [test2.authUserId]).bodyObj;
    const messageIdObj = requestMessageSendDm(
      test1.token,
      dmIdObj.dmId,
      'firstMessage'
    ).bodyObj;
    requestMessageReact(test1.token, messageIdObj.messageId, 1);
    requestMessageReact(test2.token, messageIdObj.messageId, 1);
    const res = requestMessageUnReact(test1.token, messageIdObj.messageId, 1);
    expect(res.statusCode).toStrictEqual(OK);
    expect(res.bodyObj).toStrictEqual({});
    const dmMessages = requestDmMessages(test1.token, dmIdObj.dmId, 0);
    expect(dmMessages.bodyObj).toStrictEqual({
      messages: [
        {
          messageId: messageIdObj.messageId,
          uId: test1.authUserId,
          message: 'firstMessage',
          timeSent: expect.any(Number),
          reacts: [
            {
              reactId: 1,
              uIds: [test2.authUserId],
              isThisUserReacted: false,
            },
          ],
          isPinned: false,
        },
      ],
      start: 0,
      end: -1,
    });
  });
});

describe('Testing /message/pin/v1', () => {
  test('Test-1: Error, token is invalid', () => {
    const test1 = requestAuthRegister(
      'test1@gmail.com',
      'password1',
      'firstName1',
      'lastName1'
    ).bodyObj;
    const channelId = requestChannelsCreate(
      test1.token,
      'firstChannel',
      true
    ).bodyObj;
    const messageSendObj1 = requestMessageSend(
      test1.token,
      channelId.channelId,
      'firstMessage'
    ).bodyObj;
    const res = requestMessagePin(test1.token + '1', messageSendObj1.messageId);
    expect(res.statusCode).toBe(FORBIDDEN);
  });

  test('Test-2: Error, messageId does not refer to a valid message', () => {
    const test1 = requestAuthRegister(
      'test1@gmail.com',
      'password1',
      'firstName1',
      'lastName1'
    ).bodyObj;
    const channelId = requestChannelsCreate(
      test1.token,
      'RicardoChannel',
      true
    ).bodyObj;
    const messageSendObj1 = requestMessageSend(
      test1.token,
      channelId.channelId,
      'firstMessage'
    ).bodyObj;
    const res = requestMessagePin(test1.token, messageSendObj1.messageId + 1);
    expect(res.statusCode).toBe(BAD_REQUEST);
  });

  test('Test-3: Error, user is not a member of the channel where the message is in', () => {
    const test1 = requestAuthRegister(
      'test1@gmail.com',
      'password1',
      'firstName1',
      'lastName1'
    ).bodyObj;
    const test2 = requestAuthRegister(
      'test2@gmail.com',
      'password1',
      'firstName1',
      'lastName1'
    ).bodyObj;
    const channelId = requestChannelsCreate(
      test1.token,
      'RicardoChannel',
      true
    ).bodyObj;
    const messageSendObj1 = requestMessageSend(
      test1.token,
      channelId.channelId,
      'firstMessage'
    ).bodyObj;
    const res = requestMessagePin(test2.token, messageSendObj1.messageId);
    expect(res.statusCode).toBe(BAD_REQUEST);
  });

  test('Test-4: Error, user is not a member of the dm where the message is in', () => {
    const test1 = requestAuthRegister(
      'test1@gmail.com',
      'password1',
      'firstName1',
      'lastName1'
    ).bodyObj;
    const test2 = requestAuthRegister(
      'test2@gmail.com',
      'password2',
      'firstName2',
      'lastName2'
    ).bodyObj;
    const test3 = requestAuthRegister(
      'test3@gmail.com',
      'password3',
      'firstName3',
      'lastName3'
    ).bodyObj;
    const dmIdObj = requestDmCreate(test2.token, [test1.authUserId]).bodyObj;
    const messageIdObj = requestMessageSendDm(
      test1.token,
      dmIdObj.dmId,
      'firstMessage'
    ).bodyObj;
    const res = requestMessagePin(test3.token, messageIdObj.messageId);
    expect(res.statusCode).toBe(BAD_REQUEST);
  });

  test('Test-5: Error, message already pinned', () => {
    const test1 = requestAuthRegister(
      'test1@gmail.com',
      'password1',
      'firstName1',
      'lastName1'
    ).bodyObj;
    const channelId = requestChannelsCreate(
      test1.token,
      'firstChannel',
      true
    ).bodyObj;
    const messageSendObj1 = requestMessageSend(
      test1.token,
      channelId.channelId,
      'firstMessage'
    ).bodyObj;
    requestMessagePin(test1.token, messageSendObj1.messageId);
    const res = requestMessagePin(test1.token, messageSendObj1.messageId);
    expect(res.statusCode).toBe(BAD_REQUEST);
  });

  test('Test-6: Error, user does not have the permission in channel', () => {
    const test1 = requestAuthRegister(
      'test1@gmail.com',
      'password1',
      'firstName1',
      'lastName1'
    ).bodyObj;
    const test2 = requestAuthRegister(
      'test2@gmail.com',
      'password2',
      'firstName2',
      'lastName2'
    ).bodyObj;
    const channelId = requestChannelsCreate(
      test1.token,
      'firstChannel',
      true
    ).bodyObj;
    requestChannelJoin(test2.token, channelId.channelId);
    const messageSendObj1 = requestMessageSend(
      test1.token,
      channelId.channelId,
      'firstMessage'
    ).bodyObj;
    const res = requestMessagePin(test2.token, messageSendObj1.messageId);
    expect(res.statusCode).toBe(FORBIDDEN);
  });

  test('Test-7: Error, user does not have the permission in dm', () => {
    const test1 = requestAuthRegister(
      'test1@gmail.com',
      'password1',
      'firstName1',
      'lastName1'
    ).bodyObj;
    const test2 = requestAuthRegister(
      'test2@gmail.com',
      'password2',
      'firstName2',
      'lastName2'
    ).bodyObj;
    const dmIdObj = requestDmCreate(test2.token, [test1.authUserId]).bodyObj;
    const messageIdObj = requestMessageSendDm(
      test1.token,
      dmIdObj.dmId,
      'firstMessage'
    ).bodyObj;
    const res = requestMessagePin(test1.token, messageIdObj.messageId);
    expect(res.statusCode).toBe(FORBIDDEN);
  });

  test('Test-8: Success pin in a channel from channel owner', () => {
    requestAuthRegister(
      'test1@gmail.com',
      'password1',
      'firstName1',
      'lastName1'
    ).bodyObj;
    const test2 = requestAuthRegister(
      'test2@gmail.com',
      'password2',
      'firstName2',
      'lastName2'
    ).bodyObj;
    const channelId = requestChannelsCreate(
      test2.token,
      'firstChannel',
      true
    ).bodyObj;
    const messageSendObj1 = requestMessageSend(
      test2.token,
      channelId.channelId,
      'firstMessage'
    ).bodyObj;
    const res = requestMessagePin(test2.token, messageSendObj1.messageId);
    expect(res.statusCode).toStrictEqual(OK);
    expect(res.bodyObj).toStrictEqual({});
    const channelMessages = requestChannelMessages(
      test2.token,
      channelId.channelId,
      0
    );
    expect(channelMessages.bodyObj).toStrictEqual({
      messages: [
        {
          messageId: messageSendObj1.messageId,
          uId: test2.authUserId,
          message: 'firstMessage',
          timeSent: expect.any(Number),
          reacts: [],
          isPinned: true,
        },
      ],
      start: 0,
      end: -1,
    });
  });

  test('Test-9: Success pin in a channel by a global owner', () => {
    const test1 = requestAuthRegister(
      'test1@gmail.com',
      'password1',
      'firstName1',
      'lastName1'
    ).bodyObj;
    const test2 = requestAuthRegister(
      'test2@gmail.com',
      'password2',
      'firstName2',
      'lastName2'
    ).bodyObj;
    const channelId = requestChannelsCreate(
      test2.token,
      'firstChannel',
      true
    ).bodyObj;
    requestChannelJoin(test1.token, channelId.channelId);
    const messageSendObj1 = requestMessageSend(
      test2.token,
      channelId.channelId,
      'firstMessage'
    ).bodyObj;
    const res = requestMessagePin(test1.token, messageSendObj1.messageId);
    expect(res.statusCode).toStrictEqual(OK);
    expect(res.bodyObj).toStrictEqual({});
    const channelMessages = requestChannelMessages(
      test2.token,
      channelId.channelId,
      0
    );
    expect(channelMessages.bodyObj).toStrictEqual({
      messages: [
        {
          messageId: messageSendObj1.messageId,
          uId: test2.authUserId,
          message: 'firstMessage',
          timeSent: expect.any(Number),
          reacts: [],
          isPinned: true,
        },
      ],
      start: 0,
      end: -1,
    });
  });

  test('Test-10: Success pin in a dm', () => {
    const test1 = requestAuthRegister(
      'test1@gmail.com',
      'password1',
      'firstName1',
      'lastName1'
    ).bodyObj;
    const test2 = requestAuthRegister(
      'test2@gmail.com',
      'password2',
      'firstName2',
      'lastName2'
    ).bodyObj;
    const dmIdObj = requestDmCreate(test2.token, [test1.authUserId]).bodyObj;
    const messageIdObj = requestMessageSendDm(
      test1.token,
      dmIdObj.dmId,
      'firstMessage'
    ).bodyObj;
    const res = requestMessagePin(test2.token, messageIdObj.messageId);
    expect(res.statusCode).toStrictEqual(OK);
    expect(res.bodyObj).toStrictEqual({});
    const dmMessages = requestDmMessages(test1.token, dmIdObj.dmId, 0);
    expect(dmMessages.bodyObj).toStrictEqual({
      messages: [
        {
          messageId: messageIdObj.messageId,
          uId: test1.authUserId,
          message: 'firstMessage',
          timeSent: expect.any(Number),
          reacts: [],
          isPinned: true,
        },
      ],
      start: 0,
      end: -1,
    });
  });
});

describe('Testing /message/unpin/v1', () => {
  test('Test-1: Error, token is invalid', () => {
    const test1 = requestAuthRegister(
      'test1@gmail.com',
      'password1',
      'firstName1',
      'lastName1'
    ).bodyObj;
    const channelId = requestChannelsCreate(
      test1.token,
      'firstChannel',
      true
    ).bodyObj;
    const messageSendObj1 = requestMessageSend(
      test1.token,
      channelId.channelId,
      'firstMessage'
    ).bodyObj;
    requestMessagePin(test1.token, messageSendObj1.messageId);
    const res = requestMessageUnPin(
      test1.token + '1',
      messageSendObj1.messageId
    );
    expect(res.statusCode).toBe(FORBIDDEN);
  });

  test('Test-2: Error, messageId does not refer to a valid message', () => {
    const test1 = requestAuthRegister(
      'test1@gmail.com',
      'password1',
      'firstName1',
      'lastName1'
    ).bodyObj;
    const channelId = requestChannelsCreate(
      test1.token,
      'RicardoChannel',
      true
    ).bodyObj;
    const messageSendObj1 = requestMessageSend(
      test1.token,
      channelId.channelId,
      'firstMessage'
    ).bodyObj;
    requestMessagePin(test1.token, messageSendObj1.messageId);
    const res = requestMessageUnPin(test1.token, messageSendObj1.messageId + 1);
    expect(res.statusCode).toBe(BAD_REQUEST);
  });

  test('Test-3: Error, user is not a member of the channel where the message is in', () => {
    const test1 = requestAuthRegister(
      'test1@gmail.com',
      'password1',
      'firstName1',
      'lastName1'
    ).bodyObj;
    const test2 = requestAuthRegister(
      'test2@gmail.com',
      'password1',
      'firstName1',
      'lastName1'
    ).bodyObj;
    const channelId = requestChannelsCreate(
      test1.token,
      'RicardoChannel',
      true
    ).bodyObj;
    const messageSendObj1 = requestMessageSend(
      test1.token,
      channelId.channelId,
      'firstMessage'
    ).bodyObj;
    requestMessagePin(test1.token, messageSendObj1.messageId);
    const res = requestMessageUnPin(test2.token, messageSendObj1.messageId);
    expect(res.statusCode).toBe(BAD_REQUEST);
  });

  test('Test-4: Error, user is not a member of the dm where the message is in', () => {
    const test1 = requestAuthRegister(
      'test1@gmail.com',
      'password1',
      'firstName1',
      'lastName1'
    ).bodyObj;
    const test2 = requestAuthRegister(
      'test2@gmail.com',
      'password2',
      'firstName2',
      'lastName2'
    ).bodyObj;
    const test3 = requestAuthRegister(
      'test3@gmail.com',
      'password3',
      'firstName3',
      'lastName3'
    ).bodyObj;
    const dmIdObj = requestDmCreate(test2.token, [test1.authUserId]).bodyObj;
    const messageIdObj = requestMessageSendDm(
      test1.token,
      dmIdObj.dmId,
      'firstMessage'
    ).bodyObj;
    requestMessagePin(test2.token, messageIdObj.messageId);
    const res = requestMessageUnPin(test3.token, messageIdObj.messageId);
    expect(res.statusCode).toBe(BAD_REQUEST);
  });

  test('Test-5: Error, message not already pinned', () => {
    const test1 = requestAuthRegister(
      'test1@gmail.com',
      'password1',
      'firstName1',
      'lastName1'
    ).bodyObj;
    const channelId = requestChannelsCreate(
      test1.token,
      'firstChannel',
      true
    ).bodyObj;
    const messageSendObj1 = requestMessageSend(
      test1.token,
      channelId.channelId,
      'firstMessage'
    ).bodyObj;
    const res = requestMessageUnPin(test1.token, messageSendObj1.messageId);
    expect(res.statusCode).toBe(BAD_REQUEST);
  });

  test('Test-6: Error, user does not have the permission in channel', () => {
    const test1 = requestAuthRegister(
      'test1@gmail.com',
      'password1',
      'firstName1',
      'lastName1'
    ).bodyObj;
    const test2 = requestAuthRegister(
      'test2@gmail.com',
      'password2',
      'firstName2',
      'lastName2'
    ).bodyObj;
    const channelId = requestChannelsCreate(
      test1.token,
      'firstChannel',
      true
    ).bodyObj;
    requestChannelJoin(test2.token, channelId.channelId);
    const messageSendObj1 = requestMessageSend(
      test1.token,
      channelId.channelId,
      'firstMessage'
    ).bodyObj;
    requestMessagePin(test1.token, messageSendObj1.messageId);
    const res = requestMessageUnPin(test2.token, messageSendObj1.messageId);
    expect(res.statusCode).toBe(FORBIDDEN);
  });

  test('Test-7: Error, user does not have the permission in dm', () => {
    const test1 = requestAuthRegister(
      'test1@gmail.com',
      'password1',
      'firstName1',
      'lastName1'
    ).bodyObj;
    const test2 = requestAuthRegister(
      'test2@gmail.com',
      'password2',
      'firstName2',
      'lastName2'
    ).bodyObj;
    const dmIdObj = requestDmCreate(test2.token, [test1.authUserId]).bodyObj;
    const messageIdObj = requestMessageSendDm(
      test1.token,
      dmIdObj.dmId,
      'firstMessage'
    ).bodyObj;
    requestMessagePin(test2.token, messageIdObj.messageId);
    const res = requestMessageUnPin(test1.token, messageIdObj.messageId);
    expect(res.statusCode).toBe(FORBIDDEN);
  });

  test('Test-8: Success unpin in a channel from channel owner', () => {
    requestAuthRegister(
      'test1@gmail.com',
      'password1',
      'firstName1',
      'lastName1'
    ).bodyObj;
    const test2 = requestAuthRegister(
      'test2@gmail.com',
      'password2',
      'firstName2',
      'lastName2'
    ).bodyObj;
    const channelId = requestChannelsCreate(
      test2.token,
      'firstChannel',
      true
    ).bodyObj;
    const messageSendObj1 = requestMessageSend(
      test2.token,
      channelId.channelId,
      'firstMessage'
    ).bodyObj;
    requestMessagePin(test2.token, messageSendObj1.messageId);
    const res = requestMessageUnPin(test2.token, messageSendObj1.messageId);
    expect(res.statusCode).toStrictEqual(OK);
    expect(res.bodyObj).toStrictEqual({});
    const channelMessages = requestChannelMessages(
      test2.token,
      channelId.channelId,
      0
    );
    expect(channelMessages.bodyObj).toStrictEqual({
      messages: [
        {
          messageId: messageSendObj1.messageId,
          uId: test2.authUserId,
          message: 'firstMessage',
          timeSent: expect.any(Number),
          reacts: [],
          isPinned: false,
        },
      ],
      start: 0,
      end: -1,
    });
  });

  test('Test-9: Success unpin in a channel by a global owner', () => {
    const test1 = requestAuthRegister(
      'test1@gmail.com',
      'password1',
      'firstName1',
      'lastName1'
    ).bodyObj;
    const test2 = requestAuthRegister(
      'test2@gmail.com',
      'password2',
      'firstName2',
      'lastName2'
    ).bodyObj;
    const channelId = requestChannelsCreate(
      test2.token,
      'firstChannel',
      true
    ).bodyObj;
    requestChannelJoin(test1.token, channelId.channelId);
    const messageSendObj1 = requestMessageSend(
      test2.token,
      channelId.channelId,
      'firstMessage'
    ).bodyObj;
    requestMessagePin(test1.token, messageSendObj1.messageId);
    const res = requestMessageUnPin(test1.token, messageSendObj1.messageId);
    expect(res.statusCode).toStrictEqual(OK);
    expect(res.bodyObj).toStrictEqual({});
    const channelMessages = requestChannelMessages(
      test2.token,
      channelId.channelId,
      0
    );
    expect(channelMessages.bodyObj).toStrictEqual({
      messages: [
        {
          messageId: messageSendObj1.messageId,
          uId: test2.authUserId,
          message: 'firstMessage',
          timeSent: expect.any(Number),
          reacts: [],
          isPinned: false,
        },
      ],
      start: 0,
      end: -1,
    });
  });

  test('Test-10: Success unpin in a dm', () => {
    const test1 = requestAuthRegister(
      'test1@gmail.com',
      'password1',
      'firstName1',
      'lastName1'
    ).bodyObj;
    const test2 = requestAuthRegister(
      'test2@gmail.com',
      'password2',
      'firstName2',
      'lastName2'
    ).bodyObj;
    const dmIdObj = requestDmCreate(test2.token, [test1.authUserId]).bodyObj;
    const messageIdObj = requestMessageSendDm(
      test1.token,
      dmIdObj.dmId,
      'firstMessage'
    ).bodyObj;
    requestMessagePin(test2.token, messageIdObj.messageId);
    const res = requestMessageUnPin(test2.token, messageIdObj.messageId);
    expect(res.statusCode).toStrictEqual(OK);
    expect(res.bodyObj).toStrictEqual({});
    const dmMessages = requestDmMessages(test1.token, dmIdObj.dmId, 0);
    expect(dmMessages.bodyObj).toStrictEqual({
      messages: [
        {
          messageId: messageIdObj.messageId,
          uId: test1.authUserId,
          message: 'firstMessage',
          timeSent: expect.any(Number),
          reacts: [],
          isPinned: false,
        },
      ],
      start: 0,
      end: -1,
    });
  });
});

describe('Testing /message/share/v1', () => {
  test('Test-1: Error, token is invalid', () => {
    const test1 = requestAuthRegister(
      'test1@gmail.com',
      'password1',
      'firstName1',
      'lastName1'
    ).bodyObj;

    const channelIdObj = requestChannelsCreate(
      test1.token,
      'RicardoChannel',
      true
    ).bodyObj;

    const messageSendObj1 = requestMessageSend(
      test1.token,
      channelIdObj.channelId,
      'firstMessage'
    ).bodyObj;

    const res = requestMessageShare(
      test1.token + '1',
      messageSendObj1.messageId,
      '',
      channelIdObj.channelId,
      -1
    );

    expect(res.statusCode).toBe(FORBIDDEN);
    expect(res.bodyObj).toStrictEqual(undefined);
  });

  test('Test-2: Error, both channelId and dmId are invalid', () => {
    const test1 = requestAuthRegister(
      'test1@gmail.com',
      'password1',
      'firstName1',
      'lastName1'
    ).bodyObj;

    const channelIdObj = requestChannelsCreate(
      test1.token,
      'RicardoChannel',
      true
    ).bodyObj;

    const dmIdObj = requestDmCreate(test1.token, []).bodyObj;

    const messageSendObj1 = requestMessageSend(
      test1.token,
      channelIdObj.channelId,
      'firstMessage'
    ).bodyObj;

    const res = requestMessageShare(
      test1.token,
      messageSendObj1.messageId,
      '',
      -1,
      -1
      );

    expect(res.statusCode).toBe(BAD_REQUEST);
    expect(res.bodyObj).toStrictEqual(undefined);
  });

  test('Test-3: Error, neither channelId nor dmId are -1', () => {
    const test1 = requestAuthRegister(
      'test1@gmail.com',
      'password1',
      'firstName1',
      'lastName1'
    ).bodyObj;

    const channelIdObj = requestChannelsCreate(
      test1.token,
      'RicardoChannel',
      true
    ).bodyObj;

    const dmIdObj = requestDmCreate(test1.token, []).bodyObj;

    const messageSendObj1 = requestMessageSend(
      test1.token,
      channelIdObj.channelId,
      'firstMessage'
    ).bodyObj;

    const res = requestMessageShare(
      test1.token,
      messageSendObj1.messageId,
      '',
      channelIdObj.channelId,
      dmIdObj.dmId
    );

    expect(res.statusCode).toBe(BAD_REQUEST);
    expect(res.bodyObj).toStrictEqual(undefined);
  });

  test('Test-4: Error, ogMessageId refers to invalid message', () => {
    const test1 = requestAuthRegister(
      'test1@gmail.com',
      'password1',
      'firstName1',
      'lastName1'
    ).bodyObj;

    const channelIdObj = requestChannelsCreate(
      test1.token,
      'RicardoChannel',
      true
    ).bodyObj;

    const messageSendObj1 = requestMessageSend(
      test1.token,
      channelIdObj.channelId,
      'firstMessage'
    ).bodyObj;

    const res = requestMessageShare(
      test1.token,
      messageSendObj1.messageId + 1,
      '',
      channelIdObj.channelId,
      -1
    );

    expect(res.statusCode).toBe(BAD_REQUEST);
    expect(res.bodyObj).toStrictEqual(undefined);
  });

  test('Test-5: Error, user is not a member of the channel where the ogMessage is in', () => {
    const test1 = requestAuthRegister(
      'test1@gmail.com',
      'password1',
      'firstName1',
      'lastName1'
    ).bodyObj;

    const test2 = requestAuthRegister(
      'test2@gmail.com',
      'password2',
      'firstName2',
      'lastName2'
    ).bodyObj;

    const channelIdObj1 = requestChannelsCreate(
      test1.token,
      'RicardoChannel',
      true
    ).bodyObj;

    const channelIdObj2 = requestChannelsCreate(
      test2.token,
      'SimbaChannel',
      true
    ).bodyObj;

    const messageSendObj1 = requestMessageSend(
      test2.token,
      channelIdObj2.channelId,
      'firstMessage'
    ).bodyObj;

    const res = requestMessageShare(
      test1.token,
      messageSendObj1.messageId,
      '',
      channelIdObj1.channelId,
      -1
    );

    expect(res.statusCode).toBe(BAD_REQUEST);
    expect(res.bodyObj).toStrictEqual(undefined);
  });

  test('Test-6: Error, user is not a member of the dm where the ogMessage is in', () => {
    const test1 = requestAuthRegister(
      'test1@gmail.com',
      'password1',
      'firstName1',
      'lastName1'
    ).bodyObj;

    const test2 = requestAuthRegister(
      'test2@gmail.com',
      'password2',
      'firstName2',
      'lastName2'
    ).bodyObj;

    const channelIdObj1 = requestChannelsCreate(
      test1.token,
      'RicardoChannel',
      true
    ).bodyObj;

    const dmIdObj = requestDmCreate(test2.token, []).bodyObj;

    const messageSendObj1 = requestMessageSendDm(
      test2.token,
      dmIdObj.dmId,
      'firstMessage'
    ).bodyObj;

    const res = requestMessageShare(
      test1.token,
      messageSendObj1.messageId,
      '',
      channelIdObj1.channelId,
      -1
    );

    expect(res.statusCode).toBe(BAD_REQUEST);
    expect(res.bodyObj).toStrictEqual(undefined);
  });

  test('Test-7: Error, length of optional message is more than 1000 characters', () => {
    const test1 = requestAuthRegister(
      'test1@gmail.com',
      'password1',
      'firstName1',
      'lastName1'
    ).bodyObj;

    const channelIdObj = requestChannelsCreate(
      test1.token,
      'RicardoChannel',
      true
    ).bodyObj;

    const messageSendObj1 = requestMessageSend(
      test1.token,
      channelIdObj.channelId,
      'firstMessage'
    ).bodyObj;

    // length of the message is more than 1000
    const message = 'HelloWorld'.repeat(101);

    const res = requestMessageShare(
      test1.token,
      messageSendObj1.messageId,
      message,
      channelIdObj.channelId,
      -1
    );

    expect(res.statusCode).toBe(BAD_REQUEST);
    expect(res.bodyObj).toStrictEqual(undefined);
  });

  test('Test-8: Error, user not join the channel they are tring to share the message to', () => {
    const test1 = requestAuthRegister(
      'test1@gmail.com',
      'password1',
      'firstName1',
      'lastName1'
    ).bodyObj;

    const test2 = requestAuthRegister(
      'test2@gmail.com',
      'password2',
      'firstName2',
      'lastName2'
    ).bodyObj;

    const channelIdObj1 = requestChannelsCreate(
      test1.token,
      'RicardoChannel',
      true
    ).bodyObj;

    const channelIdObj2 = requestChannelsCreate(
      test2.token,
      'SimbaChannel',
      true
    ).bodyObj;

    const messageSendObj1 = requestMessageSend(
      test1.token,
      channelIdObj1.channelId,
      'firstMessage'
    ).bodyObj;

    const res = requestMessageShare(
      test1.token,
      messageSendObj1.messageId,
      '',
      channelIdObj2.channelId,
      -1
    );

    expect(res.statusCode).toBe(FORBIDDEN);
    expect(res.bodyObj).toStrictEqual(undefined);
  });

  test('Test-9: Error, user not join the dm tried to share the message to', () => {
    const test1 = requestAuthRegister(
      'test1@gmail.com',
      'password1',
      'firstName1',
      'lastName1'
    ).bodyObj;

    const test2 = requestAuthRegister(
      'test2@gmail.com',
      'password2',
      'firstName2',
      'lastName2'
    ).bodyObj;

    const test3 = requestAuthRegister(
      'test3@gmail.com',
      'password3',
      'firstName3',
      'lastName3'
    ).bodyObj;

    const channelIdObj = requestChannelsCreate(
      test1.token,
      'RicardoChannel',
      true
    ).bodyObj;

    const dmIdObj = requestDmCreate(test2.token, [test3.authUserId]).bodyObj;

    const messageSendObj1 = requestMessageSend(
      test1.token,
      channelIdObj.channelId,
      'firstMessage'
    ).bodyObj;

    const res = requestMessageShare(
      test1.token,
      messageSendObj1.messageId,
      '',
      -1,
      dmIdObj.dmId
    );

    expect(res.statusCode).toBe(FORBIDDEN);
    expect(res.bodyObj).toStrictEqual(undefined);
  });

  test('Test-11: Success, channel message shared to channel', () => {
    const test1 = requestAuthRegister(
      'test1@gmail.com',
      'password1',
      'firstName1',
      'lastName1'
    ).bodyObj;

    const channelIdObj = requestChannelsCreate(
      test1.token,
      'RicardoChannel',
      true
    ).bodyObj;

    const messageSendObj1 = requestMessageSend(
      test1.token,
      channelIdObj.channelId,
      'firstMessage'
    ).bodyObj;

    const res = requestMessageShare(
      test1.token,
      messageSendObj1.messageId,
      'additionalMessage',
      channelIdObj.channelId,
      -1
    );

    expect(res.statusCode).toBe(OK);
    expect(res.bodyObj).toStrictEqual({
      sharedMessageId: expect.any(Number),
    });

    // check the message details
    expect(
      requestChannelMessages(test1.token, channelIdObj.channelId, 0).bodyObj
    ).toStrictEqual({
      messages: [
        {
          messageId: res.bodyObj.sharedMessageId,
          uId: test1.authUserId,
          message:
            expect.stringContaining('firstMessage') &&
            expect.stringContaining('additionalMessage'),
          timeSent: expect.any(Number),
          reacts: [],
          isPinned: false,
        },
        {
          messageId: messageSendObj1.messageId,
          uId: test1.authUserId,
          message: expect.stringContaining('firstMessage'),
          timeSent: expect.any(Number),
          reacts: [],
          isPinned: false,
        },
      ],
      start: 0,
      end: -1,
    });

    // ensure no link to the original message
    requestMessageRemove(test1.token, messageSendObj1.messageId);
    expect(
      requestChannelMessages(test1.token, channelIdObj.channelId, 0).bodyObj
    ).toStrictEqual({
      messages: [
        {
          messageId: res.bodyObj.sharedMessageId,
          uId: test1.authUserId,
          message:
            expect.stringContaining('firstMessage') &&
            expect.stringContaining('additionalMessage'),
          timeSent: expect.any(Number),
          reacts: [],
          isPinned: false,
        },
      ],
      start: 0,
      end: -1,
    });
  });

  test('Test-12: Success, dm message shared to channel', () => {
    const test1 = requestAuthRegister(
      'test1@gmail.com',
      'password1',
      'firstName1',
      'lastName1'
    ).bodyObj;

    const test2 = requestAuthRegister(
      'test2@gmail.com',
      'password2',
      'firstName2',
      'lastName2'
    ).bodyObj;
    const channelIdObj = requestChannelsCreate(
      test1.token,
      'RicardoChannel',
      true
    ).bodyObj;

    const dmIdObj = requestDmCreate(test1.token, [test2.authUserId]).bodyObj;

    const messageSendObj1 = requestMessageSendDm(
      test1.token,
      dmIdObj.dmId,
      'firstMessage'
    ).bodyObj;

    const res = requestMessageShare(
      test1.token,
      messageSendObj1.messageId,
      'additionalMessage',
      channelIdObj.channelId,
      -1
    );

    expect(res.statusCode).toBe(OK);
    expect(res.bodyObj).toStrictEqual({
      sharedMessageId: expect.any(Number),
    });

    // ensure no link to the original message
    requestMessageRemove(test1.token, messageSendObj1.messageId);
    expect(
      requestChannelMessages(test1.token, channelIdObj.channelId, 0).bodyObj
    ).toStrictEqual({
      messages: [
        {
          messageId: res.bodyObj.sharedMessageId,
          uId: test1.authUserId,
          message:
            expect.stringContaining('firstMessage') &&
            expect.stringContaining('additionalMessage'),
          timeSent: expect.any(Number),
          reacts: [],
          isPinned: false,
        },
      ],
      start: 0,
      end: -1,
    });
  });

  test('Test-13: Success, channel message shared to dm', () => {
    const test1 = requestAuthRegister(
      'test1@gmail.com',
      'password1',
      'firstName1',
      'lastName1'
    ).bodyObj;
  
    const channelIdObj = requestChannelsCreate(
      test1.token,
      'RicardoChannel',
      true
    ).bodyObj;

    const test2 = requestAuthRegister(
      'test2@gmail.com',
      'password2',
      'firstName2',
      'lastName2'
    ).bodyObj;
  
    const dmIdObj = requestDmCreate(
      test1.token,
      [test2.authUserId]
    ).bodyObj;

    const messageSendObj1 = requestMessageSend(
      test1.token,
      channelIdObj.channelId,
      'firstMessage'
    ).bodyObj;
  
    const res = requestMessageShare(
      test1.token, 
      messageSendObj1.messageId, 
      'additionalMessage',
      -1,
      dmIdObj.dmId,
      );
      
      expect(res.statusCode).toBe(OK);
      expect(res.bodyObj).toStrictEqual({
        sharedMessageId: expect.any(Number),
      });
        
        
    // ensure no link to the original message
    requestMessageRemove(test1.token, messageSendObj1.messageId);
    expect(
      requestDmMessages(
        test1.token,
        dmIdObj.dmId,
        0
      ).bodyObj
    ).toStrictEqual({
      messages: [
        {
          messageId: res.bodyObj.sharedMessageId,
          uId: test1.authUserId,
          message: expect.stringContaining('firstMessage') &&
                  expect.stringContaining('additionalMessage'),
          timeSent: expect.any(Number),
          reacts: [],
          isPinned: false,
        }
      ],
      start: 0,
      end: -1,
    });
  });

  

  test('Test-14: Success, dm message shared to dm', () => {
    const test1 = requestAuthRegister(
      'test1@gmail.com',
      'password1',
      'firstName1',
      'lastName1'
    ).bodyObj;
    const test2 = requestAuthRegister(
      'test2@gmail.com',
      'password2',
      'firstName2',
      'lastName2'
    ).bodyObj;
    const dmIdObj = requestDmCreate(test1.token, [test2.authUserId]).bodyObj;
    const messageSendObj1 = requestMessageSendDm(
      test1.token,
      dmIdObj.dmId,
      'firstMessage'
    ).bodyObj;

    const res = requestMessageShare(
      test1.token,
      messageSendObj1.messageId,
      'additionalMessage',
      -1,
      dmIdObj.dmId
    );

    expect(res.statusCode).toBe(OK);
    expect(res.bodyObj).toStrictEqual({
      sharedMessageId: expect.any(Number),
    });

    // ensure no link to the original message
    requestMessageRemove(test1.token, messageSendObj1.messageId);
    expect(
      requestDmMessages(test1.token, dmIdObj.dmId, 0).bodyObj
    ).toStrictEqual({
      messages: [
        {
          messageId: res.bodyObj.sharedMessageId,
          uId: test1.authUserId,
          message:
            expect.stringContaining('firstMessage') &&
            expect.stringContaining('additionalMessage'),
          timeSent: expect.any(Number),
          reacts: [],
          isPinned: false,
        },
      ],
      start: 0,
      end: -1,
    });
  });
});

describe('Testing message/sendlater/v1', () => {
  test('Test-1: Error, invalid token', () => {
    const test1 = requestAuthRegister(
      'test1@gmail.com',
      'password1',
      'firstName1',
      'lastName1'
    );
    const channelId = requestChannelsCreate(
      test1.bodyObj.token,
      'RicardoChannel',
      true
    );
    const messageSendLaterObj = requestMessageSendLater(
      test1.bodyObj.token + '1',
      channelId.bodyObj.channelId,
      'HelloWorld',
      getTimeNow() + 2
    );

    expect(messageSendLaterObj.statusCode).toBe(FORBIDDEN);
    expect(messageSendLaterObj.bodyObj).toStrictEqual(undefined);
  });

  test('Test-2: Error, channelId does not refer to a valid channel', () => {
    const test1 = requestAuthRegister(
      'test1@gmail.com',
      'password1',
      'firstName1',
      'lastName1'
    );
    const channelId = requestChannelsCreate(
      test1.bodyObj.token,
      'RicardoChannel',
      true
    );
    const messageSendLaterObj = requestMessageSendLater(
      test1.bodyObj.token,
      channelId.bodyObj.channelId + 1,
      'HelloWorld',
      getTimeNow() + 2
    );

    expect(messageSendLaterObj.statusCode).toBe(BAD_REQUEST);
    expect(messageSendLaterObj.bodyObj).toStrictEqual(undefined);
  });

  test('Test-3: Error, length of message is less than 1 or over 1000 characters', () => {
    const test1 = requestAuthRegister(
      'test1@gmail.com',
      'password1',
      'firstName1',
      'lastName1'
    );
    const channelId = requestChannelsCreate(
      test1.bodyObj.token,
      'RicardoChannel',
      true
    );

    // length of the message is less than 1
    const messageSendLaterObj = requestMessageSendLater(
      test1.bodyObj.token,
      channelId.bodyObj.channelId,
      '',
      1
    );

    expect(messageSendLaterObj.statusCode).toBe(BAD_REQUEST);
    expect(messageSendLaterObj.bodyObj).toStrictEqual(undefined);

    // length of the message is more than 1000
    const messageSendLaterObj1 = requestMessageSendLater(
      test1.bodyObj.token,
      channelId.bodyObj.channelId,
      'HelloWorld'.repeat(101),
      getTimeNow() + 2
    );

    expect(messageSendLaterObj1.statusCode).toBe(BAD_REQUEST);
    expect(messageSendLaterObj1.bodyObj).toStrictEqual(undefined);
  });

  test('Test-4: Error, timeSent is a time in the past', () => {
    const test1 = requestAuthRegister(
      'test1@gmail.com',
      'password1',
      'firstName1',
      'lastName1'
    );
    const channelId = requestChannelsCreate(
      test1.bodyObj.token,
      'RicardoChannel',
      true
    );
    const messageSendLaterObj = requestMessageSendLater(
      test1.bodyObj.token,
      channelId.bodyObj.channelId ,
      'HelloWorld',
      getTimeNow() - 2
    );

    expect(messageSendLaterObj.statusCode).toBe(BAD_REQUEST);
    expect(messageSendLaterObj.bodyObj).toStrictEqual(undefined);
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
    const channelId = requestChannelsCreate(
      test1.bodyObj.token,
      'firstChannel',
      true
    );
    // the authorised user is not a member of the channel
    const messageSendLaterObj = requestMessageSendLater(
      test2.bodyObj.token,
      channelId.bodyObj.channelId,
      'firstMessage',
      getTimeNow() + 2
    );

    expect(messageSendLaterObj.statusCode).toBe(FORBIDDEN);
    expect(messageSendLaterObj.bodyObj).toStrictEqual(undefined);
  });

  test('Test-6: Success, send 1 message', () => {
    const test1 = requestAuthRegister(
      'test1@gmail.com',
      'password1',
      'firstName1',
      'lastName1'
    );

    const channelId = requestChannelsCreate(
      test1.bodyObj.token,
      'firstChannel',
      true
    );
    const timesent = getTimeNow() + 2;
    const messageSendLaterObj = requestMessageSendLater(
      test1.bodyObj.token,
      channelId.bodyObj.channelId,
      'firstMessage',
      timesent
    );

    expect(messageSendLaterObj.statusCode).toBe(OK);
    expect(messageSendLaterObj.bodyObj).toStrictEqual({
      messageId: expect.any(Number),
    });

    // the message id should be invalid until reaches timesent
    const messageEditObj = requestMessageEdit(
      test1.bodyObj.token,
      messageSendLaterObj.bodyObj.messageId,
      'HelloWorld'
    );

    expect(messageEditObj.statusCode).toBe(BAD_REQUEST);
    expect(messageEditObj.bodyObj).toStrictEqual(undefined);
    sleep(3); // wait for 2 seconds
    expect(
      requestChannelMessages(
        test1.bodyObj.token,
        channelId.bodyObj.channelId,
        0
      ).bodyObj
    ).toStrictEqual({
      messages: [
        {
          messageId: messageSendLaterObj.bodyObj.messageId,
          uId: test1.bodyObj.authUserId,
          message: 'firstMessage',
          timeSent: timesent,
          reacts: [],
          isPinned: false,
        },
      ],
      start: 0,
      end: -1,
    });

    const messageRemoveObj = requestMessageRemove(
      test1.bodyObj.token,
      messageSendLaterObj.bodyObj.messageId
    );

    expect(messageRemoveObj.statusCode).toBe(OK);
    expect(messageRemoveObj.bodyObj).toStrictEqual({});
  });
});


describe('Testing message/sendlaterdm/v1', () => {
  test('Test-1: Error, invalid token', () => {
    const test1 = requestAuthRegister(
      'test1@gmail.com',
      'password1',
      'firstName1',
      'lastName1'
    );
    const dmId = requestDmCreate(test1.bodyObj.token, []);
    const messageSendLaterDmObj = requestMessageSendLaterDm(
      test1.bodyObj.token + '1',
      dmId.bodyObj.dmId,
      'HelloWorld',
      getTimeNow() + 2
    );

    expect(messageSendLaterDmObj.statusCode).toBe(FORBIDDEN);
    expect(messageSendLaterDmObj.bodyObj).toStrictEqual(undefined);
  });

  test('Test-2: Error, dmId does not refer to a valid dm', () => {
    const test1 = requestAuthRegister(
      'test1@gmail.com',
      'password1',
      'firstName1',
      'lastName1'
    );
    const dmId = requestDmCreate(test1.bodyObj.token, []);
    const messageSendLaterDmObj = requestMessageSendLaterDm(
      test1.bodyObj.token,
      dmId.bodyObj.dmId + 1,
      'HelloWorld',
      getTimeNow() + 2
    );

    expect(messageSendLaterDmObj.statusCode).toBe(BAD_REQUEST);
    expect(messageSendLaterDmObj.bodyObj).toStrictEqual(undefined);
  });

  test('Test-3: Error, length of message is less than 1 or over 1000 characters', () => {
    const test1 = requestAuthRegister(
      'test1@gmail.com',
      'password1',
      'firstName1',
      'lastName1'
    );
    const dmId = requestDmCreate(test1.bodyObj.token, []);

    // length of the message is less than 1
    const messageSendLaterDmObj = requestMessageSendLaterDm(
      test1.bodyObj.token,
      dmId.bodyObj.dmId,
      '',
      getTimeNow() + 2
    );

    expect(messageSendLaterDmObj.statusCode).toBe(BAD_REQUEST);
    expect(messageSendLaterDmObj.bodyObj).toStrictEqual(undefined);

    // length of the message is more than 1000
    const messageSendLaterDmObj1 = requestMessageSendLaterDm(
      test1.bodyObj.token,
      dmId.bodyObj.dmId,
      'HelloWorld'.repeat(101),
      getTimeNow() + 2
    );

    expect(messageSendLaterDmObj1.statusCode).toBe(BAD_REQUEST);
    expect(messageSendLaterDmObj1.bodyObj).toStrictEqual(undefined);
  });

  test('Test-4: Error, timeSent is a time in the past', () => {
    const test1 = requestAuthRegister(
      'test1@gmail.com',
      'password1',
      'firstName1',
      'lastName1'
    );
    const dmId = requestDmCreate(test1.bodyObj.token, []);
    const messageSendLaterDmObj = requestMessageSendLaterDm(
      test1.bodyObj.token,
      dmId.bodyObj.dmId,
      'HelloWorld',
      getTimeNow() - 2
    );

    expect(messageSendLaterDmObj.statusCode).toBe(BAD_REQUEST);
    expect(messageSendLaterDmObj.bodyObj).toStrictEqual(undefined);
  });

  test('Test-5: Error, dm is valid and the authorised user is not a member of the dm', () => {
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

    const test3 = requestAuthRegister(
      'test3@gmail.com',
      'password3',
      'firstName3',
      'lastName3'
    );

    const dmId = requestDmCreate(test2.bodyObj.token, [
      test1.bodyObj.authUserId,
    ]);
    // the authorised user is not a member of the channel
    const messageSendLaterDmObj = requestMessageSendLaterDm(
      test3.bodyObj.token,
      dmId.bodyObj.dmId,
      'firstMessage',
      getTimeNow() + 2
    );

    expect(messageSendLaterDmObj.statusCode).toBe(FORBIDDEN);
    expect(messageSendLaterDmObj.bodyObj).toStrictEqual(undefined);
  });

  test('Test-6: Success, send 1 message', () => {
    const test1 = requestAuthRegister(
      'test1@gmail.com',
      'password1',
      'firstName1',
      'lastName1'
    );

    const dmId = requestDmCreate(test1.bodyObj.token, []);
    const timesent = getTimeNow() + 2;
    const messageSendLaterDmObj = requestMessageSendLaterDm(
      test1.bodyObj.token,
      dmId.bodyObj.dmId,
      'firstMessage',
      timesent
    );

    expect(messageSendLaterDmObj.statusCode).toBe(OK);
    expect(messageSendLaterDmObj.bodyObj).toStrictEqual({
      messageId: expect.any(Number),
    });

    // the message id should be invalid until reaches timesent
    const messageEditObj = requestMessageEdit(
      test1.bodyObj.token,
      messageSendLaterDmObj.bodyObj.messageId,
      'HelloWorld'
    );

    expect(messageEditObj.statusCode).toBe(BAD_REQUEST);
    expect(messageEditObj.bodyObj).toStrictEqual(undefined);
    sleep(3); // wait for 3 seconds
    expect(
      requestDmMessages(test1.bodyObj.token, dmId.bodyObj.dmId, 0).bodyObj
    ).toStrictEqual({
      messages: [
        {
          messageId: messageSendLaterDmObj.bodyObj.messageId,
          uId: test1.bodyObj.authUserId,
          message: 'firstMessage',
          timeSent: timesent,
          reacts: [],
          isPinned: false,
        },
      ],
      start: 0,
      end: -1,
    });

    const messageRemoveObj = requestMessageRemove(
      test1.bodyObj.token,
      messageSendLaterDmObj.bodyObj.messageId
    );

    expect(messageRemoveObj.statusCode).toBe(OK);
    expect(messageRemoveObj.bodyObj).toStrictEqual({});
  });
});