import React, { useState, useEffect } from 'react';
import { Form, Input, Button, message} from 'antd';
import { useParams, useHistory } from 'react-router-dom';
import HttpUtil from '../Utils/HttpUtils';
import ApiUtil from '../Utils/ApiUtils';

import Editor from 'for-editor'

import '../css/EditPost.css'; 

const ModifyPost = () => {
    const [loading, setLoading] = useState(false);
  const { blogId } = useParams(); // 获取从路由参数传递的博客ID
  const history = useHistory();
  const [blogData, setBlogData] = useState(null);
    // 文章内容

    // 编辑器配置，可以根据自己需要决定是否显示
  const toolbar = {
    h1: true, // h1
    h2: true, // h2
    h3: true, // h3
    h4: true, // h4
    img: true, // 图片
    link: true, // 链接
    code: true, // 代码块
    preview: true, // 预览
    expand: true, // 全屏
    /* v0.0.9 */
    undo: true, // 撤销
    redo: true, // 重做
    /* v0.2.3 */
    subfield: true, // 单双栏模式
  };

  // 从后端获取当前博客的数据
  useEffect(() => {
    // 在组件加载时，向后端发送请求验证用户身份
    const checkUserAuthentication = async () => {
        try {
          // 从本地存储中获取 JWT 令牌
          const token = localStorage.getItem('access_token');
          const responsePost = await HttpUtil.get(ApiUtil.API_BOKE_SHOW + `${blogId}`);
  
          if (!token) {
            // 如果没有令牌，表示用户未登录，可以在此处执行其他操作，如跳转到登录页面
            history.push('/login'); // 没有登陆则跳转到登陆页面
            message.error('请先登录');
            // 可以跳转到登录页面
          } else {
            // 向后端发送验证请求
            try{
                const response = await HttpUtil.get(ApiUtil.API_USER_PROFILE, {
                    Authorization: `Bearer ${token}`, // 在请求头中发送 JWT 令牌
                });
    
                if (response && response.id) {
                    if (response.id !== responsePost.user_id) {
                        message.error('您无权修改此博客');
                        history.push('/');
                    } else {
                        // 此处代表可以修改,设置博客内容
                        setBlogData(responsePost);
                    }
                } else {
                // 令牌验证失败，可以在此处执行其他操作，如跳转到登录页面
                message.error('令牌验证失败，请重新登录');
                // 可以跳转到登录页面
                history.push('/login');
                }
            } catch (error) {
                console.error('验证用户身份出错:', error);
                // 可以在此处执行其他操作，如跳转到登录页面
                message.error('验证用户身份出错，请重新登录');
            }
          }
        } catch (error) {
          console.error('获取用户身份出错:', error);
          // 可以在此处执行其他操作，如跳转到登录页面
          message.error('获取用户身份出错，请重新登录');
          // 可以跳转到登录页面
          history.push('/login');
        }
      };
  
      checkUserAuthentication();
  }, [blogId, history]);

  // 处理用户编辑博客的提交
  const onFinish = async () => {
    setLoading(true);

    const title = blogData.title;
    const context = blogData.context;

    try {
        const token = localStorage.getItem('access_token');
  
        const response = await HttpUtil.post(ApiUtil.API_MODIFY_POST + `${blogData.id}`, { title, context }, {
          Authorization: `Bearer ${token}`,
        });
  
        if (response && response.post_id) {
          message.success('修改成功!');
  
          setTimeout(() => {
            history.push('/blog/' + `${blogId}`);
          }, 1000);
        }
  
      } catch (error) {
        console.log('修改博客出错:', error);
        message.error('修改失败，请稍后重试');
      }
  
      setLoading(false);
  };

  const handleChange = (val) => {
    setBlogData({
        ...blogData,
        context:val
    }
    )
  }

  return (
    <div style={{ marginTop: '50px' }}>
        {blogData && (
        <Form name="modifyPost" onFinish={onFinish}>
          <Form.Item
            label="标题"
            name="title"
            rules={[{ required: true, message: '请输入标题' }]}
            initialValue={blogData.title}
          >
            <Input />
          </Form.Item>
          <Form.Item name="context">
            <div className="editor-box container has-nav">
              <div className="main">
                <Editor
                  className="editor"
                  toolbar={toolbar}
                  value={blogData.context}
                  onChange={handleChange}
                  preview={true}
                  subfield={true}
                />
              </div>
            </div>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              确认
            </Button>
          </Form.Item>
        </Form>
      )}
    </div>
  );
};

export default ModifyPost;
