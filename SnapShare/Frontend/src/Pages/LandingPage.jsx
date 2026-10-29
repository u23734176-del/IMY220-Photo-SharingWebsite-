// Splash page
import { Link, Navigate } from "react-router-dom";
import { useState } from "react";

// Put your photos in  public/images/  and point these at them,
// e.g. "/images/splash-collage.jpg". null shows a placeholder.
const SPLASH_PHOTOS = {
  collage: null,
  birthday: null,
  graduation: null,
};

function PhotoFrame({ src, alt, className }) {
  return (
    <div
      className={`absolute overflow-hidden border-4 border-brand-pink bg-white/70 shadow-[8px_8px_0_0_rgba(80,90,120,0.45)] ${className}`}
    >
      {src ? (
        <img src={src} alt={alt} className="h-full w-full object-cover" />
      ) : (
        <div className="grid h-full w-full place-items-center p-2 text-center text-sm text-brand-ink/50">
          {alt}
        </div>
      )}
    </div>
  );
}

// How it works component/button
function HowitWorks() {
  const [show, setShow] = useState(false);

  return (
    <div>
      <button
        type="button"
        onClick={() => setShow((open) => !open)}
        aria-expanded={show}
        className="rounded-2xl bg-white px-10 py-4 text-2xl text-brand-ink shadow-sm hover:bg-white hover:brightness-95"
      >
        How it works ?
      </button>

      {show && (
        // Swap this card for your "how it works" image when you have it
        <div className="mt-4 max-w-sm rounded-2xl bg-white p-5 shadow">
          <p>1. Create your free account.</p>
          <p>2. Upload photos and videos to an album.</p>
          <p>3. Share the album with friends and family.</p>
        </div>
      )}
    </div>
  );
}

function LandingPage({ username }) {
  // Logged-in users skip the splash page
  if (username) return <Navigate to="/home" replace />;

  return (
    <section className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-12 md:grid-cols-2 md:py-20">
      {/* Left: copy + buttons */}
      <div>
        <h1 className="text-5xl leading-tight md:text-6xl">
          Store your memories.
          <br />
          Share your world.
        </h1>

        <p className="mt-8 max-w-md text-lg leading-relaxed">
          Collect every photo &amp; video into secure digital albums, ready to
          share with friends and family — no apps, no hassle, so simple even
          grandma will use it.
        </p>

        <div className="mt-10 flex flex-wrap items-start gap-6">
          <Link
            to="/signUp"
            className="rounded-2xl bg-brand-pink px-12 py-4 text-2xl text-white shadow-sm transition hover:brightness-95"
          >
            Get Started
          </Link>
          <HowitWorks />
        </div>

        <p className="mt-6 text-sm">Start free. Setup in under 1 minute.</p>
      </div>

      {/* Right: tilted photo frames */}
      <div className="relative mx-auto h-[30rem] w-full max-w-md" aria-hidden={false}>
        <PhotoFrame
          src={SPLASH_PHOTOS.collage}
          alt="Photo collage"
          className="left-2 top-0 h-80 w-48 rotate-3"
        />
        <PhotoFrame
          src={SPLASH_PHOTOS.birthday}
          alt="Birthday"
          className="right-0 top-2 h-52 w-44 rotate-2"
        />
        <PhotoFrame
          src={SPLASH_PHOTOS.graduation}
          alt="Graduation"
          className="bottom-0 right-8 h-60 w-44 rotate-6"
        />
      </div>
    </section>
  );
}

export default LandingPage;