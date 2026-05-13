const { buildSchema } = require('graphql');

module.exports = buildSchema(`


    # ------------------------------
    # Object Types
    # ------------------------------

    # A Post created by a user
    type Post {
        _id: ID!
        title: String!
        content: String!
        imageUrl: String!
        creator: User!          # Relation: every post has a creator
        createdAt: String!
        updatedAt: String!
        likeCount: Int!         # Total number of likes on this post
        likedByMe: Boolean!     # Whether the requesting user has liked this post
    }
    
    # A User of the system
    type User {
        _id: ID!
        name: String!
        email: String!
        password: String    # Nullable → only used internally, not exposed to clients
        status: String!     # Profile status 
        posts: [Post!]!     # Relation: all posts created by this user
    }
    
    # Returned when logging in successfully
    type AuthData {
        token: String!
        userId: String!
    
    }

    # Wrapper for paginated posts (list + total count)
    type PostData {
        posts: [Post!]!
        totalPosts: Int!
    }
    
    # ------------------------------
    # Input Types (for mutations)
    # ------------------------------

    # Input for signing up a user
    input UserSignUpData {
        email: String!
        name: String!
        password: String!
    }
    
    # Input for creating/updating a post
    input PostInputData {
        title: String!
        content: String!
        imageUrl: String!
    }
    
    # ------------------------------
    # Mutations (write operations)
    # ------------------------------
    type RootMutation {
        createUser(userInput: UserSignUpData): User!            # Register new user
        createPost(postInput: PostInputData): Post!             # Create a new post
        updatePost(id: ID!, postInput: PostInputData): Post!    # Update an existing post
        deletePost(id: ID!): Boolean                            # Delete a post
        updateStatus(status: String!): User!                    # Update user status
        likePost(id: ID!): Post!                                # Like a post (idempotent)
        unlikePost(id: ID!): Post!                              # Remove like from a post
    }

    # ------------------------------
    # Queries (read operations)
    # ------------------------------
    type RootQuery {
        login(email: String!, password: String!): AuthData!     # Authenticate user
        getPosts(page: Int): PostData!                          # Paginated posts
        getPost(id: ID!): Post!                                 # Get single post
        user: User!                                              # Get currently logged-in user
    }

    # ------------------------------
    # Schema Entry Point
    # ------------------------------
    schema {
        query: RootQuery
        mutation: RootMutation
    }
  `);
