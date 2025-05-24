import Post from "../postContent/PostContent.jsx";
import PostForm from "../postForm/PostForm.jsx";
import "./Posts.scss";
import { useState, useEffect, useContext } from "react";
import { api } from "../../context/AuthContext";
import { AuthContext } from "../../context/AuthContext";

const Posts = ({ userId, groupId, showAllPosts = false }) => {
  const { currentUser } = useContext(AuthContext);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const isOwnProfile = userId ? parseInt(userId) === currentUser.id : true;

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        let endpoint = '/userPost';
        
        if (userId) {
          endpoint = `/userPost/userPosts/${userId}`;
        }
        else if (groupId) {
          endpoint = `/userPost/groupPosts/${groupId}`;
        }
        else if (showAllPosts) {
          endpoint = '/userPost/all';
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
  }, [userId, groupId, currentUser.id, showAllPosts]);

  const handlePostCreated = (newPost) => {
    setPosts(prevPosts => [newPost, ...prevPosts]);
  };
  
  const handlePostDeleted = (postId) => {
    setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
  };

  if (loading) return <div className="posts">Loading posts...</div>;
  if (error) return <div className="posts">Error: {error}</div>;

  return (
    <div className="posts">
      <PostForm 
        groupId={groupId} 
        onPostCreated={handlePostCreated}
        isOwnProfile={isOwnProfile} 
      />
      
      {posts.length === 0 ? (
        <div className="no-posts">
          <p>No posts to display</p>
        </div>
      ) : (
        posts.map(post => (
          <Post 
            post={post} 
            key={post.id} 
            onPostDeleted={handlePostDeleted}
          />
        ))
      )}
    </div>
  );
};

export default Posts;