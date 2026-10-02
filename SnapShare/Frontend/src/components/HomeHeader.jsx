// HomeHeader.jsx
function HomeHeader({ username, onNavigateProfile, searchQuery, onSearchChange }) {
  return (
    <header className="home-header">
      {/* Active Logged-in User Profile Navigation */}
      <div>
        <button type="button" onClick={onNavigateProfile}>
          My Profile ({username || "Guest"})
        </button>
      </div>

      {/* Top Search Bar */}
      <div>
        <button type="button">Search Icon</button>
        <input 
          type="text" 
          placeholder="Search posts or users..." 
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      {/* Tagline */}
      <div>
        <p>"See what people are posting"</p>
      </div>
    </header>
  );
}

export default HomeHeader;