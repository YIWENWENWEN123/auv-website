document.documentElement.classList.add("js");

const inquiryRecipient = "yanling.zhou@sealien.cn";
const header = document.querySelector("[data-header]");
const heroVideo = document.querySelector("[data-hero-video]");
const motionVideos = document.querySelectorAll("video");
const revealTargets = document.querySelectorAll(".reveal");
const counters = document.querySelectorAll("[data-count]");

function updateHeader() {
  if (!header) return;
  header.classList.toggle("is-scrolled", window.scrollY > 24);
}

window.addEventListener("scroll", updateHeader, { passive: true });
updateHeader();

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    const target = document.querySelector(link.getAttribute("href"));
    if (!target) return;

    event.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.14 }
);

revealTargets.forEach((target) => revealObserver.observe(target));

const countObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      const element = entry.target;
      const target = Number(element.dataset.count);
      const duration = 1200;
      const startTime = performance.now();

      function tick(now) {
        const progress = Math.min((now - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        element.textContent = Math.round(target * eased).toLocaleString("en-US");

        if (progress < 1) {
          requestAnimationFrame(tick);
        }
      }

      requestAnimationFrame(tick);
      countObserver.unobserve(element);
    });
  },
  { threshold: 0.6 }
);

counters.forEach((counter) => countObserver.observe(counter));

if (heroVideo) {
  heroVideo.addEventListener("error", () => {
    heroVideo.poster = "船.jpg";
  });

  const playAttempt = heroVideo.play();
  if (playAttempt && typeof playAttempt.catch === "function") {
    playAttempt.catch(() => {
      heroVideo.setAttribute("controls", "controls");
    });
  }
}

const videoObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      const video = entry.target;
      if (entry.isIntersecting) {
        video.muted = true;
        video.playsInline = true;
        const attempt = video.play();
        if (attempt && typeof attempt.catch === "function") {
          attempt.catch(() => {
            video.setAttribute("controls", "controls");
          });
        }
      } else if (!video.hasAttribute("data-hero-video")) {
        video.pause();
      }
    });
  },
  { threshold: 0.28 }
);

motionVideos.forEach((video) => {
  video.muted = true;
  video.setAttribute("muted", "");
  video.setAttribute("playsinline", "");
  videoObserver.observe(video);
});

document.querySelectorAll("[data-consult-form]").forEach((form) => {
  const status = form.querySelector("[data-form-status]");
  const lang = form.dataset.lang || "en";

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const data = Object.fromEntries(new FormData(form).entries());
    const subject = lang === "zh" ? "SEALIEN AUV 项目咨询" : "SEALIEN AUV Project Inquiry";
    const lines = [
      `Name: ${data.name || ""}`,
      `Email: ${data.email || ""}`,
      `Operating Depth: ${data.depth || ""}`,
      `Endurance Target: ${data.endurance || ""}`,
      "",
      "Mission Profile:",
      data.message || ""
    ];

    try {
      const response = await fetch("/api/consultation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, lang, page: location.pathname })
      });

      if (response.ok) {
        if (status) {
          status.textContent = lang === "zh"
            ? "已记录咨询信息，我们建议同时通过邮件发送以便快速跟进。"
            : "Inquiry recorded locally. You can also send the email for faster follow-up.";
        }
        form.reset();
        return;
      }
    } catch (error) {
      // Static file mode falls back to mailto.
    }

    const mailto = `mailto:${inquiryRecipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join("\n"))}`;
    if (status) {
      status.textContent = lang === "zh" ? "正在打开邮件客户端..." : "Opening your email client...";
    }
    window.location.href = mailto;
  });
});
