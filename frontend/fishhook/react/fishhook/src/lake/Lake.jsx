import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { api } from "../context/AuthContext";
import InfoCard from "../components/infoCard/InfoCard";
import "./Lake.scss";

const Lake = () => {
  const { id } = useParams();
  const [lakeData, setLakeData] = useState(null);
  const [allLakes, setAllLakes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLakeData = async () => {
      try {
        if (id) {
          const response = await api.get(`/lake/${id}`);
          setLakeData(response.data);
        } else {
          const response = await api.get("/lake");
          setAllLakes(response.data);
        }
        setLoading(false);
      } catch (err) {
        setError(err.message || "Failed to fetch lake information");
        setLoading(false);
      }
    };

    fetchLakeData();
  }, [id]);

  if (loading) return <div className="lake-page">Loading lake information...</div>;
  if (error) return <div className="lake-page">Error: {error}</div>;

  if (id && lakeData) {
    return (
      <div className="lake-page single-view">
        <InfoCard
          image={lakeData.photoURL}
          title={lakeData.summary.split(' ').slice(0, 3).join(' ')}
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
      
      <div className="lake-grid">
        {allLakes.map((lake) => (
          <div className="lake-card" key={lake.id} onClick={() => window.location.href = `/lake/${lake.id}`}>
            <div className="lake-image">
              <img src={lake.photoURL} alt={lake.summary} />
            </div>
            <div className="lake-info">
              <h3>{lake.summary.split(' ').slice(0, 3).join(' ')}</h3>
              <p>{lake.summary.substring(0, 100)}...</p>
              <div className="lake-coords">
                <span>Lat: {lake.latitude}</span> • <span>Long: {lake.longitude}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Lake;