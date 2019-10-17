const { ApolloServer, gql } = require('apollo-server')
var uuid = require('uuid');
//
//placeholder profiles
let profileExamples = [
    {
        name: "Matt",
        lastOnline: "2 hours",
        distance: '0.6 mi',
        photo: 'matt.jpg',
        id: uuid.v4()
    },
    {
        name: "Steven",
        lastOnline: "6 hours",
        distance: '4.2 mi',
        photo: 'steven.jpg',
        id: uuid.v4()
    },
    {
        name: "Jonathan",
        lastOnline: "2 days",
        distance: '.5 mi',
        photo: 'jon.jpg',
        id: uuid.v4()
    }
];

//array containing profiles (will be in redux state in future)
let profiles = []

//randomly picks from placeholder profiles to fill the profiles array
for (let i = 0; i < 40; i++) {
    let randomNumber = Math.floor(Math.random() * profileExamples.length);
    profiles.push(profileExamples[randomNumber]);
}

let conversations = [
    {
        messages: [{content: "Hello", sender: "Matt"}],
        memberIDs: [1, 2],
        id: uuid.v4()
    },
    {
        messages: [{content: "hey there", sender: "Jon"}, {content: "test message", sender: "Steven"}],
        memberIDs: [0, 2],
        id: uuid.v4()
    }
];

const typeDefs = gql`
  type Person {
    name: String!
    lastOnline: String!
    distance: String!
    photo: String! 
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
    memberIDs: [String!]!
    createdAt: String
    updatedAt: String
  } 

  type Query {
    personCount: Int!
    allPersons: [Person!]!
    findPersonByName(name: String!): Person
    findPersonByID(id: String!): Person
    findConversationBetweenTwoPeople(id1: Int, id2: Int): Conversation
  }

  type Mutation {
      createConversation(
          id1: Int!
          id2: Int!
      ): Conversation
      addMessageToConversation(
          conversationID: Int!
          content: String!
          senderID: Int!
      ): Conversation
  }
`

const resolvers = {
    Query: {
        personCount: () => profiles.length,
        allPersons: () => profiles,
        findPersonByName: (root, args) =>
            profiles.find(p => p.name === args.name),
        findPersonByID: (root, args) =>
            profiles.find(p => p.id === args.id),
        findConversationBetweenTwoPeople: (root, args) =>
            conversations.find(conversation => conversation.memberIDs.includes(args.id1) && conversation.memberIDs.includes(args.id2))
    },

    Mutation: {
        createConversation: (root, args) => {
          const conversation = { memberIDs: [args.id1, args.id2], messages: [], id: uuid.v4() };
          conversations = conversations.concat(conversation);
          return conversation;
        },
        addMessageToConversation: (root, args) => {
            const conversation = conversations.find(conversation => conversation.id === args.conversationID);
            conversation.messages.push({content: args.content, sender: args.senderID, id: uuid.v4()});
            return conversation;
          }
    }
}

const server = new ApolloServer({
    typeDefs,
    resolvers,
})

server.listen().then(({ url }) => {
    console.log(`Server ready at ${url}`)
})