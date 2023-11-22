import sqlite3
#或者：
from sqlite3 import dbapi2       #导入sqlite3模块的dbapi2接口模块 
import hashlib
import json
import csv
import re
import markdown
from bs4 import BeautifulSoup

dbname="websy"

def createTables():
    connection=sqlite3.connect(dbname + '.db', check_same_thread=False) 
    cursor = connection.cursor()
    try:
        # 创建文章表
        sql_create_posts = '''
        CREATE TABLE IF NOT EXISTS posts(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL REFERENCES users (id),
            title VARCHAR(100) NOT NULL,
            context TEXT NOT NULL,
            publish_time TIMESTAMP NOT NULL DEFAULT (datetime('now','localtime')),
            comment_count INTEGER NOT NULL
        )'''
        cursor.execute(sql_create_posts)

        # 创建评论表
        sql_create_comments = '''
        CREATE TABLE IF NOT EXISTS comments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            post_id INTEGER NOT NULL REFERENCES posts (id),
            user_id INTEGER NOT NULL REFERENCES users (id),
            content TEXT NOT NULL,
            create_time TIMESTAMP NOT NULL DEFAULT (datetime('now','localtime')),
            parent_comment_id INTEGER,
            is_deleted BOOLEAN NOT NULL DEFAULT 0
        )'''
        cursor.execute(sql_create_comments)

        # 创建标签表
        sql_create_tags = '''
        CREATE TABLE IF NOT EXISTS tags (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name VARCHAR(50) NOT NULL
        )'''
        cursor.execute(sql_create_tags)

        # 创建文章与标签的关联表
        sql_create_post_tags = '''
        CREATE TABLE IF NOT EXISTS post_tags (
            post_id INTEGER NOT NULL REFERENCES posts (id),
            tag_id INTEGER NOT NULL REFERENCES tags (id),
            PRIMARY KEY (post_id, tag_id)
        )'''
        cursor.execute(sql_create_post_tags)

        # 创建点赞表
        sql_create_comment_likes = '''
        CREATE TABLE IF NOT EXISTS comment_likes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            comment_id INTEGER NOT NULL REFERENCES comments (id),
            user_id INTEGER NOT NULL REFERENCES users (id),
            create_time TIMESTAMP NOT NULL DEFAULT (datetime('now','localtime')),
            UNIQUE (comment_id, user_id)
        )'''
        cursor.execute(sql_create_comment_likes)
    except Exception as e:
        print(repr(e))

createTables()

# 从博客内容中移除Markdown标识符并计算长度
def calculate_markdown_length(content):
    # 将Markdown内容转换为HTML
    html_content = markdown.markdown(content)

    # 从HTML中移除标签，只保留文本
    text_content = ''.join(BeautifulSoup(html_content, "html.parser").findAll(text=True))

    # 移除空格和换行符，然后计算长度
    text_content = text_content.replace('\n', '')
    cleaned_content = text_content.strip()
    print("nowcontent:\n", cleaned_content)
    length = len(cleaned_content)

    return length


## 博客类
# 获取博客列表
def getPostsList():
    connection=sqlite3.connect(dbname + '.db', check_same_thread=False) 
    cursor = connection.cursor()
    sql = "select * from posts"

    with connection:
        cursor.execute(sql)
        datas = cursor.fetchall()
        cols = [desc[0] for desc in cursor.description]

        all_blogs = []  # 用于存储所有博客数据的列表

        for data in datas:
            dataDict = {col: value for col, value in zip(cols, data)}
            all_blogs.append(dataDict)  # 将每篇博客的数据添加到列表中

        return all_blogs


#获取某篇博客
def getPost(id):
    connection=sqlite3.connect(dbname + '.db', check_same_thread=False) 
    cursor = connection.cursor()
    sql = "select * from posts where id = ?"

    with connection:
        cursor.execute(sql, (id,))

        datas = cursor.fetchall()
        cols = [desc[0] for desc in cursor.description]

        for data in datas:
            dataDict = {col: value for col, value in zip(cols, data)}

        return dataDict

#获取某个用户的所有博客
def getPostUser(id):
    connection=sqlite3.connect(dbname + '.db', check_same_thread=False) 
    cursor = connection.cursor()
    sql = 'select * from posts where user_id = ?'

    with connection:
        cursor.execute(sql, (id,))
        datas = cursor.fetchall()
        cols = [desc[0] for desc in cursor.description]

        all_blogs = []  # 用于存储所有博客数据的列表

        for data in datas:
            dataDict = {col: value for col, value in zip(cols, data)}
            all_blogs.append(dataDict)  # 将每篇博客的数据添加到列表中

        return all_blogs

# 获取某个标签对应的所有博客
def getPostTag(tag_id):
    connection = sqlite3.connect(dbname + '.db', check_same_thread=False) 
    cursor = connection.cursor()

    # 通过 tag_id 查询 post_tags 表获取博客的 post_id
    tag_sql = 'SELECT * FROM post_tags WHERE tag_id = ?'
    cursor.execute(tag_sql, (tag_id,))
    post_ids = [row[1] for row in cursor.fetchall()]

    all_blogs = []  # 用于存储所有博客数据的列表

    # 遍历获取到的 post_ids，查询博客内容
    for post_id in post_ids:
        post_sql = 'SELECT * FROM posts WHERE id = ?'
        cursor.execute(post_sql, (post_id,))
        blog_data = cursor.fetchone()

        if blog_data:
            cols = [desc[0] for desc in cursor.description]
            data_dict = {col: value for col, value in zip(cols, blog_data)}
            all_blogs.append(data_dict)  # 将每篇博客的数据添加到列表中

    return all_blogs

    
# 添加新的博客
def add_post(title, context, user_id):
    connection=sqlite3.connect(dbname + '.db', check_same_thread=False) 
    cursor = connection.cursor()
    try:
        sql = "INSERT INTO posts (user_id, title, context, comment_count) VALUES (?, ?, ?, ?)"

        with connection:
            cursor.execute(sql, (user_id, title, context, calculate_markdown_length(context)))
            connection.commit()

            return cursor.lastrowid
    except Exception as e:
        print(repr(e))
        return None
    
# 删除博客
def delete_post(post_id):
    connection=sqlite3.connect(dbname + '.db', check_same_thread=False) 
    cursor = connection.cursor()
    # 首先检查博客是否存在
    sql = "SELECT id FROM posts WHERE id = ?"
    
    with connection:
        cursor.execute(sql, (post_id))
        data = cursor.fetchone()
        if data:
            # 如果博客存在，执行删除操作
            delete_sql = "DELETE FROM posts WHERE id = ?"
            cursor.execute(delete_sql, (post_id))
            connection.commit()
            # 返回 True 表示删除成功
            return True
        else:
            # 如果博客不存在，返回 False 表示删除失败
            return False

# 修改博客
def modify_post(post_id, title, context):
    connection=sqlite3.connect(dbname + '.db', check_same_thread=False) 
    cursor = connection.cursor()
    try:
        # 检查博客是否存在
        sql = "SELECT id FROM posts WHERE id = ?"

        with connection:
            cursor.execute(sql, (post_id,))
            data = cursor.fetchone()
            if data:
                # 如果博客存在，执行更新操作
                update_sql = "UPDATE posts SET title = ?, context = ?, comment_count = ? WHERE id = ?"
                cursor.execute(update_sql, (title, context, calculate_markdown_length(context), post_id))
                connection.commit()
                # 返回 True 表示修改成功
                return True
            else:
                # 如果博客不存在，返回 False 表示修改失败
                return False
    except Exception as e:
        print(repr(e))
        return False

## 用户类
# 获取单个用户数据
def getUSer(id):
    connection=sqlite3.connect(dbname + '.db', check_same_thread=False) 
    cursor = connection.cursor()
    sql = "select * from users where id = ?"

    with connection:
        cursor = connection.cursor()
        cursor.execute(sql, (id))
        data = cursor.fetchone()

        if data is not None:
            cols = [desc[0] for desc in cursor.description]
            dataDict = {col: value for col, value in zip(cols, data)}
            return dataDict
        else:
            return None

# 检查用户登录信息
def authenticate_user(username, password):
    connection=sqlite3.connect(dbname + '.db', check_same_thread=False) 
    cursor = connection.cursor()
    sql = "SELECT * FROM users WHERE name = ? AND password = ?"

    with connection:
        cursor.execute(sql, (username, password))
        
        data = cursor.fetchone()
        if data:
            return {"id": data[0], "name": data[1]}
        else:
            return None
    
# 检查用户名是否已存在
def check_user_exists(username):
    connection=sqlite3.connect(dbname + '.db', check_same_thread=False) 
    cursor = connection.cursor()
    sql = "SELECT id FROM users WHERE name = ?"

    with connection:
        cursor.execute(sql, (username,))
        return cursor.fetchone() is not None

# 添加新用户
def add_user(username, password):
    connection=sqlite3.connect(dbname + '.db', check_same_thread=False) 
    cursor = connection.cursor()
    try:
        sql = "INSERT INTO users (name, password) VALUES (?, ?)"

        with connection:
            cursor.execute(sql, (username, hashlib.sha256(password.encode()).hexdigest()))
            connection.commit()

            return cursor.lastrowid
    except Exception as e:
        print(repr(e))
        return None
    

## 交互类
# 判断博客和个人信息是否匹配
def check_post_id_and_user_id(post_id, user_id):
    connection=sqlite3.connect(dbname + '.db', check_same_thread=False) 
    cursor = connection.cursor()
    # 查询博客的作者（user_id）是否与给定的用户ID（user_id）匹配
    sql = "SELECT user_id FROM posts WHERE id = ?"
    
    with connection:
        cursor.execute(sql, (post_id,))
        data = cursor.fetchone()
        if data:
            # 如果找到博客，检查作者是否匹配
            return data[0] == user_id
        else:
            # 如果未找到博客，返回 False
            return False

## 评论类
# 获取单片博客的评论
def getCommentPost(post_id):
    connection=sqlite3.connect(dbname + '.db', check_same_thread=False) 
    cursor = connection.cursor()
    sql = 'select * from comments where post_id = ?'

    with connection:
        cursor.execute(sql, (post_id,))
        datas = cursor.fetchall()
        cols = [desc[0] for desc in cursor.description]

        all_comments = []  # 用于存储所有博客数据的列表

        for data in datas:
            dataDict = {col: value for col, value in zip(cols, data)}
            all_comments.append(dataDict)  # 将每篇博客的数据添加到列表中

        return all_comments
    
# 获取某个评论的点赞数
def getCommentLikes(comment_id):
    connection=sqlite3.connect(dbname + '.db', check_same_thread=False) 
    cursor = connection.cursor()
    sql = "SELECT COUNT(id) FROM comment_likes WHERE comment_id = ?"
    
    with connection:
        cursor.execute(sql, (comment_id,))
        likes_count = cursor.fetchone()
        
        if likes_count:
            return likes_count[0]
        else:
            return 0
        
# 更改某条评论的点赞情况
def change_comment_like(comment_id, userId):
    connection=sqlite3.connect(dbname + '.db', check_same_thread=False) 
    cursor = connection.cursor()
    # 查询数据表 comment_likes，检查是否已经存在点赞记录
    select_sql = "SELECT id FROM comment_likes WHERE comment_id = ? AND user_id = ?"
    
    with connection:
        cursor.execute(select_sql, (comment_id, userId))
        existing_like = cursor.fetchone()
        
        if existing_like:
            # 如果已经存在点赞记录，删除它
            delete_sql = "DELETE FROM comment_likes WHERE id = ?"
            cursor.execute(delete_sql, (existing_like[0],))
            connection.commit()
            # 返回 False 表示取消点赞
            return False
        else:
            # 如果不存在点赞记录，插入一个新的点赞记录
            insert_sql = "INSERT INTO comment_likes (comment_id, user_id) VALUES (?, ?)"
            cursor.execute(insert_sql, (comment_id, userId))
            connection.commit()
            # 返回 True 表示点赞成功
            return True
        
# 查找某条评论是否被某个用户点赞
def get_comment_isLiked(comment_id, userId):
    connection=sqlite3.connect(dbname + '.db', check_same_thread=False) 
    cursor = connection.cursor()
    # 查询数据表 comment_likes，检查是否已经存在点赞记录
    select_sql = "SELECT id FROM comment_likes WHERE comment_id = ? AND user_id = ?"
    
    with connection:
        cursor.execute(select_sql, (comment_id, userId))
        existing_like = cursor.fetchone()
        
        if existing_like:
            # 如果已经存在点赞记录，返回true
            return True
        else:
            # 如果不存在点赞记录，返回false
            return False
        
# 添加评论
def add_comment(content, blogId, userId):
    connection = sqlite3.connect(dbname + '.db', check_same_thread=False)
    cursor = connection.cursor()
    try:
        # 检查评论内容是否以回复格式开头。
        match = re.search(r'@reply to (\d+)@', content)
        if match:
            # 从匹配中提取父评论的 ID。
            parent_comment_id = int(match.group(1))

            # 查询是否有对应的父评论。
            sql = "SELECT id FROM comments WHERE id = ?"
            with connection:
                cursor.execute(sql, (parent_comment_id,))
                parent_comment = cursor.fetchone()

            if parent_comment:
                # 从评论内容中只消除第一个回复格式。
                content = re.sub(r'@reply to \d+@', '', content, count=1)

                # 将评论作为回复插入，带有父评论的 ID。
                sql = "INSERT INTO comments (content, post_id, user_id, parent_comment_id) VALUES (?, ?, ?, ?)"
                with connection:
                    cursor.execute(sql, (content, blogId, userId, parent_comment_id))
                    connection.commit()
            else:
                # 从评论内容中只消除第一个回复格式。
                content = re.sub(r'@reply to \d+@', '', content, count=1)
                # 如果父评论不存在，将其视为普通评论，不插入 parent_comment_id。
                sql = "INSERT INTO comments (content, post_id, user_id) VALUES (?, ?, ?)"
                with connection:
                    cursor.execute(sql, (content, blogId, userId))
                    connection.commit()
        else:
            # 如果不是回复，将其插入为普通评论。
            sql = "INSERT INTO comments (content, post_id, user_id) VALUES (?, ?, ?)"
            with connection:
                cursor.execute(sql, (content, blogId, userId))
                connection.commit()

        return cursor.lastrowid
    except Exception as e:
        print(repr(e))
        return None
    
# 删除评论
def delete_comment(comment_id):
    connection=sqlite3.connect(dbname + '.db', check_same_thread=False) 
    cursor = connection.cursor()
    # 首先检查评论是否存在
    sql = "SELECT id FROM comments WHERE id = ?"
    
    with connection:
        cursor.execute(sql, (comment_id,))
        data = cursor.fetchone()
        if data:
            # 如果博客存在，执行删除操作
            delete_sql = "DELETE FROM comments WHERE id = ?"
            cursor.execute(delete_sql, (comment_id,))
            connection.commit()
            # 返回 True 表示删除成功
            return True
        else:
            # 如果博客不存在，返回 False 表示删除失败
            return False

## 标签类
# 获取单篇博客的所有标签
def getTagsPost(post_id):
    connection=sqlite3.connect(dbname + '.db', check_same_thread=False) 
    cursor = connection.cursor()
    sql = 'SELECT * FROM tags ' \
        'INNER JOIN post_tags ON tags.id = post_tags.tag_id ' \
        'WHERE post_tags.post_id = ?'
    
    with connection:
        cursor.execute(sql, (post_id,))
        tags = cursor.fetchall()
        cols = [desc[0] for desc in cursor.description]

        all_tags = [] 

        for tag in tags:
            dataDict = {col: value for col, value in zip(cols, tag)}
            all_tags.append(dataDict) 

        return all_tags

# 获取标签的名称并返回
def getTagName(tag_id):
    connection = sqlite3.connect(dbname + '.db', check_same_thread=False)
    cursor = connection.cursor()

    # SQL查询以根据tag_id检索标签名称
    sql = 'SELECT name FROM tags WHERE id = ?'

    with connection:
        cursor.execute(sql, (tag_id,))
        result = cursor.fetchone()

        # 检查tag_id是否存在于数据库中
        if result:
            tag_name = result[0]
            return tag_name
        else:
            # 处理tag_id不存在的情况
            return None

