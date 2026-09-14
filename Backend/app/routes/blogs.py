# app/routes/blogs.py
# Blogs Blueprint routes. Public fetch and admin CRUD endpoints for blog posts.

from flask import Blueprint, request
from app.services.blog_service import BlogService
from app.utils import success_response, error_response, validate_required_fields, admin_required

blogs_bp = Blueprint('blogs', __name__)

@blogs_bp.route('', methods=['GET'])
def get_blogs():
    blogs = BlogService.get_all_blogs()
    return success_response(blogs)

@blogs_bp.route('/<int:blog_id>', methods=['GET'])
def get_blog(blog_id):
    blog, err = BlogService.get_blog_by_id(blog_id)
    if err:
        return error_response(err, 404)
    return success_response(blog)

@blogs_bp.route('', methods=['POST'])
@admin_required()
def create_blog():
    data = request.get_json(silent=True)
    is_valid, err = validate_required_fields(data, ['title', 'content'])
    if not is_valid:
        return error_response(err, 400)

    blog, create_err = BlogService.create_blog(
        title=data['title'],
        content=data['content'],
        excerpt=data.get('excerpt'),
        image_url=data.get('image_url'),
        author=data.get('author'),
        project_id=data.get('project_id')
    )
    if create_err:
        return error_response(create_err, 400)
    return success_response(blog, "Blog post published successfully", 201)

@blogs_bp.route('/<int:blog_id>', methods=['PUT'])
@admin_required()
def update_blog(blog_id):
    data = request.get_json(silent=True) or {}
    blog, err = BlogService.update_blog(
        blog_id=blog_id,
        title=data.get('title'),
        content=data.get('content'),
        excerpt=data.get('excerpt'),
        image_url=data.get('image_url'),
        author=data.get('author'),
        project_id=data.get('project_id')
    )
    if err:
        return error_response(err, 400)
    return success_response(blog, "Blog post updated successfully")

@blogs_bp.route('/<int:blog_id>', methods=['DELETE'])
@admin_required()
def delete_blog(blog_id):
    success, err = BlogService.delete_blog(blog_id)
    if err:
        return error_response(err, 400)
    return success_response(None, "Blog post deleted successfully")
