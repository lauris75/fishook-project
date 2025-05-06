import { useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { storage } from "../../firebase/firebase"; 
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import "./PostForm.scss";
import ImageIcon from '@mui/icons-material/Image';

const PostForm = ({ groupId = null, onPostCreated }) => {
  const { currentUser, api } = useContext(AuthContext);
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size must be less than 5MB");
        return;
      }
      
      // Check file type
      if (!file.type.match('image.*')) {
        setError("Only image files are allowed");
        return;
      }
      
      setImage(file);
      
      // Create a preview of the image
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    setImagePreview(null);
    setUploadProgress(0);
  };

  const uploadImageToFirebase = async (file) => {
    if (!file) return null;
    
    const fileName = `${Date.now()}_${file.name}`;
    const storageRef = ref(storage, `posts/${currentUser.id}/${fileName}`);
    
    try {
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw new Error("Failed to upload image");
    }
  };

  const handleSubmit = async () => {
    if (!content.trim() && !image) {
      setError("Please add some text or an image to your post");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      let photoURL = null;
      
      // Upload image to Firebase if one is selected
      if (image) {
        photoURL = await uploadImageToFirebase(image);
      }

      const postData = {
        userId: currentUser.id,
        content: content,
        photoURL: photoURL,
        date: new Date(),
        groupId: groupId
      };

      const response = await api.post('/userPost', postData);
      
      // Clear the form
      setContent("");
      setImage(null);
      setImagePreview(null);
      setUploadProgress(0);
      
      // Notify parent component that a post was created
      if (onPostCreated && typeof onPostCreated === 'function') {
        onPostCreated(response.data);
      }
    } catch (err) {
      console.error("Error creating post:", err);
      setError(err.response?.data?.message || "Failed to create post");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="post-form">
      <div className="user-info">
        <img src={currentUser.profilePicture} alt={currentUser.name} />
        <span>{currentUser.name}</span>
      </div>
      
      <div className="content-area">
        <textarea 
          placeholder={`What's on your mind, ${currentUser.name}?`}
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        
        {imagePreview && (
          <div className="image-preview">
            <img src={imagePreview} alt="Preview" />
            <button className="remove-btn" onClick={handleRemoveImage}>×</button>
            
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="upload-progress">
                <div 
                  className="progress-bar" 
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            )}
          </div>
        )}
        
        {error && <div className="error-message">{error}</div>}
      </div>
      
      <div className="actions">
        <div className="options">
          <label htmlFor="image-upload" className="upload-btn">
            <ImageIcon />
            <span>Photo</span>
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: 'none' }}
            />
          </label>
        </div>
        
        <button 
          className="post-btn" 
          onClick={handleSubmit} 
          disabled={isSubmitting || (!content.trim() && !image)}
        >
          {isSubmitting ? "Posting..." : "Post"}
        </button>
      </div>
    </div>
  );
};

export default PostForm;