import React from 'react';
import { Link } from 'react-router-dom';
import { Card, Typography } from 'antd';
import { UserOutlined, CalendarOutlined, FileTextOutlined, ReadOutlined } from '@ant-design/icons';

const { Text } = Typography;

const CARD_HEIGHT = 250;

const Blog = ({ blogData, searchTerm }) => {
  return (
    <Link to={`/blog/${blogData.id}`} style={{ textDecoration: 'none' }}>
      <Card title={null} style={{ height: CARD_HEIGHT, margin: '20px' }} hoverable>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '100%' }}>
          <div style={{ flex: 1, padding: '16px' }}>
            <h3 style={{ fontSize: '20px' }}>{blogData.title}</h3>
            <Text type="secondary">
              <UserOutlined style={{ marginRight: '8px' }} />
              {`作者: ${blogData.author}`}
            </Text>
            <br />
            <Text type="secondary">
              <CalendarOutlined style={{ marginRight: '8px' }} />
              {`发表时间: ${blogData.publish_time}`}
            </Text>
            <br />
            <Text type="secondary">
              <ReadOutlined style={{ marginRight: '8px' }} />
              {`文章长度: ${blogData.comment_count}`}
            </Text>
          </div>
          <div style={{ flex: 2, padding: '16px', overflow: 'hidden' }}>
            <Text className="truncate-text">
              <FileTextOutlined style={{ marginRight: '8px' }} />
              <div
                dangerouslySetInnerHTML={{
                  __html: searchTerm
                    ? blogData.context.replace(
                        new RegExp(`(${searchTerm})`, 'gi'),
                        '<span class="highlighted">$1</span>'
                      )
                    : blogData.context,
                }}
              />
            </Text>
          </div>
        </div>
      </Card>
    </Link>
  );
};

export default Blog;
