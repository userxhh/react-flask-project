import React, { useState, useEffect, useRef } from 'react';
import { Avatar, Form, Button, List, Input, Empty, message, Dropdown, Menu } from 'antd';
import { UserOutlined, DownOutlined } from '@ant-design/icons';
import HttpUtil from '../Utils/HttpUtils';
import ApiUtil from '../Utils/ApiUtils';
import Comment from './Comment';

const { TextArea } = Input;

const CommentArea = ({ blogId }) => {
  const [comments, setComments] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [value, setValue] = useState('');
  const [userId, setUserId] = useState(null);
  const [sortOrder, setSortOrder] = useState('latest'); // 添加排序方式的状态，默认为最新发布

  const commentInputRef = useRef(null); // 引用评论输入框

  // 在此获取评论数据并更新 comments 状态
  const fetchData = async (user_id) => {
    try {
      const responseComments = await HttpUtil.get(ApiUtil.API_COMMENT_POST + `${blogId}`);

      var commentsWithAuthorInfo = await Promise.all(
        responseComments.map(async (commentData) => {
          // 获取评论用户名称
          const responseUser = await HttpUtil.get(ApiUtil.API_USER_DATA + `${commentData.user_id}`);
          commentData.author = responseUser.name;

          // 获取评论点赞数
          const responseLikes = await HttpUtil.get(ApiUtil.API_COMMENT_LIKES + `${commentData.id}`);
          commentData.likes = responseLikes.likes;

          // 判断当前用户是否点赞过该评论
          const comment_id = commentData.id;
          const responseIsLiked = await HttpUtil.post(ApiUtil.API_COMMENT_ISLIKED, { comment_id, user_id });
          commentData.isLiked = responseIsLiked.isLiked;

          
          return commentData;
        })
      );


      // 根据排序方式对评论进行排序
      if (sortOrder === 'latest') {
        commentsWithAuthorInfo = commentsWithAuthorInfo.sort((a, b) => (b.create_time > a.create_time ? 1 : -1));
      } else if (sortOrder === 'earliest') {
        commentsWithAuthorInfo = commentsWithAuthorInfo.sort((a, b) => (a.create_time > b.create_time ? 1 : -1));
      } else if (sortOrder === 'mostLiked') {
        commentsWithAuthorInfo = commentsWithAuthorInfo.sort((a, b) => (Number(b.likes) - Number(a.likes)));
      }

      setComments(commentsWithAuthorInfo);

    } catch (error) {
      console.log('获取评论数据时出错:\n', error);
    }
  };

  // 模拟获取评论列表的数据
  useEffect(() => {

    const fetchUSer = async () => {
      // 判断用户是否登录
      const token = localStorage.getItem('access_token');
      if(token){
        try {
          // 向后端发送验证请求
          const response = await HttpUtil.get(ApiUtil.API_USER_PROFILE, {
            Authorization: `Bearer ${token}`, // 在请求头中发送 JWT 令牌
          });

          if(response && response.id){
            setUserId(response.id);
            return response.id;
          }
          // 此处查询结束
        } catch (error) {
          console.error('获取用户数据时出现错误:\n', error);
        }
      }
      return null;
    }

    const fetchDataAndUser = async () => {
      const userId = await fetchUSer(); // 等待fetchUSer函数的结果
      fetchData(userId);
    };

    fetchDataAndUser();

  }, [blogId, sortOrder]);

  const handleSubmit = async () => {
    if (!value) {
      message.error('评论内容不能为空');
      return;
    }
  
    try {
      const token = localStorage.getItem('access_token');
  
      if (!token) {
        message.error('未登录，无法发表评论');
        return;
      }
  
      // 发送评论请求，将评论内容提交到后端
      const response = await HttpUtil.post(ApiUtil.API_ADD_COMMENT, {
          content: value,
          blogId: blogId, // 评论所属的博客或文章ID
          userId: userId,
        }, {
          Authorization: `Bearer ${token}`,
        });
    
        if (response) {
          message.success('评论发表成功');
          // 清空输入框
          setValue('');
          // 刷新评论列表，您可以在这里调用获取评论列表的函数
          fetchData();
        } else {
          message.error('评论发表失败，请稍后');
        }
    } catch (error) {
      console.error('评论发表失败', error);
      message.error('评论发表失败，请稍后重试');
    }
  };
  

  const handleLikes = async (comment_id) => {
    try {
      const token = localStorage.getItem('access_token');

      if (!token) {
        message.error('未登录，无法点赞');
        return false;
      }
      try {
        const response = await HttpUtil.post(ApiUtil.API_COMMENT_LIKE, { comment_id, userId }, {
          Authorization: `Bearer ${token}`,
        });

        if (response && response.message) {
          return true;
        }

        message.error('登录信息有误');
        return false;

      } catch (error) {
        console.log('点赞失败', error);
        message.error('登录信息有误');
      }
      

    } catch (error) {
      console.log('点赞失败', error);
      message.error('点赞失败，请稍后重试');
    }
  }

  const handleDelete = async (comment_id) => {
    try {
      const token = localStorage.getItem('access_token');
  
      if (!token) {
        message.error('未登录，无法删除评论');
        return;
      }
  
      // 删除评论请求，将评论内容提交到后端
      const response = await HttpUtil.get(ApiUtil.API_DELETE_COMMENT + `${comment_id}`,
        {
          Authorization: `Bearer ${token}`,
        });
    
        if (response) {
          message.success('评论删除成功');
          // 刷新评论列表，您可以在这里调用获取评论列表的函数
          fetchData();
        } else {
          message.error('评论删除失败，请稍后');
        }
    } catch (error) {
      console.error('评论删除失败', error);
      message.error('评论删除失败，请稍后重试');
    }
  }

  const handleReply = (comment_id) => {
    try {
      const token = localStorage.getItem('access_token');
  
      if (!token) {
        message.error('未登录，无法回复评论');
        return;
      }

      if (commentInputRef.current) {
        commentInputRef.current.focus(); // 聚焦评论输入框

        // 在此处为评论区加入初始值
        const reply = "@reply to " + comment_id + "@";
        setValue(reply);
      }
  
    } catch (error) {
      console.error('评论回复失败', error);
      message.error('评论回复失败，请稍后重试');
    }
  }

  const sortMenu = (
    <Menu onClick={({ key }) => setSortOrder(key)}>
      <Menu.Item key="latest">最新发布</Menu.Item>
      <Menu.Item key="earliest">最早发布</Menu.Item>
      <Menu.Item key="mostLiked">点赞最多</Menu.Item>
    </Menu>
  );

  // 在CommentArea组件之外创建映射函数
  function mapParentCommentIdToIndex(comments, parentCommentId) {
    for (let i = 0; i < comments.length; i++) {
      if (comments[i].id === parentCommentId) {
        return i + 1;
      }
    }
    return null; // 如果未找到匹配的父评论，则返回null或其他合适的值
  }

  return (
    <div>
      <h3>Comments</h3>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
        <Dropdown overlay={sortMenu} trigger={['click']}>
          <Button>
            排序方式 <DownOutlined />
          </Button>
        </Dropdown>
      </div>
      {comments.length > 0 ? (
        <List
          dataSource={comments}
          header={`${comments.length} ${comments.length > 1 ? 'replies' : 'reply'}`}
          itemLayout="horizontal"
          renderItem={(comment, index) => {
            const parentCommentIndex = mapParentCommentIdToIndex(comments, comment.parent_comment_id);

            return (<Comment
              id={comment.id}
              comment={comment}
              avatar={<Avatar icon={<UserOutlined />} />}
              handleLikes={() => handleLikes(comment.id)}
              isCurrentUser={comment.user_id === userId}
              onReply={() => handleReply(comment.id)}
              onDelete={() => handleDelete(comment.id)}
              floor={index + 1}
              parentCommentIndex={parentCommentIndex}
            />)
          }}
        />
      ) : (
        <Empty description="No comments yet" />
      )}
      <Form.Item>
        <TextArea rows={4} autoSize={{ minRows: 4, maxRows: 4 }} onChange={(e) => setValue(e.target.value)} value={value} disabled={!userId} ref={commentInputRef} />
        {!userId && (
          <div style={{ marginTop: 8, color: 'gray' }}>
            <a href="/login">登录</a>后才可以发表评论
          </div>
        )}
      </Form.Item>
      <Form.Item>
      <Button htmlType="submit" loading={submitting} onClick={handleSubmit} type="primary" disabled={!userId}>
          Add Comment
        </Button>
      </Form.Item>
    </div>
  );
};

export default CommentArea;