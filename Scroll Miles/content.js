let lastScrollY = window.scrollY;

setInterval(() => {
  const currentScrollY = window.scrollY;
  const delta = Math.abs(currentScrollY - lastScrollY);
  lastScrollY = currentScrollY;

  if (delta === 0) return;

  try {
    chrome.storage.local.get(["scrollTotal", "dailyScroll", "scrollEvents"], (result) => {
      if (chrome.runtime.lastError) return;

      const total = result.scrollTotal || 0;
      const daily = result.dailyScroll || {};
      const events = result.scrollEvents || [];

      const todayKey = new Date().toISOString().split("T")[0];
      daily[todayKey] = (daily[todayKey] || 0) + delta;

      events.push({ timestamp: Date.now(), delta });
      if (events.length > 1000) events.shift();

      chrome.storage.local.set({
        scrollTotal: total + delta,
        dailyScroll: daily,
        scrollEvents: events
      });
    });
  } catch (err) {
    console.error("Scroll tracking error:", err);
  }
}, 1000);
