# CS PYQ Archive — Sammilani Mahavidyalya

> **Previous Year Question Paper Archive** for B.Sc. Computer Science (Honours / Major) at **Sammilani Mahavidyalya**, affiliated with the **University of Calcutta**.

---

## ⚡ Overview

This web repository provides a structured, responsive, and categorized archive of previous year university question papers across all six semesters (Sem 1 to Sem 6) from 2019 onward.

Built with **vanilla modern web technologies (HTML5, CSS3, JavaScript)**, the archive runs without any external libraries or heavyweight frameworks.

---

## 🚀 Key Features

* **Calcutta University CBCS / CCF Syllabus Pre-population:**
  * Core Courses (CC-1 through CC-14).
  * Skill Enhancement Courses (SEC-A, SEC-B).
  * Discipline Specific Electives (DSE-A, DSE-B).
  * General Electives (GE-1, GE-2).
* **Multi-Criteria Search & Filtering:**
  * Instant search by subject title, paper code (`CC-1`, `DBMS`, `Python`), or academic year.
  * Filter by semester (`Sem 1` to `Sem 6`) with quick-jump chips.
  * Filter by status (`Available Only`, `Pending Upload Only`, `Unavailable Only`).
* **Luminous Status Glow System:**
  * 🟢 **Green Glow:** Available question paper with verified PDF / Drive view link.
  * 🟡 **Yellow Glow:** Pending upload (paper awaiting upload).
  * 🔴 **Red Glow:** Unavailable (exams cancelled during COVID sessions or elective not offered).
* **Editorial Admin Mode:**
  * Secured with client-side SHA-256 cryptographic digests (zero plaintext credentials in source code).
  * Animated celebration welcome modal on successful sign in.
  * Inline editing for paper titles, codes, and Google Drive links.
  * Dedicated status toggle to mark papers as Available, Pending, or Unavailable.
  * Ability to add custom question papers and create new academic sessions.
* **Storage & Data Management:**
  * Auto-saves changes directly to browser `localStorage`.
  * **Export / Backup:** One-click download of `smv-cs-pyq-archive.json` or copy JSON to clipboard.
  * **Import:** Restore database from any JSON backup file.
* **Responsive Dark Aesthetics:**
  * Cyber-academic dark palette with glassmorphism.
  * High-DPI crystal-sharp college crest emblem.
  * Optimized for desktop, tablet, and mobile screens.

---

## 🛠️ Project Structure

```plaintext
PYQ/
├── index.html        # Semantic HTML structure & modal dialogs
├── style.css         # Modern styling, glow animations & responsive design
├── app.js            # Archive state controller, auth & curriculum data
├── logo.png          # High-resolution emblem (1855x1855)
├── logo-512.png      # Web-optimized crisp emblem (512x512)
└── README.md         # Documentation & guide
```

---

## 🔒 Security & Admin Access

Administrative features are restricted via SHA-256 cryptographic hashes. Credentials are never stored in plaintext within the repository:

* To access editorial features, click the **🔒 Admin Mode** button located in the top header.
* Authenticated admins can update their credentials at any time using the **Change Password** option in the Admin Toolbar.
* Edits made in Admin Mode can be exported via **Export Data** to update default static files.

---

## 💻 Running Locally

No installation, Node build step, or server configuration is required. Simply:

1. Double-click [index.html](file:///d:/Website/PYQ/index.html) in your file explorer to open it directly in any browser.
2. Or serve it via a local static HTTP server:
   ```bash
   # Using Python
   python -m http.server 8000

   # Or using Node.js
   npx serve .
   ```

---

## 👨‍💻 Creator & Attribution

* **Developer:** **GHOST (Aritra)**
* **Department:** Department of Computer Science
* **Institution:** Sammilani Mahavidyalya (University of Calcutta)
* **Batch:** 2024–2028
* **Department Portal:** [smmv-cs-dept.vercel.app](https://smmv-cs-dept.vercel.app/)
