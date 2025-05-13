import { Link } from "react-router-dom";
import "./SearchDropdown.scss";

const SearchDropdown = ({ users, loading, visible, onSelect }) => {
  if (!visible) return null;

  return (
    <div className="search-dropdown">
      {loading ? (
        <div className="search-loading">Searching...</div>
      ) : users.length === 0 ? (
        <div className="no-results">No users found</div>
      ) : (
        <div className="results-container">
          {users.map((user) => (
            <Link 
              key={user.id} 
              to={`/profile/${user.id}`}
              className="user-item"
              onClick={() => onSelect && onSelect()}
            >
              <img 
                src={user.profilePicture} 
                alt={`${user.name}'s profile`} 
                className="user-avatar" 
              />
              <div className="user-info">
                <span className="user-name">{user.name} {user.lastname}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchDropdown;