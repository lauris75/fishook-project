import { useState, useEffect, useContext, useRef } from "react";
import { Link } from "react-router-dom";
import { api } from "../../context/AuthContext";
import { AuthContext } from "../../context/AuthContext";
import { formatDistanceToNow } from 'date-fns';
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import DropdownMenu from "../dropdownMenu/DropdownMenu";
import ConfirmationModal from "../confirmationModal/ConfirmationModal";
import "./MarketPostCard.scss";

const MarketPostCard = ({ post, onPostDeleted }) => {
  const { currentUser } = useContext(AuthContext);
  const [seller, setSeller] = useState(null);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const moreOptionsRef = useRef(null);
  
  const isOwnPost = post.userId === currentUser.id;

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
  
  const openDeleteModal = () => {
    setIsDeleteModalOpen(true);
  };
  
  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
  };
  
  const handleDelete = async () => {
    try {
      await api.delete(`/market/${post.id}`);
      
      if (onPostDeleted) {
        onPostDeleted(post.id);
      } else {
        // If no callback provided, we can show a success message or refresh the page
        window.location.reload();
      }
    } catch (error) {
      console.error("Error deleting market listing:", error);
      alert("Failed to delete listing. Please try again.");
    } finally {
      closeDeleteModal();
    }
  };
  
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };
  
  const moreOptions = [
    {
      label: "Delete Listing",
      icon: <DeleteOutlineIcon fontSize="small" />,
      onClick: openDeleteModal,
      danger: true
    }
  ];
  
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
          <div className="meta-right">
            {category && (
              <span className="post-category">{category.name}</span>
            )}
            {isOwnPost && (
              <div className="more-options" ref={moreOptionsRef}>
                <div onClick={toggleMenu}>
                  <MoreHorizIcon style={{ cursor: 'pointer' }} />
                </div>
                <DropdownMenu 
                  options={moreOptions} 
                  anchorEl={moreOptionsRef.current}
                  isOpen={menuOpen}
                  setIsOpen={setMenuOpen}
                />
              </div>
            )}
          </div>
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
      
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
        title="Delete Listing"
        message="Are you sure you want to delete this marketplace listing? This action cannot be undone."
      />
    </div>
  );
};

export default MarketPostCard;