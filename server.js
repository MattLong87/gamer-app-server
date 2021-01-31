const { ApolloServer, gql } = require('apollo-server');
var uuid = require('uuid');
var faker = require('faker');
//
//placeholder profiles
// let profileExamples = [
//     {
//         name: "Matt",
//         lastOnline: "2 hours",
//         distance: '0.6 mi',
//         photo: 'matt.jpg',
//         id: uuid.v4()
//     },
//     {
//         name: "Steven",
//         lastOnline: "6 hours",
//         distance: '4.2 mi',
//         photo: 'steven.jpg',
//         id: uuid.v4()
//     },
//     {
//         name: "Jonathan",
//         lastOnline: "2 days",
//         distance: '.5 mi',
//         photo: 'jon.jpg',
//         id: uuid.v4()
//     }
// ];

//array containing profiles (will be in redux state in future)
let profiles = []

//randomly picks from placeholder profiles to fill the profiles array
// for (let i = 0; i < 40; i++) {
//     let randomNumber = Math.floor(Math.random() * profileExamples.length);
//     profiles.push(profileExamples[randomNumber]);
// }

for (let i = 0; i < 40; i++) {
    let fakeProfile = {};
    fakeProfile.name = faker.name.firstName();
    fakeProfile.lastOnline = Math.floor(Math.random() * 6 + 1) + ' days';
    fakeProfile.distance = Math.floor(Math.random() * 15 + 1) + ' mi';
    fakeProfile.photo = `https://avatars.dicebear.com/api/human/${Math.floor(Math.random() * 59999)}.svg`;
    fakeProfile.id = uuid.v4();
    fakeProfile.aboutMe = "This is just a test profile, this area will contain information about the user!";
    fakeProfile.favoriteGames = "Puerto Rico, \nSettlers of Catan, \nFood Chain Magnate, \nGloomhaven, \nMage Knight";
    fakeProfile.wantToPlay = "I would like to find a group to play cooperative games with!"
    profiles.push(fakeProfile);
}

let conversations = [
    {
        messages: [{ content: "Hello", sender: "Matt" }],
        members: [profiles[1], profiles[2]],
        id: uuid.v4()
    },
    {
        messages: [{ content: "Hello 2", sender: "Matt" }, {content: "Hello again", sender: "Jon"}],
        members: [profiles[1], profiles[2]],
        id: uuid.v4()
    },
    {
        messages: [{ content: "hey there", sender: "Jon" }, { content: "test message", sender: "Steven" }],
        members: [profiles[3], profiles[4]],
        id: uuid.v4()
    }
];

const typeDefs = gql`
  type Person {
    name: String!
    lastOnline: String!
    distance: String!
    photo: String!
    aboutMe: String
    favoriteGames: String
    wantToPlay: String
    id: ID!
  }

   type Message {
    content: String!
    timeCreated: Int
    id: ID
    sender: String
   }

  type Conversation {
    id: ID!
    messages: [Message]!
    members: [Person]!
    createdAt: String
    updatedAt: String
  } 

  type Query {
    personCount: Int!
    allPersons: [Person!]!
    findPersonByName(name: String!): Person
    findPersonByID(id: String!): Person
    findConversationBetweenTwoPeople(id1: String, id2: String): Conversation
    findConversationsByMemberID(id: ID!): [Conversation]
  }

  type Mutation {
      createConversation(
          id1: String!
          id2: Int!
      ): String
      addMessageToConversation(
          conversationID: String!
          content: String!
          senderID: String!
      ): Conversation
  }
`
console.log(profiles[1].id);
console.log(conversations[1].members[0]);

const resolvers = {
    Query: {
        personCount: () => profiles.length,
        allPersons: () => profiles,
        findPersonByName: (root, args) =>
            profiles.find(p => p.name === args.name),
        findPersonByID: (root, args) =>
            profiles.find(p => p.id === args.id),
        findConversationsByMemberID: (root, args) =>
            conversations.filter(conversation => conversation.members[0].id == args.id || conversation.members[1].id == args.id)
        //findConversationBetweenTwoPeople: (root, args) =>
            //conversations.find(conversation => conversation.memberIDs.includes(args.id1) && conversation.memberIDs.includes(args.id2))
    },

    Mutation: {
        createConversation: (root, args) => {
            const conversation = { memberIDs: [args.id1, args.id2], messages: [], id: uuid.v4() };
            conversations = conversations.concat(conversation);
            return conversation;
        },
        addMessageToConversation: (root, args) => {
            const conversation = conversations.find(conversation => conversation.id === args.conversationID);
            conversation.messages.push({ content: args.content, sender: args.senderID, id: uuid.v4() });
            return conversation;
        }
    }
}

const server = new ApolloServer({
    typeDefs,
    resolvers,
    playground: {
        endpoint: '/graphql',
        settings: {
            "editor.theme": "light"
        }
    },
    introspection: true
});

// Start the server
server.listen({ port: process.env.PORT || 4000 }).then(({ url }) => {
    console.log(`🚀 Server ready at ${url}`);
});