import "./PostContent.scss";
import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";
import FavoriteOutlinedIcon from "@mui/icons-material/FavoriteOutlined";
import TextsmsOutlinedIcon from "@mui/icons-material/TextsmsOutlined";
import ShareOutlinedIcon from "@mui/icons-material/ShareOutlined";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { Link } from "react-router-dom";
import Comments from "../comments/Comments";
import { useState } from "react";
import { formatDistanceToNow } from 'date-fns'; // Install if not already
import { api } from "../../context/AuthContext"; // Use the same import path as in Posts

const Post = ({ post }) => {
  const [commentOpen, setCommentOpen] = useState(false);
  const [liked, setLiked] = useState(post.isLikedByCurrentUser);
  const [likeCount, setLikeCount] = useState(post.likeCount);

  // Format the date
  const formattedDate = post.date ? formatDistanceToNow(new Date(post.date), { addSuffix: true }) : "unknown time";
  
  const handleLike = async () => {
    try {
      if (liked) {
        // Unlike the post
        await api.delete(`/likes/${post.id}`);
        setLikeCount(prev => prev - 1);
      } else {
        // Like the post
        await api.post('/likes', { postId: post.id });
        setLikeCount(prev => prev + 1);
      }
      setLiked(!liked);
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };
  
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
          <div className="item" onClick={handleLike}>
            {liked ? <FavoriteOutlinedIcon /> : <FavoriteBorderOutlinedIcon />}
            {likeCount} {likeCount === 1 ? 'Like' : 'Likes'}
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