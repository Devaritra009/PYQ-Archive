# CS PYQ Archive — Sammilani Mahavidyalya

> **Previous Year Question Paper Archive** for B.Sc. Computer Science (Honours / Major) at **Sammilani Mahavidyalya**, affiliated with the **University of Calcutta**.

---

## ⚡ Overview

This web repository provides a structured, responsive, and categorized archive of previous year university question papers across all semesters from 2019 onward.

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
* **Storage & Real-Time Cloud Synchronization:**
  * **Firebase Realtime Database Integration:** Paper links and curriculum edits synchronize in real-time across all visitors, students, and devices worldwide.
  * **Zero-Reload Live Updates:** Changes made by an admin propagate over WebSockets without requiring other users to refresh their browser.
  * **Offline Resilience:** Automatic fallback to browser `localStorage` if offline or prior to cloud configuration.
  * **Export / Backup:** One-click download of `smv-cs-pyq-archive.json` or copy JSON to clipboard.
  * **Import & Cloud Migration:** Restore database from any JSON backup or migrate local browser papers directly into Firebase with a single click.
* **Responsive Dark Aesthetics:**
  * Cyber-academic dark palette with glassmorphism.
  * High-DPI crystal-sharp college crest emblem.
  * Optimized for desktop, tablet, and mobile screens.

---

## ☁️ Real-Time Cloud Database Setup & Security Hardening (Free Firebase)

Follow these steps to configure Firebase with **read-only access for students** and **write access strictly restricted to the Admin**:

### Step 1: Create a Free Firebase Project
1. Open [Firebase Console](https://console.firebase.google.com/) and click **Add Project** (e.g. `smv-pyq-archive`).
2. Google Analytics can be toggled off or on (optional), then click **Create Project**.

### Step 2: Enable Firebase Authentication (Email/Password)
1. In the left sidebar, click **Build** &rarr; **Authentication** &rarr; click **Get Started**.
2. Under the **Sign-in method** tab, click **Email/Password**, enable the first toggle (**Email/Password**), and click **Save**.
3. Under the **Users** tab, click **Add user**:
   - Email: `aritrasarkarofficial027@gmail.com` (or your chosen admin email)
   - Password: your strong admin password

### Step 3: Create & Secure Realtime Database
1. In the left sidebar, click **Build** &rarr; **Realtime Database** &rarr; click **Create Database** (choose default location, e.g. Singapore or US Central).
2. Go to the **Rules** tab, replace the existing content with the following **Hardened Security Rules**, and click **Publish**:
   ```json
   {
     "rules": {
       "archive": {
         ".read": true,
         ".write": "auth != null",
         ".validate": "newData.hasChildren(['years', 'papers'])",
         "papers": {
           "$paperId": {
             ".validate": "newData.hasChildren(['code', 'name']) && (!newData.hasChild('link') || newData.child('link').isString())"
           }
         }
       }
     }
   }
   ```
   > **🔒 Why these rules are secure:**
   > - **Students & Visitors (`.read: true`):** Can ONLY view the archive, filter papers, copy links, and download PDFs.
   > - **Write Protection (`.write: "auth != null"`):** Only authenticated admin sessions can add, edit, or delete papers or links. Any unauthenticated write or tampering attempt is immediately rejected by Firebase servers.
   > - **Data Validation (`.validate`):** Enforces schema integrity, preventing corrupted or malicious data injection.

### Step 4: Connect the Database to Your Website
1. Copy your Realtime Database URL from the top of the Firebase Realtime Database page (e.g. `https://your-project-id-default-rtdb.firebaseio.com/`).
2. Open your PYQ Archive website.
3. Click **🔒 Admin Mode** in the top right header, sign in with your admin credentials.
4. In the Admin Toolbar, click **☁️ Cloud Sync DB**.
5. Paste your Database URL and click **✓ Save & Connect**.
6. Click **⬆️ Upload Local Data to Cloud** to sync all your existing papers and links to the cloud database.

All visitors worldwide will now see paper links update live in real-time, with zero risk of database tampering!

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
## 👨‍💻 Creator & Attribution

* **Developer:** **GHOST (Aritra)**
* **Department:** Department of Computer Science
* **Institution:** Sammilani Mahavidyalya (University of Calcutta)
* **Batch:** 2024–2028
* **Department Portal:** [smmv-cs-dept.vercel.app](https://smmv-cs-dept.vercel.app/)
