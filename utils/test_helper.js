const bcrypt = require('bcrypt');
const Blog = require('../models/blog');
const User = require('../models/user');

const listWithOneBlog = [
    {
        title: 'Blog Post 1',
        author: 'Author 1',
        url: 'http://www.example.com',
        likes: 4,
    },
];

const blogsInDb = async () => {
    const blogs = await Blog.find({});
    return blogs.map((blog) => blog.toJSON());
};

const usersInDb = async () => {
    const users = await User.find({});
    return users.map((user) => user.toJSON());
};

const nonExistingId = async () => {
    const blog = new Blog(listWithOneBlog[0]);
    await blog.save();
    await blog.deleteOne();

    return blog._id.toString();
};

const getValidUserId = async () => {
    await User.deleteMany({});
    const user = await User({
        username: 'first',
        passwordHash: await bcrypt.hash('cheesee', 10),
    });
    await user.save();
    return user._id.toString();
};

const listWithMultipleBlogs = [
    {
        title: 'Blog Post 1',
        author: 'Author 1',
        url: 'http://www.example.com',
        likes: 4,
    },
    {
        title: 'Blog Post 2',
        author: 'Author 2',
        url: 'http://www.example.com',
        likes: 3,
    },
    {
        title: 'Blog Post 1',
        author: 'Author 1',
        url: 'http://www.example.com',
        likes: 6,
    },
    {
        title: 'Blog Post 4',
        author: 'Author 4',
        url: 'http://www.example.com',
        likes: 2,
    },
    {
        title: 'Blog Post 5',
        author: 'Author 5',
        url: 'http://www.example.com',
        likes: 5,
    },
];

const getListWithMultipleBlogs = async () => {
    const userId = await getValidUserId();
    return listWithMultipleBlogs.map((blog) => ({ ...blog, userId }));
};

module.exports = {
    getListWithMultipleBlogs,
    listWithMultipleBlogs,
    listWithOneBlog,
    blogsInDb,
    nonExistingId,
    usersInDb,
};
