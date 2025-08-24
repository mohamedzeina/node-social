const fs = require('fs');
const path = require('path');

const { validationResult } = require('express-validator');

const io = require('../socket');
const Post = require('../models/post');
const User = require('../models/user');
const { clearImage } = require('../../util/file');

/**
 * @desc    Get paginated list of posts
 * @route   GET /feed/posts?page=<page>
 * @access  Public (but typically protected in real-world apps)
 */

exports.getPosts = async (req, res, next) => {
  const currentPage = req.query.page || 1;
  const postsPerPage = 2;
  let totalItems;

  try {
    const count = await Post.find().countDocuments();
    totalItems = count;
    const posts = await Post.find()
      .populate('creator') // Include user info for each post
      .sort({ createdAt: -1 }) // Sort posts by descending order of data created
      .skip((currentPage - 1) * postsPerPage)
      .limit(postsPerPage);
    res.status(200).json({
      message: 'Fetched posts successfully!',
      posts: posts,
      totalItems: totalItems,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

/**
 * @desc    Create a new post
 * @route   POST /feed/post
 * @access  Private (requires authentication)
 */

exports.createPost = async (req, res, next) => {
  const errors = validationResult(req);
  try {
    if (!errors.isEmpty()) {
      const error = new Error('Validation failed, entered data is incorrect.');
      error.statusCode = 422;
      throw error;
    }
    if (!req.file) {
      console.log(req.file);
      const error = new Error('No image provided.');
      error.statusCode = 422;
      throw error;
    }
    const imageUrl = req.file.path.replace('\\', '/');
    const title = req.body.title;
    const content = req.body.content;

    // Create and save new post
    const post = new Post({
      title: title,
      content: content,
      imageUrl: imageUrl,
      creator: req.userId,
    });
    await post.save();

    // Push post into user's posts array
    const user = await User.findById(req.userId);
    user.posts.push(post);
    await user.save();

    // Notifying all users with emit that a new post has been created
    io.getIO().emit('posts', {
      action: 'create',
      post: { ...post._doc, creator: { _id: req.id, name: user.name } },
    });

    res.status(201).json({
      message: 'Post created successfully!',
      post: post,
      creator: { _id: user._id, name: user.name },
    });
  } catch (err) {
    if (!err.statusCode) {
      console.log(err);
      err.statusCode = 500;
    }
    next(err); // Since we're in an async, we can't throw an error like above
  }
};

/**
 * @desc    Get a single post by ID
 * @route   GET /feed/post/:postId
 * @access  Public
 */

exports.getPost = async (req, res, next) => {
  const postId = req.params.postId;
  try {
    const post = await Post.findById(postId);
    if (!post) {
      const error = new Error('Could not find post.');
      error.statusCode = 404;
      throw error;
    }
    console.log(post);
    res.status(200).json({ message: 'Post fetched successfully!', post: post });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

/**
 * @desc    Update an existing post
 * @route   PUT /feed/post/:postId
 * @access  Private (only post creator)
 */

exports.updatePost = async (req, res, next) => {
  const postId = req.params.postId;
  const errors = validationResult(req);
  try {
    if (!errors.isEmpty()) {
      const error = new Error('Validation failed, entered data is incorrect.');
      error.statusCode = 422;
      throw error;
    }

    const title = req.body.title;
    const content = req.body.content;
    let imageUrl = req.body.image;

    if (req.file) {
      imageUrl = req.file.path.replace('\\', '/');
    }

    if (!imageUrl) {
      const error = new Error('No file picked!');
      error.statusCode = 422;
      throw error;
    }

    const post = await Post.findById(postId).populate('creator');
    if (!post) {
      const error = new Error('Could not find post.');
      error.statusCode = 404;
      throw error;
    }

    // Authorization check
    if (post.creator._id.toString() !== req.userId) {
      const error = new Error('Not Authorized!');
      error.statusCode = 403;
      throw error;
    }

    // If new image uploaded → delete old one
    if (imageUrl !== post.imageUrl) {
      clearImage(post.imageUrl);
    }

    // Update post fields
    post.title = title;
    post.imageUrl = imageUrl;
    post.content = content;
    const result = await post.save();

    io.getIO().emit('posts', {
      action: 'update',
      post: result,
    });

    res
      .status(200)
      .json({ message: 'Post updated successfully!', post: result });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

/**
 * @desc    Delete a post
 * @route   DELETE /feed/post/:postId
 * @access  Private (only post creator)
 */

exports.deletePost = async (req, res, next) => {
  const postId = req.params.postId;

  try {
    const post = await Post.findById(postId);

    if (!post) {
      const error = new Error('Could not find post.');
      error.statusCode = 404;
      throw error;
    }

    // Authorization check
    if (post.creator.toString() !== req.userId) {
      const error = new Error('Not Authorized!');
      error.statusCode = 403;
      throw error;
    }

    // Remove image from file system
    clearImage(post.imageUrl);

    // Delete post
    await Post.findByIdAndDelete(postId);

    // Remove post reference from user
    const user = await User.findById(req.userId);
    user.posts.pull(postId);
    await user.save();

    // Notifying all users that a post has been deleted
    io.getIO().emit('posts', { action: 'delete', post: postId });

    res.status(200).json({ message: 'Post deleted successfully!' });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

/**
 * @desc    Get current user's status
 * @route   GET /feed/status
 * @access  Private
 */

exports.getStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      const error = new Error('User Not Found!');
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json({ status: user.status });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

/**
 * @desc    Update current user's status
 * @route   PUT /feed/status
 * @access  Private
 */

exports.editStatus = async (req, res, next) => {
  const newStatus = req.body.status;
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      const error = new Error('User Not Found!');
      error.statusCode = 404;
      throw error;
    }
    user.status = newStatus;
    await user.save();

    res.status(200).json({ message: 'User Status Updated' });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
