////////////////////////////////////////////////////////////////////////////////

Assumption 1
Assume that no user leaves any channel during this stage (iteration 1), and no channel is deleted from UNSW Memes. (No data is removed from dataStore)

////////////////////////////////////////////////////////////////////////////////

Assumption 2

Assume that after the user has registered via authRegisterV1, it is assumed that the user's login detail is immediate avaliable. (they are automatically logged into the system immediately after register)

////////////////////////////////////////////////////////////////////////////////

Assumption 3

The name of the user, including the first name and last name, don't include any speical charaters (e.g. !@#$%^\*+), since this would result in empty handler string.

////////////////////////////////////////////////////////////////////////////////

Assumption 4

Assume that the start value for channelMessagesV1 is non-negative integer.

////////////////////////////////////////////////////////////////////////////////

Assumption 5

Assume that channelListV1 return a empty array is the input user that doesn't have any channel ({ channels: [] }), channelListallV1 will return an empty array if there are no channel created within UNSW Memes.

////////////////////////////////////////////////////////////////////////////////

Assumption 6

Assume a global owner with a valid user id can join any private channels of which they are not a member.

////////////////////////////////////////////////////////////////////////////////

Assumption 7

Assume no global owner would have their permission removed or changed.

////////////////////////////////////////////////////////////////////////////////

Assumption 8

If the handler string is already taken by someone, and need concatination of number from 0, its is assumed that there are at most 9 repeated handler string (from 0 to 9).

////////////////////////////////////////////////////////////////////////////////

Assumption 9

Assume that the channelMessagesV1 wourld return an empty array if the input start is strictly equal to the end of the message.

////////////////////////////////////////////////////////////////////////////////
