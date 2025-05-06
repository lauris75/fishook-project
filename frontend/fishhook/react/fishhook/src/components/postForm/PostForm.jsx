import { useState, useContext } from "react";
import "./PostForm.scss";
import { AuthContext } from "../../context/AuthContext";

const PostForm = ({ onPostCreated, groupId, isOwnProfile = true }) => {
  const { currentUser, api } = useContext(AuthContext);
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleContentChange = (e) => {
    setContent(e.target.value);
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
      setImageUrl(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!content.trim() && !image) {
      return; // Don't submit empty posts
    }
    
    setIsSubmitting(true);
    
    try {
      // Create form data if you need to upload an image
      // Otherwise, just send a JSON object
      const postData = {
        userId: currentUser.id,
        content: content,
        photoURL: imageUrl || null, // For now, just use the local URL
        date: new Date(),
        groupId: groupId || null
      };
      
      const response = await api.post('/userPost', postData);
      
      if (response.status === 201) {
        // Clear form after successful submission
        setContent("");
        setImage(null);
        setImageUrl("");
        
        // Notify parent component that a new post was created
        if (onPostCreated) {
          onPostCreated(response.data);
        }
      }
    } catch (error) {
      console.error("Error creating post:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Don't render the form if we're not on the user's own profile
  if (!isOwnProfile) {
    return null;
  }

  return (
    <div className="post-form">
      <form onSubmit={handleSubmit}>
        <div className="user-info">
          <img 
            src={currentUser.profilePicture} 
            alt={`${currentUser.name}'s profile`} 
            className="avatar"
          />
          <div className="name">{currentUser.name}</div>
        </div>
        
        <textarea
          placeholder="What's on your mind about fishing today?"
          value={content}
          onChange={handleContentChange}
          disabled={isSubmitting}
        />
        
        {imageUrl && (
          <div className="image-preview">
            <img src={imageUrl} alt="Preview" />
            <button 
              type="button" 
              className="remove-image" 
              onClick={() => {
                setImage(null);
                setImageUrl("");
              }}
            >
              ×
            </button>
          </div>
        )}
        
        <div className="actions">
          <div className="upload-buttons">
            <label className="image-upload">
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageChange}
                disabled={isSubmitting}
              />
              Add Photo
            </label>
          </div>
          
          <button 
            type="submit" 
            className="submit-button"
            disabled={isSubmitting || (!content.trim() && !image)}
          >
            {isSubmitting ? "Posting..." : "Post"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PostForm;