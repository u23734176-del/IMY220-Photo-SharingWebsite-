// src/components/HomeHeader.jsx

function HomeHeader({ username, onNavigateProfile, searchQuery, onSearchChange }) {
  return (
    <header>
      {/* Profile Button / Link */}
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
          placeholder="Search Bar" 
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      {/* Page Description */}
      <div>
        <p>"See what people are posting"</p>
      </div>
    </header>
  );
}

export default HomeHeader;