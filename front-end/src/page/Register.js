import React, { useState } from 'react';
import { Form, Input, Button } from 'antd';
import HttpUtil from '../Utils/HttpUtils';
import ApiUtil from '../Utils/ApiUtils';

const Register = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const onFinish = async (values) => {
    setLoading(true);

    try {
      const response = await HttpUtil.post(ApiUtil.API_REGISTER, values);

      if (response && response.access_token) {
        // 登录成功，存储令牌并跳转到主页或执行其他操作
        localStorage.setItem('access_token', response.access_token);
        setMessage('Registration successful');
        setTimeout(() => {
          window.location.reload();
        }, 1000);
        // 可以跳转到登录页面或其他操作
      } else {
        setMessage('Registration failed');
      }
    } catch (error) {
      setMessage('Registration failed');
    }

    setLoading(false);
  };

  return (
    <div>
      <Form
        name="register"
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

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            注册
          </Button>
        </Form.Item>

        {message && <p>{message}</p>}
      </Form>
    </div>
  );
};

export default Register;
