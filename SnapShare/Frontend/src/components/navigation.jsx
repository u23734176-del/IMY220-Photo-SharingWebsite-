// Sidebar for logged-in users
import { NavLink } from "react-router-dom";
import Logo from "./Logo";

const LINKS = [
  { to: "/home", label: "Home" },
  { to: "/themeOfDay", label: "Theme Of Day" },
  { to: "/posts", label: "Post" },
  { to: "/friends", label: "Friends" },
  { to: "/albums", label: "Albums" },
];

const linkClass = ({ isActive }) =>
  `block whitespace-nowrap rounded-lg px-4 py-2 text-lg transition-colors ${
    isActive ? "bg-brand-lilac text-white" : "text-white/90 hover:bg-white/15"
  }`;

function Navigation({ username }) {
  const initial = (username || "?").charAt(0).toUpperCase();

  return (
    <nav
      aria-label="Main"
      className="flex shrink-0 flex-col gap-4 bg-brand-sidebar p-4 text-white md:sticky md:top-0 md:h-screen md:w-56"
    >
      {/* Logo box */}
      <div className="grid h-16 place-items-center rounded-md bg-brand-panel md:h-28">
        <Logo className="text-2xl" />
      </div>

      {/* Links: a row on phones, a column on desktop */}
      <div className="flex gap-2 overflow-x-auto md:flex-col md:overflow-visible">
        {LINKS.map(({ to, label }) => (
          <NavLink key={to} to={to} className={linkClass}>
            {label}
          </NavLink>
        ))}
      </div>

      {/* My Profile pinned to the bottom */}
      <NavLink to="/profile" className={`${linkClass({ isActive: false })} md:mt-auto`}>
        <span className="flex items-center gap-3">
          <span className="grid size-8 place-items-center rounded-full bg-brand-lavender text-sm font-semibold text-brand-ink">
            {initial}
          </span>
          My Profile
        </span>
      </NavLink>
    </nav>
  );
}

export default Navigation;