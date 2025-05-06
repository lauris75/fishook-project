import Post from "../postContent/PostContent.jsx";
import "./Posts.scss";
import { useState, useEffect } from "react";
import { api } from "../../context/AuthContext";

const Posts = ({ userId }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        let response;
        
        if (userId) {
          response = await api.get(`/userPost/userPosts/${userId}`);
        } else {
          response = await api.get('/userPost');
        }
        
        setPosts(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.message || "Failed to fetch posts");
        setLoading(false);
      }
    };

    fetchPosts();
  }, [userId]);

  if (loading) return <div className="posts">Loading posts...</div>;
  if (error) return <div className="posts">Error: {error}</div>;
  if (posts.length === 0) return <div className="posts">No posts found</div>;

  return (
    <div className="posts">
      {posts.map(post => (
        <Post post={post} key={post.id} />
      ))}
    </div>
  );
};

export default Posts;