const bcrypt = require('bcryptjs');
const validator = require('validator');
const jwt = require('jsonwebtoken');

const User = require('../models/user');
const Post = require('../models/post');
const { clearImage } = require('../../util/file');

module.exports = {
  /**
   * Register a new user
   * Validates email/password, hashes password, and saves user in DB
   */
  createUser: async function ({ userInput }, req) {
    const errors = [];

    // Input validation
    if (!validator.isEmail(userInput.email)) {
      errors.push({ message: 'E-Mail is invalid.' });
    }
    if (
      validator.isEmpty(userInput.password) ||
      !validator.isLength(userInput.password, { min: 6 })
    ) {
      errors.push({ message: 'Password too short.' });
    }
    if (errors.length > 0) {
      const error = new Error('Invalid input.');
      error.data = errors;
      error.code = 422;
      throw error;
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: userInput.email });
    if (existingUser) {
      const error = new Error('User exists already.');
      error.code = 401;
      throw error;
    }

    // Hash password and create user
    const hashedPw = await bcrypt.hash(userInput.password, 12);
    const user = new User({
      email: userInput.email,
      name: userInput.name,
      password: hashedPw,
    });

    const createdUser = await user.save();
    return { ...createdUser._doc, _id: createdUser._id.toString() };
  },

  /**
   * Login user
   * Validates email/password and returns JWT
   */
  login: async function ({ email, password }) {
    const user = await User.findOne({ email });
    if (!user) {
      const error = new Error('User not found.');
      error.code = 401;
      throw error;
    }

    const isEqual = await bcrypt.compare(password, user.password);
    if (!isEqual) {
      const error = new Error('Password is incorrect.');
      error.code = 401;
      throw error;
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id.toString(), email: user.email },
      'secretString', // Should be in env variable in production
      { expiresIn: '1h' }
    );

    return { token, userId: user._id.toString() };
  },

  /**
   * Create a post
   * Requires authentication; validates title/content; associates post with user
   */
  createPost: async function ({ postInput }, req) {
    if (!req.isAuth) throw new Error('Not authenticated!');

    const errors = [];
    if (validator.isEmpty(postInput.title))
      errors.push({ message: 'Title should not be empty' });
    if (!validator.isLength(postInput.title, { min: 5 }))
      errors.push({ message: 'Title should have a minimum length of 5' });
    if (validator.isEmpty(postInput.content))
      errors.push({ message: 'Content should not be empty' });
    if (!validator.isLength(postInput.content, { min: 5 }))
      errors.push({ message: 'Content should have a minimum length of 5' });
    if (errors.length > 0) {
      const error = new Error('Invalid input.');
      error.data = errors;
      error.code = 422;
      throw error;
    }

    const user = await User.findById(req.userId);
    if (!user) throw new Error('Invalid User.');

    const post = new Post({
      title: postInput.title,
      content: postInput.content,
      imageUrl: postInput.imageUrl,
      creator: user,
    });

    const createdPost = await post.save();
    user.posts.push(createdPost);
    await user.save();

    return {
      ...createdPost._doc,
      _id: createdPost._id.toString(),
      createdAt: createdPost.createdAt.toISOString(),
      updatedAt: createdPost.updatedAt.toISOString(),
    };
  },

  /**
   * Get paginated posts
   * Requires authentication
   */
  getPosts: async function ({ page }, req) {
    if (!req.isAuth) throw new Error('Not authenticated!');
    page = page || 1;
    const perPage = 2;

    const totalPosts = await Post.find().countDocuments();
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * perPage)
      .limit(perPage)
      .populate('creator');

    return {
      posts: posts.map((p) => ({
        ...p._doc,
        _id: p._id.toString(),
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
      })),
      totalPosts,
    };
  },

  /**
   * Get a single post by ID
   * Requires authentication
   */
  getPost: async function ({ id }, req) {
    if (!req.isAuth) throw new Error('Not authenticated!');

    const post = await Post.findById(id).populate('creator');
    if (!post) throw new Error('No post found!');

    return {
      ...post._doc,
      _id: post._id.toString(),
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
    };
  },

  /**
   * Update a post
   * Requires authentication and authorization (only creator)
   */
  updatePost: async function ({ id, postInput }, req) {
    if (!req.isAuth) throw new Error('Not authenticated!');

    const post = await Post.findById(id).populate('creator');
    if (!post) throw new Error('No post found!');
    if (post.creator._id.toString() !== req.userId.toString()) {
      throw new Error('Not authorized!');
    }

    const errors = [];
    if (validator.isEmpty(postInput.title))
      errors.push({ message: 'Title should not be empty' });
    if (!validator.isLength(postInput.title, { min: 5 }))
      errors.push({ message: 'Title should have a minimum length of 5' });
    if (validator.isEmpty(postInput.content))
      errors.push({ message: 'Content should not be empty' });
    if (!validator.isLength(postInput.content, { min: 5 }))
      errors.push({ message: 'Content should have a minimum length of 5' });
    if (errors.length > 0) {
      const error = new Error('Invalid input.');
      error.data = errors;
      error.code = 422;
      throw error;
    }

    post.title = postInput.title;
    post.content = postInput.content;
    if (postInput.imageUrl !== 'undefined') post.imageUrl = postInput.imageUrl;

    const updatedPost = await post.save();
    return {
      ...updatedPost._doc,
      _id: updatedPost._id.toString(),
      createdAt: updatedPost.createdAt.toISOString(),
      updatedAt: updatedPost.updatedAt.toISOString(),
    };
  },

  /**
   * Delete a post
   * Requires authentication and authorization
   */
  deletePost: async function ({ id }, req) {
    if (!req.isAuth) throw new Error('Not authenticated!');

    const post = await Post.findById(id);
    if (!post) throw new Error('No post found!');
    if (post.creator.toString() !== req.userId.toString())
      throw new Error('Not authorized!');

    clearImage(post.imageUrl.replace('/', '\\'));
    await Post.findByIdAndDelete(id);

    const user = await User.findById(req.userId);
    user.posts.pull(id);
    await user.save();

    return true;
  },

  /**
   * Get current authenticated user
   */
  user: async function (args, req) {
    if (!req.isAuth) throw new Error('Not authenticated!');

    const user = await User.findById(req.userId);
    if (!user) throw new Error('No user found!');

    return { ...user._doc, _id: user._id.toString() };
  },

  /**
   * Update current user's status
   */
  updateStatus: async function ({ status }, req) {
    if (!req.isAuth) throw new Error('Not authenticated!');

    const user = await User.findById(req.userId);
    if (!user) throw new Error('No user found!');

    user.status = status;
    await user.save();

    return { ...user._doc, _id: user._id.toString() };
  },
};
