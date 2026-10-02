// src/utils/feedUtils.js

export const getPostId = (post) => {
  if (!post) return null;
  if (typeof post._id === 'object' && post._id?.$oid) {
    return post._id.$oid;
  }
  return post._id || post.id;
};

const postTime = (post) => new Date(post.createdAt || 0).getTime() || 0;
const likeCount = (post) => Number(post.likes) || 0;
const commentCount = (post) => (Array.isArray(post.comments) ? post.comments.length : 0);

// Sort options (the values match the <select> in FeedFilters).
// "global" is the default feed order: newest first.
const SORTERS = {
  global: (a, b) => postTime(b) - postTime(a),
  newest: (a, b) => postTime(b) - postTime(a),
  oldest: (a, b) => postTime(a) - postTime(b),
  mostLiked: (a, b) => likeCount(b) - likeCount(a) || postTime(b) - postTime(a),
  mostCommented: (a, b) => commentCount(b) - commentCount(a) || postTime(b) - postTime(a),
};

// Does a post match the search text? Checks caption, author, category and hashtags.
function matchesSearch(post, query) {
  const fields = [
    post.caption,
    post.author,
    post.category,
    ...(Array.isArray(post.hashTags) ? post.hashTags : []),
  ];
  return fields.some((field) => String(field || "").toLowerCase().includes(query));
}

// One place for: remove duplicates -> search -> category -> sort
export function filterAndSortPosts(posts = [], { search = "", category = "", activity = "newest" } = {}) {
  const query = search.trim().toLowerCase();

  // Drop duplicates (and anything without an id)
  const unique = Array.from(
    new Map(
      posts
        .filter((post) => getPostId(post))
        .map((post) => [String(getPostId(post)), post])
    ).values()
  );

  const filtered = unique.filter((post) => {
    if (category && post.category !== category) return false;
    if (query && !matchesSearch(post, query)) return false;
    return true;
  });

  const sorter = SORTERS[activity] || SORTERS.newest;
  return filtered.sort(sorter);
}