import { useState, useEffect, useContext, useRef } from "react";
import { Link } from "react-router-dom";
import { api } from "../../context/AuthContext";
import { AuthContext } from "../../context/AuthContext";
import { useAdmin } from "../../hooks/useAdmin";
import { formatDistanceToNow } from 'date-fns';
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import SecurityIcon from "@mui/icons-material/Security";
import DropdownMenu from "../dropdownMenu/DropdownMenu";
import ConfirmationModal from "../confirmationModal/ConfirmationModal";
import "./MarketPostCard.scss";

const MarketPostCard = ({ post, onPostDeleted }) => {
  const { currentUser } = useContext(AuthContext);
  const { isAdmin } = useAdmin();
  const [seller, setSeller] = useState(null);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const moreOptionsRef = useRef(null);
  
  const canManageListing = post.userId === currentUser.id || isAdmin;

  useEffect(() => {
    const fetchAdditionalData = async () => {
      try {
        const userResponse = await api.get(`/user/${post.userId}`);
        setSeller(userResponse.data);
        
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
  
  const formattedDate = post.date 
    ? formatDistanceToNow(new Date(post.date), { addSuffix: true }) 
    : "unknown time";
  
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
        window.location.reload();
      }
    } catch (error) {
      console.error("Error deleting market listing:", error);
      alert("Failed to delete listing. Please try again.");
    } finally {
      closeDeleteModal();
    }
  };

  const handleContactSeller = () => {
    window.location.href = `/chat?seller=${post.userId}`;
  };
  
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };
  
  const moreOptions = [
    {
      label: isAdmin && post.userId !== currentUser.id ? "Delete Listing (Admin)" : "Delete Listing",
      icon: isAdmin && post.userId !== currentUser.id ? <SecurityIcon fontSize="small" /> : <DeleteOutlineIcon fontSize="small" />,
      onClick: openDeleteModal,
      danger: true
    }
  ];
  
  const deleteMessage = isAdmin && post.userId !== currentUser.id
    ? "As an admin, you are about to delete another user's marketplace listing. This action cannot be undone."
    : "Are you sure you want to delete this marketplace listing? This action cannot be undone.";
  
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
            {canManageListing && (
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
        <button 
          className="contact-button"
          onClick={() => window.location.href = `/chat?seller=${post.userId}`}>
            Contact Seller
        </button>
      </div>
      
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
        title="Delete Listing"
        message={deleteMessage}
      />
    </div>
  );
};

export default MarketPostCard;