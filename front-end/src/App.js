// App
import React, { useEffect } from 'react';
import './css/App.css';
import Navbar from './components/Navbar';
import Home from './page/Home';
import Profile from './page/Profile';
import Login from './page/Login'
import Register from './page/Register'
import BlogPost from './page/BlogPost'; // 导入博客页面组件
import EditPost from './page/EditPost';
import ModifyPost from './page/ModifyPost';
import Tag from './page/Tag';
import NotFound from './page/NotFound';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

function App() {
  return (
    <div className="App">
      <Router>
        <Navbar />
        <main>
          <Switch>
            <Route path="/" exact component={Home} /> {/* 主页 */}
            <Route path="/profile" component={Profile} /> {/* 个人主页 */}
            <Route path="/blog/:blogId" component={BlogPost} /> {/* 设置博客页面路由 */}
            <Route path="/login" component={Login} />
            <Route path="/register" component={Register} />
            <Route path="/edit" component={EditPost} />
            <Route path="/modifypost/:blogId" component={ModifyPost} />
            <Route path="/tags/:tagId" component={Tag}/>
            <Route component={NotFound} />
            {/* <Route path="/development" component={Dev} /> */}
          </Switch>
        </main>
      </Router>
    </div>
  );
}

export default App;
