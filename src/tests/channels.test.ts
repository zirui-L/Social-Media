import {
  requestAuthRegister,
  requestClear,
  requestChannelsCreate,
  requestChannelsListAll,
  requestChannelsList,
  BAD_REQUEST,
  OK,
} from '../helperFunctions/helperServer';

beforeEach(() => {
  requestClear();
});

afterEach(() => {
  requestClear();
});

describe('requestChannelsCreate function testing', () => {
  test('Test-1: lenth of name exceed 20', () => {
    const user = requestAuthRegister(
      'test@gmail.com',
      '123455',
      'firstName',
      'lastName'
    );
    const longName = 'someNameThatExceedLenthOf20';
    const channelId = requestChannelsCreate(user.bodyObj.token, longName, true);
    expect(channelId.statusCode).toBe(BAD_REQUEST);
    expect(channelId.bodyObj).toStrictEqual(undefined);
  });

  test('Test-2: lenth of name less than 1', () => {
    const user = requestAuthRegister(
      'test@gmail.com',
      '123455',
      'firstName',
      'lastName'
    );
    const shortName = '';
    const channelId = requestChannelsCreate(
      user.bodyObj.token,
      shortName,
      true
    );
    expect(channelId.bodyObj).toStrictEqual(undefined);
  });

  test('Test-3: Invalid authUserId', () => {
    const user = requestAuthRegister(
      'test@gmail.com',
      '123455',
      'firstName',
      'lastName'
    );
    const name = 'validName';
    const channelId = requestChannelsCreate(user.bodyObj.token + 1, name, true);
    expect(channelId.statusCode).toBe(BAD_REQUEST);
    expect(channelId.bodyObj).toStrictEqual(undefined);
  });

  test('Test-4: Successful private channel creation', () => {
    const user = requestAuthRegister(
      'test@gmail.com',
      '123455',
      'firstName',
      'lastName'
    );
    const name = 'validName';
    const channelId = requestChannelsCreate(user.bodyObj.token, name, false);
    expect(channelId.statusCode).toBe(OK);
    expect(channelId.bodyObj).toStrictEqual({
      channelId: channelId.bodyObj.channelId,
    });
  });

  test('Test-5: Successful public channel creation', () => {
    const user = requestAuthRegister(
      'test@gmail.com',
      '123455',
      'firstName',
      'lastName'
    );
    const name = 'validName';
    const channelId = requestChannelsCreate(user.bodyObj.token, name, true);
    expect(channelId.statusCode).toBe(OK);
    expect(channelId.bodyObj).toEqual({
      channelId: channelId.bodyObj.channelId,
    });
  });
});

describe('requestChannelsList function testing', () => {
  test('Test-1: Invalid authUserId', () => {
    const user1 = requestAuthRegister(
      'ricky@gmail.com',
      '123455',
      'Ricky',
      'Li'
    );

    const channelsListObj = requestChannelsList(user1.bodyObj.token + 1);
    expect(channelsListObj.statusCode).toBe(BAD_REQUEST);
    expect(channelsListObj.bodyObj).toStrictEqual(undefined);
  });

  test('Test-2: Testing requestChannelsList with valid authUserId who is a member of one channel', () => {
    const test1 = requestAuthRegister(
      'test1@unsw.edu.au',
      'password1',
      'nameFirst1',
      'nameLast1'
    );
    const channel1 = requestChannelsCreate(
      test1.bodyObj.token,
      'channel',
      true
    );
    const channelsListObj = requestChannelsList(test1.bodyObj.token);
    expect(channelsListObj.statusCode).toBe(OK);
    expect(channelsListObj.bodyObj).toStrictEqual({
      channels: [
        {
          channelId: channel1.bodyObj.channelId,
          name: 'channel',
        },
      ],
    });
  });

  test('Test-3: Testing requestChannelsList with no channels', () => {
    const test1 = requestAuthRegister(
      'test1@unsw.edu.au',
      'password1',
      'nameFirst1',
      'nameLast1'
    );
    const test2 = requestAuthRegister(
      'test2@unsw.edu.au',
      'password2',
      'nameFirst2',
      'nameLast2'
    );
    requestChannelsCreate(test2.bodyObj.token, 'channel1', true);

    const channelsListObj = requestChannelsList(test1.bodyObj.token);
    expect(channelsListObj.statusCode).toBe(OK);

    expect(channelsListObj.bodyObj).toStrictEqual({
      channels: [],
    });
  });

  test('Test-4: Member has three channels', () => {
    const test = requestAuthRegister(
      'test@unsw.edu.au',
      '123456',
      'nameFirst',
      'nameLast'
    );
    const channel1 = requestChannelsCreate(
      test.bodyObj.token,
      'channel1',
      true
    );
    const channel2 = requestChannelsCreate(
      test.bodyObj.token,
      'channel2',
      true
    );
    const channel3 = requestChannelsCreate(
      test.bodyObj.token,
      'channel3',
      true
    );

    const channelsListObj = requestChannelsList(test.bodyObj.token);
    expect(channelsListObj.statusCode).toBe(OK);

    expect(channelsListObj.bodyObj).toStrictEqual({
      channels: [
        {
          name: 'channel1',
          channelId: channel1.bodyObj.channelId,
        },
        {
          name: 'channel2',
          channelId: channel2.bodyObj.channelId,
        },
        {
          name: 'channel3',
          channelId: channel3.bodyObj.channelId,
        },
      ],
    });
  });

  test('Test-5: Member of two out of three channels', () => {
    const test1 = requestAuthRegister(
      'test1@unsw.edu.au',
      'password1',
      'nameFirst1',
      'nameLast1'
    );
    const test2 = requestAuthRegister(
      'test2@unsw.edu.au',
      'password2',
      'nameFirst2',
      'nameLast2'
    );
    const channel1 = requestChannelsCreate(
      test1.bodyObj.token,
      'channel1',
      true
    );
    requestChannelsCreate(test2.bodyObj.token, 'channel2', true);
    const channel3 = requestChannelsCreate(
      test1.bodyObj.token,
      'channel3',
      true
    );
    const channelsListObj = requestChannelsList(test1.bodyObj.token);
    expect(channelsListObj.statusCode).toBe(OK);
    expect(channelsListObj.bodyObj).toStrictEqual({
      channels: [
        {
          channelId: channel1.bodyObj.channelId,
          name: 'channel1',
        },
        {
          channelId: channel3.bodyObj.channelId,
          name: 'channel3',
        },
      ],
    });
  });
});

describe('requestChannelsListAll function testing', () => {
  test('Test-1: Invalid token', () => {
    const user1 = requestAuthRegister(
      'ricky@gmail.com',
      '123455',
      'Ricky',
      'Li'
    );

    const channelsListAllObj = requestChannelsListAll(user1.bodyObj.token + 1);
    expect(channelsListAllObj.statusCode).toBe(BAD_REQUEST);

    expect(channelsListAllObj.bodyObj).toStrictEqual(undefined);
  });

  test('Test-2: Successful function implementation', () => {
    const user1 = requestAuthRegister(
      'ricky@gmail.com',
      '123455',
      'Ricky',
      'Li'
    );

    const user2 = requestAuthRegister(
      'libro@gmail.com',
      '123455',
      'libro',
      'Zhang'
    );
    const channel1 = requestChannelsCreate(
      user1.bodyObj.token,
      'Rickychannel',
      true
    );
    const channel2 = requestChannelsCreate(
      user2.bodyObj.token,
      'Librochannel',
      true
    );
    const channel3 = requestChannelsCreate(
      user2.bodyObj.token,
      'Henrychannel',
      false
    );

    const channelsListAllObj = requestChannelsListAll(user1.bodyObj.token);
    expect(channelsListAllObj.statusCode).toBe(OK);

    expect(channelsListAllObj.bodyObj).toEqual({
      channels: [
        {
          name: 'Rickychannel',
          channelId: channel1.bodyObj.channelId,
        },
        {
          name: 'Librochannel',
          channelId: channel2.bodyObj.channelId,
        },
        {
          name: 'Henrychannel',
          channelId: channel3.bodyObj.channelId,
        },
      ],
    });
  });

  test('Test-3: no channels', () => {
    const user1 = requestAuthRegister(
      'ricky@gmail.com',
      '123455',
      'Ricky',
      'Li'
    );

    const channelsListAllObj = requestChannelsListAll(user1.bodyObj.token);
    expect(channelsListAllObj.statusCode).toBe(OK);

    expect(channelsListAllObj.bodyObj).toStrictEqual({
      channels: [],
    });
  });
});
