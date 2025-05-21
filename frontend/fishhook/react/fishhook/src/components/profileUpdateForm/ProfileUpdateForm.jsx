import React, { useState, useContext, useRef } from "react";
import { AuthContext } from "../../context/AuthContext";
import { storage } from "../../firebase/firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { v4 as uuidv4 } from "uuid";
import "./ProfileUpdateForm.scss";
import CloseIcon from '@mui/icons-material/Close';

const ProfileUpdateForm = ({ profile, onClose, onUpdate }) => {
  const { currentUser, api } = useContext(AuthContext);
  const [description, setDescription] = useState(profile?.description || "");
  const [profilePic, setProfilePic] = useState(null);
  const [profilePicUrl, setProfilePicUrl] = useState(profile?.profilePicture || "");
  const [coverPic, setCoverPic] = useState(null);
  const [coverPicUrl, setCoverPicUrl] = useState(profile?.coverPicture || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState({
    profile: 0,
    cover: 0
  });
  
  const profilePicInputRef = useRef(null);
  const coverPicInputRef = useRef(null);

  const handleProfilePicChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setProfilePic(e.target.files[0]);
      setProfilePicUrl(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleCoverPicChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setCoverPic(e.target.files[0]);
      setCoverPicUrl(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleDescriptionChange = (e) => {
    setDescription(e.target.value);
  };

  const uploadFileToFirebase = async (file, fileType) => {
    if (!file) return null;

    const storageRef = ref(storage, `users/${currentUser.id}/${fileType}/${uuidv4()}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          );
          setUploadProgress(prev => ({
            ...prev,
            [fileType]: progress
          }));
        },
        (error) => {
          console.error(`Error uploading ${fileType}:`, error);
          reject(error);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(downloadURL);
          } catch (err) {
            console.error(`Error getting ${fileType} download URL:`, err);
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
      let profilePicURL = profilePicUrl;
      let coverPicURL = coverPicUrl;

      if (profilePic) {
        profilePicURL = await uploadFileToFirebase(profilePic, 'profile');
      }

      if (coverPic) {
        coverPicURL = await uploadFileToFirebase(coverPic, 'cover');
      }

      const updateData = {
        profilePicture: profilePicURL,
        coverPicture: coverPicURL,
        description: description
      };

      const response = await api.put('/user/profile', updateData);

      if (response.status === 200) {
        if (onUpdate) {
          onUpdate({
            ...profile,
            ...updateData
          });
        }
        
        if (onClose) {
          onClose();
        }
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setError("Failed to update profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="profile-update-form-overlay">
      <div className="profile-update-form">
        <div className="form-header">
          <h2>Update Your Profile</h2>
          <button className="close-button" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Profile Picture</label>
            <div className="image-preview">
              {profilePicUrl && (
                <img
                  src={profilePicUrl}
                  alt="Profile"
                  className="profile-image-preview"
                />
              )}
              <div className="image-actions">
                <button
                  type="button"
                  className="upload-button"
                  onClick={() => profilePicInputRef.current.click()}
                >
                  {profilePicUrl ? "Change Picture" : "Upload Picture"}
                </button>
                {profilePicUrl && (
                  <button
                    type="button"
                    className="remove-button"
                    onClick={() => {
                      setProfilePic(null);
                      setProfilePicUrl("");
                    }}
                  >
                    Remove
                  </button>
                )}
              </div>
              <input
                type="file"
                ref={profilePicInputRef}
                onChange={handleProfilePicChange}
                accept="image/*"
                style={{ display: "none" }}
              />
              {uploadProgress.profile > 0 && uploadProgress.profile < 100 && (
                <div className="progress-bar">
                  <div
                    className="progress"
                    style={{ width: `${uploadProgress.profile}%` }}
                  ></div>
                  <span>{uploadProgress.profile}%</span>
                </div>
              )}
            </div>
          </div>

          <div className="form-group">
            <label>Cover Picture</label>
            <div className="image-preview">
              {coverPicUrl && (
                <img
                  src={coverPicUrl}
                  alt="Cover"
                  className="cover-image-preview"
                />
              )}
              <div className="image-actions">
                <button
                  type="button"
                  className="upload-button"
                  onClick={() => coverPicInputRef.current.click()}
                >
                  {coverPicUrl ? "Change Cover" : "Upload Cover"}
                </button>
                {coverPicUrl && (
                  <button
                    type="button"
                    className="remove-button"
                    onClick={() => {
                      setCoverPic(null);
                      setCoverPicUrl("");
                    }}
                  >
                    Remove
                  </button>
                )}
              </div>
              <input
                type="file"
                ref={coverPicInputRef}
                onChange={handleCoverPicChange}
                accept="image/*"
                style={{ display: "none" }}
              />
              {uploadProgress.cover > 0 && uploadProgress.cover < 100 && (
                <div className="progress-bar">
                  <div
                    className="progress"
                    style={{ width: `${uploadProgress.cover}%` }}
                  ></div>
                  <span>{uploadProgress.cover}%</span>
                </div>
              )}
            </div>
          </div>

          <div className="form-group">
            <label>Bio</label>
            <textarea
              value={description}
              onChange={handleDescriptionChange}
              placeholder="Tell others about yourself..."
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

export default ProfileUpdateForm;