import Post from "../postContent/PostContent.jsx";
import PostForm from "../postForm/PostForm.jsx";
import "./Posts.scss";
import { useState, useEffect, useContext } from "react";
import { api } from "../../context/AuthContext";
import { AuthContext } from "../../context/AuthContext";

const Posts = ({ userId, groupId }) => {
  const { currentUser } = useContext(AuthContext);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Determine if we're viewing the current user's profile
  const isOwnProfile = userId ? parseInt(userId) === currentUser.id : true;

  useEffect(() => {
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

    fetchPosts();
  }, [userId, groupId, currentUser.id]); // Added currentUser.id as a dependency

  const handlePostCreated = (newPost) => {
    // Add the new post to the top of the posts list
    setPosts(prevPosts => [newPost, ...prevPosts]);
  };

  if (loading) return <div className="posts">Loading posts...</div>;
  if (error) return <div className="posts">Error: {error}</div>;

  return (
    <div className="posts">
      {/* Post creation form - only show on own profile or in groups */}
      <PostForm 
        groupId={groupId} 
        onPostCreated={handlePostCreated}
        isOwnProfile={isOwnProfile} 
      />
      
      {/* List of posts */}
      {posts.map(post => (
        <Post post={post} key={post.id} />
      ))}
    </div>
  );
};

export default Posts;