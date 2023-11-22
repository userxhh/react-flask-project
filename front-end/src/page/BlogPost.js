import React, { useEffect, useState } from 'react';
import HttpUtil from '../Utils/HttpUtils';
import ApiUtil from '../Utils/ApiUtils';
import { Card, Typography, Divider, Space, Layout, Progress, Button, message, Tag } from 'antd';
import { UserOutlined, CalendarOutlined, FileTextOutlined, ReadOutlined } from '@ant-design/icons';
import { CSSTransition } from 'react-transition-group';
import { useHistory } from 'react-router-dom';
import CommentArea from '../components/CommentArea';
import { Link } from 'react-router-dom';

// 文章显示
import ReactMarkdown from 'react-markdown';
// 划线、表、任务列表和直接url等的语法扩展
import remarkGfm from 'remark-gfm';
// 代码高亮
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
// 高亮的主题
import { coldarkDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';

import MarkNav from 'markdown-navbar';
import 'markdown-navbar/dist/navbar.css';

import '../css/github-markdown.css';
import '../css/BlogPost.css';

const { Title, Text } = Typography;
const { Sider, Content } = Layout;

const BlogPost = ({ match }) => {
  const blogId = match.params.blogId;

  const [[blogData, userData], setData] = useState([null, null]);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showCatalog, setShowCatalog] = useState(true);
  const [tableOfContents, setTableOfContents] = useState('');
  const [isUser, setIsUser] = useState(false);
  const [tags, setTags] = useState([]);
  const history = useHistory();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const responsePost = await HttpUtil.get(ApiUtil.API_BOKE_SHOW + `${blogId}`);
        const responseUser = await HttpUtil.get(ApiUtil.API_USER_DATA + `${responsePost.user_id}`);

        // 此处查询当前用户信息
        // 从本地存储中获取 JWT 令牌
        const token = localStorage.getItem('access_token');
        if(token){
          try {
            // 向后端发送验证请求
            const response = await HttpUtil.get(ApiUtil.API_USER_PROFILE, {
              Authorization: `Bearer ${token}`, // 在请求头中发送 JWT 令牌
            });

            if(response && response.id){
              setIsUser(response.id === responsePost.user_id);
            }
            // 此处查询结束
          } catch (error) {
            console.error('获取用户数据时出现错误:\n', error);
          }
        }

        setData([responsePost, responseUser]);
      } catch (error) {
        console.error('获取博客、用户数据时出现错误:\n', error);
      }
    };

    fetchData();

    const fetchTags = async () => {
      try {
        const responseTags = await HttpUtil.get(ApiUtil.API_GET_TAGS_BY_BLOG + `${blogId}`);
        setTags(responseTags);
      } catch (error) {
        console.error('获取标签数据时出现错误:\n', error);
      }
    };
  
    fetchTags();

    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.body.scrollHeight;
      const scrollTop = window.scrollY;
      const scrollPercentage = (scrollTop / (documentHeight - windowHeight)) * 100;
      setScrollProgress(scrollPercentage);
    };

    const handleResize = () => {
      if (window.innerWidth < 768) {
        setShowCatalog(false);
      } else {
        setShowCatalog(true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, [blogId]);

  if (!blogData) {
    return <div>加载中...</div>;
  }

  // 生成随机颜色的函数
  const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  const handleEdit = () => {
    history.push(`/modifypost/${blogData.id}`);
  };

  const handleDelete = async () => {
  // 弹出确认提示
    if (window.confirm('确认要删除该博客吗？')) {
      try {
        const token = localStorage.getItem('access_token');
        // 向后端发送删除博客的请求
        await HttpUtil.get(ApiUtil.API_BOKE_DELETE + `${blogId}`, {
            Authorization: `Bearer ${token}`
        });
        // 删除成功后进行页面跳转
        
        // 这里可以使用 react-router 的 useHistory 钩子
        history.push('/'); // 例如，跳转到首页或其他页面
        message.success('删除博客成功');
      } catch (error) {
        console.error('删除博客时出错:', error);
        // 处理删除失败的情况，例如显示错误提示
      }
    }
  };

  function excludeCodeBlocks(content) {
    // 使用正则表达式匹配代码段，例如：```python ... ```
    const codeBlockRegex = /```[\s\S]*?```/g;
    
    // 用空字符串替换代码段
    const contentWithoutCodeBlocks = content.replace(codeBlockRegex, '');
  
    return contentWithoutCodeBlocks;
  }

  return (
    <Layout>
      <CSSTransition in={showCatalog} timeout={1000} classNames="catalog">
        <Sider
          width={200}
          style={{
            background: '#fff',
            padding: '20px',
            marginTop: '20px',
            marginRight: '20px',
            position: 'fixed',
            maxHeight: '100vh',
            height: '100%',
            textAlign: 'left'
          }}
        >
          <div style={{ marginBottom: '16px', textAlign: 'center' }}>
            <Title level={4}>Catalog</Title>
          </div>
          <Progress
            type="line"
            percent={scrollProgress}
            showInfo={false}
            status="active"
            style={{ marginTop: '20px' }}
          />
          <MarkNav
                className="article-menu"
                source={excludeCodeBlocks(blogData.context)}
                headingTopOffset={80}
                ordered={true}   //是否显示标题题号1,2等
                /> 
        </Sider>
      </CSSTransition>
      <CSSTransition timeout={1000} classNames="context">
      <Content style={{ display: 'flex', flex: 1, height: 'calc(100vh - 50px)', flexDirection: 'column', overflowY: 'auto', marginLeft: showCatalog ? '240px' : '70px', marginTop: '50px', whiteSpace: 'nowrap' }}>
        <Card title={blogData.title} style={{ flex: 1, marginRight: '50px', height: '100%', overflow: 'auto' }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <div>
              <UserOutlined style={{ marginRight: '8px' }} />
              <Text type="secondary">{`作者: ${userData.name}`}</Text>
            </div>
            <div>
              <CalendarOutlined style={{ marginRight: '8px' }} />
              <Text type="secondary">{`发表时间: ${blogData.publish_time}`}</Text>
            </div>
            <div>
              <ReadOutlined style={{ marginRight: '8px' }} />
              <Text type='secondary'>{`文章长度: ${blogData.comment_count}`}</Text>
            </div>
            {isUser && (
                  <div>
                    <Button type="primary" style={{ marginRight: '10px' }} onClick={handleEdit}>
                      编辑
                    </Button>
                    <Button type="danger" onClick={handleDelete}>
                      删除
                    </Button>
                  </div>
                )}
            <Divider />
            <div id="blog-content" style={{ textAlign: 'left' }}  >
              <div style={{ textAlign: 'center' }}><FileTextOutlined/></div>
              <div className='article-detail has-nav flex'>
                <div className='left-box flex-sub'>
                  <div className='article-box bg-white'>
                    <div className='article-body'>
                      <ReactMarkdown
                        className='markdown-body'
                        children={blogData.context}
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeSlug, rehypeAutolinkHeadings]}
                        components={{
                          // 代码高亮
                          code ({ node, inline, className, children, ...props }) {
                            const match = /language-(\w+)/.exec(className || '')
                            return !inline && match ? (
                              <div className="code-container">
                                <SyntaxHighlighter
                                  children={String(children).replace(/\n$/, '')}
                                  style={coldarkDark}
                                  language={match[1]}
                                  PreTag="div"
                                  showLineNumbers={true}
                                  {...props}
                                />
                              </div>
                            ) : (
                              <code className={className} {...props} children={children} />
                            )
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>
            </div>
            </div>
          </Space>
          <div>
          <Title level={4}>Tags</Title>
            <div>
              {tags.map(tag => (
                <Link key={tag.id} to={`/tags/${tag.id}`} style={{ textDecoration: 'none' }}>
                <Tag color={getRandomColor()}>{tag.name}</Tag>
              </Link>
              ))}
            </div>
          </div>
          <CommentArea blogId={blogData.id} /> {/* 使用 CommentArea 组件并传入 blogId */}
        </Card>
      </Content>
      </CSSTransition>
    </Layout>
  );
};

export default BlogPost;