chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({
    scrollTotal: 0,
    dailyScroll: {},
    badges: [],
    user: null
  });
});