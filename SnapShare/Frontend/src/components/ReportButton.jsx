// src/components/ReportButton.jsx
import { useState } from "react";
import useIsAdmin from "../hooks/useIsAdmin";

function ReportButton({ postId, currentUser, reported = false, reportMessage = "", onReported }) {
  const isAdmin = useIsAdmin(currentUser);

  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState(reportMessage || "");
  const [isReported, setIsReported] = useState(!!reported);
  const [savedMessage, setSavedMessage] = useState(reportMessage || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Hidden for everyone except admins
  if (!isAdmin) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!message.trim()) {
      setError("Please write a report message.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch(`/api/posts/${postId}/report`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminUsername: currentUser,
          reportMessage: message.trim()
        })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Could not report this post.");

      setIsReported(true);
      setSavedMessage(data.post?.reportMessage ?? message.trim());
      setIsOpen(false);

      if (onReported) onReported(data.post);
    } catch (err) {
      console.error("Report failed:", err);
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ marginTop: "8px", padding: "8px", border: "1px dashed #dc3545" }}>
      <p>
        <strong>Admin:</strong>{" "}
        {isReported ? `Reported. Message: "${savedMessage}"` : "Not reported"}
      </p>

      {isOpen ? (
        <form onSubmit={handleSubmit}>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Describe why this post is being reported..."
            rows={3}
            style={{ width: "100%" }}
          />
          <div>
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Report"}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                setError("");
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          style={{ backgroundColor: "#dc3545", color: "#fff" }}
        >
          {isReported ? "Update Report" : "Report"}
        </button>
      )}

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}

export default ReportButton;