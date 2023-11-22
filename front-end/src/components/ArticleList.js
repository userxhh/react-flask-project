// 该文件是主页展示博客列表
import React from 'react';
import { List, Card } from 'antd';

const ArticleList = () => {
  const articles = [
    { id: 1, title: '第一篇文章' },
    { id: 2, title: '第二篇文章' },
    { id: 3, title: '第三篇文章' },
  ];

  return (
    <div>
      <h2>文章列表</h2>
      <List
        grid={{ gutter: 16, column: 3 }}
        dataSource={articles}
        renderItem={(article) => (
          <List.Item>
            <Card title={article.title}>文章内容...</Card>
          </List.Item>
        )}
      />
    </div>
  );
};

export default ArticleList;
