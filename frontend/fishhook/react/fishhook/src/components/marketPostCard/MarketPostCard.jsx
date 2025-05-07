import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../../context/AuthContext";
import { formatDistanceToNow } from 'date-fns';
import "./MarketPostCard.scss";

const MarketPostCard = ({ post }) => {
  const [seller, setSeller] = useState(null);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdditionalData = async () => {
      try {
        // Fetch seller (user) information
        const userResponse = await api.get(`/user/${post.userId}`);
        setSeller(userResponse.data);
        
        // Fetch category information
        const categoryResponse = await api.get(`/category/${post.categoryId}`);
        setCategory(categoryResponse.data);
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching additional data for market post:", err);
        setLoading(false);
      }
    };
    
    fetchAdditionalData();
  }, [post.userId, post.categoryId]);
  
  // Format the date to show how long ago the post was created
  const formattedDate = post.date 
    ? formatDistanceToNow(new Date(post.date), { addSuffix: true }) 
    : "unknown time";
  
  // Format price to 2 decimal places
  const formattedPrice = post.price ? 
    parseFloat(post.price).toFixed(2) : 
    '0.00';
  
  if (loading) {
    return <div className="market-post-card loading">Loading...</div>;
  }

  return (
    <div className="market-post-card">
      <div className="post-header">
        <div className="seller-info">
          <Link to={`/profile/${post.userId}`}>
            <img 
              src={seller?.profilePicture} 
              alt={`${seller?.name}'s profile`} 
              className="seller-avatar" 
            />
          </Link>
          <div className="seller-details">
            <Link 
              to={`/profile/${post.userId}`}
              className="seller-name"
            >
              {seller?.name} {seller?.lastname}
            </Link>
            <span className="price">${formattedPrice}</span>
          </div>
        </div>
        <div className="post-meta">
          <span className="post-date">{formattedDate}</span>
          {category && (
            <span className="post-category">{category.name}</span>
          )}
        </div>
      </div>
      
      <div className="post-content">
        <p className="post-description">{post.content}</p>
        
        {post.photoURL && (
          <div className="post-image">
            <img src={post.photoURL} alt="Item for sale" />
          </div>
        )}
      </div>
      
      <div className="post-actions">
        <button className="contact-button">
          Contact Seller
        </button>
      </div>
    </div>
  );
};

export default MarketPostCard;