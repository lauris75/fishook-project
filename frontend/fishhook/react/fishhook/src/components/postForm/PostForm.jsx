import { useState, useContext } from "react";
import "./PostForm.scss";
import { AuthContext } from "../../context/AuthContext";
import { storage } from "../../firebase/firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { v4 as uuidv4 } from "uuid";

const PostForm = ({ onPostCreated, groupId, isOwnProfile = true }) => {
  const { currentUser, api } = useContext(AuthContext);
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

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
      let finalImageUrl = null;
      
      // Upload image to Firebase if there is one
      if (image) {
        const storageRef = ref(storage, `posts/${currentUser.id}/${uuidv4()}`);
        
        // Create the file metadata
        const metadata = {
          contentType: image.type,
        };
        
        // Upload file and metadata
        const uploadTask = uploadBytesResumable(storageRef, image, metadata);
        
        // Listen for state changes, errors, and completion
        await new Promise((resolve, reject) => {
          uploadTask.on(
            'state_changed', 
            (snapshot) => {
              // Update progress
              const progress = Math.round(
                (snapshot.bytesTransferred / snapshot.totalBytes) * 100
              );
              setUploadProgress(progress);
            },
            (error) => {
              console.error("Upload error:", error);
              reject(error);
            },
            async () => {
              // Upload completed, get download URL
              try {
                finalImageUrl = await getDownloadURL(uploadTask.snapshot.ref);
                resolve();
              } catch (err) {
                console.error("Error getting download URL:", err);
                reject(err);
              }
            }
          );
        });
      }
      
      // Create post data
      const postData = {
        userId: currentUser.id,
        content: content,
        photoURL: finalImageUrl, // Use the Firebase Storage URL
        date: new Date(),
        groupId: groupId || null
      };
      
      const response = await api.post('/userPost', postData);
      
      if (response.status === 201) {
        // Clear form after successful submission
        setContent("");
        setImage(null);
        setImageUrl("");
        setUploadProgress(0);
        
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
        
        {uploadProgress > 0 && uploadProgress < 100 && (
          <div className="upload-progress">
            <div 
              className="progress-bar" 
              style={{ width: `${uploadProgress}%` }}
            ></div>
            <span>{uploadProgress}%</span>
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