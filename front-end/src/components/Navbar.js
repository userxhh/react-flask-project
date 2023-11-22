import React, { useState, useEffect } from 'react';
import { Menu, message } from 'antd';
import { Link } from 'react-router-dom'; // 引入 useHistory 钩子
import { HomeOutlined, UserOutlined, UserAddOutlined, LoginOutlined, LogoutOutlined, EditOutlined } from '@ant-design/icons'; // 引入需要的图标
import HttpUtil from '../Utils/HttpUtils';
import ApiUtil from '../Utils/ApiUtils';

const Navbar = () => {
  const navStyle = {
    position: 'fixed',
    top: 0,
    width: '100%',
    zIndex: 1, // 可选，如果需要覆盖其他内容
  };
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // 在组件加载时检查用户是否已登录
  useEffect(() => {
        // 在组件加载时，向后端发送请求验证用户身份
        const checkUserAuthentication = async () => {
          try {
            // 从本地存储中获取 JWT 令牌
            const token = localStorage.getItem('access_token');
    
            if (!token) {
              // 如果没有令牌，表示用户未登录，可以在此处执行其他操作，如跳转到登录页面
              setIsLoggedIn(false);
            } else {
              // 向后端发送验证请求
              const response = await HttpUtil.get(ApiUtil.API_USER_PROFILE, {
                  Authorization: `Bearer ${token}`, // 在请求头中发送 JWT 令牌
              });
    
              if (response && response.id) {
                setIsLoggedIn(true);
              } else {
                setIsLoggedIn(false);
                localStorage.removeItem('access_token');
              }
            }
          } catch (error) {
            setIsLoggedIn(false);
          }
        };
    
        checkUserAuthentication();
  }, []);

  const handleLogout = () => {
    // 执行登出操作，例如向后端发送登出请求

    // 清除本地存储中的令牌
    localStorage.removeItem('access_token');

    // 更新 isLoggedIn 状态为 false
    setIsLoggedIn(false);

    // 显示提示消息
    message.success('退出登录成功');

    setTimeout(() => {
      window.location.reload();
    }, 1000);

  };

  return (
    <Menu mode="horizontal" style={navStyle}>
      <Menu.Item key="home" icon={<HomeOutlined />}>
        <Link to="/">主页</Link>
      </Menu.Item>
      <Menu.Item key="profile" icon={<UserOutlined />}>
        <Link to="/profile">个人</Link>
      </Menu.Item>
      {isLoggedIn ? (
        <>
        <Menu.Item key="edit" icon={<EditOutlined />}>
        <Link to="/edit">发布</Link>
        </Menu.Item>
        <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={() => handleLogout()}>
          登出
        </Menu.Item>
        </>
      ) : (
        <>
          <Menu.Item key="login" icon={<LoginOutlined />}>
            <Link to="/login">登录</Link>
          </Menu.Item>
          <Menu.Item key="register" icon={<UserAddOutlined />}>
            <Link to="/register">注册</Link>
          </Menu.Item>
        </>
      )}
    </Menu>
  );
};

export default Navbar;
