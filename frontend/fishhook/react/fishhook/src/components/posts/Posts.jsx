import Post from "../postContent/PostContent.jsx";
import PostForm from "../postForm/PostForm.jsx";
import "./Posts.scss";
import { useState, useEffect } from "react";
import { api } from "../../context/AuthContext";

const Posts = ({ userId, groupId }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPosts = async () => {
    try {
      let endpoint = '/userPost';
      
      // If userId is provided, fetch posts for that specific user
      if (userId) {
        endpoint = `/userPost/userPosts/${userId}`;
      }
      
      // If groupId is provided, fetch posts for that specific group
      if (groupId) {
        endpoint = `/userPost/groupPosts/${groupId}`;
      }
      
      const response = await api.get(endpoint);
      setPosts(response.data);
      setLoading(false);
    } catch (err) {
      setError(err.message || "Failed to fetch posts");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [userId, groupId]);

  const handlePostCreated = (newPost) => {
    // Add the new post to the top of the posts list
    setPosts(prevPosts => [newPost, ...prevPosts]);
  };

  if (loading) return <div className="posts">Loading posts...</div>;
  if (error) return <div className="posts">Error: {error}</div>;

  return (
    <div className="posts">
      {/* Post creation form */}
      <PostForm 
        groupId={groupId} 
        onPostCreated={handlePostCreated} 
      />
      
      {/* List of posts */}
      {posts.map(post => (
        <Post post={post} key={post.id} />
      ))}
    </div>
  );
};

export default Posts;