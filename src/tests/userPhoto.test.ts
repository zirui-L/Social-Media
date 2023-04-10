import {
  requestClear,
  requestAuthRegister,
  requestUserProfile,
  requestUserProfileUploadPhoto,
  OK,
  BAD_REQUEST,
  FORBIDDEN,
} from '../helperFunctions/helperServer';

const JPG =
  'http://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Rufous_Hummingbird%2C_male_01.jpg/1280px-Rufous_Hummingbird%2C_male_01.jpg';
const GIF =
  'https://chttps://cdn.vox-cdn.com/thumbor/iaVMlcV5rj0OuPejZ7HyqYslLZk=/0x0:800x333/1400x788/filters:focal(334x72:462x200):format(gif)/cdn.vox-cdn.com/uploads/chorus_image/image/55278741/gatsby.0.gifdn.vox-cdn.com/thumbor/SiIyeqmKIJGcOJccz94pHgwmgvQ=/0x0:1400x1400/1200x800/filters:focal(588x588:812x812):no_upscale()/cdn.vox-cdn.com/uploads/chorus_image/image/68837730/poptart1redrainbowfix_1.0.gif';

// info collected from inspecting image on internet
const JPGWidth = 1280;
const JPGHeight = 973;

beforeEach(() => {
  requestClear();
});

afterEach(() => {
  requestClear();
});

describe('user/profile/uploadphoto/v1', () => {
  test('Test-1: Success, the image has changed', () => {
    const detail = requestAuthRegister(
      'test@gmail.com',
      '123456',
      'firstName',
      'lastName31415'
    );

    const defaultPhoto = requestUserProfile(
      detail.bodyObj.token,
      detail.bodyObj.authUserId
    ).bodyObj.user.profileImgUrl;

    const userProfileUploadPhotoObj = requestUserProfileUploadPhoto(
      detail.bodyObj.token,
      JPG,
      0,
      0,
      200,
      200
    );

    expect(userProfileUploadPhotoObj.statusCode).toBe(OK);
    expect(userProfileUploadPhotoObj.bodyObj).toStrictEqual({});
    const newPhoto = requestUserProfile(
      detail.bodyObj.token,
      detail.bodyObj.authUserId
    ).bodyObj.user.profileImgUrl;

    expect(newPhoto).not.toBe(defaultPhoto);
  });

  test('Test-2: Unsuccess, any of xStart, yStart, xEnd, yEnd are not within the dimensions of the image at the URL', () => {
    const test1 = requestAuthRegister(
      'test1@gmail.com',
      '123455',
      'firstName',
      'lastName'
    );

    expect(
      requestUserProfileUploadPhoto(
        test1.bodyObj.token,
        JPG,
        0,
        0,
        JPGWidth + 1,
        200
      ).statusCode
    ).toBe(BAD_REQUEST);

    expect(
      requestUserProfileUploadPhoto(
        test1.bodyObj.token,
        JPG,
        0,
        0,
        200,
        JPGHeight + 1
      ).statusCode
    ).toBe(BAD_REQUEST);

    expect(
      requestUserProfileUploadPhoto(test1.bodyObj.token, JPG, -1, 0, 200, 200)
        .statusCode
    ).toBe(BAD_REQUEST);

    expect(
      requestUserProfileUploadPhoto(test1.bodyObj.token, JPG, 0, -1, 200, 200)
        .statusCode
    ).toBe(BAD_REQUEST);
  });

  test('Test-3: Unsuccess, xEnd is less than or equal to xStart or yEnd is less than or equal to yStart', () => {
    const test1 = requestAuthRegister(
      'test1@gmail.com',
      '123455',
      'firstName',
      'lastName'
    );

    expect(
      requestUserProfileUploadPhoto(test1.bodyObj.token, JPG, 100, 0, 100, 200)
        .statusCode
    ).toBe(BAD_REQUEST);
    expect(
      requestUserProfileUploadPhoto(test1.bodyObj.token, JPG, 100, 0, 99, 200)
        .statusCode
    ).toBe(BAD_REQUEST);
    expect(
      requestUserProfileUploadPhoto(test1.bodyObj.token, JPG, 0, 100, 200, 100)
        .statusCode
    ).toBe(BAD_REQUEST);
    expect(
      requestUserProfileUploadPhoto(test1.bodyObj.token, JPG, 0, 100, 200, 99)
        .statusCode
    ).toBe(BAD_REQUEST);
  });

  test('Test-4: Unsuccess, image uploaded is not a JPG', () => {
    const test1 = requestAuthRegister(
      'test1@gmail.com',
      '123455',
      'firstName',
      'lastName'
    );
    expect(
      requestUserProfileUploadPhoto(test1.bodyObj.token, GIF, 0, 0, 200, 200)
        .statusCode
    ).toBe(BAD_REQUEST);
  });

  test('Test 5: testing there is a default image', () => {
    const test1 = requestAuthRegister(
      'test1@gmail.com',
      '123455',
      'firstName',
      'lastName'
    );

    const defaultPhoto = requestUserProfile(
      test1.bodyObj.token,
      test1.bodyObj.authUserId
    ).bodyObj.user.profileImgUrl;

    expect(defaultPhoto).not.toBe('');
  });

  test('Test 6: invalid token', () => {
    const test1 = requestAuthRegister(
      'test1@gmail.com',
      '123455',
      'firstName',
      'lastName'
    );
    const userProfileUploadPhotoObj = requestUserProfileUploadPhoto(
      test1.bodyObj.token + '1',
      JPG,
      0,
      0,
      200,
      200
    );
    expect(userProfileUploadPhotoObj.statusCode).toBe(FORBIDDEN);
  });
});
