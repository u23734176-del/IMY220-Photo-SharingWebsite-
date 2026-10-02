// src/hooks/useIsAdmin.js
import { useState, useEffect } from "react";

// username -> Promise<boolean>
const cache = new Map();

function lookupAdmin(username) {
  if (!cache.has(username)) {
    const request = fetch(`/api/profile/${encodeURIComponent(username)}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("lookup failed"))))
      .then((data) => data.user?.admin === true)
      .catch(() => {
        cache.delete(username); // allow a retry later
        return false;
      });
    cache.set(username, request);
  }
  return cache.get(username);
}

export default function useIsAdmin(username) {
  // Remember which username the answer belongs to
  const [result, setResult] = useState({ name: "", admin: false });

  useEffect(() => {
    if (!username) return undefined;

    let cancelled = false;

    lookupAdmin(username).then((value) => {
      if (!cancelled) setResult({ name: username, admin: value });
    });

    return () => {
      cancelled = true;
    };
  }, [username]);

  // Derived during render: no setState needed when the user logs out or changes
  return !!username && result.name === username && result.admin;
}