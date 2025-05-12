import "./PostContent.scss";
import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";
import FavoriteOutlinedIcon from "@mui/icons-material/FavoriteOutlined";
import TextsmsOutlinedIcon from "@mui/icons-material/TextsmsOutlined";
import ShareOutlinedIcon from "@mui/icons-material/ShareOutlined";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { Link } from "react-router-dom";
import Comments from "../comments/Comments";
import { useState, useEffect, useContext, useRef } from "react";
import { formatDistanceToNow } from 'date-fns';
import { api } from "../../context/AuthContext";
import { AuthContext } from "../../context/AuthContext";
import DropdownMenu from "../dropdownMenu/DropdownMenu";
import ConfirmationModal from "../confirmationModal/ConfirmationModal";

const Post = ({ post, onPostDeleted }) => {
  const { currentUser } = useContext(AuthContext);
  const [commentOpen, setCommentOpen] = useState(false);
  const [liked, setLiked] = useState(post.isLikedByCurrentUser);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const moreOptionsRef = useRef(null);
  
  const isOwnPost = post.userId === currentUser.id;
  
  const sortCommentsByDate = (commentsArray) => {
    return [...commentsArray].sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateA - dateB;
    });
  };
  
  const [comments, setComments] = useState(
    sortCommentsByDate(post.comments || [])
  );
  
  const [commentCount, setCommentCount] = useState(post.commentCount || 0);
  
  useEffect(() => {
    if (post.comments) {
      setComments(sortCommentsByDate(post.comments));
    }
  }, [post.comments]);
  
  const handleCommentAdded = (newComment) => {
    setComments(prevComments => {
      const updatedComments = [newComment, ...prevComments];
      return sortCommentsByDate(updatedComments);
    });
    
    setCommentCount(prevCount => prevCount + 1);
  };

  const formattedDate = post.date ? formatDistanceToNow(new Date(post.date), { addSuffix: true }) : "unknown time";
  
  const handleLike = async () => {
    try {
      if (liked) {
        await api.delete(`/postLikes/${post.id}`);
        setLikeCount(prev => prev - 1);
      } else {
        await api.post('/postLikes', { postId: post.id });
        setLikeCount(prev => prev + 1);
      }
      setLiked(!liked);
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };
  
  const openDeleteModal = () => {
    setIsDeleteModalOpen(true);
  };
  
  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
  };
  
  const handleDelete = async () => {
    try {
      await api.delete(`/userPost/${post.id}`);
      
      if (onPostDeleted) {
        onPostDeleted(post.id);
      } else {
        // If no callback provided, we can show a success message or refresh the page
        window.location.reload();
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      alert("Failed to delete post. Please try again.");
    } finally {
      closeDeleteModal();
    }
  };
  
  const moreOptions = [
    {
      label: "Delete Post",
      icon: <DeleteOutlineIcon fontSize="small" />,
      onClick: openDeleteModal
    }
  ];
  
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
          <div className="more-options" ref={moreOptionsRef}>
            {isOwnPost && (
              <>
                <MoreHorizIcon style={{ cursor: 'pointer' }} />
                <DropdownMenu 
                  options={moreOptions} 
                  anchorEl={moreOptionsRef.current} 
                />
              </>
            )}
          </div>
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
      
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
        title="Delete Post"
        message="Are you sure you want to delete this post? This action cannot be undone."
      />
    </div>
  );
};

export default Post;