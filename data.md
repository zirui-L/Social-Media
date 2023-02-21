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

[Optional] short description: We have implemented the users and channel data object using a conbination of lists and object. By incorporating lists inside the object, new information and data (such as users and channel) can be populated while the programe is running. Also, from the iteration0 iterface, we have also included lists for chat member within each channel object, which can also populate (add or remove member) while running the program.
