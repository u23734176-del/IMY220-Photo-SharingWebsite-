// src/Pages/PostPage.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Post from '../components/Post';
import CreatePostForm from '../components/createPostForm';
import FeedFilters from '../components/FeedFilters';
import { getPostId, filterAndSortPosts } from '../utils/feedUtils';

const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB (the server enforces the same limit)

function Posts({ username, posts = [], setPosts, onAddPost, onUpdatePost }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [activityFilter, setActivityFilter] = useState("newest");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // /posts/:id shows that user's posts; /posts shows the logged-in user's
  const activeAuthor = id || username;
  const isOwnPage = !id || id === username;

  // ---------- LOAD THIS USER'S POSTS ----------
  useEffect(() => {
    async function fetchUserPosts() {
      if (!activeAuthor) return;

      setIsLoading(true);
      setError("");
      try {
        const response = await fetch(`/api/posts/user/${encodeURIComponent(activeAuthor)}`);
        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.error || "Failed to load posts.");
        }

        const data = await response.json();
        const userPosts = Array.isArray(data) ? data : data.posts || [];

        if (setPosts) {
          setPosts((prev) => {
            const uniqueMap = new Map();
            [...userPosts, ...prev].forEach((p) => {
              const pId = getPostId(p);
              if (pId && !uniqueMap.has(pId)) uniqueMap.set(pId, p);
            });
            return Array.from(uniqueMap.values());
          });
        }
      } catch (err) {
        console.error("Error loading user posts:", err);
        setError("Could not retrieve user posts from server.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchUserPosts();
  }, [activeAuthor, setPosts]);

  // ---------- CREATE A POST (POST /api/posts, multipart/form-data) ----------
  // Returns true when the post was saved, so the form knows it can clear itself
  const handleAddPost = async (newPostData = {}) => {
    if (!username) {
      setError("You must be logged in to create a post.");
      return false;
    }
    if (isPosting) return false;

    const caption = String(newPostData.caption || "").trim();
    if (!caption) {
      setError("Please write a caption for your post.");
      return false;
    }

    const imageFile = newPostData.imageFile;
    if (imageFile && imageFile.size > MAX_IMAGE_BYTES) {
      setError("Image is too large (max 5 MB).");
      return false;
    }

    setIsPosting(true);
    setError("");
    setSuccess("");

    try {
      const tags = newPostData.hashTags ?? newPostData.hashtags ?? newPostData.tags ?? "";

      // FormData is how a file travels to the server.
      // Do NOT set a Content-Type header: the browser adds it (with the boundary).
      const formData = new FormData();
      formData.append("username", username);
      formData.append("caption", caption);
      formData.append("category", newPostData.category || "Nature");
      formData.append("hashTags", Array.isArray(tags) ? tags.join(" ") : String(tags));

      if (imageFile instanceof File) {
        formData.append("image", imageFile); // field name must be "image"
      } else if (newPostData.imageURL) {
        formData.append("imageURL", String(newPostData.imageURL).trim());
      }

      const response = await fetch("/api/posts", {
        method: "POST",
        body: formData,
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Failed to create post.");

      if (onAddPost) {
        onAddPost(data.post);
      } else if (setPosts) {
        setPosts((prevPosts) => [data.post, ...prevPosts]);
      }

      setSuccess("Post created!");
      return true;
    } catch (err) {
      console.error("Error creating post on server:", err);
      setError(err.message || "Could not create post.");
      return false;
    } finally {
      setIsPosting(false);
    }
  };

  // Local state only. Post.jsx already makes its own server calls.
  const handleUpdatePost = (updatedPost) => {
    const postId = getPostId(updatedPost);
    if (onUpdatePost) {
      onUpdatePost(updatedPost);
    } else if (setPosts) {
      setPosts((prevPosts) =>
        prevPosts.map((p) => (getPostId(p) === postId ? updatedPost : p))
      );
    }
  };

  // Remove a deleted post from local state (the server delete happens in Post.jsx)
  const handleDeletePost = (deletedId) => {
    if (setPosts) {
      setPosts((prevPosts) => prevPosts.filter((p) => getPostId(p) !== deletedId));
    }
  };

  // ---------- FILTER + SORT THIS USER'S POSTS ----------
  const userPosts = filterAndSortPosts(
    posts.filter((post) => post.author === activeAuthor),
    { category: categoryFilter, activity: activityFilter }
  );

  // Shown when nobody is logged in and no user is in the URL
  if (!activeAuthor) {
    return (
      <main>
        <h2>Posts</h2>
        <p>You are not logged in. Please log in to view and create posts.</p>
        <button type="button" onClick={() => navigate("/login")}>
          Go to Login
        </button>
        <button type="button" onClick={() => navigate("/signUp")}>
          Create an Account
        </button>
      </main>
    );
  }

  return (
    <main>
      <h2>Posts by {activeAuthor}</h2>

      {/* Only let a user create posts on their own page */}
      {isOwnPage && (
        <CreatePostForm onAddPost={handleAddPost} currentUser={username} />
      )}
      {isPosting && <p>Posting...</p>}

      <hr />

      <div>
        <button type="button" onClick={() => navigate("/profile")}>
          My Profile ({username || "Guest"})
        </button>
      </div>

      <FeedFilters
        selectedActivity={activityFilter}
        onActivityChange={setActivityFilter}
        selectedCategory={categoryFilter}
        onCategoryChange={setCategoryFilter}
      />

      <hr />

      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}
      {isLoading && <p>Loading user posts...</p>}

      <section>
        {!isLoading && userPosts.length > 0 ? (
          userPosts.map((postItem) => (
            <Post
              key={getPostId(postItem)}
              post={postItem}
              onUpdatePost={handleUpdatePost}
              onDeletePost={handleDeletePost}
              currentUser={username}
              isEditable={isOwnPage}
            />
          ))
        ) : (
          !isLoading && (
            <p>{categoryFilter ? "No posts match this category." : "No posts found for this user."}</p>
          )
        )}
      </section>
    </main>
  );
}

export default Posts;