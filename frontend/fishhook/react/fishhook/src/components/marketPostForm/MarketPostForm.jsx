import { useState, useContext } from "react";
import "./MarketPostForm.scss";
import { AuthContext } from "../../context/AuthContext";
import { storage } from "../../firebase/firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { v4 as uuidv4 } from "uuid";

const MarketPostForm = ({ categories, onPostCreated }) => {
  const { currentUser, api } = useContext(AuthContext);
  const [content, setContent] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);

  const handleContentChange = (e) => {
    setContent(e.target.value);
  };

  const handlePriceChange = (e) => {
    const value = e.target.value;
    // Allow only numbers and decimals
    if (/^\d*\.?\d*$/.test(value) || value === "") {
      setPrice(value);
    }
  };

  const handleCategoryChange = (e) => {
    setCategoryId(e.target.value);
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
      setImageUrl(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Form validation
    if (!content.trim()) {
      setError("Please provide a description for your listing");
      return;
    }
    
    if (!price || parseFloat(price) <= 0) {
      setError("Please provide a valid price");
      return;
    }
    
    if (!categoryId) {
      setError("Please select a category");
      return;
    }
    
    setError(null);
    setIsSubmitting(true);
    
    try {
      let finalImageUrl = null;
      
      // Upload image to Firebase if there is one
      if (image) {
        const storageRef = ref(storage, `marketplace/${currentUser.id}/${uuidv4()}`);
        
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
      
      // Create market post data
      const marketPostData = {
        userId: currentUser.id,
        content: content,
        price: parseFloat(price),
        photoURL: finalImageUrl,
        date: new Date(),
        categoryId: parseInt(categoryId)
      };
      
      const response = await api.post('/market', marketPostData);
      
      if (response.status === 201) {
        // Clear form after successful submission
        setContent("");
        setPrice("");
        setCategoryId("");
        setImage(null);
        setImageUrl("");
        setUploadProgress(0);
        setIsFormVisible(false);
        
        // Notify parent component that a new post was created
        if (onPostCreated) {
          onPostCreated(response.data);
        }
      }
    } catch (error) {
      console.error("Error creating market post:", error);
      setError("Failed to create listing. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="market-post-form-container">
      {!isFormVisible ? (
        <button 
          className="create-listing-btn" 
          onClick={() => setIsFormVisible(true)}
        >
          Create New Listing
        </button>
      ) : (
        <div className="market-post-form">
          <h2>Create New Listing</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="price">Price ($) *</label>
              <input
                type="text"
                id="price"
                value={price}
                onChange={handlePriceChange}
                placeholder="Enter price"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="category">Category *</label>
              <select
                id="category"
                value={categoryId}
                onChange={handleCategoryChange}
                required
              >
                <option value="">Select a category</option>
                {categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="description">Description *</label>
              <textarea
                id="description"
                value={content}
                onChange={handleContentChange}
                placeholder="Describe your item, condition, etc."
                rows={4}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Product Photo</label>
              <div className="image-upload-container">
                <label className="image-upload-btn">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{ display: "none" }}
                  />
                  Choose Image
                </label>
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
              </div>
            </div>
            
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="upload-progress">
                <div
                  className="progress-bar"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
                <span>{uploadProgress}%</span>
              </div>
            )}
            
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}
            
            <div className="form-actions">
              <button
                type="button"
                className="cancel-btn"
                onClick={() => setIsFormVisible(false)}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="submit-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating..." : "Post Listing"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default MarketPostForm;