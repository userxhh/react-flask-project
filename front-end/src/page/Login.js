import React, { useState } from 'react';
import { Form, Input, Button, Checkbox, message } from 'antd';
import HttpUtil from '../Utils/HttpUtils';
import ApiUtil from '../Utils/ApiUtils';
import { useHistory } from 'react-router-dom';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const history = useHistory();

  const onFinish = async (values) => {
    setLoading(true);

    const { username, password } = values;

    try {
      const response = await HttpUtil.post(ApiUtil.API_LOGIN, { username, password });

      if (response && response.access_token) {
        // 登录成功，存储令牌并跳转到主页或执行其他操作
        localStorage.setItem('access_token', response.access_token);
        message.success('登录成功');
        setTimeout(() => {
          history.push('/');
          setTimeout(() => {
            window.location.reload();
          });
        }, 1000);
        // 可以在这里跳转到主页
      } else {
        message.error('登录失败，请检查用户名和密码');
      }
    } catch (error) {
      console.error('登录出错:', error);
      message.error('登录失败，请稍后重试');
    }

    setLoading(false);
  };

  return (
    <Form
      name="login"
      initialValues={{ remember: true }}
      onFinish={onFinish}
      style={{marginTop:'50px'}}
    >
      <Form.Item
        label="用户名"
        name="username"
        rules={[{ required: true, message: '请输入用户名' }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        label="密码"
        name="password"
        rules={[{ required: true, message: '请输入密码' }]}
      >
        <Input.Password />
      </Form.Item>

      <Form.Item name="remember" valuePropName="checked">
        <Checkbox>记住我</Checkbox>
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading}>
          登录
        </Button>
      </Form.Item>
    </Form>
  );
};

export default Login;
