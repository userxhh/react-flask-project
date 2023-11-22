// 前后端接口文件
export default class ApiUtil {
    static URL_IP = 'http://127.0.0.1:5001';
    static URL_ROOT = ApiUtil.URL_IP + '/api/v1';

    // 用户信息操作
    static API_USER_DATA = ApiUtil.URL_ROOT + '/user/';                 //获取单个用户时所采用的url前缀
    static API_USER_PROFILE = ApiUtil.URL_ROOT + '/user/profile/'       //用户个人界面

    // 博客信息操作
    static API_BOKE_SHOW = ApiUtil.URL_ROOT + `/blog/`;                 //展示博客时所采用的url前缀
    static API_EDIT_POST = ApiUtil.URL_ROOT + `/blog/edit/`;            //发布博客的url前缀
    static API_POST_USER = ApiUtil.URL_ROOT + `/blog/user/`;            //获取某个用户发布的所有博客
    static API_BOKE_DELETE = ApiUtil.URL_ROOT + `/blog/delete/`;        //删除博客
    static API_MODIFY_POST = ApiUtil.URL_ROOT + `/blog/modify/`;        //修改博客

    // 账号信息操作
    static API_LOGIN = ApiUtil.URL_ROOT + '/login/';                    //用户登录url
    static API_REGISTER = ApiUtil.URL_ROOT + '/register/';              //用户注册url
    
    // 评论信息操作
    static API_COMMENT_POST = ApiUtil.URL_ROOT + '/comment/';           //获取评论信息
    static API_COMMENT_LIKES = ApiUtil.URL_ROOT + '/commentLikes/';     //获取评论点赞数量
    static API_COMMENT_LIKE = ApiUtil.URL_ROOT + '/comment/like/';      //给评论点赞或者取消点赞
    static API_COMMENT_ISLIKED = ApiUtil.URL_ROOT + '/comment/isliked/';//判断用户是否给某条评论点过赞
    static API_ADD_COMMENT = ApiUtil.URL_ROOT + '/add/comment/';        //添加评论
    static API_DELETE_COMMENT = ApiUtil.URL_ROOT + '/delete/comment/';  //删除评论
    
    // 标签操作
    static API_GET_TAGS_BY_BLOG = ApiUtil.URL_ROOT + '/post/tags/';     //获取博客的标签
    static API_GET_TAG_INFO = ApiUtil.URL_ROOT + '/tag/posts/';         //获取标签对应的所有博客
    static API_GET_TAG_NAME = ApiUtil.URL_ROOT + '/tag/name/';          //获取标签名称 

}