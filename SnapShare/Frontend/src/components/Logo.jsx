// SnapShare wordmark: display font with a pink "marker" stroke behind it
function Logo({ className = "" }) {
  return (
    <span
      className={`relative isolate inline-block font-display leading-none text-brand-royal ${className}`}
    >
      <span
        aria-hidden="true"
        className="absolute -inset-x-1 bottom-0 -z-10 h-1/2 -rotate-2 rounded-full bg-brand-pink/80"
      />
      SnapShare
    </span>
  );
}

export default Logo;