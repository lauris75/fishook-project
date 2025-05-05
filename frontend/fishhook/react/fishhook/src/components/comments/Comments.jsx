import { useContext, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import "./Comments.scss";
import { formatDistanceToNow } from 'date-fns';
import { api } from "../../context/AuthContext";

const Comments = ({ comments = [], postId, onCommentAdded }) => {
  const { currentUser } = useContext(AuthContext);
  const [commentText, setCommentText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!commentText.trim() || isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      const response = await api.post('/postComment', {
        postId: postId,
        userId: currentUser.id,
        content: commentText,
        date: new Date()
      });
      
      // Create a new comment object
      const newComment = {
        id: response.data.id,
        userId: currentUser.id,
        content: commentText,
        date: new Date(),
        user: {
          name: currentUser.name,
          lastname: currentUser.surname || currentUser.lastname,
          profilePicture: currentUser.profilePicture
        }
      };
      
      // Call the callback from parent with the new comment
      if (onCommentAdded) {
        onCommentAdded(newComment);
      }
      
      setCommentText("");
      
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