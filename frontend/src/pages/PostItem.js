import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function PostItem() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    description: "",
    bookType: ""
  });
  const [message, setMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    setLoading(true);
    e.preventDefault();
    
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setMessage("Please login to post an item");
        return;
      }

      // Validate all fields
      if (!formData.title || !formData.category || !formData.description || !formData.bookType || !selectedImage) {
        setMessage("Please fill in all required fields and select an image");
        return;
      }

      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, value);
      });
      formDataToSend.append('image', selectedImage);

      const res = await fetch("http://localhost:5000/api/items/postItem", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to post item");
      }

      setMessage("Item posted successfully!");
      
      // Reset all fields
      setFormData({
        title: "",
        category: "",
        description: "",
        bookType: ""
      });
      setSelectedImage(null);
      setImagePreview(null);

      // Redirect after success
      setTimeout(() => navigate("/"), 2000);

    } catch (error) {
      console.error("Submission error:", error);
      setMessage(error.message || "An error occurred while posting the item");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <header>
        <div className="logo">
          <Link to="/">Swap & Trade</Link>
        </div>
      </header>
      
      <main>
      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <p>Posting item...</p>
        </div>
      )}
        <section className="post-item-container">
          <div className="post-item-form">
            <h2>Post an Item for Swap</h2>
            <p>Share details about your item to find great swap offers!</p>
            
            <form id="post-item-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="item-title">Item Title</label>
                <input
                  type="text"
                  id="item-title"
                  name="title"
                  required
                  placeholder="e.g., Vintage Book Collection"
                  value={formData.title}
                  onChange={handleChange}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="item-category">Category</label>
                <select
                  id="item-category"
                  name="category"
                  required
                  value={formData.category}
                  onChange={handleChange}
                >
                  <option value="">Select a Category</option>
                  <option value="books">Books</option>
                  {/* <option value="electronics">Electronics</option>
                  <option value="clothing">Clothing</option>
                  <option value="home">Home & Garden</option>
                  <option value="toys">Toys & Games</option>
                  <option value="sports">Sports Equipment</option>
                  <option value="music">Music & Instruments</option>
                  <option value="other">Other</option> */}
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="item-description">Description</label>
                <textarea
                  id="item-description"
                  name="description"
                  rows="4"
                  required
                  placeholder="Describe your item, including bookType, age, and any other relevant details."
                  value={formData.description}
                  onChange={handleChange}
                ></textarea>
              </div>
              
              <div className="form-group">
                <label htmlFor="item-bookType">Book Type</label>
                <select
                  id="item-bookType"
                  name="bookType"
                  required
                  value={formData.bookType}
                  onChange={handleChange}
                >
                  <option value="">Select Book Type</option>
                  <option value="Story Book">Story Book</option>
                  <option value="Textbook">Textbook</option>
                  <option value="Exam">Exam</option>
                  <option value="Novel">Novel</option>
                  <option value="Guidebook">Guidebook</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="item-image">Upload Image</label>
                <div className="image-upload-container">
                  <div className="image-upload-area">
                    {imagePreview ? (
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="image-preview"
                        style={{ maxWidth: '200px', maxHeight: '200px' }}
                      />
                    ) : (
                      <>
                        <i className="fa-solid fa-cloud-upload-alt"></i>
                        <p>Click to select an image</p>
                      </>
                    )}
                    <input
                      type="file"
                      id="item-image"
                      name="image"
                      accept="image/*"
                      onChange={handleFileChange}
                      required
                      style={{ display: 'none' }}
                    />
                    <button
                      type="button"
                      className="btn upload-btn"
                      onClick={() => document.getElementById('item-image').click()}
                    >
                      Choose Image
                    </button>
                  </div>
                </div>
                <small>Only one image allowed. Max size 5MB.</small>
              </div>

              <button type="submit" className="btn submit-btn">Post Item</button>
              
              {message && (
                <div className={`auth-message ${message.includes("success") ? "success" : "error"}`}>
                  {message}
                </div>
              )}
            </form>
          </div>
        </section>
      </main>
      
      <footer>
        <p>&copy; 2025 Swap & Trade. All rights reserved.</p>
        <div className="footer-links">
          <Link to="/">Home</Link>
          <Link to="#">About Us</Link>
          <Link to="/how-it-works">How It Works</Link>
          <Link to="#">Terms of Service</Link>
          <Link to="#">Privacy Policy</Link>
          <Link to="#">Contact Us</Link>
        </div>
      </footer>
    </div>
  );
}

export default PostItem;