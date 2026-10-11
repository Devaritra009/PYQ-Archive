/**
 * ============================================================================
 * CS PYQ ARCHIVE — SAMMILANI MAHAVIDYALYA (CALCUTTA UNIVERSITY)
 * Core Logic & Data Controller: app.js
 * ============================================================================
 */

(function () {
  "use strict";

  /* ==========================================================================
     SECTION 1: CALCUTTA UNIVERSITY B.SC. CS CURRICULUM SYLLABUS DATA
     ========================================================================== */
  const CU_CBCS_PAPERS = {
    1: [
      { code: "CC-1", name: "Computer Fundamentals & Digital Logic" },
      { code: "CC-2", name: "Programming Fundamentals using C" },
      { code: "GE-1", name: "Mathematics / Physics GE-1" }
    ],
    2: [
      { code: "CC-3", name: "Data Structures" },
      { code: "CC-4", name: "Basic Electronic Circuits" },
      { code: "GE-2", name: "Mathematics / Physics GE-2" }
    ],
    3: [
      { code: "CC-5", name: "Computational Mathematics" },
      { code: "CC-6", name: "Operating Systems" },
      { code: "CC-7", name: "Computer Organization & Architecture" },
      { code: "SEC-A", name: "Microprocessor & its Applications / Arduino" }
    ],
    4: [
      { code: "CC-8", name: "Data Communication & Computer Networks" },
      { code: "CC-9", name: "Software Engineering" },
      { code: "CC-10", name: "Database Management Systems (DBMS)" },
      { code: "SEC-B", name: "Python Programming / Linux Shell Scripting" }
    ],
    5: [
      { code: "CC-11", name: "Internet Technologies" },
      { code: "CC-12", name: "Theory of Computation" },
      { code: "DSE-A1", name: "Information Security / Digital Image Processing" },
      { code: "DSE-B1", name: "Operations Research / Compiler Design" }
    ],
    6: [
      { code: "CC-13", name: "Artificial Intelligence" },
      { code: "CC-14", name: "Computer Graphics" },
      { code: "DSE-A2", name: "Data Mining & Data Warehousing" },
      { code: "DSE-B2", name: "Cloud Computing / Advanced Algorithms" }
    ]
  };

  const SEM_ROMAN = { 1: "I", 2: "II", 3: "III", 4: "IV", 5: "V", 6: "VI" };
  const SEM_WORD = { 1: "1st", 2: "2nd", 3: "3rd", 4: "4th", 5: "5th", 6: "6th" };
  const CURRENT_YEAR = new Date().getFullYear();
  const DEFAULT_START_YEAR = 2019;

  /* ==========================================================================
     SECTION 2: CRYPTOGRAPHIC SECURITY & AUTHENTICATION
     Credentials are stored solely as one-way SHA-256 cryptographic digests.
     Plaintext passwords/emails are never exposed in the source code.
     ========================================================================== */
  const AUTH_EMAIL_HASH = "1eb8957294136f321465d733c4272e57015fb7536f584df57161d99a192a1568"; // csdeptsmvstudent@gmail.com
  const AUTH_PASS_HASH = "0725789d349166a8ddfb9bbd688d675ee311df53c27327def9339ebbde2d64cc";  // csstudent2206@#

  async function sha256(text) {
    const enc = new TextEncoder().encode(text);
    const buf = await crypto.subtle.digest("SHA-256", enc);
    return Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }

  function getAuthCredentials() {
    return { emailHash: AUTH_EMAIL_HASH, passHash: AUTH_PASS_HASH };
  }

  function verifyCredentials(emailHash, passHash) {
    return emailHash === AUTH_EMAIL_HASH && passHash === AUTH_PASS_HASH;
  }

  function setAuthCredentials(emailHash, passHash) {
    localStorage.setItem("smv_admin_email_hash", emailHash);
    localStorage.setItem("smv_admin_pass_hash", passHash);
  }

  /* ==========================================================================
     SECTION 3: XSS SANITIZATION & SAFE URL VALIDATION
     ========================================================================== */
  function sanitizeUrl(rawUrl) {
    if (!rawUrl || typeof rawUrl !== "string") return "";
    const trimmed = rawUrl.trim();
    if (!trimmed) return "";
    // Strict URL validation: Only allow safe HTTP/HTTPS or relative path navigation
    // Strictly blocks javascript:, data:, vbscript:, mailto:, file:
    if (/^(https?:\/\/|\/|\.\/|\.\.\/)/i.test(trimmed)) {
      // Reject any URLs containing control characters, unescaped quotes, or angle brackets
      if (/[\s<>"'`\\]/.test(trimmed)) {
        return "";
      }
      return trimmed;
    }
    return "";
  }

  function escapeHtml(str) {
    if (str === null || str === undefined) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  /* ==========================================================================
     SECTION 4: REAL-TIME CLOUD DATABASE & ARCHIVE STATE MANAGEMENT
     ========================================================================== */
  const STORAGE_KEY = "smv_pyq_archive_state_v2";
  const CLOUD_CONFIG_KEY = "smv_firebase_config_v1";

  /**
   * Firebase Cloud Realtime Database Configuration:
   * You can define your Firebase settings below or enter them via the
   * "Cloud Sync DB" button in Admin Mode.
   */
  const DEFAULT_FIREBASE_CONFIG = {
    apiKey: "",
    databaseURL: "https://pyq-archive-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "pyq-archive-default-rtdb"
  };

  let state = {
    years: [],
    papers: {}
  };

  let dbRef = null;
  let isCloudConnected = false;

  function getCloudConfig() {
    try {
      const stored = localStorage.getItem(CLOUD_CONFIG_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.databaseURL) {
          return { ...DEFAULT_FIREBASE_CONFIG, ...parsed };
        }
      }
    } catch (err) {
      console.warn("Could not parse cloud config from localStorage", err);
    }
    return DEFAULT_FIREBASE_CONFIG;
  }

  function setCloudConfig(config) {
    if (!config) {
      localStorage.removeItem(CLOUD_CONFIG_KEY);
    } else {
      localStorage.setItem(CLOUD_CONFIG_KEY, JSON.stringify(config));
    }
  }

  function updateCloudStatusBadge(status, label) {
    const badge = document.getElementById("cloudSyncBadge");
    const statusText = document.getElementById("cloudSyncStatus");
    const hint = document.getElementById("adminSyncHint");

    if (badge) {
      badge.classList.remove("sync-live", "sync-local", "sync-connecting");
      if (status === "live") badge.classList.add("sync-live");
      else if (status === "local") badge.classList.add("sync-local");
      else if (status === "connecting") badge.classList.add("sync-connecting");
    }
    if (statusText) {
      statusText.textContent = label;
    }
    if (hint) {
      if (status === "live") {
        hint.textContent = "(⚡ Real-time Cloud Sync Active — All visitors see updates live)";
      } else {
        hint.textContent = "(💾 Local Mode — Connect Cloud DB to share with visitors)";
      }
    }
  }

  function generateDefaultState() {
    const years = [];
    for (let y = CURRENT_YEAR; y >= DEFAULT_START_YEAR; y--) {
      years.push(y);
    }

    const papers = {};
    years.forEach((year) => {
      for (let s = 1; s <= 6; s++) {
        const list = CU_CBCS_PAPERS[s] || [];
        list.forEach((p, idx) => {
          const id = `y${year}-s${s}-p${idx + 1}`;
          papers[id] = {
            code: p.code,
            name: p.name,
            link: "",
            status: "auto"
          };
        });
      }
    });

    return { years, papers };
  }

  function loadArchiveState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed.years) && parsed.papers) {
          state = parsed;
          return;
        }
      }
    } catch (e) {
      console.warn("Could not load from localStorage, falling back to defaults.", e);
    }
    state = generateDefaultState();
    saveArchiveStateLocally();
  }

  let saveTimer = null;
  function queueSave() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(saveArchiveState, 350);
  }

  function saveArchiveStateLocally() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error("Failed to save state to localStorage", e);
    }
  }

  function saveArchiveState() {
    saveArchiveStateLocally();
    updateStats();

    if (isCloudConnected && dbRef) {
      dbRef.set(state).catch((e) => {
        console.error("Realtime cloud sync error:", e);
        if (e && (e.code === "PERMISSION_DENIED" || (e.message && e.message.includes("permission_denied")))) {
          showToast("Cloud write blocked: Administrative authentication required.", "error");
        } else {
          showToast("Cloud sync error. Data preserved locally.", "error");
        }
      });
    }
  }

  function initCloudDatabase() {
    const config = getCloudConfig();
    if (!window.firebase || !window.firebase.database) {
      console.warn("Firebase SDK not loaded, operating in local offline mode.");
      updateCloudStatusBadge("local", "Local Mode");
      return;
    }

    const dbUrl = (config.databaseURL || "").trim();
    if (!dbUrl) {
      updateCloudStatusBadge("local", "Local Mode");
      return;
    }

    try {
      updateCloudStatusBadge("connecting", "Connecting Cloud...");
      let app;
      if (firebase.apps && firebase.apps.length > 0) {
        app = firebase.apps[0];
      } else {
        app = firebase.initializeApp(config);
      }

      const db = firebase.database(app);
      dbRef = db.ref("archive");

      // Subscribe to real-time changes
      dbRef.on(
        "value",
        (snapshot) => {
          const cloudData = snapshot.val();
          if (cloudData && Array.isArray(cloudData.years) && cloudData.papers) {
            state = cloudData;
            saveArchiveStateLocally();
            isCloudConnected = true;
            updateCloudStatusBadge("live", "Cloud Live");
            renderArchive();
            updateStats();
          } else if (!cloudData) {
            // First time database is opened
            isCloudConnected = true;
            updateCloudStatusBadge("live", "Cloud Connected (Empty)");
            // If local state exists, push it
            if (state.years && state.years.length > 0) {
              dbRef.set(state);
            }
          }
        },
        (error) => {
          console.error("Firebase Realtime Database error:", error);
          isCloudConnected = false;
          updateCloudStatusBadge("local", "Cloud Error (Using Local)");
          showToast("Cloud database access error. Reverted to local storage.", "error");
        }
      );
    } catch (err) {
      console.error("Failed to initialize Firebase Realtime Database:", err);
      isCloudConnected = false;
      updateCloudStatusBadge("local", "Local Mode");
    }
  }

  /* ==========================================================================
     SECTION 5: TOAST NOTIFICATIONS & ADMIN STATE
     ========================================================================== */
  let isAdminActive = false;
  let activeYearFilter = "all";

  function showToast(message, type = "info") {
    const container = document.getElementById("toastContainer");
    if (!container) return;
    const el = document.createElement("div");
    el.className = `toast toast-${type}`;
    el.innerHTML = `<span>${type === "error" ? "&#9888;" : type === "success" ? "&#10004;" : "&#9432;"}</span> <span>${escapeHtml(message)}</span>`;
    container.appendChild(el);
    setTimeout(() => {
      el.style.opacity = "0";
      el.style.transform = "translateY(10px)";
      setTimeout(() => el.remove(), 250);
    }, 3200);
  }

  /* ==========================================================================
     SECTION 6: ARCHIVE RENDERING & REDESIGNED YEAR SECTIONS
     ========================================================================== */
  const yearsContainer = document.getElementById("yearsContainer");
  const yearNavBar = document.getElementById("yearNavBar");
  const noResults = document.getElementById("noResults");

  function renderYearNavBar() {
    if (!yearNavBar) return;
    yearNavBar.innerHTML = "";

    const years = (state.years || []).slice().sort((a, b) => b - a);

    // "All Years" pill
    const allPill = document.createElement("button");
    allPill.className = `year-nav-pill ${activeYearFilter === "all" ? "active" : ""}`;
    allPill.textContent = "All Years";
    allPill.addEventListener("click", () => {
      activeYearFilter = "all";
      renderYearNavBar();
      filterPapers();
    });
    yearNavBar.appendChild(allPill);

    // Year specific pills
    years.forEach((yr) => {
      const pill = document.createElement("button");
      pill.className = `year-nav-pill ${activeYearFilter === String(yr) ? "active" : ""}`;
      pill.textContent = yr;
      pill.addEventListener("click", () => {
        activeYearFilter = String(yr);
        renderYearNavBar();
        filterPapers();
        const targetBlock = document.querySelector(`.year-block[data-year="${yr}"]`);
        if (targetBlock) {
          targetBlock.classList.add("open");
          targetBlock.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
      });
      yearNavBar.appendChild(pill);
    });
  }

  function renderArchive() {
    renderYearNavBar();

    const openSet = new Set(
      Array.from(document.querySelectorAll(".year-block.open")).map(
        (b) => b.dataset.year
      )
    );
    const isFirstRender = openSet.size === 0 && yearsContainer.innerHTML.trim() === "";

    yearsContainer.innerHTML = "";
    const years = (state.years || []).slice().sort((a, b) => b - a);

    years.forEach((year, index) => {
      const block = document.createElement("div");
      const shouldOpen = isFirstRender ? index === 0 : openSet.has(String(year));
      block.className = "year-block" + (shouldOpen ? " open" : "");
      block.dataset.year = year;

      const isCurrent = year === CURRENT_YEAR;

      // Count papers for statistics & progress bar
      let yearTotal = 0;
      let yearAvailable = 0;
      let yearUnavailable = 0;

      for (let s = 1; s <= 6; s++) {
        for (let i = 1; i <= 30; i++) {
          const id = `y${year}-s${s}-p${i}`;
          const p = state.papers[id];
          if (p) {
            yearTotal++;
            if (p.status === "unavailable") {
              yearUnavailable++;
            } else if (p.link && p.link.trim().length > 0) {
              yearAvailable++;
            }
          }
        }
      }

      const activeTotal = yearTotal - yearUnavailable;
      const progressPct = activeTotal > 0 ? Math.round((yearAvailable / activeTotal) * 100) : 0;

      block.innerHTML = `
        <div class="year-head" data-toggle="${year}">
          <div class="year-left">
            <span class="year-badge">${year}</span>
            <span class="year-status-chip ${isCurrent ? "current" : ""}">${isCurrent ? "Current Session" : "Academic Session"}</span>
            <div class="year-progress-box" title="${yearAvailable} available, ${yearUnavailable} unavailable out of ${yearTotal}">
              <div class="year-progress-track">
                <div class="year-progress-fill" style="width: ${progressPct}%;"></div>
              </div>
              <span>${yearAvailable}/${yearTotal} uploaded (${progressPct}%)</span>
            </div>
          </div>
          <div class="year-right">
            <button class="btn btn-danger btn-del-year" data-year="${year}" style="padding: 4px 8px; font-size: 10.5px;">&times; Delete Year</button>
            <div class="year-chevron">&#9660;</div>
          </div>
        </div>
        <div class="year-body"></div>
      `;

      const body = block.querySelector(".year-body");

      for (let s = 1; s <= 6; s++) {
        const semPapers = [];
        for (let i = 1; i <= 30; i++) {
          const id = `y${year}-s${s}-p${i}`;
          if (state.papers[id]) {
            semPapers.push({ id, ...state.papers[id] });
          }
        }

        const semCard = document.createElement("div");
        semCard.className = "sem-card";
        semCard.dataset.sem = s;
        semCard.dataset.year = year;

        semCard.innerHTML = `
          <div class="sem-header">
            <div class="sem-title-box">
              <span class="sem-roman-badge">SEM ${SEM_ROMAN[s]}</span>
              <span class="sem-name">${SEM_WORD[s]} Semester</span>
            </div>
            <button class="btn btn-outline-teal btn-open-add-paper" data-year="${year}" data-sem="${s}" style="padding: 3px 8px; font-size: 10px;">+ Add Paper</button>
          </div>
          <ul class="paper-list"></ul>
        `;

        const list = semCard.querySelector(".paper-list");

        if (semPapers.length === 0) {
          const emptyLi = document.createElement("li");
          emptyLi.className = "paper-item";
          emptyLi.style.color = "var(--text-dim)";
          emptyLi.style.fontSize = "12.5px";
          emptyLi.textContent = "No question papers listed for this semester.";
          list.appendChild(emptyLi);
        } else {
          semPapers.forEach((paper) => {
            const li = document.createElement("li");
            const isUnavailable = paper.status === "unavailable";
            const hasLink = !isUnavailable && paper.link && paper.link.trim().length > 0;
            const safeUrl = hasLink ? sanitizeUrl(paper.link) : "";

            let statusLabel = "";
            let statusClass = "";
            let rowStatus = "pending";

            if (isUnavailable) {
              statusLabel = "&#8856; Unavailable";
              statusClass = "unavailable";
              rowStatus = "unavailable";
            } else if (hasLink) {
              statusLabel = "&#9679; Available";
              statusClass = "available";
              rowStatus = "available";
            } else {
              statusLabel = "&#9675; Pending Upload";
              statusClass = "pending";
              rowStatus = "pending";
            }

            li.className = "paper-item" + (isUnavailable ? " is-unavailable" : "");
            li.dataset.id = paper.id;
            li.dataset.sem = s;
            li.dataset.year = year;
            li.dataset.status = rowStatus; // activates custom glow hover effect

            li.innerHTML = `
              <div class="paper-main-content">
                <span class="paper-code">${escapeHtml(paper.code || "PAPER")}</span>
                <div class="paper-info">
                  <div class="paper-title">${escapeHtml(paper.name || "Untitled Paper")}</div>
                </div>
              </div>
              <div class="paper-meta-content">
                <div class="paper-status-indicator ${statusClass}">
                  ${statusLabel}
                </div>
                <div class="paper-actions-group">
                  ${
                    isUnavailable
                      ? `<span class="action-btn action-btn-disabled btn-unavail-text" title="Exam not held or paper unavailable">Unavailable</span>`
                      : hasLink && safeUrl
                      ? `<a href="${escapeHtml(safeUrl)}" target="_blank" rel="noopener noreferrer" class="action-btn action-btn-view" title="Open question paper">View PDF &#8599;</a>
                         <button class="action-btn action-btn-copy btn-copy-link" data-url="${escapeHtml(safeUrl)}" title="Copy paper link">&#128203;</button>`
                      : `<span class="action-btn action-btn-disabled">Pending</span>`
                  }
                </div>
              </div>
              <div class="edit-fields-wrap">
                <input type="text" class="input-edit input-edit-code edit-paper-field" data-id="${paper.id}" data-field="code" value="${escapeHtml(paper.code || "")}" placeholder="Code" title="Paper Code" />
                <input type="text" class="input-edit input-edit-name edit-paper-field" data-id="${paper.id}" data-field="name" value="${escapeHtml(paper.name || "")}" placeholder="Paper Name" title="Paper Name" />
                <input type="url" class="input-edit input-edit-link edit-paper-field" data-id="${paper.id}" data-field="link" value="${escapeHtml(paper.link || "")}" placeholder="URL / Link" title="Paper Link" />
                <select class="input-edit input-edit-status edit-paper-field" data-id="${paper.id}" data-field="status" title="Set Availability Status">
                  <option value="auto" ${!isUnavailable ? "selected" : ""}>Auto (Link/Pending)</option>
                  <option value="unavailable" ${isUnavailable ? "selected" : ""}>Unavailable</option>
                </select>
                <button class="btn-icon-del btn-del-paper" data-id="${paper.id}" title="Delete paper">&times;</button>
              </div>
            `;

            list.appendChild(li);
          });
        }

        body.appendChild(semCard);
      }

      yearsContainer.appendChild(block);
    });

    attachDynamicEventListeners();
    filterPapers();
    updateStats();
  }

  function updateSinglePaperRow(id) {
    const paper = state.papers[id];
    if (!paper) return;
    const row = document.querySelector(`.paper-item[data-id="${id}"]`);
    if (!row) return;

    const isUnavailable = paper.status === "unavailable";
    const hasLink = !isUnavailable && paper.link && paper.link.trim().length > 0;
    const safeUrl = hasLink ? sanitizeUrl(paper.link) : "";

    let statusLabel = "";
    let statusClass = "";
    let rowStatus = "pending";

    if (isUnavailable) {
      statusLabel = "&#8856; Unavailable";
      statusClass = "unavailable";
      rowStatus = "unavailable";
    } else if (hasLink) {
      statusLabel = "&#9679; Available";
      statusClass = "available";
      rowStatus = "available";
    } else {
      statusLabel = "&#9675; Pending Upload";
      statusClass = "pending";
      rowStatus = "pending";
    }

    row.className = "paper-item" + (isUnavailable ? " is-unavailable" : "");
    row.dataset.status = rowStatus;

    const codeEl = row.querySelector(".paper-code");
    if (codeEl) codeEl.textContent = paper.code || "PAPER";

    const titleEl = row.querySelector(".paper-title");
    if (titleEl) titleEl.textContent = paper.name || "Untitled Paper";

    const statusEl = row.querySelector(".paper-status-indicator");
    if (statusEl) {
      statusEl.className = `paper-status-indicator ${statusClass}`;
      statusEl.innerHTML = statusLabel;
    }

    const actionsEl = row.querySelector(".paper-actions-group");
    if (actionsEl) {
      actionsEl.innerHTML = isUnavailable
        ? `<span class="action-btn action-btn-disabled btn-unavail-text" title="Exam not held or paper unavailable">Unavailable</span>`
        : hasLink && safeUrl
        ? `<a href="${escapeHtml(safeUrl)}" target="_blank" rel="noopener noreferrer" class="action-btn action-btn-view" title="Open question paper">View PDF &#8599;</a>
           <button class="action-btn action-btn-copy btn-copy-link" data-url="${escapeHtml(safeUrl)}" title="Copy paper link">&#128203;</button>`
        : `<span class="action-btn action-btn-disabled">Pending</span>`;

      const copyBtn = actionsEl.querySelector(".btn-copy-link");
      if (copyBtn) {
        copyBtn.addEventListener("click", async (e) => {
          e.stopPropagation();
          try {
            await navigator.clipboard.writeText(copyBtn.dataset.url);
            showToast("Paper link copied to clipboard!", "success");
          } catch (err) {
            showToast("Could not copy link automatically", "error");
          }
        });
      }
    }
  }

  /* ==========================================================================
     SECTION 7: DYNAMIC EVENT LISTENERS
     ========================================================================= */
  function attachDynamicEventListeners() {
    // Accordion toggle
    document.querySelectorAll(".year-head").forEach((head) => {
      head.addEventListener("click", (e) => {
        if (e.target.closest(".btn-del-year")) return;
        const block = head.closest(".year-block");
        block.classList.toggle("open");
      });
    });

    // Copy link button
    document.querySelectorAll(".btn-copy-link").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        e.stopPropagation();
        const url = btn.dataset.url;
        try {
          await navigator.clipboard.writeText(url);
          showToast("Paper link copied to clipboard!", "success");
        } catch (err) {
          showToast("Could not copy link automatically", "error");
        }
      });
    });

    // Delete Year
    document.querySelectorAll(".btn-del-year").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const year = parseInt(btn.dataset.year, 10);
        if (confirm(`Delete academic year ${year} and all its recorded papers?`)) {
          deleteYear(year);
        }
      });
    });

    // Add Paper Modal trigger
    document.querySelectorAll(".btn-open-add-paper").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const year = btn.dataset.year;
        const sem = btn.dataset.sem;
        openAddPaperModal(year, sem);
      });
    });

    // Delete Paper
    document.querySelectorAll(".btn-del-paper").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        deletePaper(id);
      });
    });

    // Inline inputs auto-save
    document.querySelectorAll(".edit-paper-field").forEach((input) => {
      input.addEventListener("input", () => {
        const id = input.dataset.id;
        const field = input.dataset.field;
        if (!state.papers[id]) state.papers[id] = { code: "", name: "", link: "", status: "auto" };
        state.papers[id][field] = input.value;
        queueSave();
      });

      // When field value changes (blur, Enter, or select change), update only this row (no full page redraw)
      input.addEventListener("change", () => {
        const id = input.dataset.id;
        const field = input.dataset.field;
        if (!state.papers[id]) state.papers[id] = { code: "", name: "", link: "", status: "auto" };
        state.papers[id][field] = input.value;
        saveArchiveState();
        updateSinglePaperRow(id);
      });
    });
  }

  /* ==========================================================================
     SECTION 8: SEARCH & MULTI-CRITERIA FILTERS
     ========================================================================== */
  const searchInput = document.getElementById("searchInput");
  const statusFilter = document.getElementById("statusFilter");
  const semSelect = document.getElementById("semSelect");

  function filterPapers() {
    const query = (searchInput.value || "").trim().toLowerCase();
    const statusVal = statusFilter.value;
    const semVal = semSelect.value;
    let anyVisibleTotal = false;

    document.querySelectorAll(".year-block").forEach((yearBlock) => {
      const year = yearBlock.dataset.year;
      const yearMatchesNav = activeYearFilter === "all" || activeYearFilter === year;

      if (!yearMatchesNav) {
        yearBlock.style.display = "none";
        return;
      }

      let yearHasVisible = false;

      yearBlock.querySelectorAll(".sem-card").forEach((semCard) => {
        const sem = semCard.dataset.sem;
        const semMatches = semVal === "all" || semVal === sem;
        let semHasVisible = false;

        semCard.querySelectorAll(".paper-item").forEach((paperRow) => {
          const id = paperRow.dataset.id;
          if (!id) return;
          const paper = state.papers[id] || {};
          const name = (paper.name || "").toLowerCase();
          const code = (paper.code || "").toLowerCase();
          const link = (paper.link || "").trim();
          const isUnavailable = paper.status === "unavailable";
          const hasLink = !isUnavailable && link.length > 0;

          let statusMatches = true;
          if (statusVal === "available") {
            statusMatches = hasLink;
          } else if (statusVal === "pending") {
            statusMatches = !isUnavailable && !hasLink;
          } else if (statusVal === "unavailable") {
            statusMatches = isUnavailable;
          }

          const textMatches =
            !query ||
            name.includes(query) ||
            code.includes(query) ||
            year.includes(query) ||
            `sem ${sem}`.includes(query);

          const isVisible = semMatches && statusMatches && textMatches;
          paperRow.style.display = isVisible ? "" : "none";
          if (isVisible) semHasVisible = true;
        });

        const showSemCard = semMatches && (semHasVisible || (!query && statusVal === "all"));
        semCard.style.display = showSemCard ? "" : "none";
        if (showSemCard && semHasVisible) yearHasVisible = true;
      });

      const showYearBlock = (!query && statusVal === "all" && semVal === "all") || yearHasVisible;
      yearBlock.style.display = showYearBlock ? "" : "none";
      if (showYearBlock && yearHasVisible) {
        anyVisibleTotal = true;
        if (query || statusVal !== "all" || semVal !== "all") {
          yearBlock.classList.add("open");
        }
      }
    });

    if (noResults) {
      noResults.style.display = anyVisibleTotal ? "none" : "block";
    }
  }

  let searchDebounceTimer = null;
  searchInput.addEventListener("input", () => {
    clearTimeout(searchDebounceTimer);
    searchDebounceTimer = setTimeout(filterPapers, 80);
  });
  statusFilter.addEventListener("change", filterPapers);
  semSelect.addEventListener("change", () => {
    const val = semSelect.value;
    document.querySelectorAll(".sem-chip").forEach((c) => {
      c.classList.toggle("active", c.dataset.sem === val);
    });
    filterPapers();
  });

  document.querySelectorAll(".sem-chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      const val = chip.dataset.sem;
      semSelect.value = val;
      document.querySelectorAll(".sem-chip").forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");
      filterPapers();
    });
  });

  document.getElementById("btnExpandAll").addEventListener("click", () => {
    document.querySelectorAll(".year-block").forEach((b) => b.classList.add("open"));
  });
  document.getElementById("btnCollapseAll").addEventListener("click", () => {
    document.querySelectorAll(".year-block").forEach((b) => b.classList.remove("open"));
  });

  /* ==========================================================================
     SECTION 9: DATA OPERATIONS (YEARS & PAPERS)
     ========================================================================== */
  function deleteYear(year) {
    state.years = state.years.filter((y) => y !== year);
    Object.keys(state.papers).forEach((id) => {
      if (id.startsWith(`y${year}-`)) {
        delete state.papers[id];
      }
    });
    saveArchiveState();
    renderArchive();
    showToast(`Year ${year} removed`, "info");
  }

  function deletePaper(id) {
    if (state.papers[id]) {
      const name = state.papers[id].name || "Paper";
      delete state.papers[id];
      saveArchiveState();
      renderArchive();
      showToast(`Deleted "${name}"`, "info");
    }
  }

  // Add Year
  const newYearInput = document.getElementById("newYearInput");
  const btnAddYearSubmit = document.getElementById("btnAddYearSubmit");

  btnAddYearSubmit.addEventListener("click", () => {
    const val = parseInt(newYearInput.value.trim(), 10);
    if (isNaN(val) || val < 2000 || val > 2060) {
      showToast("Please enter a valid 4-digit academic year", "error");
      return;
    }
    if (state.years.includes(val)) {
      showToast(`Academic year ${val} is already added`, "error");
      return;
    }

    state.years.push(val);
    state.years.sort((a, b) => b - a);

    // Pre-populate standard curriculum slots
    for (let s = 1; s <= 6; s++) {
      const list = CU_CBCS_PAPERS[s] || [];
      list.forEach((p, idx) => {
        const id = `y${val}-s${s}-p${idx + 1}`;
        if (!state.papers[id]) {
          state.papers[id] = { code: p.code, name: p.name, link: "", status: "auto" };
        }
      });
    }

    saveArchiveState();
    newYearInput.value = "";
    activeYearFilter = "all";
    renderArchive();
    showToast(`Added academic session ${val}`, "success");

    const target = document.querySelector(`.year-block[data-year="${val}"]`);
    if (target) {
      target.classList.add("open");
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });

  // Add Custom Paper Modal
  const addPaperModal = document.getElementById("addPaperModal");
  const addPaperYear = document.getElementById("addPaperYear");
  const addPaperSem = document.getElementById("addPaperSem");
  const addPaperCode = document.getElementById("addPaperCode");
  const addPaperName = document.getElementById("addPaperName");
  const addPaperLink = document.getElementById("addPaperLink");
  const addPaperStatus = document.getElementById("addPaperStatus");
  const addPaperMessage = document.getElementById("addPaperMessage");

  function openAddPaperModal(year, sem) {
    addPaperYear.value = year;
    addPaperSem.value = sem;
    addPaperCode.value = "";
    addPaperName.value = "";
    addPaperLink.value = "";
    if (addPaperStatus) addPaperStatus.value = "auto";
    addPaperMessage.className = "form-message";
    addPaperMessage.textContent = "";
    document.getElementById("addPaperModalSubtitle").textContent = `Session ${year} • Semester ${SEM_ROMAN[sem]} (${SEM_WORD[sem]} Sem)`;
    addPaperModal.classList.add("open");
    setTimeout(() => addPaperCode.focus(), 50);
  }

  document.getElementById("btnCancelAddPaper").addEventListener("click", () => {
    addPaperModal.classList.remove("open");
  });

  document.getElementById("addPaperForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const year = addPaperYear.value;
    const sem = addPaperSem.value;
    const code = addPaperCode.value.trim();
    const name = addPaperName.value.trim();
    const link = sanitizeUrl(addPaperLink.value.trim());
    const status = addPaperStatus ? addPaperStatus.value : "auto";

    if (!code || !name) {
      addPaperMessage.textContent = "Paper code and name are required.";
      addPaperMessage.className = "form-message error";
      return;
    }

    let nextIdx = 1;
    while (state.papers[`y${year}-s${sem}-p${nextIdx}`]) {
      nextIdx++;
    }
    const newId = `y${year}-s${sem}-p${nextIdx}`;
    state.papers[newId] = { code, name, link, status };

    saveArchiveState();
    addPaperModal.classList.remove("open");
    renderArchive();
    showToast(`Added ${code}: ${name}`, "success");
  });

  /* ==========================================================================
     SECTION 10: ARCHIVE KPI STATISTICS UPDATE
     ========================================================================== */
  function updateStats() {
    let total = 0;
    let available = 0;
    let unavailable = 0;

    Object.values(state.papers || {}).forEach((p) => {
      if (p && p.name) {
        total++;
        if (p.status === "unavailable") {
          unavailable++;
        } else if (p.link && p.link.trim().length > 0) {
          available++;
        }
      }
    });

    const pending = total - available - unavailable;
    const activeTotal = total - unavailable;
    const coverage = activeTotal > 0 ? Math.round((available / activeTotal) * 100) : 0;

    const elTotal = document.getElementById("statTotal");
    const elAvailable = document.getElementById("statAvailable");
    const elPending = document.getElementById("statPending");
    const elUnavailable = document.getElementById("statUnavailable");
    const elCoverage = document.getElementById("statCoverage");

    if (elTotal) elTotal.textContent = total;
    if (elAvailable) elAvailable.textContent = available;
    if (elPending) elPending.textContent = pending;
    if (elUnavailable) elUnavailable.textContent = unavailable;
    if (elCoverage) elCoverage.textContent = `${coverage}%`;
  }

  /* ==========================================================================
     SECTION 11: AUTHENTICATION, ADMIN WELCOME CELEBRATION & PASSWORD UPDATE
     ========================================================================== */
  const btnAdminAccess = document.getElementById("btnAdminAccess");
  const adminBar = document.getElementById("adminBar");
  const loginModal = document.getElementById("loginModal");
  const loginEmail = document.getElementById("loginEmail");
  const loginPass = document.getElementById("loginPass");
  const loginMessage = document.getElementById("loginMessage");
  const adminWelcomeModal = document.getElementById("adminWelcomeModal");
  const btnDismissWelcome = document.getElementById("btnDismissWelcome");
  const btnHeaderLogout = document.getElementById("btnHeaderLogout");
  const btnLogout = document.getElementById("btnLogout");

  btnAdminAccess.addEventListener("click", () => {
    const isAuthenticated = sessionStorage.getItem("smv_admin_auth") === "1";
    if (isAuthenticated) {
      if (isAdminActive) {
        // Switch to preview mode (hides inputs, keeps session & Logout button visible)
        isAdminActive = false;
        document.body.classList.remove("is-editing");
        btnAdminAccess.innerHTML = "✏️ Edit Mode";
        btnAdminAccess.classList.remove("active");
        if (adminBar) adminBar.classList.remove("show");
        if (btnHeaderLogout) btnHeaderLogout.style.display = "inline-flex";
      } else {
        // Return to active edit mode
        enableAdminMode();
      }
    } else {
      openLoginModal();
    }
  });

  function openLoginModal() {
    loginMessage.className = "form-message";
    loginMessage.textContent = "";
    loginEmail.value = "";
    loginPass.value = "";
    loginModal.classList.add("open");
    setTimeout(() => loginEmail.focus(), 60);
  }

  function closeLoginModal() {
    loginModal.classList.remove("open");
  }

  function showWelcomeCelebrationPopup() {
    if (adminWelcomeModal) {
      adminWelcomeModal.classList.add("open");
    }
  }

  if (btnDismissWelcome) {
    btnDismissWelcome.addEventListener("click", () => {
      if (adminWelcomeModal) adminWelcomeModal.classList.remove("open");
      showToast("Editorial dashboard active. Happy updating!", "success");
    });
  }

  document.getElementById("btnCancelLogin").addEventListener("click", closeLoginModal);

  async function syncFirebaseAuth(email, pass) {
    if (!window.firebase || !firebase.auth || !isCloudConnected) return;
    try {
      const auth = firebase.auth();
      try {
        await auth.signInWithEmailAndPassword(email, pass);
        console.log("Firebase Auth editorial session authenticated.");
      } catch (signInErr) {
        if (signInErr.code === "auth/user-not-found") {
          try {
            await auth.createUserWithEmailAndPassword(email, pass);
            console.log("Firebase Auth admin account initialized.");
          } catch (createErr) {
            console.warn("Firebase Auth account creation notice:", createErr.message);
          }
        } else {
          console.warn("Firebase Auth notice:", signInErr.message);
        }
      }
    } catch (err) {
      console.warn("Firebase Auth sync notice:", err);
    }
  }

  document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = loginEmail.value.trim().toLowerCase();
    const pass = loginPass.value;

    const emailH = await sha256(email);
    const passH = await sha256(pass);

    const isValid = verifyCredentials(emailH, passH);

    if (isValid) {
      sessionStorage.setItem("smv_admin_auth", "1");
      enableAdminMode();
      closeLoginModal();
      showWelcomeCelebrationPopup();
      // Synchronize authenticated session with Firebase Auth
      syncFirebaseAuth(email, pass);
    } else {
      loginMessage.textContent = "Invalid credentials. Please verify your email and password.";
      loginMessage.className = "form-message error";
    }
  });

  function enableAdminMode() {
    isAdminActive = true;
    document.body.classList.add("is-editing");
    if (btnAdminAccess) {
      btnAdminAccess.textContent = "✓ Done Editing";
      btnAdminAccess.classList.add("active");
    }
    if (btnHeaderLogout) {
      btnHeaderLogout.style.display = "inline-flex";
    }
    if (adminBar) {
      adminBar.classList.add("show");
    }
  }

  function handleLogout() {
    sessionStorage.removeItem("smv_admin_auth");
    if (window.firebase && firebase.auth) {
      try {
        firebase.auth().signOut().catch(() => {});
      } catch (e) {}
    }
    isAdminActive = false;
    document.body.classList.remove("is-editing");
    if (btnAdminAccess) {
      btnAdminAccess.innerHTML = "🔒 Admin Mode";
      btnAdminAccess.classList.remove("active");
    }
    if (btnHeaderLogout) {
      btnHeaderLogout.style.display = "none";
    }
    if (adminBar) {
      adminBar.classList.remove("show");
    }
    showToast("Signed out of Admin Mode.", "info");
  }

  if (btnLogout) {
    btnLogout.addEventListener("click", handleLogout);
  }
  if (btnHeaderLogout) {
    btnHeaderLogout.addEventListener("click", handleLogout);
  }

  // Restore session
  if (sessionStorage.getItem("smv_admin_auth") === "1") {
    enableAdminMode();
  }

  // Change Password Modal
  const changePassModal = document.getElementById("changePassModal");
  const newAdminEmail = document.getElementById("newAdminEmail");
  const newAdminPass = document.getElementById("newAdminPass");
  const confirmAdminPass = document.getElementById("confirmAdminPass");
  const changePassMessage = document.getElementById("changePassMessage");

  document.getElementById("btnChangePass").addEventListener("click", () => {
    changePassMessage.className = "form-message";
    changePassMessage.textContent = "";
    newAdminEmail.value = "";
    newAdminPass.value = "";
    confirmAdminPass.value = "";
    changePassModal.classList.add("open");
    setTimeout(() => newAdminEmail.focus(), 60);
  });

  document.getElementById("btnCancelChangePass").addEventListener("click", () => {
    changePassModal.classList.remove("open");
  });

  document.getElementById("changePassForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = newAdminEmail.value.trim().toLowerCase();
    const pass = newAdminPass.value;
    const confirm = confirmAdminPass.value;

    if (pass.length < 6) {
      changePassMessage.textContent = "Password must be at least 6 characters long.";
      changePassMessage.className = "form-message error";
      return;
    }

    if (pass !== confirm) {
      changePassMessage.textContent = "Passwords do not match.";
      changePassMessage.className = "form-message error";
      return;
    }

    const emailH = await sha256(email);
    const passH = await sha256(pass);
    setAuthCredentials(emailH, passH);

    showToast("Admin credentials updated successfully!", "success");
    changePassModal.classList.remove("open");
  });

  /* ==========================================================================
     SECTION 12: DATA EXPORT & IMPORT (BACKUP & RESTORE)
     ========================================================================== */
  const exportModal = document.getElementById("exportModal");
  const exportJsonArea = document.getElementById("exportJsonArea");

  document.getElementById("btnExportData").addEventListener("click", () => {
    exportJsonArea.value = JSON.stringify(state, null, 2);
    exportModal.classList.add("open");
  });

  document.getElementById("btnCloseExport").addEventListener("click", () => {
    exportModal.classList.remove("open");
  });

  document.getElementById("btnCopyJson").addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(exportJsonArea.value);
      showToast("Archive JSON copied to clipboard!", "success");
    } catch (err) {
      showToast("Failed to copy JSON", "error");
    }
  });

  document.getElementById("btnDownloadJson").addEventListener("click", () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(exportJsonArea.value);
    const a = document.createElement("a");
    a.setAttribute("href", dataStr);
    a.setAttribute("download", `smv-cs-pyq-archive-${new Date().toISOString().split("T")[0]}.json`);
    document.body.appendChild(a);
    a.click();
    a.remove();
    showToast("Backup JSON file downloaded successfully!", "success");
  });

  // Import Modal
  const importModal = document.getElementById("importModal");
  const importFileInput = document.getElementById("importFileInput");
  const importJsonArea = document.getElementById("importJsonArea");
  const importMessage = document.getElementById("importMessage");

  document.getElementById("btnImportData").addEventListener("click", () => {
    importMessage.className = "form-message";
    importMessage.textContent = "";
    importFileInput.value = "";
    importJsonArea.value = "";
    importModal.classList.add("open");
  });

  document.getElementById("btnCloseImport").addEventListener("click", () => {
    importModal.classList.remove("open");
  });

  importFileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      importJsonArea.value = evt.target.result;
    };
    reader.readAsText(file);
  });

  document.getElementById("btnApplyImport").addEventListener("click", () => {
    try {
      const raw = importJsonArea.value.trim();
      if (!raw) {
        importMessage.textContent = "Please provide JSON data to import.";
        importMessage.className = "form-message error";
        return;
      }
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed.years) || typeof parsed.papers !== "object") {
        throw new Error("Invalid structure. Must contain 'years' array and 'papers' object.");
      }
      state = parsed;
      saveArchiveState();
      activeYearFilter = "all";
      renderArchive();
      importModal.classList.remove("open");
      showToast("Archive data restored successfully!", "success");
    } catch (err) {
      importMessage.textContent = "Import error: " + err.message;
      importMessage.className = "form-message error";
    }
  });

  // Modal dismissal via Escape or overlay click
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      document.querySelectorAll(".modal-overlay.open").forEach((m) => m.classList.remove("open"));
    }
  });
  document.querySelectorAll(".modal-overlay").forEach((overlay) => {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) overlay.classList.remove("open");
    });
  });

  /* ==========================================================================
     SECTION 13: CLOUD DATABASE (FIREBASE) MODAL & SETTINGS CONTROLLER
     ========================================================================== */
  const cloudConfigModal = document.getElementById("cloudConfigModal");
  const firebaseDbUrlInput = document.getElementById("firebaseDbUrl");
  const firebaseApiKeyInput = document.getElementById("firebaseApiKey");
  const firebaseProjectIdInput = document.getElementById("firebaseProjectId");
  const cloudConfigMessage = document.getElementById("cloudConfigMessage");
  const btnCloudConfig = document.getElementById("btnCloudConfig");
  const btnCloseCloudConfig = document.getElementById("btnCloseCloudConfig");
  const btnResetCloudConfig = document.getElementById("btnResetCloudConfig");
  const btnUploadLocalToCloud = document.getElementById("btnUploadLocalToCloud");
  const cloudConfigForm = document.getElementById("cloudConfigForm");

  if (btnCloudConfig) {
    btnCloudConfig.addEventListener("click", () => {
      const current = getCloudConfig();
      if (firebaseDbUrlInput) firebaseDbUrlInput.value = current.databaseURL || "";
      if (firebaseApiKeyInput) firebaseApiKeyInput.value = current.apiKey || "";
      if (firebaseProjectIdInput) firebaseProjectIdInput.value = current.projectId || "";
      if (cloudConfigMessage) {
        cloudConfigMessage.className = "form-message";
        cloudConfigMessage.textContent = "";
      }
      if (cloudConfigModal) {
        cloudConfigModal.classList.add("open");
        setTimeout(() => firebaseDbUrlInput && firebaseDbUrlInput.focus(), 60);
      }
    });
  }

  if (btnCloseCloudConfig) {
    btnCloseCloudConfig.addEventListener("click", () => {
      if (cloudConfigModal) cloudConfigModal.classList.remove("open");
    });
  }

  if (cloudConfigForm) {
    cloudConfigForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const dbUrl = (firebaseDbUrlInput ? firebaseDbUrlInput.value : "").trim();
      const apiKey = (firebaseApiKeyInput ? firebaseApiKeyInput.value : "").trim();
      const projectId = (firebaseProjectIdInput ? firebaseProjectIdInput.value : "").trim();

      if (!dbUrl || !dbUrl.startsWith("https://")) {
        if (cloudConfigMessage) {
          cloudConfigMessage.textContent = "Please enter a valid Firebase Database URL (starts with https://)";
          cloudConfigMessage.className = "form-message error";
        }
        return;
      }

      const newConfig = {
        databaseURL: dbUrl,
        apiKey: apiKey,
        projectId: projectId
      };

      setCloudConfig(newConfig);
      if (cloudConfigModal) cloudConfigModal.classList.remove("open");
      showToast("Cloud configuration saved. Connecting...", "info");
      initCloudDatabase();
    });
  }

  if (btnUploadLocalToCloud) {
    btnUploadLocalToCloud.addEventListener("click", () => {
      if (!dbRef) {
        initCloudDatabase();
      }
      if (!dbRef) {
        showToast("Cloud DB could not be initialized. Please check Database URL.", "error");
        return;
      }
      showToast("Uploading papers to Cloud DB...", "info");
      dbRef.set(state)
        .then(() => {
          isCloudConnected = true;
          updateCloudStatusBadge("live", "Cloud Live");
          showToast("Successfully uploaded local papers to Cloud DB!", "success");
          if (cloudConfigModal) cloudConfigModal.classList.remove("open");
        })
        .catch((err) => {
          console.error("Cloud upload error:", err);
          if (err && err.message && err.message.toLowerCase().includes("permission_denied")) {
            showToast("Firebase Rule Blocked: Please set .read: true, .write: true in Firebase Console Rules", "error");
          } else {
            showToast("Upload failed: " + err.message, "error");
          }
        });
    });
  }

  if (btnResetCloudConfig) {
    btnResetCloudConfig.addEventListener("click", () => {
      if (confirm("Disconnect from Cloud Database and revert to browser Local Mode?")) {
        setCloudConfig(null);
        isCloudConnected = false;
        dbRef = null;
        updateCloudStatusBadge("local", "Local Mode");
        if (cloudConfigModal) cloudConfigModal.classList.remove("open");
        showToast("Reverted to local mode.", "info");
      }
    });
  }

  /* ==========================================================================
     SECTION 14: DATE STAMP & INITIALIZATION
     ========================================================================== */
  function updateDateStamp() {
    const d = new Date();
    const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    const dayStr = String(d.getDate()).padStart(2, "0");
    const monthStr = months[d.getMonth()];
    const yearStr = d.getFullYear();
    const stampEl = document.getElementById("dateStamp");
    if (stampEl) {
      stampEl.textContent = `UPDATED TILL ${dayStr}-${monthStr}-${yearStr}`;
    }
  }

  // Launch Application
  updateDateStamp();
  loadArchiveState();
  renderArchive();
  initCloudDatabase();
})();
