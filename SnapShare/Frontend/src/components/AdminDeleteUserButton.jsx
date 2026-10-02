// src/components/AdminDeleteUserButton.jsx
import { useState } from "react";
import useIsAdmin from "../hooks/useIsAdmin";

function AdminDeleteUserButton({ targetUsername, currentUser, onDeleted }) {
  const isAdmin = useIsAdmin(currentUser);
  const [error, setError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // Only admins, and never on their own profile
  if (!isAdmin || !targetUsername || targetUsername === currentUser) return null;

  const handleDelete = async () => {
    if (!window.confirm(`Delete the profile '${targetUsername}'? This cannot be undone.`)) return;

    setIsDeleting(true);
    setError("");
    try {
      const response = await fetch(`/api/profile/${encodeURIComponent(targetUsername)}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requesterUsername: currentUser }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Could not delete this profile.");

      if (onDeleted) onDeleted(targetUsername);
    } catch (err) {
      console.error("Admin delete failed:", err);
      setError(err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={handleDelete}
        disabled={isDeleting}
        style={{ backgroundColor: "#dc3545", color: "#fff" }}
      >
        {isDeleting ? "Deleting..." : "Delete Profile (Admin)"}
      </button>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}

export default AdminDeleteUserButton;