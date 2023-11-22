import React, { useEffect, useState } from 'react';
import { message } from 'antd';
import { useHistory } from 'react-router-dom';
import HttpUtil from '../Utils/HttpUtils';
import ApiUtil from '../Utils/ApiUtils';
import { Pagination, Input, Spin, Card } from 'antd';
import Blog from '../components/Blog';

const POSTS_PER_PAGE = 10; // 每页显示的博客数量

const BlogPagination = ({ totalPosts, postsPerPage, paginate }) => {
  const pageNumbers = [];

  for (let i = 1; i <= Math.ceil(totalPosts / postsPerPage); i++) {
    pageNumbers.push(i);
  }

  return (
    <div>
      <Pagination
        showSizeChanger={false}
        defaultPageSize={postsPerPage}
        defaultCurrent={1}
        total={totalPosts}
        onChange={(page) => paginate(page)}
      />
    </div>
  );
};

const Profile = () => {
  const [userInfo, setUserInfo] = useState(null);
  const history = useHistory();

  const [postsData, setPostsData] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true); // 控制加载状态
  const [searchTerm, setSearchTerm] = useState(''); // 追踪搜索词汇

  // 添加一个排序博客的函数
  const sortPostsByDate = (posts) => {
    return posts.sort((a, b) => new Date(a.publish_time) - new Date(b.publish_time));
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
            // 用户已验证成功
            setUserInfo(response);
            const responseUser = response;
            const reid = response.id;

            // 此处查询博客内容
            const response2 = await HttpUtil.get(ApiUtil.API_POST_USER + `${reid}`);
            const postsWithAuthorInfo = await Promise.all(
              response2.map(async (blogData) => {
                blogData.author = responseUser.name;

                // 处理Markdown文本以去除Markdown标记
                blogData.context = blogData.context.replace(/(#+\s*)/g, ''); // 删除Markdown标记

                return blogData;
              })
            );
            const sortedPosts = sortPostsByDate(postsWithAuthorInfo).reverse(); // 按发布时间排序
            setPostsData(sortedPosts);
            setLoading(false); // 数据加载完成后设置 loading 为 false

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
        setTimeout(() =>{
          history.push('/login'); // 没有登陆则跳转到登陆页面
        }, 1000);
      }
    };

    checkUserAuthentication();
  }, [history]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" tip="加载中..." />
      </div>
    );
  }

  
  const indexOfLastPost = currentPage * POSTS_PER_PAGE;
  const indexOfFirstPost = indexOfLastPost - POSTS_PER_PAGE;

  const filteredPosts = postsData.filter((blogData) =>
    blogData.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    blogData.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
    blogData.context.toLowerCase().includes(searchTerm.toLowerCase())
  );
  

  const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);

  const paginate = (page) => {
    setCurrentPage(page);
    // 自动滚动到页面顶部
    window.scrollTo(0, 0);
    // 或者，您还可以使用以下方式：
    // window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div style={{ marginTop: '50px' }}>
      {userInfo && (
        <Card title="用户信息">
          <p>用户名: {userInfo.name}</p>
          {/* 添加其他用户信息 */}
        </Card>
      )}
      
      <div style={{ marginTop: '50px' }}>
      <Input
        placeholder="搜索博客内容"
        onChange={(e) => setSearchTerm(e.target.value)}
        value={searchTerm}
      />

      {currentPosts.length > 0 ? (
        currentPosts.map((blogData) => (
          <Blog key={blogData.id} blogData={blogData} searchTerm={searchTerm} />
        ))
      ) : (
        <div style={{ textAlign: 'center' }}>没有匹配结果。</div>
      )}

      {/* 嵌套分页组件 */}
      <BlogPagination totalPosts={filteredPosts.length} postsPerPage={POSTS_PER_PAGE} paginate={paginate} />
    </div>
    </div>
  );
};

export default Profile;
