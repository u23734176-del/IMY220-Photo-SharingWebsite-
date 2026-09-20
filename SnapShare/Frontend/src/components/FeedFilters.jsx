// src/components/FeedFilters.jsx
// src/components/FeedFilters.jsx

const CATEGORIES = ["Nature", "Travel", "People", "Fashion", "Technology", "Other"];

function FeedFilters({ selectedActivity, onActivityChange, selectedCategory, onCategoryChange }) {
  return (
    <div>
      <select 
        id="global-activity" 
        value={selectedActivity} 
        onChange={(e) => onActivityChange(e.target.value)}
      >
        <option value="global">Global Activity</option>
        <option value="newest">Recently Posted</option>
        <option value="oldest">Least Recent</option>
        <option value="mostLiked">Most Liked</option>
        <option value="mostCommented">Most Commented</option>
      </select>

      <select 
        id="Categories-filter" 
        value={selectedCategory} 
        onChange={(e) => onCategoryChange(e.target.value)}
      >
        <option value="">All Categories</option>
        {CATEGORIES.map((cat) => (
          <option key={cat} value={cat}>
            {cat}
          </option>
        ))}
      </select>
    </div>
  );
}

export default FeedFilters;