const PIXELS_PER_INCH = 96;
const INCHES_PER_MILE = 63360;
const SPEED_ADJUST = 0.6;

chrome.storage.local.get(["scrollTotal"], (result) => {
  const pixels = result.scrollTotal || 0;
  const miles = (pixels / PIXELS_PER_INCH / INCHES_PER_MILE) * SPEED_ADJUST;
  document.getElementById("miles").textContent = `You've scrolled: ${miles.toFixed(2)} mi`;
});

document.getElementById("dashboardBtn").addEventListener("click", () => {
  chrome.tabs.create({ url: chrome.runtime.getURL("dashboard.html") });
});
