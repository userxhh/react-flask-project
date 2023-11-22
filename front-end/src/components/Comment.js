import React, { useState, useEffect } from 'react';
import { Button, List, message, Tooltip, Dropdown, Menu } from 'antd';
import { LikeOutlined, LikeFilled, MessageOutlined, DeleteOutlined } from '@ant-design/icons';

const Comment = ({ comment, avatar, handleLikes, isCurrentUser, onReply, onDelete, floor, parentCommentIndex }) => {
    const [IsLiked, setIsLiked] = useState(comment.isLiked);
    const [Likes, setLikes] = useState(comment.likes);
  
    const handleLike = async () => {
      try {
        // 实现点赞逻辑
        const result = await handleLikes();
        if (result) {
          if (IsLiked) {
            const nowLikes = Likes - 1;
            setLikes(nowLikes);
          } else {
            const nowLikes = Likes + 1;
            setLikes(nowLikes);
          }
          setIsLiked(!IsLiked);
        }
      } catch (error) {
        console.error('点赞失败', error);
        message.error('点赞失败，请稍后重试');
      }
    };
  
    useEffect(() => {
      setLikes(comment.likes);
      setIsLiked(comment.isLiked);
    }, [comment])
  
    const menu = (
      <Menu>
        {isCurrentUser && ( // 仅在当前用户评论时显示删除选项
          <Menu.Item key="delete" icon={<DeleteOutlined />} onClick={onDelete}>
            删除
          </Menu.Item>
        )}
        <Menu.Item key="reply" icon={<MessageOutlined />} onClick={onReply}>
          回复
        </Menu.Item>
      </Menu>
    );
  
    return (
      <List.Item
        actions={[
          <Tooltip key="comment-like" title={IsLiked ? '取消点赞' : '点赞'}>
            <span onClick={handleLike}>
              {IsLiked ? <LikeFilled style={{ color: '#1890ff' }} /> : <LikeOutlined />}
              <span style={{ paddingLeft: '8px', cursor: 'auto' }}>{Likes}</span>
            </span>
          </Tooltip>,
          <Dropdown overlay={menu} placement="bottomRight" trigger={['click']}>
            <Button icon={<MessageOutlined />} type="text">
              编辑
            </Button>
          </Dropdown>
        ]}
      >
        <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
          <div style={{ width: '8%' }}>{avatar}</div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '15%', overflow: 'hidden' }}>
            <span style={{ fontWeight: 'bold' }}>{comment.author}</span>
            <span style={{ color: 'gray' }}>（{floor}楼）</span>
            {parentCommentIndex && (
              <span style={{ color: 'gray' }}>{"回复"}{parentCommentIndex}楼</span>
            )}
          </div>
          <div style={{ textAlign: 'left', width: '45%', marginLeft: '5%' }}>{comment.content}</div>
          <div className="comment-datetime" style={{ alignItems: 'right', width: '27%' }}>{comment.create_time}</div>
        </div>
      </List.Item>
    );
  };


export default Comment;