import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { api } from "../context/AuthContext";
import InfoCard from "../components/infoCard/InfoCard";
import "./Fish.scss";

const Fish = () => {
  const { id } = useParams();
  const [fishData, setFishData] = useState(null);
  const [allFish, setAllFish] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFishData = async () => {
      try {
        if (id) {
          const response = await api.get(`/fish/${id}`);
          setFishData(response.data);
        } else {
          const response = await api.get("/fish");
          setAllFish(response.data);
        }
        setLoading(false);
      } catch (err) {
        setError(err.message || "Failed to fetch fish information");
        setLoading(false);
      }
    };

    fetchFishData();
  }, [id]);

  if (loading) return <div className="fish-page">Loading fish information...</div>;
  if (error) return <div className="fish-page">Error: {error}</div>;

  if (id && fishData) {
    return (
      <div className="fish-page single-view">
        <InfoCard
          image={fishData.photoURL}
          title={fishData.summary.split(' ').slice(0, 3).join(' ')}
          summary={fishData.summary}
          description={fishData.description}
        />
      </div>
    );
  }

  return (
    <div className="fish-page list-view">
      <h1>Fish Species</h1>
      <p className="page-description">Learn about different fish species, their habits, and characteristics.</p>
      
      <div className="fish-grid">
        {allFish.map((fish) => (
          <div className="fish-card" key={fish.id} onClick={() => window.location.href = `/fish/${fish.id}`}>
            <div className="fish-image">
              <img src={fish.photoURL} alt={fish.summary} />
            </div>
            <div className="fish-info">
              <h3>{fish.summary.split(' ').slice(0, 3).join(' ')}</h3>
              <p>{fish.summary.substring(0, 100)}...</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Fish;