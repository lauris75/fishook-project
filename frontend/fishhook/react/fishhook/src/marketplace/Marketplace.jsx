import { useState, useEffect } from "react";
import { api } from "../context/AuthContext";
import "./Marketplace.scss";
import MarketPostForm from "../components/marketPostForm/MarketPostForm";
import MarketPostCard from "../components/marketPostCard/MarketPostCard";
import SearchFilter from "../components/searchFilter/SearchFilter";

const Marketplace = () => {
  const [marketPosts, setMarketPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        const postsResponse = await api.get("/market");
        setMarketPosts(postsResponse.data);
        setFilteredPosts(postsResponse.data);
        
        const categoriesResponse = await api.get("/category");
        
        const categoryOptions = categoriesResponse.data.map(category => ({
          value: category.id.toString(),
          label: category.name
        }));
        
        setCategories(categoryOptions);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching marketplace data:", err);
        setError(err.message || "Failed to fetch marketplace data");
        setLoading(false);
      }
    };
    
    fetchMarketData();
  }, []);
  
  useEffect(() => {
    let filtered = marketPosts;
    
    if (selectedCategory !== "all") {
      filtered = filtered.filter(post => post.categoryId.toString() === selectedCategory);
    }
    
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(post => 
        (post.content && post.content.toLowerCase().includes(query))
      );
    }
    
    setFilteredPosts(filtered);
  }, [selectedCategory, searchQuery, marketPosts]);
  
  const handlePostCreated = (newPost) => {
    setMarketPosts(prevPosts => [newPost, ...prevPosts]);
    
    setSearchQuery("");
    setSelectedCategory("all");
  };
  
  const handlePostDeleted = (postId) => {
    setMarketPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
    setFilteredPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
  };
  
  const handleCategoryChange = (value) => {
    setSelectedCategory(value);
  };
  
  if (loading) return <div className="marketplace">Loading marketplace...</div>;
  if (error) return <div className="marketplace">Error: {error}</div>;
  
  return (
    <div className="marketplace">
      <h1>Fishing Gear Marketplace</h1>
      <p className="marketplace-description">Buy and sell fishing equipment, boats, and accessories</p>
      
      <MarketPostForm 
        categories={categories} 
        onPostCreated={handlePostCreated} 
      />
      
      <div className="filter-container">
        <SearchFilter 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          placeholder="Search listings..."
          filterOptions={categories.length > 0 ? categories : null}
          selectedFilter={selectedCategory}
          onFilterChange={handleCategoryChange}
        />
      </div>
      
      {filteredPosts.length === 0 ? (
        <div className="no-posts">
          <p>No marketplace listings found</p>
          {(searchQuery || selectedCategory !== "all") && (
            <button onClick={() => {
              setSearchQuery("");
              setSelectedCategory("all");
            }}>
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="market-posts-grid">
          {filteredPosts.map(post => (
            <MarketPostCard 
              key={post.id} 
              post={post} 
              onPostDeleted={handlePostDeleted}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Marketplace;