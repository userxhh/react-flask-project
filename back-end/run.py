from flask import Flask, jsonify, request
from flask_cors import CORS  # 导入CORS模块
import SqliteUtil as DBUtil
import hashlib
from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity, create_access_token
from datetime import timedelta

# 数据库名
app = Flask(__name__, template_folder='../front-end', static_folder='../front-end')
CORS(app)  # 启用CORS，允许所有源访问

app.config['JWT_SECRET_KEY'] = 'your-secret-key'  # 设置一个安全的密钥，用于签署 JWT 令牌
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=1)  # 设置过期时间为1天
jwt = JWTManager(app)

#api接口前缀
apiPrefix = '/api/v1/'

## 博客类
# 单个博客
@app.route(apiPrefix + 'blog/<string:blog_id>', methods=['GET'])
def get_blog(blog_id):
    # 获取博客数据并返回
    return jsonify(DBUtil.getPost(blog_id))

# 所有博客
@app.route(apiPrefix + 'blog/', methods=['GET'])
def get_blogs():
    # 获取博客数据并返回
    return jsonify(DBUtil.getPostsList())

# 用户博客
@app.route(apiPrefix + 'blog/user/<string:user_id>', methods=['GET'])
def get_blog_user(user_id):
    # 获取博客数据并返回
    return jsonify(DBUtil.getPostUser(user_id))

# 标签对应的所有博客
@app.route(apiPrefix + 'tag/posts/<string:tag_id>', methods=['GET'])
def get_blog_tag(tag_id):
    # 获取博客数据并返回
    return jsonify(DBUtil.getPostTag(tag_id))

# 删除博客
@app.route(apiPrefix + 'blog/delete/<string:post_id>', methods=['GET'])
@jwt_required()
def delete_post(post_id):
    current_user = get_jwt_identity()
    user = DBUtil.getUSer(current_user)

    if user:
        # 判断用户信息和博客信息是否匹配
        if DBUtil.check_post_id_and_user_id(post_id, user['id']):
            # 删除博客
            result = DBUtil.delete_post(post_id)
            if result:
                return jsonify({'message': 'Delete successful'}), 200
            else:
                return jsonify({'message': 'Delete false'}), 500
        else:
            return jsonify({'error': 'User does not have permission'}), 500
    else:
        return jsonify({'error': 'User not found'}), 404
    
# 修改博客
@app.route(apiPrefix + 'blog/modify/<string:post_id>', methods=['POST'])
@jwt_required()
def update_post(post_id):
    try:
        data = request.get_json()
        title = data.get('title')
        context = data.get('context')

        # 修改博客信息
        if DBUtil.modify_post(post_id, title, context):
            return jsonify({'message': 'Modify post successful', 'post_id': post_id}), 200
        else:
            return jsonify({'message': 'Modify post false'}), 500

    except Exception as e:
        return jsonify({'message': 'Modify post failed'}), 500
    
# 发布博客
@app.route(apiPrefix + 'blog/edit/', methods=['POST'])
@jwt_required()
def edit_post():
    # 首先判断用户jwt令牌是否正确
    current_user = get_jwt_identity()
    user = DBUtil.getUSer(current_user)

    if user:
        try:
            data = request.get_json()
            title = data.get('title')
            context = data.get('context')
            user_id = user['id']

            # 将博客信息存储到数据库
            post_id = DBUtil.add_post(title, context, user_id)

            return jsonify({'message': 'EditPost successful', 'post_id': post_id}), 200

        except Exception as e:
            return jsonify({'message': 'EditPost failed'}), 500
    else:
        return jsonify({'error': 'User not fount'}), 404

## 用户类
# 单个用户
@app.route(apiPrefix + 'user/<string:user_id>', methods=['GET'])
def get_user(user_id):
    # 获取用户数据并返回
    return jsonify(DBUtil.getUSer(user_id))

# 检查用户登录信息
@app.route(apiPrefix + 'login/', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    # 验证用户名和密码，如果验证通过，生成 JWT 令牌
    user = DBUtil.authenticate_user(username, hashlib.sha256(password.encode()).hexdigest())

    if user:
        access_token = create_access_token(identity=user['id'])  # 创建 JWT 令牌
        return jsonify(access_token=access_token), 200
    else:
        return jsonify({"error": "Authentication failed"}), 401
    
# 用户注册
@app.route(apiPrefix + 'register/', methods=['POST'])
def register_user():
    try:
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')

        # 检查用户名是否已存在
        user_exists = DBUtil.check_user_exists(username)

        if user_exists:
            return jsonify({'message': 'Username already exists'}), 400

        # 将用户信息存储到数据库
        user_id = DBUtil.add_user(username, password)

        # 注册成功后，生成 JWT 令牌并返回给前端
        access_token = create_access_token(identity=user_id)

        return jsonify({'message': 'Registration successful', 'user_id': user_id, 'access_token': access_token}), 200

    except Exception as e:
        return jsonify({'message': 'Registration failed'}), 500

# 获取用户个人资料
@app.route(apiPrefix + 'user/profile/', methods=['GET'])
@jwt_required()
def get_user_profile():
    current_user = get_jwt_identity()
    user = DBUtil.getUSer(current_user)

    if user:
        return jsonify(user)
    else:
        return jsonify({'error': 'User not found'}), 404
    
## 评论类
# 获取单篇博客所有评论
@app.route(apiPrefix + '/comment/<string:post_id>', methods=['GET'])
def get_comment_post(post_id):
    # 获取评论数据并返回
    return jsonify(DBUtil.getCommentPost(post_id))

# 获取评论的点赞数量
@app.route(apiPrefix + '/commentLikes/<string:comment_id>', methods=['GET'])
def get_comment_likes(comment_id):
    # 获取评论的点赞数并返回
    return jsonify({'likes': DBUtil.getCommentLikes(comment_id)})

# 给某条评论点赞或者取消点赞
@app.route(apiPrefix + '/comment/like/', methods=['POST'])
@jwt_required()
def change_comment_like():
    try:
        data = request.get_json()
        comment_id = data.get('comment_id')
        userId = data.get('userId')

        DBUtil.change_comment_like(comment_id, userId)

        return jsonify({'message': 'Change successful' }), 200

    except Exception as e:
        return jsonify({'message': 'Change comment like failed'}), 500
    
# 判断用户是否点赞过
@app.route(apiPrefix + '/comment/isliked/', methods=['POST'])
def get_comment_user_isLiked():
    try:
        data = request.get_json()
        comment_id = data.get('comment_id')
        user_id = data.get('user_id')

        if DBUtil.get_comment_isLiked(comment_id, user_id):
            return jsonify({'isLiked': True})
        else:
            return jsonify({'isLiked': False})


    except Exception as e:
        return jsonify({'message': 'get comment isLiked failed'}), 500
    
# 添加评论
@app.route(apiPrefix + '/add/comment/', methods=['POST'])
@jwt_required()
def add_comment():
    try:
        data = request.get_json()
        content = data.get('content')
        blogId = data.get('blogId')
        userId = data.get('userId')

        # 添加评论
        DBUtil.add_comment(content, blogId, userId)

        return jsonify({'message': 'add comment successful'}), 200


    except Exception as e:
        return jsonify({'message': 'Add comment failed'}), 500
    
# 删除评论
@app.route(apiPrefix + '/delete/comment/<string:comment_id>', methods=['GET'])
@jwt_required()
def delete_comment(comment_id):
    try:
        # 删除评论
        DBUtil.delete_comment(comment_id)

        return jsonify({'message': 'Delete comment successful'}), 200
    except Exception as e:
        return jsonify({'message': 'Delete comment failed'}), 500


## 标签类
# 获取某篇博客的标签
@app.route(apiPrefix + '/post/tags/<string:post_id>', methods=['GET'])
def get_tags_post(post_id):
    # 获取标签数据并返回
    return jsonify(DBUtil.getTagsPost(post_id))


# 获取标签的名称
@app.route(apiPrefix + '/tag/name/<string:tag_id>', methods=['GET'])
def get_tag_name(tag_id):
    # 获取标签的名称并返回
    return jsonify(DBUtil.getTagName(tag_id))

if __name__ == '__main__':
    app.run(debug=True, port=5001)
