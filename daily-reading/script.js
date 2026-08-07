(() => {
  const storyCards = [...document.querySelectorAll(".story-card")];
  const searchInput = document.querySelector(".search input");
  const savedCount = document.querySelector(".saved-button span");
  const savedToggle = document.querySelector(".saved-button");
  const filterButtons = [...document.querySelectorAll(".filter-row button")];
  const signalKey = "feedineed-public-signals";
  const savedKey = "feedineed-public-saved";
  let activeFilter = "All";
  let savedOnly = false;
  let saved = new Set(JSON.parse(localStorage.getItem(savedKey) || "[]"));
  let signals = JSON.parse(localStorage.getItem(signalKey) || "{}");

  const updateSavedCount = () => {
    if (savedCount) savedCount.textContent = String(saved.size);
  };

  const applyStoryView = () => {
    const query = (searchInput?.value || "").trim().toLowerCase();
    storyCards.forEach((card, index) => {
      const category = card.querySelector(".category")?.textContent?.trim() || "";
      const matchesFilter = activeFilter === "All" || category === activeFilter;
      const matchesQuery = !query || card.textContent.toLowerCase().includes(query);
      const matchesSaved = !savedOnly || saved.has(index);
      card.hidden = !(matchesFilter && matchesQuery && matchesSaved);
      card.style.order = String(-(signals[index] || 0));
    });
  };

  storyCards.forEach((card, index) => {
    const saveButton = card.querySelector(".story-meta button");
    const tuningButtons = [...card.querySelectorAll(".tuning-row button")];

    const paint = () => {
      if (saveButton) {
        saveButton.textContent = saved.has(index) ? "♥" : "♡";
        saveButton.classList.toggle("saved", saved.has(index));
      }
      tuningButtons[0]?.classList.toggle("active", signals[index] === 1);
      tuningButtons[1]?.classList.toggle("active", signals[index] === -1);
    };

    saveButton?.addEventListener("click", () => {
      saved.has(index) ? saved.delete(index) : saved.add(index);
      localStorage.setItem(savedKey, JSON.stringify([...saved]));
      updateSavedCount();
      paint();
      applyStoryView();
    });

    tuningButtons.forEach((button, buttonIndex) => {
      button.addEventListener("click", () => {
        signals[index] = buttonIndex === 0 ? 1 : -1;
        localStorage.setItem(signalKey, JSON.stringify(signals));
        paint();
        applyStoryView();
      });
    });
    paint();
  });

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      activeFilter = button.textContent.trim();
      filterButtons.forEach((item) => item.classList.toggle("active", item === button));
      applyStoryView();
    });
  });

  searchInput?.addEventListener("input", applyStoryView);
  savedToggle?.addEventListener("click", () => {
    savedOnly = !savedOnly;
    savedToggle.classList.toggle("active", savedOnly);
    applyStoryView();
  });

  const monthButtons = [...document.querySelectorAll(".month-filters button")];
  const festivalCards = [...document.querySelectorAll(".festival-card")];
  monthButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const month = button.textContent.trim();
      monthButtons.forEach((item) => item.classList.toggle("active", item === button));
      festivalCards.forEach((card) => {
        const date = card.querySelector(".festival-date")?.textContent || "";
        card.hidden = month !== "ALL" && !date.includes(month);
      });
    });
  });

  document.querySelector(".wordmark")?.addEventListener("dblclick", () => {
    window.location.href = "../";
  });

  updateSavedCount();
  applyStoryView();
})();

// Article-image enhancement contract. The daily refresh can either render an
// <img class="story-image"> directly or put its URL in data-image on story-art.
// Invalid, blocked, or unavailable images fall back to the existing category art.
(() => {
  const currentStoryMedia = [
    {
      image: "images/stories/gemini-robotics-demo.jpg",
      alt: "Gemini Robotics 2 multi-robot collaboration demonstration",
      video: "https://www.youtube-nocookie.com/embed/fo9WirRIaVs?autoplay=1&rel=0",
      videoTitle: "Gemini Robotics 2 official demonstration",
    },
    {
      image: "images/stories/robostral-demo.jpg",
      alt: "Robostral following a navigation instruction using its single-camera point of view",
    },
    {
      image: "images/stories/lerobot-vla-architecture.jpg",
      alt: "LeRobot vision-language-action model architecture diagram",
      fit: "contain",
    },
  ];

  document.querySelectorAll(".story-art").forEach((art, index) => {
    const media = currentStoryMedia[index];
    if (!art.dataset.image && media) {
      art.dataset.image = media.image;
      art.dataset.imageAlt = media.alt;
      if (media.fit === "contain") art.classList.add("technical-diagram");
    }
    let image = art.querySelector("img.story-image");
    const source = art.dataset.image;

    if (!image && source) {
      image = document.createElement("img");
      image.className = "story-image";
      image.src = source;
      image.alt = art.dataset.imageAlt || "";
      image.loading = "lazy";
      image.decoding = "async";
      image.referrerPolicy = "no-referrer";
      art.prepend(image);
    }

    if (!image) return;
    image.loading ||= "lazy";
    image.decoding ||= "async";
    const reveal = () => art.classList.add("has-image");
    const fallback = () => {
      art.classList.remove("has-image");
      image.remove();
    };
    image.addEventListener("load", reveal, { once: true });
    image.addEventListener("error", fallback, { once: true });
    if (image.complete) image.naturalWidth > 0 ? reveal() : fallback();

    if (media?.video) {
      art.classList.add("has-video");
      const play = document.createElement("button");
      play.className = "story-video-trigger";
      play.type = "button";
      play.setAttribute("aria-label", `Play ${media.videoTitle}`);
      play.innerHTML = '<span aria-hidden="true">▶</span><b>WATCH DEMO</b>';
      play.addEventListener("click", () => {
        const frame = document.createElement("iframe");
        frame.className = "story-video";
        frame.src = media.video;
        frame.title = media.videoTitle;
        frame.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
        frame.allowFullscreen = true;
        frame.referrerPolicy = "strict-origin-when-cross-origin";
        art.classList.add("is-playing");
        art.append(frame);
      }, { once: true });
      art.append(play);
    }
  });
})();

// Minimal space layer — independently removable with space-feed.css.
(() => {
  document.body.classList.add("feed-minimal");
  if (document.querySelector(".feed-space-canvas")) return;

  const canvas = document.createElement("canvas");
  canvas.className = "feed-space-canvas";
  canvas.setAttribute("aria-hidden", "true");
  document.body.prepend(canvas);

  const draw = () => {
    const rect = canvas.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(rect.width * ratio);
    canvas.height = Math.round(rect.height * ratio);
    const context = canvas.getContext("2d");
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.clearRect(0, 0, rect.width, rect.height);

    let seed = 731992;
    const random = () => {
      seed |= 0;
      seed = seed + 0x6D2B79F5 | 0;
      let value = Math.imul(seed ^ seed >>> 15, 1 | seed);
      value = value + Math.imul(value ^ value >>> 7, 61 | value) ^ value;
      return ((value ^ value >>> 14) >>> 0) / 4294967296;
    };
    const count = Math.max(90, Math.round(rect.width * rect.height / 7200));

    for (let index = 0; index < count; index++) {
      const x = random() * rect.width;
      const y = random() * rect.height;
      const bright = random() > .95;
      const radius = bright ? .9 + random() : .25 + random() * .55;
      const alpha = bright ? .7 : .2 + random() * .45;
      context.fillStyle = `rgba(${random() > .75 ? "174,226,255" : "240,249,255"},${alpha})`;
      context.beginPath();
      context.arc(x, y, radius, 0, Math.PI * 2);
      context.fill();
    }
  };

  let timer;
  window.addEventListener("resize", () => {
    window.clearTimeout(timer);
    timer = window.setTimeout(draw, 160);
  });
  draw();
})();
