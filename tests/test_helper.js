const Blog = require('../models/blog');

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

const nonExistingId = async () => {
    const blog = new Blog(listWithOneBlog[0]);
    await blog.save();
    await blog.deleteOne();

    return blog._id.toString();
};

module.exports = {
    listWithMultipleBlogs,
    listWithOneBlog,
    blogsInDb,
    nonExistingId,
};
