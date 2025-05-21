import React, { useState, useContext, useRef } from "react";
import { AuthContext } from "../../context/AuthContext";
import { storage } from "../../firebase/firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { v4 as uuidv4 } from "uuid";
import "./GroupUpdateForm.scss";
import CloseIcon from '@mui/icons-material/Close';

const GroupUpdateForm = ({ group, onClose, onUpdate }) => {
  const { currentUser, api } = useContext(AuthContext);
  const [summary, setSummary] = useState(group?.summary || "");
  const [groupPhoto, setGroupPhoto] = useState(null);
  const [groupPhotoUrl, setGroupPhotoUrl] = useState(group?.photoURL || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const photoInputRef = useRef(null);

  const handlePhotoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setGroupPhoto(e.target.files[0]);
      setGroupPhotoUrl(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleSummaryChange = (e) => {
    setSummary(e.target.value);
  };

  const uploadFileToFirebase = async (file) => {
    if (!file) return null;

    const storageRef = ref(storage, `groups/${group.id}/${uuidv4()}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          );
          setUploadProgress(progress);
        },
        (error) => {
          console.error("Error uploading group photo:", error);
          reject(error);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(downloadURL);
          } catch (err) {
            console.error("Error getting group photo download URL:", err);
            reject(err);
          }
        }
      );
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      let photoURL = groupPhotoUrl;

      if (groupPhoto) {
        photoURL = await uploadFileToFirebase(groupPhoto);
      }

      const updateData = {
        photoURL: photoURL,
        summary: summary
      };

      const response = await api.put(`/group/${group.id}`, updateData);

      if (response.status === 200) {
        if (onUpdate) {
          onUpdate({
            ...group,
            ...updateData
          });
        }
        
        if (onClose) {
          onClose();
        }
      }
    } catch (error) {
      console.error("Error updating group:", error);
      setError("Failed to update group. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="group-update-form-overlay">
      <div className="group-update-form">
        <div className="form-header">
          <h2>Update Group: {group.groupName}</h2>
          <button className="close-button" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Group Photo</label>
            <div className="image-preview">
              {groupPhotoUrl && (
                <img
                  src={groupPhotoUrl}
                  alt="Group"
                  className="group-image-preview"
                />
              )}
              <div className="image-actions">
                <button
                  type="button"
                  className="upload-button"
                  onClick={() => photoInputRef.current.click()}
                >
                  {groupPhotoUrl ? "Change Photo" : "Upload Photo"}
                </button>
                {groupPhotoUrl && (
                  <button
                    type="button"
                    className="remove-button"
                    onClick={() => {
                      setGroupPhoto(null);
                      setGroupPhotoUrl("");
                    }}
                  >
                    Remove
                  </button>
                )}
              </div>
              <input
                type="file"
                ref={photoInputRef}
                onChange={handlePhotoChange}
                accept="image/*"
                style={{ display: "none" }}
              />
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="progress-bar">
                  <div
                    className="progress"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                  <span>{uploadProgress}%</span>
                </div>
              )}
            </div>
          </div>

          <div className="form-group">
            <label>Group Description</label>
            <textarea
              value={summary}
              onChange={handleSummaryChange}
              placeholder="Describe what this group is about..."
              rows={4}
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="form-actions">
            <button
              type="button"
              className="cancel-button"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="save-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GroupUpdateForm;