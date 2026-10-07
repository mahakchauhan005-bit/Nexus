# Nexora

**Nexora** is a modern project and task management dashboard built with **HTML, CSS, and JavaScript**.

It provides a centralized workspace for managing tasks and projects, viewing analytics, tracking activity, managing settings, and organizing your workflow.

## ✨ Features

* 📊 **Dashboard**

  * Overview of tasks and projects
  * Task statistics
  * Quick access to important sections

* ✅ **Task Management**

  * Create and manage tasks
  * Update task status
  * Mark tasks as completed
  * Organize tasks by priority

* 📁 **Project Management**

  * Create and manage projects
  * View all projects
  * Track project activity

* 📈 **Analytics**

  * Total tasks
  * Completed tasks
  * Active tasks
  * Overdue tasks
  * Task and project statistics
  * Priority analytics
  * Recent activity

* 🗓️ **Calendar**

  * View scheduled tasks
  * Track important dates
  * Calendar-based task organization

* ⚙️ **Settings**

  * Manage application settings
  * Customize user preferences

* 🔐 **Authentication**

  * Login page
  * Signup page

* 🕒 **Dynamic Recent Activity**

  * Tracks recent task and project activity
  * Updates dynamically
  * Displays the latest 7 activities

* 💾 **Local Storage**

  * Stores application data using browser `localStorage`
  * No backend database required

## 🛠️ Technologies Used

* HTML5
* CSS3
* JavaScript
* Chart.js
* Browser LocalStorage

## 📂 Project Structure

```text
Nexora/
│
├──index.html
├── HTML/
│   ├── dashboard.html
│   ├── tasks.html
│   ├── projects.html
│   ├── projectsall.html
│   ├── analytics.html
│   ├── calendar.html
│   ├── settings.html
│   ├── login.html
│   └── signup.html
│
├── CSS/
│   ├── dashboard.css
│   ├── tasks.css
│   ├── projects.css
│   ├── style.css
│   ├── analytics.css
│   ├── calendar.css
│   ├── settings.css
│   ├── login.css
│   └── signup.css
│
├── JS/
│   ├── dashboard.js
│   ├── tasks.js
│   ├── projects.js
│   ├──app.js
│   ├── analytics.js
│   ├── calendar.js
│   ├── settings.js
│   ├── login.js
│   └── signup.js
│
└── README.md
```

## 📄 HTML Pages

### Dashboard

`dashboard.html`

The main Nexora workspace providing an overview of tasks, projects, and important information.

### Tasks

`tasks.html`

Used to create, manage, update, and complete tasks.

### Projects

`projects.html`

Provides project management functionality and project-related information.

### All Projects

`projectsall.html`

Displays the complete list of projects.

### Analytics

`analytics.html`

Provides statistics, charts, task insights, project information, and recent activity.

### Calendar

`calendar.html`

Provides a calendar interface for viewing and organizing scheduled tasks and dates.

### Settings

`settings.html`

Used to manage application preferences and settings.

### Login

`login.html`

Provides the user login interface.

### Signup

`signup.html`

Provides the user registration interface.

## 🎨 CSS

The `css` folder contains the stylesheets used by the different sections of Nexora.

Each major page has its own stylesheet to keep the project organized and maintainable.

```text
css/
├── dashboard.css
├── tasks.css
├── projects.css
├── projectsall.css
├── analytics.css
├── calendar.css
├── settings.css
├── login.css
└── signup.css
```

## ⚙️ JavaScript

The `js` folder contains the functionality for the different Nexora pages.

```text
js/
├── dashboard.js
├── tasks.js
├── projects.js
├── projectsall.js
├── analytics.js
├── calendar.js
├── settings.js
├── login.js
└── signup.js
```

JavaScript handles features such as:

* Task creation and updates
* Project management
* Analytics calculations
* Recent activity
* Calendar functionality
* LocalStorage data
* User interface interactions
* Login and signup functionality

## 💾 Data Storage

Nexora currently uses the browser's **LocalStorage API** to store application data.

This allows tasks, projects, and activity information to remain available in the browser without requiring a backend server.

> **Note:** LocalStorage data is specific to the browser and device being used.

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/YOUR-USERNAME/nexora.git
```

### 2. Open the project

Open the Nexora folder in a code editor such as **Visual Studio Code**.

### 3. Run the application

Open the appropriate HTML file from the `html` folder.

For development, using the **Live Server** extension in VS Code is recommended.

## 🔮 Future Improvements

Possible future improvements include:

* User authentication with a backend
* Cloud database
* Multi-user collaboration
* Backend API
* Drag-and-drop task management
* Advanced analytics
* Real-time notifications
* User profiles
* Password recovery
* Dark and light themes
* Cloud synchronization
* Full production deployment

## 📌 Project Status

Nexora is an actively developed project management application.

The current version focuses on the frontend experience using HTML, CSS, JavaScript, and LocalStorage.

## 📄 License

This project is available for educational and personal use.

---

**Nexora**
*Project management, simplified.*
