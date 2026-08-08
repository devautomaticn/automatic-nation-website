/*  Inertial page scrolling (Lenis).
 *
 *  Lenis cancels the browser's native scroll and re-drives it from a rAF loop,
 *  easing towards the target position. That's what reads as "premium" — but it
 *  also means every scroll on the page now goes through JS, so the two rules
 *  below are not optional:
 *
 *   1. prefers-reduced-motion switches it off entirely. Inertial scrolling is
 *      precisely the kind of motion that setting exists to suppress, and with
 *      Lenis running there is no way for the OS setting to reach it.
 *   2. Touch stays native. Smoothing a finger drag fights the user's own
 *      momentum and reads as lag, not polish — so only the wheel is eased.
 *
 *  If it's ever disabled, nothing breaks: the page falls back to native
 *  scrolling plus the `scroll-behavior: smooth` already in global.css.
 */
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

export function initSmoothScroll() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return null;

  const lenis = new Lenis({
    duration: 1.05,
    // Exponential ease-out: quick to leave, long to arrive. A symmetric curve
    // feels sluggish at the start, which reads as input lag rather than weight.
    easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    syncTouch: false,
  });

  // The CSS `scroll-behavior: smooth` is the no-JS fallback for anchor jumps.
  // With Lenis driving, the browser's own smooth animation runs against the rAF
  // loop and the page stutters its way to the target — so hand over cleanly.
  document.documentElement.style.scrollBehavior = 'auto';

  const raf = (time) => {
    lenis.raf(time);
    requestAnimationFrame(raf);
  };
  requestAnimationFrame(raf);

  // Route in-page anchors through Lenis for the same reason.
  for (const a of document.querySelectorAll('a[href^="#"]')) {
    const id = a.getAttribute('href');
    if (!id || id === '#') continue;          // the placeholder social link
    a.addEventListener('click', (e) => {
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target);
      history.pushState(null, '', id);        // keep the URL and the back button
    });
  }

  return lenis;
}
