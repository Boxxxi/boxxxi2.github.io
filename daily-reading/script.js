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

// One calendar for events, hackathons and releases. Event buttons open a
// lightweight detail dialog; third-party pages load only from the source link.
(() => {
  const grid = document.querySelector(".festival-grid");
  if (!grid || grid.classList.contains("event-calendar")) return;

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const monthTokens = monthNames.map(month => month.slice(0, 3).toUpperCase());
  const editionText = document.querySelector(".masthead .overline")?.textContent || "";
  const editionMatch = editionText.match(/(JANUARY|FEBRUARY|MARCH|APRIL|MAY|JUNE|JULY|AUGUST|SEPTEMBER|OCTOBER|NOVEMBER|DECEMBER)\s+(\d{1,2}),\s+(\d{4})/i);
  const editionMonth = Math.max(0, monthNames.findIndex(month => month.toUpperCase() === editionMatch?.[1]?.toUpperCase()));
  const editionDay = Number(editionMatch?.[2] || 1);
  const editionYear = Number(editionMatch?.[3] || new Date().getFullYear());
  const editionDate = new Date(editionYear, editionMonth, editionDay);
  const typeRules = [
    ["tech", /robot|hardware|workshop|technology|cnc|solder/i],
    ["anime", /anime|manga|comic/i],
    ["nightlife", /techno|nightlife|rooftop|club|dj\b/i],
    ["food", /food|restaurant|prix fixe|italian|street market/i],
    ["music", /music|rock|jazz|concert|band|psychedelic|grateful dead|tribute/i],
  ];
  const typeLabels = {
    hackathon: "Hackathon",
    release: "Movie / Series",
    tech: "Tech / Robotics",
    anime: "Anime / Comics",
    nightlife: "Nightlife",
    food: "Food",
    music: "Music",
    event: "Other",
  };
  const parseDate = (text, preferDeadline = false) => {
    const deadline = preferDeadline && text.match(/DEADLINE\s+(JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)\s+(\d{1,2})/i);
    const match = deadline || text.match(/(JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)\s+(\d{1,2})/i);
    if (!match) return editionDate;
    const month = monthTokens.indexOf(match[1].toUpperCase());
    let year = editionYear;
    if (month < editionMonth - 6) year += 1;
    return new Date(year, month, Number(match[2]));
  };

  const events = [...grid.querySelectorAll(".festival-card")].map((card) => {
    const dateText = card.querySelector(".festival-date")?.textContent.trim() || "";
    const searchable = card.textContent;
    const type = card.dataset.eventType || typeRules.find(([, pattern]) => pattern.test(searchable))?.[0] || "event";
    return {
      date: /THROUGH/i.test(dateText) ? editionDate : parseDate(dateText), type,
      title: card.querySelector("h3")?.textContent.trim() || "Event", dateText,
      detail: card.querySelector("p")?.textContent.trim() || "",
      meta: card.querySelector("div:last-child b")?.textContent.trim() || "",
      href: card.href,
    };
  });

  document.querySelectorAll(".hackathon-grid > a").forEach((card) => {
    const dateText = card.querySelector(":scope > p")?.textContent.trim() || "";
    events.push({
      date: parseDate(dateText, true), type: "hackathon",
      title: card.querySelector("h3")?.textContent.trim() || "Hackathon", dateText,
      detail: card.querySelectorAll(":scope > p")[1]?.textContent.trim() || "",
      meta: card.querySelector("div:last-child b")?.textContent.trim() || "",
      href: card.href,
    });
  });

  document.querySelectorAll(".release-list article").forEach((card) => {
    const month = card.querySelector(".date-block b")?.textContent.trim() || "";
    const day = card.querySelector(".date-block strong")?.textContent.trim() || "1";
    const link = card.querySelector(".release-title");
    const dateText = `${month} ${day}`;
    events.push({
      date: parseDate(dateText), type: /anime/i.test(link?.textContent || "") ? "anime" : "release",
      title: link?.querySelector("h3")?.textContent.trim() || "Release", dateText,
      detail: link?.querySelector("p")?.textContent.replace(/·\s*source\s*↗/i, "").trim() || "",
      meta: card.querySelector(".countdown")?.textContent.trim().replace(/(\d+)DAYS/i, "$1 days away") || "",
      href: link?.href || "#",
    });
  });
  events.sort((a, b) => a.date - b.date);

  const header = document.createElement("div");
  header.className = "calendar-toolbar";
  const monthControl = document.createElement("div");
  monthControl.className = "calendar-month-control";
  monthControl.innerHTML = '<span>MONTH VIEW</span><div><button type="button" class="calendar-prev" aria-label="Previous month">←</button><strong></strong><button type="button" class="calendar-next" aria-label="Next month">→</button></div>';
  const legend = document.createElement("div");
  legend.className = "calendar-legend";
  legend.setAttribute("aria-label", "Event type legend");
  legend.innerHTML = Object.entries(typeLabels).filter(([type]) => events.some(event => event.type === type)).map(([type, label]) => `<span class="calendar-key ${type}"><i></i>${label}</span>`).join("");
  header.append(monthControl, legend);

  const calendar = document.createElement("div");
  calendar.className = "calendar-month";
  calendar.setAttribute("role", "grid");
  const dialog = document.createElement("dialog");
  dialog.className = "calendar-detail";
  dialog.innerHTML = '<button type="button" class="calendar-detail-close" aria-label="Close event details">×</button><p class="calendar-detail-type"></p><h3></h3><p class="calendar-detail-date"></p><p class="calendar-detail-copy"></p><p class="calendar-detail-meta"></p><a target="_blank" rel="noreferrer">Open official source ↗</a>';
  document.body.append(dialog);
  dialog.querySelector(".calendar-detail-close").addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", event => { if (event.target === dialog) dialog.close(); });

  const openDetails = (event) => {
    dialog.className = `calendar-detail ${event.type}`;
    dialog.querySelector(".calendar-detail-type").textContent = typeLabels[event.type];
    dialog.querySelector("h3").textContent = event.title;
    dialog.querySelector(".calendar-detail-date").textContent = event.dateText;
    dialog.querySelector(".calendar-detail-copy").textContent = event.detail;
    dialog.querySelector(".calendar-detail-meta").textContent = event.meta;
    dialog.querySelector("a").href = event.href;
    dialog.showModal();
  };

  const latestEvent = events.reduce((latest, event) => event.date > latest ? event.date : latest, editionDate);
  let viewDate = new Date(editionYear, editionMonth, 1);
  const renderMonth = () => {
    const viewYear = viewDate.getFullYear();
    const viewMonth = viewDate.getMonth();
    const viewMonthToken = monthTokens[viewMonth];
    monthControl.querySelector("strong").textContent = `${monthNames[viewMonth]} ${viewYear}`;
    monthControl.querySelector(".calendar-prev").disabled = viewYear === editionYear && viewMonth === editionMonth;
    monthControl.querySelector(".calendar-next").disabled = viewYear === latestEvent.getFullYear() && viewMonth === latestEvent.getMonth();
    calendar.setAttribute("aria-label", `${monthNames[viewMonth]} ${viewYear} event calendar`);
    calendar.replaceChildren();
    ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].forEach((day) => {
      const label = document.createElement("div");
      label.className = "calendar-weekday";
      label.setAttribute("role", "columnheader");
      label.textContent = day;
      calendar.append(label);
    });
    const firstWeekday = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    for (let slot = 0; slot < firstWeekday + daysInMonth; slot += 1) {
      const day = slot - firstWeekday + 1;
      const cell = document.createElement("div");
      cell.className = "calendar-day";
      cell.setAttribute("role", "gridcell");
      if (day < 1) {
        cell.classList.add("calendar-day-empty");
        calendar.append(cell);
        continue;
      }
      if (viewYear === editionYear && viewMonth === editionMonth && day === editionDay) cell.classList.add("calendar-today");
      if (slot % 7 === 0 || slot % 7 === 6) cell.classList.add("calendar-weekend");
      cell.innerHTML = `<span class="calendar-date">${String(day).padStart(2, "0")}</span>`;
      events.filter(event => event.date.getFullYear() === viewYear && event.date.getMonth() === viewMonth && event.date.getDate() === day).forEach((event) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = `calendar-event ${event.type}`;
        button.setAttribute("aria-label", `View details for ${event.title}`);
        button.innerHTML = `<span>${typeLabels[event.type]}</span><strong>${event.title}</strong><small>${event.dateText.replace(new RegExp(`^${viewMonthToken}\\s+\\d{1,2}(?:–\\d{1,2})?\\s*·?\\s*`, "i"), "")}</small>`;
        button.addEventListener("click", () => openDetails(event));
        cell.append(button);
      });
      calendar.append(cell);
    }
  };
  monthControl.querySelector(".calendar-prev").addEventListener("click", () => { viewDate.setMonth(viewDate.getMonth() - 1); renderMonth(); });
  monthControl.querySelector(".calendar-next").addEventListener("click", () => { viewDate.setMonth(viewDate.getMonth() + 1); renderMonth(); });
  renderMonth();

  grid.classList.add("event-calendar");
  grid.replaceChildren(header, calendar);
  document.querySelector(".festival-section .section-heading h2").textContent = "Signal calendar";
  document.querySelector(".festival-section .section-heading .overline").textContent = "03 / WHAT'S NEXT";
  const sourceNote = document.querySelector(".festival-section .source-note");
  if (sourceNote) sourceNote.textContent = "Events, deadlines and releases share one calendar. Select any signal for complete details, then verify the official source before making plans.";
  document.querySelector(".festival-section .month-filters")?.remove();
  document.querySelector(".hackathon-section")?.remove();
  document.querySelector(".release-section")?.remove();
  const hackathonNav = document.querySelector('.topbar nav a[href="#hackathons"]');
  if (hackathonNav) { hackathonNav.href = "#festivals"; hackathonNav.textContent = "Calendar"; }
  document.querySelector('.topbar nav a[href="#releases"]')?.remove();
  document.querySelectorAll('.topbar nav a[href="#festivals"]').forEach((link, index) => { if (index > 0) link.remove(); });
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
    {
      image: "images/stories/ultra-robotics-demo.jpg",
      alt: "Ultra Robotics humanoid working alongside Industry City logistics staff",
      video: "https://www.youtube-nocookie.com/embed/I44_zbEwz_w?autoplay=1&rel=0",
      videoTitle: "Ultra Robotics official demonstration",
    },
    {
      image: "images/stories/gpt-56-eval.svg",
      alt: "GPT-5.6 benchmark signal audit showing roughly thirty percent broken tasks",
      fit: "dark-contain",
    },
    {
      image: "images/stories/kimi-k3.png",
      alt: "Kimi K3 open-weight model repository overview",
      fit: "dark-contain",
    },
    {
      image: "images/stories/eu-ai-lifecycle.jpg",
      alt: "European Commission diagram of the artificial intelligence lifecycle",
      fit: "contain",
    },
    {
      image: "images/stories/blade-runner-2099-optimized.jpg",
      alt: "Blade Runner 2099 official series artwork",
      video: "https://www.youtube-nocookie.com/embed/0Dr8I_RyRCg?autoplay=1&rel=0",
      videoTitle: "Blade Runner 2099 official trailer",
    },
    {
      image: "images/stories/the-last-house.jpg",
      alt: "The Last House official film still",
      video: "https://www.youtube-nocookie.com/embed/3OqYqrHPQn8?autoplay=1&rel=0",
      videoTitle: "The Last House official trailer",
    },
    {
      image: "images/stories/ghost-in-the-shell.jpg",
      alt: "Ghost in the Shell official anime artwork",
      video: "https://www.youtube-nocookie.com/embed/b_v0-RWLo18?autoplay=1&rel=0",
      videoTitle: "Ghost in the Shell official trailer",
    },
  ];

  document.querySelectorAll(".story-art").forEach((art, index) => {
    const media = currentStoryMedia[index];
    if (!art.dataset.image && media) {
      art.dataset.image = media.image;
      art.dataset.imageAlt = media.alt;
      if (media.fit === "contain") art.classList.add("technical-diagram");
      if (media.fit === "dark-contain") art.classList.add("dark-diagram");
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
      const playLabel = /trailer/i.test(media.videoTitle) ? "WATCH TRAILER" : "WATCH DEMO";
      play.innerHTML = `<span aria-hidden="true">▶</span><b>${playLabel}</b>`;
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

// Add authoritative company and workshop visuals to the robotics contact cards.
(() => {
  const peopleMedia = [
    ["images/people/revise-robotics.png", "Revise Robotics logo", "contain"],
    ["images/people/kyber-labs.png", "Kyber Labs logo", "contain"],
    ["images/people/viam.png", "Viam robotics development platform", "cover"],
    ["images/people/standard-bots.jpg", "Standard Bots industrial robot arm", "cover"],
    ["images/people/ny-robotics-network.svg", "New York Robotics founder and builder community network", "cover"],
    ["images/people/fubar-labs.jpg", "FUBAR Labs makerspace robotics project", "cover"],
    ["images/people/ultra-robotics.jpg", "Ultra Robotics humanoid warehouse robot", "cover"],
    ["images/people/tuesday-labs-wordmark.svg", "Tuesday Labs official wordmark", "contain"],
  ];

  document.querySelectorAll(".people-grid > a").forEach((card, index) => {
    const media = peopleMedia[index];
    if (!media) return;
    const image = document.createElement("img");
    image.className = `people-visual people-visual-${media[2]}`;
    image.src = media[0];
    image.alt = media[1];
    image.loading = "lazy";
    image.decoding = "async";
    image.addEventListener("load", () => card.classList.add("has-visual"), { once: true });
    image.addEventListener("error", () => image.remove(), { once: true });
    card.prepend(image);
    if (image.complete && image.naturalWidth > 0) card.classList.add("has-visual");
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
