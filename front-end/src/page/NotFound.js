import React from 'react';
import { Link } from 'react-router-dom';
import '../css/NotFound.css'; // 创建一个NotFound.css文件来定义样式

const NotFound = () => {
  return (
    <div className="not-found-container" style={{alignItems: 'center'}}>
      <div className="not-found-content">
        <h1 className="not-found-title">404 - Not Found</h1>
        <p className="not-found-text">The page you are looking for does not exist.</p>
        <Link to="/" className="not-found-link">Go back to the Home page</Link>
      </div>
    </div>
  );
};

export default NotFound;
