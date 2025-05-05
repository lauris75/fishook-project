import "./PostContent.scss";
import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";
import FavoriteOutlinedIcon from "@mui/icons-material/FavoriteOutlined";
import TextsmsOutlinedIcon from "@mui/icons-material/TextsmsOutlined";
import ShareOutlinedIcon from "@mui/icons-material/ShareOutlined";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { Link } from "react-router-dom";
import Comments from "../comments/Comments";
import { useState, useEffect } from "react";
import { formatDistanceToNow } from 'date-fns';
import { api } from "../../context/AuthContext";

const Post = ({ post }) => {
  const [commentOpen, setCommentOpen] = useState(false);
  const [liked, setLiked] = useState(post.isLikedByCurrentUser);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  
  // Sort comments by date when initializing state
  const sortCommentsByDate = (commentsArray) => {
    return [...commentsArray].sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateA - dateB; // For oldest first
    });
  };
  
  // Initialize with sorted comments
  const [comments, setComments] = useState(
    sortCommentsByDate(post.comments || [])
  );
  
  const [commentCount, setCommentCount] = useState(post.commentCount || 0);
  
  // Re-sort comments if post.comments changes
  useEffect(() => {
    if (post.comments) {
      setComments(sortCommentsByDate(post.comments));
    }
  }, [post.comments]);
  
  const handleCommentAdded = (newComment) => {
    // Add the new comment and sort all comments by date
    setComments(prevComments => {
      const updatedComments = [newComment, ...prevComments];
      return sortCommentsByDate(updatedComments);
    });
    
    // Increment the comment count
    setCommentCount(prevCount => prevCount + 1);
  };

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
            <Link to={`/profile/${post.userId}`}>
              <img src={post.user?.profilePicture} alt="" />
            </Link>
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
            {commentCount} {commentCount === 1 ? 'Comment' : 'Comments'}
          </div>
          <div className="item">
            <ShareOutlinedIcon />
            Share
          </div>
        </div>
        {commentOpen && <Comments 
          comments={comments} 
          postId={post.id} 
          onCommentAdded={handleCommentAdded} 
        />}
      </div>
    </div>
  );
};

export default Post;