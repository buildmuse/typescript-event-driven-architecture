/**
 * ============================================================
 * CONCEPT 16: Debounce & Throttle
 * ============================================================
 * 
 * Control event firing rate.
 * Debounce: Wait until events stop, then fire once.
 * Throttle: Fire at most once per interval.
 */

console.log("═══ Debounce & Throttle ═══\n");

// Debounce: delays execution until events stop
function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

// Throttle: execute at most once per interval
function throttle<T extends (...args: any[]) => any>(
  fn: T,
  interval: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  return (...args) => {
    const now = Date.now();
    if (now - lastCall >= interval) {
      lastCall = now;
      fn(...args);
    }
  };
}

// Demo debounce - search input
const search = debounce((query: string) => {
  console.log(`  🔍 Searching for: "${query}"`);
}, 300);

console.log("── Debounce (search input) ──");
// Rapid keystrokes
search("h");
search("he");
search("hel");
search("hell");
search("hello"); // Only this one fires after 300ms

// Demo throttle - scroll handler
const onScroll = throttle((position: number) => {
  console.log(`  📜 Scroll position: ${position}`);
}, 100);

setTimeout(() => {
  console.log("\n── Throttle (scroll events) ──");
  // Rapid scroll events
  for (let i = 0; i < 10; i++) {
    onScroll(i * 100);
  }

  // Leading-edge debounce (fires immediately, then waits)
  console.log("\n── Leading-Edge Debounce ──");

  function debounceLeading<T extends (...args: any[]) => any>(
    fn: T,
    delay: number
  ): (...args: Parameters<T>) => void {
    let timer: ReturnType<typeof setTimeout> | null = null;
    let canCall = true;
    return (...args) => {
      if (canCall) {
        fn(...args);
        canCall = false;
      }
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => { canCall = true; }, delay);
    };
  }

  const save = debounceLeading((data: string) => {
    console.log(`  💾 Saving: ${data}`);
  }, 500);

  save("v1"); // Fires immediately
  save("v2"); // Ignored
  save("v3"); // Ignored

  setTimeout(() => {
    save("v4"); // Fires after cooldown
    console.log("\n✅ Concept 16 Complete! Run: npm run concept:streams");
  }, 600);
}, 500);
