// src/Pages/HomePage.jsx
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Post from '../components/Post';
import HomeHeader from '../components/HomeHeader';
import FeedFilters from '../components/FeedFilters';
import ProfilePreview from '../components/ProfilePreview';
import { getPostId, filterAndSortPosts } from '../utils/feedUtils';

const displayName = (u) => [u?.firstname, u?.surname].filter(Boolean).join(" ");

const OVERLAY_STYLE = {
  position: "fixed",
  inset: 0,
  background: "rgba(0, 0, 0, 0.5)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
};

const MODAL_STYLE = {
  background: "#fff",
  color: "#222",
  padding: "20px",
  borderRadius: "8px",
  width: "min(420px, 90vw)",
  maxHeight: "85vh",
  overflowY: "auto",
};

function HomePage({ username, posts = [], setPosts, onUpdatePost }) {
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [activityFilter, setActivityFilter] = useState("newest");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // The user whose profile preview popup is open (null = closed)
  const [previewUser, setPreviewUser] = useState(null);

  // User search results are stored with the query they belong to,
  // so stale results never show for a newer search
  const [userResult, setUserResult] = useState({ query: "", users: [], error: "" });

  const query = searchQuery.trim();

  // ---------- LOAD THE GLOBAL FEED ----------
  // Fresh server data wins over anything already in state.
  useEffect(() => {
    async function fetchAllPosts() {
      setIsLoading(true);
      setError("");
      try {
        const response = await fetch("/api/posts");
        if (!response.ok) {
          throw new Error("Failed to fetch feed posts.");
        }
        const data = await response.json();
        const loadedPosts = Array.isArray(data) ? data : data.posts || [];

        if (setPosts) {
          setPosts((prevPosts) => {
            const uniqueMap = new Map();
            [...loadedPosts, ...prevPosts].forEach((item) => {
              const id = getPostId(item);
              if (id && !uniqueMap.has(id)) {
                uniqueMap.set(id, item);
              }
            });
            return Array.from(uniqueMap.values());
          });
        }
      } catch (err) {
        console.error("Error fetching homepage posts:", err);
        setError("Unable to connect to server. Displaying current posts.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchAllPosts();
  }, [setPosts]);

  // ---------- SEARCH USERS (debounced) ----------
  useEffect(() => {
    if (!query) return undefined;

    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`);
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || "User search failed.");
        if (!cancelled) setUserResult({ query, users: data.users || [], error: "" });
      } catch (err) {
        console.error("User search failed:", err);
        if (!cancelled) setUserResult({ query, users: [], error: err.message });
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query]);

  // ---------- CLOSE THE PROFILE POPUP WITH ESCAPE ----------
  useEffect(() => {
    if (!previewUser) return undefined;

    const onKeyDown = (e) => {
      if (e.key === "Escape") setPreviewUser(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [previewUser]);

  const isUserResultCurrent = userResult.query === query;
  const matchedUsers = query && isUserResultCurrent ? userResult.users : [];

  // ---------- POST UPDATE / DELETE ----------
  const handlePostUpdate = (updatedPost) => {
    const targetId = getPostId(updatedPost);
    if (onUpdatePost) {
      onUpdatePost(updatedPost);
    } else if (setPosts) {
      setPosts((prev) =>
        prev.map((p) => (getPostId(p) === targetId ? updatedPost : p))
      );
    }
  };

  // Remove a deleted post from local state (the server delete happens in Post.jsx)
  const handlePostDelete = (deletedId) => {
    if (setPosts) {
      setPosts((prev) => prev.filter((p) => getPostId(p) !== deletedId));
    }
  };

  // ---------- FILTER + SORT + SEARCH ----------
  const displayedPosts = filterAndSortPosts(posts, {
    search: searchQuery,
    category: categoryFilter,
    activity: activityFilter,
  });

  return (
    <main>
      <HomeHeader
        username={username}
        onNavigateProfile={() => navigate("/profile")}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <FeedFilters
        selectedActivity={activityFilter}
        onActivityChange={setActivityFilter}
        selectedCategory={categoryFilter}
        onCategoryChange={setCategoryFilter}
      />

      {error && <p style={{ color: "orange" }}>{error}</p>}
      {isLoading && <p>Loading global feed...</p>}

      {/* Matching users (only while searching) */}
      {query !== "" && (
        <section>
          <h3>Users</h3>
          {!isUserResultCurrent ? (
            <p>Searching users...</p>
          ) : (
            <>
              {userResult.error && <p style={{ color: "orange" }}>{userResult.error}</p>}
              {matchedUsers.length > 0 ? (
                <ul>
                  {matchedUsers.map((user) => (
                    <li key={String(user._id)}>
                      <strong>{user.username}</strong>
                      {displayName(user) && <> ({displayName(user)})</>}{" "}
                      {/* Opens a popup preview. It never navigates to the profile page */}
                      <button type="button" onClick={() => setPreviewUser(user)}>
                        View profile
                      </button>
                      {" | "}
                      <Link to={`/posts/${encodeURIComponent(user.username)}`}>View posts</Link>
                    </li>
                  ))}
                </ul>
              ) : (
                !userResult.error && <p>No users found matching "{query}".</p>
              )}
            </>
          )}
        </section>
      )}

      {/* Matching posts (or the whole feed when not searching) */}
      <section>
        {query !== "" && <h3>Posts ({displayedPosts.length})</h3>}

        {!isLoading && displayedPosts.length > 0 ? (
          displayedPosts.map((postItem) => (
            <Post
              key={getPostId(postItem)}
              post={postItem}
              onUpdatePost={handlePostUpdate}
              onDeletePost={handlePostDelete}
              currentUser={username}
            />
          ))
        ) : (
          !isLoading && (
            <p>{query || categoryFilter ? "No posts match your search or filters." : "No posts available."}</p>
          )
        )}
      </section>

      {/* Profile preview popup for another user */}
      {previewUser && (
        <div style={OVERLAY_STYLE} onClick={() => setPreviewUser(null)}>
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`Profile of ${previewUser.username}`}
            style={MODAL_STYLE}
            onClick={(e) => e.stopPropagation()}
          >
            <ProfilePreview
              key={String(previewUser._id)}
              user={previewUser}
              currentUsername={username}
              allowFriendRequest
            />

            <div style={{ marginTop: "12px" }}>
              <Link to={`/posts/${encodeURIComponent(previewUser.username)}`}>View posts</Link>
              {" "}
              <button type="button" onClick={() => setPreviewUser(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default HomePage;