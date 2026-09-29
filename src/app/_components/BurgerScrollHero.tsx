"use client";

import Image from "next/image";
import {
  MotionValue,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { useRef, useState } from "react";

/**
 * Keep all timeline values here so the animation is easy to tweak.
 */
const TIMELINE = {
  captions: {
    hero: [0.0, 0.14],
    fresh: [0.18, 0.38],
    combo: [0.58, 0.72],
    menu: [0.9, 1.0],
  },
} as const;

/**
 * Scrubs the burger clip so it plays in sync with scroll instead of on a
 * timer: scroll progress maps linearly onto the video's own duration, so
 * scrolling down plays it forward and scrolling back up reverses it.
 */
function BurgerVideo({ progress }: { progress: MotionValue<number> }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const pendingTime = useRef<number | null>(null);

  // Ease scroll progress so wheel ticks glide instead of jumping frames.
  const smoothProgress = useSpring(progress, {
    stiffness: 120,
    damping: 30,
    mass: 0.4,
  });

  // Only one seek at a time: if the browser is still seeking, remember the
  // latest target and apply it once the current seek finishes.
  const seekTo = (time: number) => {
    const video = videoRef.current;
    if (!video) return;
    if (video.seeking) {
      pendingTime.current = time;
      return;
    }
    video.currentTime = time;
  };

  const syncToProgress = (value: number) => {
    const video = videoRef.current;
    if (!video || !video.duration) return;
    const clamped = Math.min(Math.max(value, 0), 1);
    seekTo(clamped * video.duration);
  };

  useMotionValueEvent(smoothProgress, "change", syncToProgress);

  return (
    <video
      ref={videoRef}
      src="/pictures/burger.mp4"
      muted
      playsInline
      preload="auto"
      aria-hidden="true"
      className="absolute inset-0 h-full w-full object-cover"
      onLoadedMetadata={() => syncToProgress(smoothProgress.get())}
      onSeeked={() => {
        if (pendingTime.current === null) return;
        const next = pendingTime.current;
        pendingTime.current = null;
        seekTo(next);
      }}
    />
  );
}

function Caption({
  progress,
  range,
  title,
  subtitle,
  side = "left",
  children,
}: {
  progress: MotionValue<number>;
  range: readonly [number, number];
  title: string;
  subtitle?: string;
  side?: "left" | "right";
  children?: React.ReactNode;
}) {
  const fadeIn = range[0];
  const fadeOut = range[1];

  const opacity = useTransform(
    progress,
    [
      Math.max(0, fadeIn - 0.025),
      fadeIn,
      fadeOut - 0.025,
      fadeOut,
    ],
    [0, 1, 1, 0]
  );

  const y = useTransform(
    progress,
    [
      Math.max(0, fadeIn - 0.025),
      fadeIn,
      fadeOut - 0.025,
      fadeOut,
    ],
    [18, 0, 0, -18]
  );

  return (
    <motion.div
      className={[
        "pointer-events-none absolute bottom-12 left-1/2 z-30 w-[90%] -translate-x-1/2 text-center md:bottom-auto md:top-1/2 md:w-[330px] md:text-left",
        side === "left"
          ? "md:left-[8vw] md:right-auto md:-translate-x-0 md:-translate-y-1/2"
          : "md:left-auto md:right-[8vw] md:translate-x-0 md:-translate-y-1/2 md:text-right",
      ].join(" ")}
      style={{ opacity, y }}
    >
      <h2 className="text-2xl font-bold leading-tight text-white drop-shadow-md md:text-4xl">
        {title}
      </h2>

      {subtitle && (
        <p className="mt-3 text-base font-medium text-white/75 drop-shadow-md md:text-lg">
          {subtitle}
        </p>
      )}

      {children}
    </motion.div>
  );
}

function StaticReducedMotion() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-[#16213E] text-white">
      <video
        src="/pictures/burger.mp4"
        muted
        playsInline
        preload="auto"
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover"
      />

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-end bg-gradient-to-t from-[#16213E] via-[#16213E]/70 to-transparent px-6 pb-16 pt-32">
        <div className="max-w-xl space-y-8 text-center">
          <div>
            <h2 className="text-2xl font-bold">
              Халуун хоол, хаалган дээр чинь.
            </h2>
            <p className="mt-2 text-white/70">30 минутад хүргэнэ.</p>
          </div>

          <div>
            <h2 className="text-2xl font-bold">Давхарга бүр шинэхэн.</h2>
            <p className="mt-2 text-white/70">
              Захиалсны дараа л хийж эхэлнэ.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold">
              Комбо сет, нэг товшилтоор.
            </h2>
          </div>

          <div>
            <h2 className="text-2xl font-bold">Цэсээ үзээрэй.</h2>
            <button
              type="button"
              onClick={() =>
                document
                  .getElementById("menu")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="pointer-events-auto mt-5 rounded-full bg-[#F0452B] px-7 py-3 font-bold text-white transition-transform hover:scale-105"
            >
              Цэс үзэх
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function BurgerScrollHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  const [logoFailed, setLogoFailed] = useState(false);

  if (reducedMotion) {
    return <StaticReducedMotion />;
  }

  return (
    <section
      ref={sectionRef}
      className="relative h-[700vh] bg-[#16213E]"
      aria-label="Nom Nom Swift"
    >
      <div className="sticky top-0 h-screen overflow-hidden bg-[#16213E]">
        {/* Burger video: fills the hero and scrubs forward/backward with
            scroll. */}
        <BurgerVideo progress={scrollYProgress} />

        {/* Darken the video slightly so captions stay readable. */}
        <div className="pointer-events-none absolute inset-0 bg-black/10" />

        {/* Logo */}
        <div className="absolute left-6 top-6 z-50 md:left-10 md:top-8">
          {!logoFailed && (
            <Image
              src="/nomnom-swift-logo.svg"
              alt="Nom Nom Swift"
              width={180}
              height={60}
              priority
              className="h-auto w-[135px] md:w-[180px]"
              onError={() => setLogoFailed(true)}
            />
          )}
        </div>

        {/* Captions */}
        <Caption
          progress={scrollYProgress}
          range={TIMELINE.captions.hero}
          title="Халуун хоол, хаалган дээр чинь."
          subtitle="30 минутад хүргэнэ."
          side="left"
        />

        <Caption
          progress={scrollYProgress}
          range={TIMELINE.captions.fresh}
          title="Давхарга бүр шинэхэн."
          subtitle="Захиалсны дараа л хийж эхэлнэ."
          side="right"
        />

        <Caption
          progress={scrollYProgress}
          range={TIMELINE.captions.combo}
          title="Комбо сет, нэг товшилтоор."
          side="left"
        />

        <Caption
          progress={scrollYProgress}
          range={TIMELINE.captions.menu}
          title="Цэсээ үзээрэй."
          side="right"
        >
          <button
            type="button"
            onClick={() =>
              document
                .getElementById("menu")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            className="pointer-events-auto mt-5 rounded-full bg-[#F0452B] px-7 py-3 font-bold text-white shadow-lg transition-transform duration-200 hover:scale-105 active:scale-95"
          >
            Цэс үзэх
          </button>
        </Caption>

        {/* Mobile accent */}
        <div className="pointer-events-none absolute bottom-5 left-1/2 z-20 -translate-x-1/2 text-xs font-medium uppercase tracking-[0.3em] text-white/35 md:hidden">
          Scroll
        </div>
      </div>
    </section>
  );
}
