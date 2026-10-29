// Page frame. Logged in: sidebar + content. Logged out: splash header + content.
import { useLocation } from "react-router-dom";
import Navigation from "./navigation";
import SplashHeader from "./Splashheader";

function Shell({ username, children }) {
  const { pathname } = useLocation();

  if (username) {
    return (
      <div className="flex min-h-screen flex-col bg-white md:flex-row">
        <Navigation username={username} />
        <div className="min-w-0 flex-1 p-4 md:p-8">{children}</div>
      </div>
    );
  }

  const isSplash = pathname === "/";

  return (
    <div className="min-h-screen bg-brand-sky">
      <SplashHeader />
      {isSplash ? (
        children
      ) : (
        // Login / Sign Up sit in a centred white card
        <div className="mx-auto my-8 w-full max-w-lg rounded-2xl bg-white/80 p-6 shadow-lg">
          {children}
        </div>
      )}
    </div>
  );
}

export default Shell;