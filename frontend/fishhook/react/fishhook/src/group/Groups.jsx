import React, { useState, useEffect } from "react";
import { api } from "../context/AuthContext";
import SearchFilter from "../components/searchFilter/SearchFilter";
import GroupForm from "../components/groupForm/GroupForm";
import "./Groups.scss";

const Groups = () => {
  const [allGroups, setAllGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredGroups, setFilteredGroups] = useState([]);
  
  const handleGroupCreated = (newGroup) => {
    // Add the new group to the list
    setAllGroups(prevGroups => [newGroup, ...prevGroups]);
    setFilteredGroups(prevGroups => [newGroup, ...prevGroups]);
  };
  
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await api.get("/group");
        setAllGroups(response.data);
        setFilteredGroups(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.message || "Failed to fetch groups");
        setLoading(false);
      }
    };

    fetchGroups();
  }, []);

  // Filter groups based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredGroups(allGroups);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = allGroups.filter(
        group => group.groupName.toLowerCase().includes(query) || 
                (group.summary && group.summary.toLowerCase().includes(query))
      );
      setFilteredGroups(filtered);
    }
  }, [searchQuery, allGroups]);

  if (loading) return <div className="groups-page">Loading groups...</div>;
  if (error) return <div className="groups-page">Error: {error}</div>;

  return (
    <div className="groups-page list-view">
      <h1>Fishing Groups</h1>
      <p className="page-description">Join fishing communities, share experiences, and connect with other anglers.</p>
      
      {/* Group creation form */}
      <GroupForm onGroupCreated={handleGroupCreated} />
      
      <SearchFilter 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        placeholder="Search fishing groups..."
      />
      
      {filteredGroups.length === 0 ? (
        <div className="no-results">
          <p>No groups found matching "{searchQuery}"</p>
          <button onClick={() => setSearchQuery("")}>Clear search</button>
        </div>
      ) : (
        <div className="groups-grid">
          {filteredGroups.map((group) => (
            <div className="group-card" key={group.id} onClick={() => window.location.href = `/group/${group.id}`}>
              <div className="group-image">
                <img 
                  src={group.photoURL || "https://images.unsplash.com/photo-1592929043000-fbea34bc8ad5?auto=format&fit=crop&w=1170&q=80"} 
                  alt={group.groupName} 
                />
              </div>
              <div className="group-info">
                <h3>{group.groupName}</h3>
                <p>{group.summary ? group.summary.substring(0, 120) + "..." : "No description available."}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Groups;