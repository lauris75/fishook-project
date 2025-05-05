import "./PostContent.scss";
import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";
import FavoriteOutlinedIcon from "@mui/icons-material/FavoriteOutlined";
import TextsmsOutlinedIcon from "@mui/icons-material/TextsmsOutlined";
import ShareOutlinedIcon from "@mui/icons-material/ShareOutlined";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { Link } from "react-router-dom";
import Comments from "../comments/Comments";
import { useState } from "react";
import { formatDistanceToNow } from 'date-fns';

const Post = ({ post }) => {
  const [commentOpen, setCommentOpen] = useState(false);
  
  const formattedDate = post.date ? formatDistanceToNow(new Date(post.date), { addSuffix: true }) : "unknown time";
  
  return (
    <div className="post">
      <div className="container">
        <div className="user">
          <div className="userInfo">
            <img src={post.user?.profilePicture} alt="" />
            <div className="details">
              <Link
                to={`/profile/${post.userId}`}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <span className="name">{post.user?.name} {post.user?.lastname}</span>
              </Link>
              <span className="date">{formattedDate}</span>
            </div>
          </div>
          <MoreHorizIcon />
        </div>
        <div className="content">
          <p>{post.content}</p>
          {post.photoURL && <img src={post.photoURL} alt="" />}
        </div>
        <div className="info">
          <div className="item">
            {post.isLikedByCurrentUser ? <FavoriteOutlinedIcon /> : <FavoriteBorderOutlinedIcon />}
            {post.likeCount} {post.likeCount === 1 ? 'Like' : 'Likes'}
          </div>
          <div className="item" onClick={() => setCommentOpen(!commentOpen)}>
            <TextsmsOutlinedIcon />
            {post.commentCount} {post.commentCount === 1 ? 'Comment' : 'Comments'}
          </div>
          <div className="item">
            <ShareOutlinedIcon />
            Share
          </div>
        </div>
        {commentOpen && <Comments comments={post.comments} postId={post.id} />}
      </div>
    </div>
  );
};

export default Post;