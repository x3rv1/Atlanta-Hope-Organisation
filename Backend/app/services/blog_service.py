# app/services/blog_service.py
# BlogService logic. Manages blog posts database operations and retrieval.

from app.models import db, Blog, Project

class BlogService:
    @staticmethod
    def get_all_blogs():
        blogs = Blog.query.order_by(Blog.created_at.desc()).all()
        return [blog.to_dict() for blog in blogs]

    @staticmethod
    def get_blog_by_id(blog_id):
        blog = db.session.get(Blog, blog_id)
        if not blog:
            return None, "Blog post not found"
        return blog.to_dict(), None

    @staticmethod
    def create_blog(title, content, excerpt=None, image_url=None, author='Atlanta Hope Team', project_id=None):
        if not title or not content:
            return None, "Title and content are required"

        if project_id:
            project = db.session.get(Project, project_id)
            if not project:
                return None, "Associated project not found"

        blog = Blog(
            title=title,
            content=content,
            excerpt=excerpt or content[:150] + '...',
            image_url=image_url,
            author=author or 'Atlanta Hope Team',
            project_id=project_id
        )

        try:
            db.session.add(blog)
            db.session.commit()
            return blog.to_dict(), None
        except Exception as e:
            db.session.rollback()
            return None, f"Database error: {str(e)}"

    @staticmethod
    def update_blog(blog_id, title=None, content=None, excerpt=None, image_url=None, author=None, project_id=None):
        blog = db.session.get(Blog, blog_id)
        if not blog:
            return None, "Blog post not found"

        if title:
            blog.title = title
        if content:
            blog.content = content
        if excerpt is not None:
            blog.excerpt = excerpt
        if image_url is not None:
            blog.image_url = image_url
        if author:
            blog.author = author
        if project_id is not None:
            if project_id:
                project = db.session.get(Project, project_id)
                if not project:
                    return None, "Associated project not found"
                blog.project_id = project_id
            else:
                blog.project_id = None

        try:
            db.session.commit()
            return blog.to_dict(), None
        except Exception as e:
            db.session.rollback()
            return None, f"Database error: {str(e)}"

    @staticmethod
    def delete_blog(blog_id):
        blog = db.session.get(Blog, blog_id)
        if not blog:
            return None, "Blog post not found"

        try:
            db.session.delete(blog)
            db.session.commit()
            return True, None
        except Exception as e:
            db.session.rollback()
            return None, f"Database error: {str(e)}"
