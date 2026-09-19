//Component to help edit post ( respective user posts only )

const CATEGORIES = ["Nature", "Travel", "People", "Fashion", "Technology", "Other"];


function PostEditForm({ caption, category, onCaptionChange, onCategoryChange, onSave, onCancel }) {
  return (
    <form onSubmit={onSave}>
      <div>
        <label>Caption: </label>
        <input
          type="text"
          value={caption}
          onChange={(e) => onCaptionChange(e.target.value)}
        />
      </div>
      <div>
        <label>Category: </label>
        <select
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
        >
          <option value="">Select Category</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>
      <button type="submit">Save Changes</button>
      <button type="button" onClick={onCancel}>Cancel</button>
    </form>
  );
}
export default PostEditForm;