import React, { useState } from "react";
import { Check, ArrowRight, X } from "lucide-react";
import { uploadToIpfs } from "../utils/encryptUpload";
import axios from "axios";
import "./DecentralizedIdentityVerification.css";

const DecentralizedIdentityVerification = () => {
  const [photoID, setPhotoID] = useState(null);
  const [idFile, setIdFile] = useState(null);
  const [registrationStatus, setRegistrationStatus] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");

  const handleUploadID = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setIdFile(file);
      setPhotoID(URL.createObjectURL(file));
    }
  };

  const handleContinue = async () => {
    if (!idFile) return;

    console.log("Uploading file:", idFile);

    const formData = new FormData();
    formData.append("file", idFile);

    try {
      console.log("Sending file to server...");
      const response = await axios.post("http://127.0.0.1:8000/extract-embedding", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Server Response:", response.data);
      const status = await uploadToIpfs(response.data.embedding, null);

      if (status && status.success) {
        setRegistrationStatus(true);
        setPopupMessage("User registered successfully!");
      } else {
        setPopupMessage("User not registered");
      }
      setShowPopup(true);
      
      // Hide popup after 3 seconds
      setTimeout(() => {
        setShowPopup(false);
      }, 3000);
    } catch (error) {
      console.error("Upload failed:", error);
      setPopupMessage("Registration failed: " + error.message);
      setShowPopup(true);
      setTimeout(() => {
        setShowPopup(false);
      }, 3000);
    }
  };

  return (
    <div className="verification-panel">
      {/* Popup Notification */}
      {showPopup && (
        <div className={`popup-notification ${registrationStatus ? "success" : "error"}`}>
          <div className="popup-content">
            {registrationStatus ? (
              <Check size={20} className="popup-icon" />
            ) : (
              <X size={20} className="popup-icon" />
            )}
            <span>{popupMessage}</span>
          </div>
        </div>
      )}

      <div className="step-content">
        <h3 className="step-title">Upload Photo ID</h3>
        <p className="step-description">
          Please upload a clear photo of your government-issued ID
        </p>

        {!photoID ? (
          <div className="upload-container">
            <input
              type="file"
              id="id-upload"
              className="file-input"
              onChange={handleUploadID}
              accept="image/*"
            />
            <label htmlFor="id-upload" className="upload-label">
              <div className="upload-icon">
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
              </div>
              <p className="upload-text">Click to upload ID</p>
              <p className="upload-subtext">
                Passport, Driver's License, or National ID
              </p>
            </label>
          </div>
        ) : (
          <div className="preview-container">
            <div className="id-preview">
              <img src={photoID} alt="ID Document" className="preview-image" />
            </div>
            <div className="preview-actions">
              <button
                className="change-button"
                onClick={() => {
                  setPhotoID(null);
                  setIdFile(null);
                }}
              >
                Change photo
              </button>
              <div className="upload-status">
                <Check size={16} className="status-icon" />
                ID uploaded
              </div>
            </div>
          </div>
        )}

        <button
          className={`next-button ${!photoID ? "disabled" : ""}`}
          disabled={!photoID}
          onClick={handleContinue}
        >
          Continue <ArrowRight size={16} className="button-icon" />
        </button>
      </div>
    </div>
  );
};

export default DecentralizedIdentityVerification;