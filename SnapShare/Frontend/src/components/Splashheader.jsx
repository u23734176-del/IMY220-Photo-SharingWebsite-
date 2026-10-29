// Top bar for logged-out visitors (splash / login / sign up)
import { Link } from "react-router-dom";
import Logo from "./Logo";

function SplashHeader() {
  return (
    <header className="flex h-16 items-center justify-between bg-brand-steel px-4 md:px-8">
      <Link to="/" aria-label="SnapShare home">
        <Logo className="text-3xl" />
      </Link>

      {/* Placeholder anchors: point them at real sections later */}
      <nav className="hidden gap-10 text-white/90 md:flex">
        <a href="#plans" className="hover:text-white">Plans</a>
        <a href="#features" className="hover:text-white">Features</a>
      </nav>

      <div className="flex items-center gap-4">
        <Link to="/login" className="text-white hover:underline">
          Login
        </Link>
        <Link
          to="/signUp"
          className="rounded-full bg-brand-pink px-6 py-2 text-white transition hover:brightness-95"
        >
          Get Started
        </Link>
      </div>
    </header>
  );
}

export default SplashHeader;