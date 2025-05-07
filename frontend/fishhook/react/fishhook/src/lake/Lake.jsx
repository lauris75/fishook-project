import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { api } from "../context/AuthContext";
import InfoCard from "../components/infoCard/InfoCard";
import SearchFilter from "../components/searchFilter/SearchFilter";
import "./Lake.scss";

const Lake = () => {
  const { id } = useParams();
  const [lakeData, setLakeData] = useState(null);
  const [allLakes, setAllLakes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredLakes, setFilteredLakes] = useState([]);

  useEffect(() => {
    const fetchLakeData = async () => {
      try {
        if (id) {
          const response = await api.get(`/lake/${id}`);
          setLakeData(response.data);
        } else {
          const response = await api.get("/lake");
          setAllLakes(response.data);
          setFilteredLakes(response.data);
        }
        setLoading(false);
      } catch (err) {
        setError(err.message || "Failed to fetch lake information");
        setLoading(false);
      }
    };

    fetchLakeData();
  }, [id]);

  // Filter lakes based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredLakes(allLakes);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = allLakes.filter(
        lake =>
          lake.name.toLowerCase().includes(query) ||
          lake.summary.toLowerCase().includes(query) ||
          lake.latitude.toLowerCase().includes(query) ||
          lake.longitude.toLowerCase().includes(query)
      );
      setFilteredLakes(filtered);
    }
  }, [searchQuery, allLakes]);

  if (loading) return <div className="lake-page">Loading lake information...</div>;
  if (error) return <div className="lake-page">Error: {error}</div>;

  if (id && lakeData) {
    return (
      <div className="lake-page single-view">
        <InfoCard
          image={lakeData.photoURL}
          title={lakeData.summary.split(' ').slice(0, 3).join(' ')}
          name={lakeData.name}
          summary={lakeData.summary}
          description={lakeData.description}
          coords={{
            latitude: lakeData.latitude,
            longitude: lakeData.longitude
          }}
        />
      </div>
    );
  }

  return (
    <div className="lake-page list-view">
      <h1>Fishing Lakes</h1>
      <p className="page-description">Discover great lakes for fishing, their locations, and what fish you might catch there.</p>
      
      <SearchFilter 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        placeholder="Search lakes by name, location or description..."
      />
      
      {filteredLakes.length === 0 ? (
        <div className="no-results">
          <p>No lakes found matching "{searchQuery}"</p>
          <button onClick={() => setSearchQuery("")}>Clear search</button>
        </div>
      ) : (
        <div className="lake-grid">
          {filteredLakes.map((lake) => (
            <div className="lake-card" key={lake.id} onClick={() => window.location.href = `/lake/${lake.id}`}>
              <div className="lake-image">
                <img src={lake.photoURL} alt={lake.name} />
              </div>
              <div className="lake-info">
                <h3>{lake.name}</h3>
                <p>{lake.summary.substring(0, 100)}...</p>
                <div className="lake-coords">
                  <span>Lat: {lake.latitude}</span> • <span>Long: {lake.longitude}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Lake;