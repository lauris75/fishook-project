import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { api } from "../context/AuthContext";
import { useAdmin } from "../hooks/useAdmin";
import InfoCard from "../components/infoCard/InfoCard";
import SearchFilter from "../components/searchFilter/SearchFilter";
import FishEditButton from "../components/fishEditButton/FishEditButton";
import FishLakeManager from "../components/fishLakeManager/FishLakeManager";
import "./Fish.scss";

const Fish = () => {
  const { id } = useParams();
  const { isAdmin } = useAdmin();
  const [fishData, setFishData] = useState(null);
  const [relatedLakes, setRelatedLakes] = useState([]);
  const [allFish, setAllFish] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredFish, setFilteredFish] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (id) {
          const response = await api.get(`/fish/${id}/withLakes`);
          setFishData(response.data);
          
          if (response.data.lakes && Array.isArray(response.data.lakes)) {
            const sortedLakes = [...response.data.lakes].sort((a, b) => 
              a.name.localeCompare(b.name)
            );
            setRelatedLakes(sortedLakes);
          } else {
            try {
              const lakeFishResponse = await api.get(`/lakeFish/fish/${id}`);
              if (lakeFishResponse.data && lakeFishResponse.data.length > 0) {
                const lakePromises = lakeFishResponse.data.map(lakeFish => 
                  api.get(`/lake/${lakeFish.lakeId}`)
                );
                const lakeResponses = await Promise.all(lakePromises);
                const lakes = lakeResponses.map(res => res.data);
                
                const sortedLakes = [...lakes].sort((a, b) => 
                  a.name.localeCompare(b.name)
                );
                setRelatedLakes(sortedLakes);
              }
            } catch (lakeFishErr) {
              console.error("Error fetching lake-fish associations:", lakeFishErr);
            }
          }
        } else {
          const response = await api.get("/fish");
          setAllFish(response.data);
          setFilteredFish(response.data);
        }
        setLoading(false);
      } catch (err) {
        setError(err.message || "Failed to fetch fish information");
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  useEffect(() => {
    if (!id && searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      const filtered = allFish.filter(
        fish =>
          fish.name.toLowerCase().includes(query) ||
          fish.summary.toLowerCase().includes(query)
      );
      setFilteredFish(filtered);
    } else if (!id) {
      setFilteredFish(allFish);
    }
  }, [searchQuery, allFish, id]);

  const handleFishUpdated = (updatedFish) => {
    setFishData(prev => ({
      ...prev,
      name: updatedFish.name,
      summary: updatedFish.summary,
      description: updatedFish.description
    }));
  };
  
  const handleAssociationsChanged = (action, changedLake) => {
    if (action === 'add') {
      setRelatedLakes(prev => {
        const updated = [...prev, changedLake];
        return updated.sort((a, b) => a.name.localeCompare(b.name));
      });
    } else if (action === 'remove') {
      setRelatedLakes(prev => 
        prev.filter(lake => lake.id !== changedLake.id)
      );
    }
    
    setFishData(prev => {
      if (!prev.lakes) {
        prev.lakes = [];
      }
      
      if (action === 'add') {
        const updatedLakes = [...prev.lakes, changedLake];
        return {
          ...prev,
          lakes: updatedLakes
        };
      } else if (action === 'remove') {
        return {
          ...prev,
          lakes: prev.lakes.filter(lake => lake.id !== changedLake.id)
        };
      }
      
      return prev;
    });
  };

  if (loading) return <div className="fish-page">Loading fish information...</div>;
  if (error) return <div className="fish-page">Error: {error}</div>;

  if (id && fishData) {
    return (
      <div className="fish-page single-view">
        <InfoCard
          image={fishData.photoURL}
          title={fishData.summary.split(' ').slice(0, 3).join(' ')}
          name={fishData.name}
          summary={fishData.summary}
          description={fishData.description}
        />
        
        {isAdmin && (
          <div className="admin-actions">
            <FishEditButton fish={fishData} onFishUpdated={handleFishUpdated} />
            <FishLakeManager 
              fish={{...fishData, lakes: relatedLakes}} 
              onAssociationsChanged={handleAssociationsChanged} 
            />
          </div>
        )}
        
        <div className="related-section">
          <h2>This fish can be found in these lakes:</h2>
          
          {relatedLakes.length === 0 ? (
            <p className="no-related-items">No lakes recorded for this fish species yet.</p>
          ) : (
            <div className="related-items-grid">
              {relatedLakes.map((lake) => (
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
      </div>
    );
  }

  return (
    <div className="fish-page list-view">
      <h1>Fish Species</h1>
      <p className="page-description">Learn about different fish species, their habits, and characteristics.</p>
      
      <SearchFilter 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        placeholder="Search fish species..."
      />
      
      {filteredFish.length === 0 ? (
        <div className="no-results">
          <p>No fish species found matching "{searchQuery}"</p>
          <button onClick={() => setSearchQuery("")}>Clear search</button>
        </div>
      ) : (
        <div className="fish-grid">
          {filteredFish.map((fish) => (
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
  );
};

export default Fish;