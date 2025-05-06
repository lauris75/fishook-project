import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { api } from "../context/AuthContext";
import InfoCard from "../components/infoCard/InfoCard";
import "./UsefulInfo.scss";

const UsefulInfo = () => {
  const { id } = useParams();
  const [infoData, setInfoData] = useState(null);
  const [allInfo, setAllInfo] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInfoData = async () => {
      try {
        if (id) {
          const response = await api.get(`/UsefulInformation/${id}`);
          setInfoData(response.data);
        } else {
          const response = await api.get("/UsefulInformation");
          setAllInfo(response.data);
        }
        setLoading(false);
      } catch (err) {
        setError(err.message || "Failed to fetch information");
        setLoading(false);
      }
    };

    fetchInfoData();
  }, [id]);

  if (loading) return <div className="useful-info-page">Loading information...</div>;
  if (error) return <div className="useful-info-page">Error: {error}</div>;

  if (id && infoData) {
    return (
      <div className="useful-info-page single-view">
        <InfoCard
          image={infoData.photoURL}
          title={infoData.summary.split(' ').slice(0, 4).join(' ')} 
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
      
      <div className="info-grid">
        {allInfo.map((info) => (
          <div className="info-card-preview" key={info.id} onClick={() => window.location.href = `/usefulinfo/${info.id}`}>
            <div className="info-image">
              <img src={info.photoURL} alt={info.summary} />
            </div>
            <div className="info-preview">
              <h3>{info.summary.split(' ').slice(0, 4).join(' ')}</h3>
              <p>{info.summary.substring(0, 120)}...</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UsefulInfo;