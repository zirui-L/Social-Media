import { books } from 'googleapis/build/src/apis/books';
import {
  requestAuthRegister,
  requestAdminUserRemove,
  requestAdminUserpermissionChange,
  requestUsersAll,
  requestUserProfile,
  requestUserProfileSetHandle,
  requestChannelsCreate,
  requestChannelJoin,
  requestChannelDetails,
  requestChannelMessages,
  requestChannelAddOwner,
  requestDmCreate,
  requestDmDetails,
  requestDmMessages,
  requestMessageSend,
  requestMessageSendDm,
  requestClear,
} from './testHelper';
import { FORBIDDEN, OK, BAD_REQUEST } from '../helperFunctions/helperFunctions';

beforeEach(() => {
  requestClear();
});

afterEach(() => {
  requestClear();
});

describe('Testing messageSend', () => {
  test('Test-1: Error, invalid token', () => {
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

    requestAdminUserpermissionChange(
      test1.bodyObj.token,
      test2.bodyObj.authUserId,
      1
    );

    const res = requestAdminUserRemove(
      test1.bodyObj.token + '1',
      test2.bodyObj.authUserId
    );
    expect(res.statusCode).toBe(FORBIDDEN);
  });

  test('Test-2: Error, invalid uId', () => {
    const test1 = requestAuthRegister(
      'test1@gmail.com',
      '123456',
      'firstName1',
      'lastName1'
    );
    const res = requestAdminUserRemove(
      test1.bodyObj.token,
      test1.bodyObj.authUserId + 1
    );
    expect(res.statusCode).toBe(BAD_REQUEST);
  });

  test('Test-3: Error, uId refers to a user who is the only global owner', () => {
    const test1 = requestAuthRegister(
      'test1@gmail.com',
      '123456',
      'firstName1',
      'lastName1'
    );
    const res = requestAdminUserRemove(
      test1.bodyObj.token,
      test1.bodyObj.authUserId
    );
    expect(res.statusCode).toBe(BAD_REQUEST);
  });

  test('Test-4: Error, authorised user is not a global owner', () => {
    requestAuthRegister('test1@gmail.com', '123456', 'firstName1', 'lastName1');

    const test2 = requestAuthRegister(
      'test2@gmail.com',
      '1234567',
      'firstName2',
      'lastName2'
    );

    const res = requestAdminUserRemove(
      test2.bodyObj.token,
      test2.bodyObj.authUserId
    );
    expect(res.statusCode).toBe(FORBIDDEN);
  });

  test('Test-5: Success, removed the user', () => {
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

    const channelId = requestChannelsCreate(
      test1.bodyObj.token,
      'firstChannel',
      true
    );

    requestChannelJoin(test2.bodyObj.token, channelId.bodyObj.channelId);

    requestAdminUserpermissionChange(
      test1.bodyObj.token,
      test2.bodyObj.authUserId,
      1
    );

    const dmId = requestDmCreate(test1.bodyObj.token, [
      test2.bodyObj.authUserId,
    ]);

    const res = requestAdminUserRemove(
      test2.bodyObj.token,
      test1.bodyObj.authUserId
    );
    expect(res.statusCode).toBe(OK);
    expect(res.bodyObj).toStrictEqual({});

    // check that user has been removed in both the dm and channel
    expect(
      requestChannelDetails(test2.bodyObj.token, channelId.bodyObj.channelId)
        .bodyObj
    ).toStrictEqual({
      name: 'firstChannel',
      isPublic: true,
      ownerMembers: [],
      allMembers: [
        {
          uId: test2.bodyObj.authUserId,
          email: 'test2@gmail.com',
          nameFirst: 'firstName2',
          nameLast: 'lastName2',
          handleStr: 'firstname2lastname2',
          profileImgUrl: expect.any(String),
        },
      ],
    });
    expect(
      requestDmDetails(test2.bodyObj.token, dmId.bodyObj.dmId).bodyObj
    ).toStrictEqual({
      name: 'firstname1lastname1, firstname2lastname2',
      members: [
        {
          uId: test2.bodyObj.authUserId,
          email: 'test2@gmail.com',
          nameFirst: 'firstName2',
          nameLast: 'lastName2',
          handleStr: 'firstname2lastname2',
          profileImgUrl: expect.any(String),
        },
      ],
    });
  });

  test('Test-6: Success, remove user (check message sent, channel)', () => {
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

    const channelId = requestChannelsCreate(
      test1.bodyObj.token,
      'firstChannel',
      true
    );

    requestChannelJoin(test2.bodyObj.token, channelId.bodyObj.channelId);
    const messageId1 = requestMessageSend(
      test1.bodyObj.token,
      channelId.bodyObj.channelId,
      'firstMessage'
    );
    const messageId2 = requestMessageSend(
      test2.bodyObj.token,
      channelId.bodyObj.channelId,
      'secondMessage'
    );

    // After removal, the message sent becomes 'Removed user'
    requestAdminUserRemove(test1.bodyObj.token, test2.bodyObj.authUserId);
    expect(
      requestChannelMessages(
        test1.bodyObj.token,
        channelId.bodyObj.channelId,
        0
      ).bodyObj
    ).toStrictEqual({
      messages: [
        {
          messageId: messageId2.bodyObj.messageId,
          uId: test2.bodyObj.authUserId,
          message: 'Removed user',
          timeSent: expect.any(Number),
          reacts: [],
          isPinned: false,
        },
        {
          messageId: messageId1.bodyObj.messageId,
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

  test('Test-7: Success, remove user (check message sent, dm)', () => {
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

    const dmId = requestDmCreate(test1.bodyObj.token, [
      test2.bodyObj.authUserId,
    ]).bodyObj.dmId;
    const messageId1 = requestMessageSendDm(
      test1.bodyObj.token,
      dmId,
      'firstMessage'
    );
    const messageId2 = requestMessageSendDm(
      test2.bodyObj.token,
      dmId,
      'secondMessage'
    );

    // After removal, the message sent becomes 'Removed user'
    requestAdminUserRemove(test1.bodyObj.token, test2.bodyObj.authUserId);
    expect(
      requestDmMessages(test1.bodyObj.token, dmId, 0).bodyObj
    ).toStrictEqual({
      messages: [
        {
          messageId: messageId2.bodyObj.messageId,
          uId: test2.bodyObj.authUserId,
          message: 'Removed user',
          timeSent: expect.any(Number),
          reacts: [],
          isPinned: false,
        },
        {
          messageId: messageId1.bodyObj.messageId,
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

  test('Test-8, Success, removed user, test user/all returns', () => {
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

    const test3 = requestAuthRegister(
      'test3@gmail.com',
      '12345678',
      'firstName3',
      'lastName3'
    );
    requestAdminUserpermissionChange(
      test1.bodyObj.token,
      test2.bodyObj.authUserId,
      1
    );

    // after removal, the user all function does not return the user anymore
    requestAdminUserRemove(test2.bodyObj.token, test1.bodyObj.authUserId);
    expect(requestUsersAll(test2.bodyObj.token).bodyObj).toStrictEqual({
      users: [
        {
          uId: test2.bodyObj.authUserId,
          email: 'test2@gmail.com',
          nameFirst: 'firstName2',
          nameLast: 'lastName2',
          handleStr: 'firstname2lastname2',
          profileImgUrl: expect.any(String),
        },
        {
          uId: test3.bodyObj.authUserId,
          email: 'test3@gmail.com',
          nameFirst: 'firstName3',
          nameLast: 'lastName3',
          handleStr: 'firstname3lastname3',
          profileImgUrl: expect.any(String),
        },
      ],
    });

    expect(requestUsersAll(test1.bodyObj.token).statusCode).toStrictEqual(
      FORBIDDEN
    );
  });

  test('Test-9, Successful remove user, checking handler str and whether the email is reusable', () => {
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

    requestAdminUserRemove(test1.bodyObj.token, test2.bodyObj.authUserId);
    const test3 = requestAuthRegister(
      'test2@gmail.com',
      '12345678',
      'firstName3',
      'lastName3'
    );

    //check whether email is reusable or not
    expect(
      requestUserProfile(test1.bodyObj.token, test3.bodyObj.authUserId).bodyObj
    ).toStrictEqual({
      user: {
        uId: test3.bodyObj.authUserId,
        email: 'test2@gmail.com',
        nameFirst: 'firstName3',
        nameLast: 'lastName3',
        handleStr: 'firstname3lastname3',
        profileImgUrl: expect.any(String),
      },
    });

    requestAdminUserRemove(test1.bodyObj.token, test3.bodyObj.authUserId);

    //check whether handle string is reusable or not
    requestUserProfileSetHandle(test1.bodyObj.token, 'firstname3lastname3');
    expect(
      requestUserProfile(test1.bodyObj.token, test1.bodyObj.authUserId).bodyObj
    ).toStrictEqual({
      user: {
        uId: test1.bodyObj.authUserId,
        email: 'test1@gmail.com',
        nameFirst: 'firstName1',
        nameLast: 'lastName1',
        handleStr: 'firstname3lastname3',
        profileImgUrl: expect.any(String),
      },
    });
  });
});

describe('Testing admin/userpermission/change/v1', () => {
  test('Test-1: Error, invalid token', () => {
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

    const res = requestAdminUserpermissionChange(
      test1.bodyObj.token + '1',
      test2.bodyObj.authUserId,
      1
    );
    expect(res.statusCode).toBe(FORBIDDEN);
  });

  test('Test-2: Error, uId does not refer to a valid user', () => {
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

    const res = requestAdminUserpermissionChange(
      test1.bodyObj.token,
      test2.bodyObj.authUserId + 1,
      1
    );
    expect(res.statusCode).toBe(BAD_REQUEST);
  });

  test('Test-3: Error, uId refers to a user who is the only global owner and they are being demoted to a user', () => {
    const test1 = requestAuthRegister(
      'test1@gmail.com',
      '123456',
      'firstName1',
      'lastName1'
    );
    const res = requestAdminUserpermissionChange(
      test1.bodyObj.token,
      test1.bodyObj.authUserId,
      2
    );
    expect(res.statusCode).toBe(BAD_REQUEST);
  });

  test('Test-4: Error, permissionId is invalid', () => {
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

    const res = requestAdminUserpermissionChange(
      test1.bodyObj.token,
      test2.bodyObj.authUserId,
      3
    );
    expect(res.statusCode).toBe(BAD_REQUEST);
  });

  test('Test-5: Error, the user already has the permissions level of permissionId', () => {
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

    const res = requestAdminUserpermissionChange(
      test1.bodyObj.token,
      test2.bodyObj.authUserId,
      2
    );
    expect(res.statusCode).toBe(BAD_REQUEST);
  });

  test('Test-6: Error, the authorised user is not a global owner', () => {
    requestAuthRegister('test1@gmail.com', '123456', 'firstName1', 'lastName1');

    const test2 = requestAuthRegister(
      'test2@gmail.com',
      '1234567',
      'firstName2',
      'lastName2'
    );

    const res = requestAdminUserpermissionChange(
      test2.bodyObj.token,
      test2.bodyObj.authUserId,
      1
    );
    expect(res.statusCode).toBe(FORBIDDEN);
  });

  test('Test-7: Success, changing member to owner', () => {
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

    const res = requestAdminUserpermissionChange(
      test1.bodyObj.token,
      test2.bodyObj.authUserId,
      1
    );
    expect(res.statusCode).toBe(OK);
    expect(res.bodyObj).toStrictEqual({});

    // the new global owner can join a private channel
    const channelId = requestChannelsCreate(
      test1.bodyObj.token,
      'firstChannel',
      false
    );
    expect(
      requestChannelJoin(test2.bodyObj.token, channelId.bodyObj.channelId)
        .bodyObj
    ).toStrictEqual({});
  });

  test('Test-8: Success, changing member to owner', () => {
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

    requestAdminUserpermissionChange(
      test1.bodyObj.token,
      test2.bodyObj.authUserId,
      1
    );
    requestAdminUserpermissionChange(
      test2.bodyObj.token,
      test1.bodyObj.authUserId,
      2
    );
    // Global owner can no long add owner in the channel if their permission id been changed to Memes member
    const channelId = requestChannelsCreate(
      test2.bodyObj.token,
      'firstChannel',
      true
    ).bodyObj.channelId;
    requestChannelJoin(test1.bodyObj.token, channelId);
    expect(
      requestChannelAddOwner(
        test1.bodyObj.token,
        channelId,
        test1.bodyObj.authUserId
      ).statusCode
    ).toStrictEqual(FORBIDDEN);
  });
});
