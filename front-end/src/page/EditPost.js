import React, { useState, useEffect } from 'react';
import { Form, Input, Button, message} from 'antd';
import { useHistory } from 'react-router-dom';
import HttpUtil from '../Utils/HttpUtils';
import ApiUtil from '../Utils/ApiUtils';
import Editor from 'for-editor'

import '../css/EditPost.css'; 

const EditPost = () => {
  const [loading, setLoading] = useState(false);
  const history = useHistory();
  // 文章内容
  const [value, setValue] = useState('')

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

  useEffect(() => {
    // 在组件加载时，向后端发送请求验证用户身份
    const checkUserAuthentication = async () => {
      try {
        // 从本地存储中获取 JWT 令牌
        const token = localStorage.getItem('access_token');

        if (!token) {
          // 如果没有令牌，表示用户未登录，可以在此处执行其他操作，如跳转到登录页面
          message.error('请先登录');
          setTimeout(() =>{
            history.push('/login'); // 没有登陆则跳转到登陆页面
          }, 1000);
          // 可以跳转到登录页面
        } else {
          // 向后端发送验证请求
          const response = await HttpUtil.get(ApiUtil.API_USER_PROFILE, {
              Authorization: `Bearer ${token}`, // 在请求头中发送 JWT 令牌
          });

          if (response && response.id) {
          } else {
            // 令牌验证失败，可以在此处执行其他操作，如跳转到登录页面
            message.error('令牌验证失败，请重新登录');
            // 可以跳转到登录页面
            history.push('/login');
          }
        }
      } catch (error) {
        console.error('验证用户身份出错:', error);
        // 可以在此处执行其他操作，如跳转到登录页面
        message.error('验证用户身份出错，请重新登录');
        // 可以跳转到登录页面
        history.push('/login');
      }
    };

    checkUserAuthentication();
  }, [history]);

  const onFinish = async (values) => {
    setLoading(true);

    const { title } = values;
    const context = value;

    try {
      const token = localStorage.getItem('access_token');

      const response = await HttpUtil.post(ApiUtil.API_EDIT_POST, { title, context }, {
        Authorization: `Bearer ${token}`,
      });

      if (response && response.post_id) {
        message.success('发布成功!');

        setTimeout(() => {
          history.push('/blog/' + `${response.post_id}`);
        }, 1000);
      }

    } catch (error) {
      console.log('发布博客出错:', error);
      message.error('发布失败，请稍后重试');
    }

    setLoading(false);
  };

  const handleChange = (val) => {
    setValue(val);
  }

  return (
    <div style={{ marginTop: '50px' }}>
          <Form
            name="editPost"
            onFinish={onFinish}
          >
            <Form.Item
              label="标题"
              name="title"
              rules={[{ required: true, message: '请输入标题' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name='context'
            >
            <div className='editor-box container has-nav'>    
            <div className='main'>
              <Editor className="editor" toolbar={toolbar} value={value} onChange={handleChange} preview={true} subfield={true} />
            </div>
          </div >
            </Form.Item>
            
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading}>
                发布
              </Button>
            </Form.Item>
          </Form>
    </div>
  );
};

export default EditPost;
