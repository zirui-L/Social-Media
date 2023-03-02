```javascript
let data = {
  users: [
    {
      uId: 1,
      nameFirst: "Jeff",
      nameLast: "Zhang",
      email: "Jeff_Zhang@gmail.com",
      handleStr: "jeff_zhang",
    },
  ],

  channels: [
    {
      channelId: 1,
      name: "My Channel",
      ownerMembers: [
        {
          uId: 1,
          nameFirst: "Jeff",
          nameLast: "Zhang",
          email: "Jeff_Zhang@gmail.com",
          handleStr: "jeff_zhang",
        },
      ],
      allMembers: [
        {
          uId: 1,
          nameFirst: "Jeff",
          nameLast: "Zhang",
          email: "Jeff_Zhang@gmail.com",
          handleStr: "jeff_zhang",
        },
      ],
    },
  ],
};
```

// User data

{
'authUserId': 100,
'uId': 12345678,
'nameFirst': 'Jeff',
'nameLast': 'Zhang',
'handleStr': 'jeffzhang',
'email': 'jeffzhang@gmail.com',
'password': 'password',
'channels': [1, 2],
'permissionId': '1',
}

// Channel data

{
'name': 'jeffchannel',
'channelId': 404,
'isPublic': true,
'allMembers': [201, 202, 203],
'ownerMembers': [201, 202, 203],
'message': [],
}

// Database

{
'usersList': [201, 202, 203, 204, 205],
'channelList': [101, 102],
}

[Optional] short description: We have implemented the users and channel data object using a conbination of lists and object. By incorporating lists inside the object, new information and data (such as users and channel) can be populated while the programe is running. Also, from the iteration0 iterface, we have also included lists for chat member within each channel object, which can also populate (add or remove member) while running the program.
