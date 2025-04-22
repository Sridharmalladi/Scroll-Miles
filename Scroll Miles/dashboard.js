document.addEventListener("DOMContentLoaded", () => {
  const PIXELS_PER_INCH = 96;
  const INCHES_PER_MILE = 63360;
  const SPEED_ADJUST = 0.7;

  let chart;
  const ctx = document.getElementById("weeklyChart").getContext("2d");

  const renderChart = (labels, values) => {
    if (chart) chart.destroy();
    chart = new Chart(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [{
          label: "Miles Scrolled",
          data: values,
          backgroundColor: "#8B5CF6",
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        animation: {
          duration: 1000,
          easing: "easeOutCubic"
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: context => `Scrolled: ${context.parsed.y.toFixed(2)} mi`
            }
          },
          legend: { display: false },
          title: {
            display: true,
            text: "This Week",
            color: "#F9FAFB",
            font: { size: 16 }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { color: "#F9FAFB" }
          },
          x: {
            ticks: { color: "#F9FAFB" }
          }
        }
      }
    });
  };

  const getCurrentWeekDates = () => {
    const today = new Date();
    const currentDay = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - ((currentDay + 6) % 7));
    monday.setHours(0, 0, 0, 0);

    const days = [];
    const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const iso = d.toISOString().split("T")[0];
      days.push({ iso, label: dayLabels[i] });
    }

    return days;
  };

  chrome.storage.local.get(["scrollTotal", "scrollEvents"], (data) => {
    const rawMiles = (data.scrollTotal || 0) / PIXELS_PER_INCH / INCHES_PER_MILE;
    const adjustedMiles = rawMiles * SPEED_ADJUST;
    document.getElementById("lifetimeMiles").textContent = `Lifetime: ${adjustedMiles.toFixed(2)} mi`;

    const events = data.scrollEvents || [];
    const thisWeekDays = getCurrentWeekDates();

    const labels = thisWeekDays.map(day => day.label);
    const isoDates = thisWeekDays.map(day => day.iso);

    const milesPerDay = isoDates.map(date => {
      const totalPixels = events
        .filter(e => new Date(e.timestamp).toISOString().startsWith(date))
        .reduce((sum, e) => sum + e.delta, 0);
      return (totalPixels / PIXELS_PER_INCH / INCHES_PER_MILE) * SPEED_ADJUST;
    });

    renderChart(labels, milesPerDay);

    // Milestones increase in difficulty
    const badgeMilestones = [1.2, 3.61, 6.56, 9.81, 12.55, 18.48];
    const badgeNames = [
      "Warm-Up?",
      "Cruiser",
      "Half Marathoner",
      "Full Marathon",
      "Ultra Scroller",
      "Scrolling Legend"
    ];
    const badgeMessages = [
      "You've scrolled more than you've walked today. ",
      "You're two scrolls away from becoming part of the algorithm. ",
      "You're halfway in. Your hand's numb. ",
      "You just scrolled a MARATHON. ",
      "Your scroll wheel tapped out. ",
      "Scroll Miles? Bro, you unlocked a spiritual awakening. "
    ];

    const badgeContainer = document.getElementById("badgesContainer");
    badgeContainer.innerHTML = "";

    let earnedAny = false;

    badgeMilestones.forEach((mile, i) => {
      const progress = Math.min((adjustedMiles / mile) * 100, 100);
      const badgeUnlocked = adjustedMiles >= mile;

      const badge = document.createElement("div");
      badge.className = "badge";
      badge.innerHTML = `
        <strong>${badgeNames[i]}</strong>
        <small>${badgeMessages[i]}</small>
        <div class="progress-bar">
          <div class="progress-bar-fill" style="width: ${progress.toFixed(0)}%"></div>
        </div>
      `;
      badgeContainer.appendChild(badge);

      if (badgeUnlocked && progress === 100) {
        earnedAny = true;
        // sound.play(); // removed
      }
    });

    if (!earnedAny) {
      badgeContainer.innerHTML += "<p style='text-align:center;'>No badges earned yet. Keep scrolling!</p>";
    }
  });
});
