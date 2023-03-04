```javascript
let data = {
  users: [
    {
      uId: 1,
      nameFirst: "Jeff",
      nameLast: "Zhang",
      email: "Jeff_Zhang@gmail.com",
      handleStr: "jeff_zhang",
      password: 'password',
      channels: [1, 2],
      permissionId: 1,
    },
  ],

  channels: [
    {
      name: "My Channel",
      channelId: 1,
      isPublic: true,
      ownerMembers: [0],
      allMembers: [0, 1, 2],
      messages: [0, 1, 2],
    },
  ],

  messages: [
    {
      messageId: 1;
      uId: 100;
      channelId: 201;
      message: 'hello henry';
    }
  ],
};
```

// User data

{
'uId': 100,
'nameFirst': 'Jeff',
'nameLast': 'Zhang',
'email': 'jeffzhang@gmail.com',
'handleStr': 'jeffzhang',
'password': 'password',
'channels': [1, 2],
'permissionId': 1,
}

// Channel data

{
'name': 'jeffchannel',
'channelId': 404,
'isPublic': true,
'allMembers': [201, 202, 203],
'ownerMembers': [201, 202, 203],
'messages': [0, 1, 2],
}

// Message data

{
messageId: 1;
uId: 100;
channelId: 201;
message: 'hello henry';
}

// Database

{
'usersList': [
{
'uId': 100,
'nameFirst': 'Jeff',
'nameLast': 'Zhang',
'email': 'jeffzhang@gmail.com',
'handleStr': 'jeffzhang',
'password': 'password',
'channels': [1, 2],
'permissionId': 1,
}
],
'channelList': [
{
'name': 'jeffchannel',
'channelId': 404,
'isPublic': true,
'allMembers': [201, 202, 203],
'ownerMembers': [201, 202, 203],
'messages': [0, 1, 2],
}
],
'messages': [
{
messageId: number;
uId: number;
channelId: number;
message: string;
}
]
}

[Optional] short description: We have implemented the users and channel data object using a conbination of lists and object. By incorporating lists inside the object, new information and data (such as users and channel) can be populated while the programe is running. Also, from the iteration0 iterface, we have also included lists for chat member within each channel object, which can also populate (add or remove member) while running the program.
