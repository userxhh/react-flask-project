import React, { useEffect, useState } from 'react';
import HttpUtil from '../Utils/HttpUtils';
import ApiUtil from '../Utils/ApiUtils';
import { Pagination, Input, Spin } from 'antd';
import Blog from '../components/Blog';
import '../css/Home.css';

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

const Home = () => {
  const [postsData, setPostsData] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true); // 控制加载状态
  const [searchTerm, setSearchTerm] = useState(''); // 追踪搜索词汇

  // 添加一个排序博客的函数
  const sortPostsByDate = (posts) => {
    return posts.sort((a, b) => new Date(a.publish_time) - new Date(b.publish_time));
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await HttpUtil.get(ApiUtil.API_BOKE_SHOW);
        const postsWithAuthorInfo = await Promise.all(
          response.map(async (blogData) => {
            const responseUser = await HttpUtil.get(ApiUtil.API_USER_DATA + `${blogData.user_id}`);
            blogData.author = responseUser.name;

            // 处理Markdown文本以去除Markdown标记
            blogData.context = blogData.context.replace(/(#+\s*)/g, ''); // 删除Markdown标记

            return blogData;
          })
        );
        const sortedPosts = sortPostsByDate(postsWithAuthorInfo).reverse(); // 按发布时间排序
        setPostsData(sortedPosts);
        setLoading(false); // 数据加载完成后设置 loading 为 false
      } catch (error) {
        console.log('获取博客数据时出错:\n', error);
      }
    };

    fetchData();
  }, []);

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
  );
};

export default Home;
