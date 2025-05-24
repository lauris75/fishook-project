import { useState, useEffect, useRef, useContext } from "react";
import "./TopBar.scss";
import PhishingIcon from '@mui/icons-material/Phishing';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import LogoutIcon from '@mui/icons-material/Logout';
import { AuthContext } from "../../context/AuthContext.js"; 
import { Link, useNavigate } from "react-router-dom";
import SearchDropdown from "../searchDropdown/SearchDropdown";

const TopBar = () => {
  const { logout, api } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const searchContainerRef = useRef(null);
  const searchDebounceRef = useRef(null);
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setDropdownVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  
  useEffect(() => {
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }
    
    if (!searchQuery || searchQuery.trim().length < 3) {
      setSearchResults([]);
      setLoading(false);
      return;
    }
    
    setLoading(true);
    
    searchDebounceRef.current = setTimeout(async () => {
      try {
        const response = await api.get(`/search/users?query=${encodeURIComponent(searchQuery.trim())}&limit=7`);
        setSearchResults(response.data);
        setDropdownVisible(true);
      } catch (error) {
        console.error("Error searching users:", error);
        setSearchResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    
    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }
    };
  }, [searchQuery, api]);

  const handleSearchInputChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (query.trim().length >= 3) {
      setDropdownVisible(true);
    } else {
      setDropdownVisible(false);
    }
  };
  
  const handleSearchInputFocus = () => {
    if (searchQuery.trim().length >= 3) {
      setDropdownVisible(true);
    }
  };
  
  const handleClearSearch = () => {
    setSearchQuery("");
    setDropdownVisible(false);
  };
  
  const handleSelectUser = () => {
    setSearchQuery("");
    setDropdownVisible(false);
  };
  
  const handleLogout = () => {
    logout();
    navigate("/login");
  };
  
  return (
    <div className="topBar">
      <div className="left">
        <Link to="/" style={{textDecoration:"none"}}>Fishook<PhishingIcon style={{ fontSize: 40 }}/></Link>
      </div>
      <div className="center" ref={searchContainerRef}>
        <div className="search-container">
          <SearchIcon className="search-icon" />
          <input 
            type="text" 
            placeholder="Search users..." 
            value={searchQuery}
            onChange={handleSearchInputChange}
            onFocus={handleSearchInputFocus}
          />
          {searchQuery && (
            <button className="clear-button" onClick={handleClearSearch}>
              <ClearIcon />
            </button>
          )}
          <SearchDropdown 
            users={searchResults} 
            loading={loading} 
            visible={dropdownVisible} 
            onSelect={handleSelectUser}
          />
        </div>
      </div>
      <div className="right">
        <div className="logoutContainer" onClick={handleLogout} style={{cursor: "pointer"}}>
          <span>Log out</span><LogoutIcon style={{ fontSize: 40 }}/>
        </div>
      </div>
    </div>
  );
};

export default TopBar;