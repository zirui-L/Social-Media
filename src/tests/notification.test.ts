import {
  requestClear,
  requestAuthRegister,
  requestNotificationsGet,
  requestChannelsCreate,
  requestDmCreate,
  requestMessageSend,
  requestMessageSendDm,
  requestMessageEdit,
  requestMessageReact,
  requestMessageUnReact,
  requestDmLeave,
  requestChannelLeave,
  requestChannelJoin,
  requestMessageRemove,
  requestChannelInvite,
} from './testHelper';
import { FORBIDDEN, OK, BAD_REQUEST } from '../helperFunctions/helperFunctions';

beforeEach(() => {
  requestClear();
});

afterEach(() => {
  requestClear();
});

describe('Testing notifications/getV1', () => {
  test('Test-1: Error, Invalid token', () => {
    // create user
    const test1 = requestAuthRegister(
      'test1@gmail.com',
      '123456',
      'firstName1',
      'lastName1'
    );
    // test function with invalid token
    expect(requestNotificationsGet(test1.bodyObj.token + '1').statusCode).toBe(
      FORBIDDEN
    );
  });

  test('Test-2: Success, user is added to a channel', () => {
    // create new users
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
      test2.bodyObj.token,
      'firstChannel',
      true
    );
    // create and send message in channel
    requestChannelInvite(
      test2.bodyObj.token,
      channel1.bodyObj.channelId,
      test1.bodyObj.authUserId
    );
    const notifications = requestNotificationsGet(test1.bodyObj.token);
    // test functin with correct input
    expect(notifications.statusCode).toBe(OK);
    expect(notifications.bodyObj).toStrictEqual({
      notifications: [
        {
          channelId: channel1.bodyObj.channelId,
          dmId: -1,
          notificationMessage: 'firstname2lastname2 added you to firstChannel',
        },
      ],
    });
  });

  test('Test-3: Success, added to the dm ', () => {
    // create users
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
    // create and send messages in both channel and dm
    const channel1 = requestChannelsCreate(
      test2.bodyObj.token,
      'firstChannel',
      true
    );

    const dm = requestDmCreate(test2.bodyObj.token, [test1.bodyObj.authUserId]);

    requestChannelJoin(test1.bodyObj.token, channel1.bodyObj.channelId);

    requestMessageSend(
      test2.bodyObj.token,
      channel1.bodyObj.channelId,
      '@firstname1lastname1'
    );
    requestMessageSendDm(
      test2.bodyObj.token,
      dm.bodyObj.dmId,
      '@firstname1lastname1'
    );
    const notifications = requestNotificationsGet(test1.bodyObj.token);
    // verify output
    expect(notifications.statusCode).toBe(OK);
    expect(notifications.bodyObj).toStrictEqual({
      notifications: [
        {
          channelId: -1,
          dmId: dm.bodyObj.dmId,
          notificationMessage:
            'firstname2lastname2 tagged you in firstname1lastname1, firstname2lastname2: @firstname1lastname1',
        },
        {
          channelId: channel1.bodyObj.channelId,
          dmId: -1,
          notificationMessage:
            'firstname2lastname2 tagged you in firstChannel: @firstname1lastname1',
        },
        {
          channelId: -1,
          dmId: dm.bodyObj.dmId,
          notificationMessage:
            'firstname2lastname2 added you to firstname1lastname1, firstname2lastname2',
        },
      ],
    });
  });

  test('Test-4: Success, test for react', () => {
    // create users
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
    // create channel and dm, send message and react it
    const channel1 = requestChannelsCreate(
      test2.bodyObj.token,
      'firstChannel',
      true
    );

    const dm = requestDmCreate(test2.bodyObj.token, [test1.bodyObj.authUserId]);
    requestChannelJoin(test1.bodyObj.token, channel1.bodyObj.channelId);

    const firstMessage = requestMessageSend(
      test2.bodyObj.token,
      channel1.bodyObj.channelId,
      'firstMessage'
    );

    const secondMessage = requestMessageSendDm(
      test2.bodyObj.token,
      dm.bodyObj.dmId,
      'secondMessage'
    );

    requestMessageReact(test1.bodyObj.token, firstMessage.bodyObj.messageId, 1);
    requestMessageReact(
      test1.bodyObj.token,
      secondMessage.bodyObj.messageId,
      1
    );
    // verify output of function
    const notifications = requestNotificationsGet(test2.bodyObj.token);
    expect(notifications.statusCode).toBe(OK);
    expect(notifications.bodyObj).toStrictEqual({
      notifications: [
        {
          channelId: -1,
          dmId: dm.bodyObj.dmId,
          notificationMessage:
            'firstname1lastname1 reacted to your message in firstname1lastname1, firstname2lastname2',
        },
        {
          channelId: channel1.bodyObj.channelId,
          dmId: -1,
          notificationMessage:
            'firstname1lastname1 reacted to your message in firstChannel',
        },
      ],
    });
  });

  test('Test-5: Unreacting message does not affect original notification', () => {
    // create new users
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
      test2.bodyObj.token,
      'firstChannel',
      true
    );
    // create channel and send messsage
    requestChannelJoin(test1.bodyObj.token, channel1.bodyObj.channelId);
    const firstMessage = requestMessageSend(
      test1.bodyObj.token,
      channel1.bodyObj.channelId,
      'hi channel1'
    );
    // react and unreact message
    requestMessageReact(test2.bodyObj.token, firstMessage.bodyObj.messageId, 1);
    requestMessageUnReact(
      test2.bodyObj.token,
      firstMessage.bodyObj.messageId,
      1
    );
    // verify the output
    const notifications = requestNotificationsGet(test1.bodyObj.token);
    expect(notifications.statusCode).toBe(OK);
    expect(notifications.bodyObj).toStrictEqual({
      notifications: [
        {
          channelId: channel1.bodyObj.channelId,
          dmId: -1,
          notificationMessage:
            'firstname2lastname2 reacted to your message in firstChannel',
        },
      ],
    });
  });

  test('Test-6: Tagged message edited or removed does not affect original notification', () => {
    // create new users
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
    // create channel and send message
    const channel1 = requestChannelsCreate(
      test2.bodyObj.token,
      'firstChannel',
      true
    );

    requestChannelJoin(test1.bodyObj.token, channel1.bodyObj.channelId);
    const firstMessage = requestMessageSend(
      test1.bodyObj.token,
      channel1.bodyObj.channelId,
      '@firstname2lastname2'
    );
    // edit message
    requestMessageEdit(
      test1.bodyObj.token,
      firstMessage.bodyObj.messageId,
      'secondMessage'
    );
    requestMessageRemove(test1.bodyObj.token, firstMessage.bodyObj.messageId);
    const notifications = requestNotificationsGet(test2.bodyObj.token);
    // verify output that tagged message edited or removed does not affect original notification
    expect(notifications.statusCode).toBe(OK);
    expect(notifications.bodyObj).toStrictEqual({
      notifications: [
        {
          channelId: channel1.bodyObj.channelId,
          dmId: -1,
          notificationMessage:
            'firstname1lastname1 tagged you in firstChannel: @firstname2lastname2',
        },
      ],
    });
  });

  test('Test-7: Success, user no long in dm or channel', () => {
    // create new users
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
    // create channel and dm, sending messages
    const channel1 = requestChannelsCreate(
      test2.bodyObj.token,
      'firstChannel',
      true
    );
    const dm = requestDmCreate(test2.bodyObj.token, [test1.bodyObj.authUserId]);
    requestChannelJoin(test1.bodyObj.token, channel1.bodyObj.channelId);
    const firstMessage = requestMessageSend(
      test1.bodyObj.token,
      channel1.bodyObj.channelId,
      'firstMessage'
    );
    const secondMessage = requestMessageSendDm(
      test1.bodyObj.token,
      dm.bodyObj.dmId,
      'secondMessage'
    );
    requestChannelLeave(test1.bodyObj.token, channel1.bodyObj.channelId);
    requestDmLeave(test1.bodyObj.token, dm.bodyObj.dmId);
    requestMessageReact(test2.bodyObj.token, firstMessage.bodyObj.messageId, 1);
    requestMessageReact(
      test2.bodyObj.token,
      secondMessage.bodyObj.messageId,
      1
    );
    const notifications = requestNotificationsGet(test1.bodyObj.token);
    // verify output with user no long in dm or channel
    expect(notifications.statusCode).toBe(OK);
    expect(notifications.bodyObj).toStrictEqual({
      notifications: [
        {
          channelId: -1,
          dmId: dm.bodyObj.dmId,
          notificationMessage:
            'firstname2lastname2 added you to firstname1lastname1, firstname2lastname2',
        },
      ],
    });
  });

  test('Test-8: No notification for self-reacts', () => {
    // create new suers
    const test1 = requestAuthRegister(
      'test1@gmail.com',
      '123456',
      'firstName1',
      'lastName1'
    );
    // create new channel and send message
    const channel1 = requestChannelsCreate(
      test1.bodyObj.token,
      'firstChannel',
      true
    );
    const firstMessage = requestMessageSend(
      test1.bodyObj.token,
      channel1.bodyObj.channelId,
      'firstMessage'
    );
    // test function with self react
    requestMessageReact(test1.bodyObj.token, firstMessage.bodyObj.messageId, 1);
    const notifications = requestNotificationsGet(test1.bodyObj.token);
    // verify output
    expect(notifications.statusCode).toBe(OK);
    expect(notifications.bodyObj).toStrictEqual({ notifications: [] });
  });

  test('Test-9: Test most recent 20 notifications', () => {
    // create new users
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
    // create dm and send more than 20 messages
    const testArray = [];
    requestDmCreate(test1.bodyObj.token, [test2.bodyObj.authUserId]);
    for (let i = 0; i < 20; i++) {
      const dmId = requestDmCreate(test1.bodyObj.token, [
        test2.bodyObj.authUserId,
      ]).bodyObj.dmId;
      testArray.push({
        channelId: -1,
        dmId: dmId,
        notificationMessage:
          'firstname1lastname1 added you to firstname1lastname1, firstname2lastname2',
      });
    }
    // verify output
    expect(requestNotificationsGet(test2.bodyObj.token).bodyObj).toStrictEqual({
      notifications: testArray.reverse(),
    });
  });
});

describe('Testing tagging with notifications', () => {
  test('Test-1: Valid and invalid tag mixed', () => {
    // create new users
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
    // create channel and send message with both valid and invalid tagg
    const channel1 = requestChannelsCreate(
      test2.bodyObj.token,
      'firstChannel',
      true
    );
    requestChannelJoin(test1.bodyObj.token, channel1.bodyObj.channelId);
    requestMessageSend(
      test2.bodyObj.token,
      channel1.bodyObj.channelId,
      '@richardolee@firstname1lastname1'
    );
    const notifications = requestNotificationsGet(test1.bodyObj.token);
    // verify output
    expect(notifications.statusCode).toBe(OK);
    expect(notifications.bodyObj).toStrictEqual({
      notifications: [
        {
          channelId: channel1.bodyObj.channelId,
          dmId: -1,
          notificationMessage:
            'firstname2lastname2 tagged you in firstChannel: @richardolee@firstna',
        },
      ],
    });
  });

  test('Test-2: User not in dm or channel', () => {
    // create new users
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
    // create channel and dm, sending messages
    const channel1 = requestChannelsCreate(
      test2.bodyObj.token,
      'firstChannel',
      true
    );
    const dm = requestDmCreate(test2.bodyObj.token, [test1.bodyObj.authUserId]);
    requestDmLeave(test1.bodyObj.token, dm.bodyObj.dmId);
    // sending message after a user has left
    requestMessageSend(
      test2.bodyObj.token,
      channel1.bodyObj.channelId,
      '@firstname1lastname1'
    );
    requestMessageSendDm(
      test2.bodyObj.token,
      dm.bodyObj.dmId,
      '@firstname1lastname1'
    );
    const notifications = requestNotificationsGet(test1.bodyObj.token);
    // verify output
    expect(notifications.statusCode).toBe(OK);
    expect(notifications.bodyObj).toStrictEqual({
      notifications: [
        {
          channelId: -1,
          dmId: dm.bodyObj.dmId,
          notificationMessage:
            'firstname2lastname2 added you to firstname1lastname1, firstname2lastname2',
        },
      ],
    });
  });

  test('Test-3: User tagging themselves', () => {
    // create new users
    const test1 = requestAuthRegister(
      'test1@gmail.com',
      '123456',
      'firstName1',
      'lastName1'
    );
    // create channel and send message
    const channel1 = requestChannelsCreate(
      test1.bodyObj.token,
      'firstChannel',
      true
    );
    requestMessageSend(
      test1.bodyObj.token,
      channel1.bodyObj.channelId,
      '@firstname1lastname1'
    );
    // verify output with user tagged themselves
    const notifications = requestNotificationsGet(test1.bodyObj.token);
    expect(notifications.statusCode).toBe(OK);
    expect(notifications.bodyObj).toStrictEqual({
      notifications: [
        {
          channelId: channel1.bodyObj.channelId,
          dmId: -1,
          notificationMessage:
            'firstname1lastname1 tagged you in firstChannel: @firstname1lastname1',
        },
      ],
    });
  });

  test('Test-4: Multiple tags', () => {
    // create new users
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
    // create channel and send message
    const channel1 = requestChannelsCreate(
      test2.bodyObj.token,
      'firstChannel',
      true
    );
    requestChannelJoin(test1.bodyObj.token, channel1.bodyObj.channelId);
    requestMessageSend(
      test2.bodyObj.token,
      channel1.bodyObj.channelId,
      '@firstname1lastname1@firstname2lastname2'
    );
    const notifications1 = requestNotificationsGet(test1.bodyObj.token);
    // verify outputs when two users are tagged
    expect(notifications1.bodyObj).toStrictEqual({
      notifications: [
        {
          channelId: channel1.bodyObj.channelId,
          dmId: -1,
          notificationMessage:
            'firstname2lastname2 tagged you in firstChannel: @firstname1lastname1',
        },
      ],
    });
    const notifications2 = requestNotificationsGet(test2.bodyObj.token);
    expect(notifications2.bodyObj).toStrictEqual({
      notifications: [
        {
          channelId: channel1.bodyObj.channelId,
          dmId: -1,
          notificationMessage:
            'firstname2lastname2 tagged you in firstChannel: @firstname1lastname1',
        },
      ],
    });
  });

  test('Test-5: Success, one notification despite multiple identical tags', () => {
    // create user
    const test1 = requestAuthRegister(
      'test1@gmail.com',
      '123456',
      'firstName1',
      'lastName1'
    );
    // create channel and send message
    const channel1 = requestChannelsCreate(
      test1.bodyObj.token,
      'firstChannel',
      true
    );
    requestMessageSend(
      test1.bodyObj.token,
      channel1.bodyObj.channelId,
      '@firstname1lastname1@firstname1lastname1@firstname1lastname1'
    );
    const notifications = requestNotificationsGet(test1.bodyObj.token);
    // verify output with multile identical tags
    expect(notifications.statusCode).toBe(OK);
    expect(notifications.bodyObj).toStrictEqual({
      notifications: [
        {
          channelId: channel1.bodyObj.channelId,
          dmId: -1,
          notificationMessage:
            'firstname1lastname1 tagged you in firstChannel: @firstname1lastname1',
        },
      ],
    });
  });

  test('Test-6: Do not notify for message edit that contain previously tagged user', () => {
    // create users
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
    // create channel and send messages
    const channel1 = requestChannelsCreate(
      test1.bodyObj.token,
      'firstChannel',
      true
    );
    requestChannelJoin(test2.bodyObj.token, channel1.bodyObj.channelId);
    const firstMessage = requestMessageSend(
      test1.bodyObj.token,
      channel1.bodyObj.channelId,
      '@firstname1lastname1'
    ).bodyObj;
    requestMessageEdit(
      test1.bodyObj.token,
      firstMessage.messageId,
      '@firstname1lastname1 @firstname2lastname2'
    );
    // verify output
    expect(requestNotificationsGet(test1.bodyObj.token).bodyObj).toStrictEqual({
      notifications: [
        {
          channelId: channel1.bodyObj.channelId,
          dmId: -1,
          notificationMessage:
            'firstname1lastname1 tagged you in firstChannel: @firstname1lastname1',
        },
      ],
    });
    expect(requestNotificationsGet(test2.bodyObj.token).bodyObj).toStrictEqual({
      notifications: [
        {
          channelId: channel1.bodyObj.channelId,
          dmId: -1,
          notificationMessage:
            'firstname1lastname1 tagged you in firstChannel: @firstname1lastname1',
        },
      ],
    });
  });
});
