const blogRouter = require('express').Router();
const Blog = require('../models/blog');
const User = require('../models/user');

blogRouter.get('/', async (request, response) => {
    const blogs = await Blog
        .find({})
        .populate('user', { username: 1, name: 1 });
    response.json(blogs);
});

blogRouter.get('/:id', async (request, response) => {
    const blog = await Blog
        .findById(request.params.id)
        .populate('user', { username: 1, name: 1 });
    if (blog) {
        response.json(blog);
    } else {
        response.status(404).end();
    }
});

blogRouter.post('/', async (request, response) => {
    const {
        title,
        author,
        url,
        likes,
    } = request.body;

    let { user } = request;

    const blog = new Blog({
        title,
        author,
        url,
        likes: likes || 0,
        user: user.id,
    });

    const savedBlog = await blog.save();

    user = await User.findById(user.id);
    user.blogs = user.blogs.concat(savedBlog._id);
    await user.save();

    response.status(201).json(savedBlog);
});

blogRouter.delete('/:id', async (request, response) => {
    const { user } = request;
    const blog = await Blog.findById(request.params.id);

    if (blog.user.toString() !== user.id.toString()) {
        return response.status(401).json({ error: 'unauthorized' });
    }

    await Blog.findByIdAndDelete(request.params.id);
    response.status(204).end();
});

blogRouter.put('/:id', async (request, response) => {
    const updatedBlog = {
        ...request.body,
    };

    const result = await Blog.findByIdAndUpdate(
        request.params.id,
        updatedBlog,
        { new: true, runValidators: true, context: 'query' },
    );

    response.json(result);
});

module.exports = blogRouter;
