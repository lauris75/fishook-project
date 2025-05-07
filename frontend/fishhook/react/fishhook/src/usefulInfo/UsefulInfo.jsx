import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { api } from "../context/AuthContext";
import InfoCard from "../components/infoCard/InfoCard";
import SearchFilter from "../components/searchFilter/SearchFilter";
import "./UsefulInfo.scss";

const UsefulInfo = () => {
  const { id } = useParams();
  const [infoData, setInfoData] = useState(null);
  const [allInfo, setAllInfo] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredInfo, setFilteredInfo] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState("all");
  
  // This could be expanded to real categories from the backend
  // For now, we'll just extract categories from the data
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchInfoData = async () => {
      try {
        if (id) {
          const response = await api.get(`/UsefulInformation/${id}`);
          setInfoData(response.data);
        } else {
          const response = await api.get("/UsefulInformation");
          setAllInfo(response.data);
          setFilteredInfo(response.data);
          
          // Extract "categories" from data based on first word of name or something similar
          // This is just a placeholder - ideally categories would come from the backend
          const extractedCategories = Array.from(
            new Set(
              response.data.map(info => {
                // Use first word of name as a simple category
                const firstWord = info.name.split(' ')[0].toLowerCase();
                return firstWord;
              })
            )
          );
          
          setCategories(
            extractedCategories.map(cat => ({
              value: cat,
              label: cat.charAt(0).toUpperCase() + cat.slice(1)
            }))
          );
        }
        setLoading(false);
      } catch (err) {
        setError(err.message || "Failed to fetch information");
        setLoading(false);
      }
    };

    fetchInfoData();
  }, [id]);

  // Filter information based on search query and category
  useEffect(() => {
    let filtered = allInfo;
    
    // Apply search filter
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        info =>
          info.name.toLowerCase().includes(query) ||
          info.summary.toLowerCase().includes(query)
      );
    }
    
    // Apply category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter(
        info => info.name.toLowerCase().startsWith(categoryFilter.toLowerCase())
      );
    }
    
    setFilteredInfo(filtered);
  }, [searchQuery, categoryFilter, allInfo]);

  const handleFilterChange = (filter) => {
    setCategoryFilter(filter);
  };

  if (loading) return <div className="useful-info-page">Loading information...</div>;
  if (error) return <div className="useful-info-page">Error: {error}</div>;

  if (id && infoData) {
    return (
      <div className="useful-info-page single-view">
        <InfoCard
          image={infoData.photoURL}
          title={infoData.summary.split(' ').slice(0, 4).join(' ')}
          name={infoData.name}
          summary={infoData.summary}
          description={infoData.description}
        />
      </div>
    );
  }

  return (
    <div className="useful-info-page list-view">
      <h1>Fishing Tips & Knowledge</h1>
      <p className="page-description">Discover useful techniques, guidelines, and knowledge to improve your fishing experience.</p>
      
      <SearchFilter 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        placeholder="Search fishing tips and techniques..."
        filterOptions={categories.length > 0 ? categories : null}
        selectedFilter={categoryFilter}
        onFilterChange={handleFilterChange}
      />
      
      {filteredInfo.length === 0 ? (
        <div className="no-results">
          <p>No fishing information found matching "{searchQuery}"</p>
          <button onClick={() => {
            setSearchQuery("");
            setCategoryFilter("all");
          }}>Clear filters</button>
        </div>
      ) : (
        <div className="info-grid">
          {filteredInfo.map((info) => (
            <div className="info-card-preview" key={info.id} onClick={() => window.location.href = `/usefulinfo/${info.id}`}>
              <div className="info-image">
                <img src={info.photoURL} alt={info.name} />
              </div>
              <div className="info-preview">
                <h3>{info.name}</h3>
                <p>{info.summary.substring(0, 120)}...</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UsefulInfo;