import { useState, useContext } from "react";
import "./GroupForm.scss";
import { AuthContext } from "../../context/AuthContext";
import { storage } from "../../firebase/firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { v4 as uuidv4 } from "uuid";

const GroupForm = ({ onGroupCreated }) => {
  const { currentUser, api } = useContext(AuthContext);
  const [groupName, setGroupName] = useState("");
  const [summary, setSummary] = useState("");
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isFormVisible, setIsFormVisible] = useState(false);

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
      setImageUrl(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!groupName.trim()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      let finalImageUrl = "https://images.unsplash.com/photo-1592929043000-fbea34bc8ad5?auto=format&fit=crop&w=1170&q=80"; // Default image
      
      if (image) {
        const storageRef = ref(storage, `groups/${currentUser.id}/${uuidv4()}`);
        
        const metadata = {
          contentType: image.type,
        };
        
        const uploadTask = uploadBytesResumable(storageRef, image, metadata);
        
        await new Promise((resolve, reject) => {
          uploadTask.on(
            'state_changed', 
            (snapshot) => {
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
      
      const groupData = {
        ownerId: currentUser.id,
        groupName: groupName,
        summary: summary || "A fishing group for enthusiasts to share experiences and tips.",
        photoURL: finalImageUrl
      };
      
      const response = await api.post('/group', groupData);
      
      if (response.status === 201) {
        setGroupName("");
        setSummary("");
        setImage(null);
        setImageUrl("");
        setUploadProgress(0);
        setIsFormVisible(false);
        
        if (onGroupCreated) {
          onGroupCreated(response.data);
        }
      }
    } catch (error) {
      console.error("Error creating group:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="group-form-container">
      {!isFormVisible ? (
        <button className="create-group-btn" onClick={() => setIsFormVisible(true)}>
          Create New Group
        </button>
      ) : (
        <div className="group-form">
          <h2>Create a New Fishing Group</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="groupName">Group Name *</label>
              <input
                type="text"
                id="groupName"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Enter group name"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="summary">Description</label>
              <textarea
                id="summary"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="What is this group about?"
                rows={4}
              />
            </div>
            
            <div className="form-group">
              <label>Group Photo</label>
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
            
            <div className="form-actions">
              <button 
                type="button" 
                className="cancel-btn"
                onClick={() => setIsFormVisible(false)}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="submit-btn"
                disabled={isSubmitting || !groupName.trim()}
              >
                {isSubmitting ? "Creating..." : "Create Group"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default GroupForm;