import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { api } from "../context/AuthContext";
import InfoCard from "../components/infoCard/InfoCard";
import SearchFilter from "../components/searchFilter/SearchFilter";
import "./Lake.scss";

const Lake = () => {
  const { id } = useParams();
  const [lakeData, setLakeData] = useState(null);
  const [relatedFish, setRelatedFish] = useState([]);
  const [allLakes, setAllLakes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredLakes, setFilteredLakes] = useState([]);

  useEffect(() => {
    const fetchLakeData = async () => {
      try {
        if (id) {
          // Get lake with related fish
          const response = await api.get(`/lake/${id}/withFish`);
          setLakeData(response.data);
          
          // If lake has fishes property and it's an array
          if (response.data.fishes && Array.isArray(response.data.fishes)) {
            // Sort fish alphabetically by name
            const sortedFish = [...response.data.fishes].sort((a, b) => 
              a.name.localeCompare(b.name)
            );
            setRelatedFish(sortedFish);
          } else {
            // Alternatively fetch lake-fish associations
            try {
              const lakeFishResponse = await api.get(`/lakeFish/lake/${id}`);
              if (lakeFishResponse.data && lakeFishResponse.data.length > 0) {
                // Get fish details for each association
                const fishPromises = lakeFishResponse.data.map(lakeFish => 
                  api.get(`/fish/${lakeFish.fishId}`)
                );
                const fishResponses = await Promise.all(fishPromises);
                const fishList = fishResponses.map(res => res.data);
                
                // Sort fish alphabetically by name
                const sortedFish = [...fishList].sort((a, b) => 
                  a.name.localeCompare(b.name)
                );
                setRelatedFish(sortedFish);
              }
            } catch (lakeFishErr) {
              console.error("Error fetching lake-fish associations:", lakeFishErr);
            }
          }
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
        
        {/* Related Fish Section */}
        <div className="related-section">
          <h2>Fish species found in this lake:</h2>
          
          {relatedFish.length === 0 ? (
            <p className="no-related-items">No fish species recorded for this lake yet.</p>
          ) : (
            <div className="related-items-grid">
              {relatedFish.map((fish) => (
                <div className="fish-card" key={fish.id} onClick={() => window.location.href = `/fish/${fish.id}`}>
                  <div className="fish-image">
                    <img src={fish.photoURL} alt={fish.name} />
                  </div>
                  <div className="fish-info">
                    <h3>{fish.name}</h3>
                    <p>{fish.summary.substring(0, 100)}...</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
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