import { useContext, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import "./Comments.scss";
import { formatDistanceToNow } from 'date-fns';
import { api } from "../../context/AuthContext";

const Comments = ({ comments = [], postId }) => {
  const { currentUser } = useContext(AuthContext);
  const [commentText, setCommentText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!commentText.trim() || isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      await api.post('/comments', {
        postId,
        content: commentText,
        userId: currentUser.id, // Assuming your auth context provides this
      });
      
      setCommentText("");
      
      // Here you could implement a strategy to refresh comments
      // Option 1: Refetch all comments for this post
      // Option 2: Add the new comment to the local state
      // Option 3: Use a global state management like Redux or Context
      
    } catch (error) {
      console.error("Error posting comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="comments">
      <div className="write">
        <img src={currentUser.profilePicture || currentUser.profilePic} alt="" />
        <input 
          type="text" 
          placeholder="write a comment" 
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
        />
        <button onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? "Sending..." : "Send"}
        </button>
      </div>
      {comments.map((comment) => (
        <div className="comment" key={comment.id}>
          <img src={comment.user?.profilePicture} alt="" />
          <div className="info">
            <span>{comment.user?.name} {comment.user?.lastname}</span>
            <p>{comment.content}</p>
          </div>
          <span className="date">
            {comment.date ? formatDistanceToNow(new Date(comment.date), { addSuffix: true }) : "unknown time"}
          </span>
        </div>
      ))}
    </div>
  );
};

export default Comments;