/* =================================
   NEXORA TASKS & PROJECT MANAGEMENT
================================= */

let editingTaskId = null;

// Unified localStorage key
const LOCAL_STORAGE_KEY = "nexoraTasks";

const savedTasks = localStorage.getItem(LOCAL_STORAGE_KEY);
const tasks = savedTasks ? JSON.parse(savedTasks) : [];

console.log("TASKS LOADED:", tasks);

/* =================================
   EXPOSE GLOBAL FUNCTIONS FOR HTML
================================= */

// Toggle custom project name input field
window.toggleCustomProjectInput = function(selectElement) {
    const customInput = document.getElementById("taskProjectCustom");
    if (!customInput) return;

    if (selectElement.value === "__NEW__") {
        customInput.style.display = "block";
        customInput.focus();
    } else {
        customInput.style.display = "none";
        customInput.value = "";
    }
};

/* =================================
   DOM ELEMENTS
================================= */
const totalTasksElement = document.getElementById("totalTasks");
const completedTasksElement = document.getElementById("completedTasks");
const activeTasksElement = document.getElementById("activeTasks");
const overdueTasksElement = document.getElementById("overdueTasks");
const completedTaskCountElement = document.getElementById("completedTaskCount");

const tasksContainer = document.getElementById("tasksContainer");
const searchInput = document.getElementById("taskSearch");
const filterButtons = document.querySelectorAll(".filter-btn");
const sortSelect = document.getElementById("sortTasks");
const newTaskButton = document.getElementById("newTaskBtn");

// Modal Elements
const taskModal = document.getElementById("taskModal");
const closeTaskModal = document.getElementById("closeTaskModal");
const cancelTask = document.getElementById("cancelTask");
const taskForm = document.getElementById("taskForm");
const taskTitleInput = document.getElementById("taskTitle");

// Project selection elements
const taskProjectSelect = document.getElementById("taskProjectSelect");
const taskProjectCustom = document.getElementById("taskProjectCustom");

const taskDueDateInput = document.getElementById("taskDueDate");
const taskPriorityInput = document.getElementById("taskPriority");

// Header notification button
const notificationBtn = document.querySelector(".notification-btn, .notification");

let currentFilter = "all";

/* =================================
   INITIALIZATION
================================= */
document.addEventListener("DOMContentLoaded", () => {
    populateProjectFolders();
    updateStatistics();
    filterTasks();
    syncTasksToCalendarEvents();
    initCalendarNotifications();
});

/* =================================
   SAVE TASKS & SYNC
================================= */
function saveTasks() {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(tasks));
    populateProjectFolders();
    syncTasksToCalendarEvents();
    initCalendarNotifications();
}

/* =================================
   CALENDAR SYNC HELPER
================================= */
function syncTasksToCalendarEvents() {
    const CALENDAR_EVENTS_KEY = "nexoraCalendarEvents";
    let events = [];
    try {
        events = JSON.parse(localStorage.getItem(CALENDAR_EVENTS_KEY)) || [];
    } catch (e) {
        events = [];
    }

    // Keep manual calendar events, filter out previously auto-synced task events
    events = events.filter(e => !e.isFromTask);

    // Push active/overdue tasks into calendar events
    tasks.forEach(task => {
        if (task.dueDate) {
            events.push({
                id: `task-event-${task.id}`,
                taskId: task.id,
                title: task.title || "Untitled Task",
                date: task.dueDate.split("T")[0],
                time: "09:00",
                category: task.project || "Task",
                completed: task.status === "completed" || task.completed === true,
                isFromTask: true
            });
        }
    });

    localStorage.setItem(CALENDAR_EVENTS_KEY, JSON.stringify(events));
    window.dispatchEvent(new CustomEvent("taskStateChanged", { detail: { tasks } }));
}

/* =================================
   DYNAMIC PROJECT FOLDER OPTIONS
================================= */
function populateProjectFolders() {
    if (!taskProjectSelect) return;

    // Projects already used by tasks
    const taskProjects = tasks
        .map(task => task.project)
        .filter(Boolean);

    // Projects created from Projects page
    let storedProjects = [];

    try {
        storedProjects = JSON.parse(
            localStorage.getItem("nexoraProjects")
        ) || [];
    } catch (error) {
        console.error("Failed to load projects:", error);
    }

    // Get project names from nexoraProjects
    const projectNames = storedProjects
        .map(project => project.name)
        .filter(Boolean);

    // Combine projects from both places
    // and remove duplicates
    const allProjects = [
        ...new Set([
            ...projectNames,
            ...taskProjects
        ])
    ];

    let optionsHTML = `
        <option value="General">General</option>
    `;

    allProjects.forEach(projectName => {
        if (projectName === "General") return;

        optionsHTML += `
            <option value="${projectName}">
                ${projectName}
            </option>
        `;
    });

    optionsHTML += `
        <option value="__NEW__">
            + Create New Project Folder...
        </option>
    `;

    taskProjectSelect.innerHTML = optionsHTML;
}

/* =================================
   RENDER TASKS
================================= */
function renderTasks(taskList) {
    if (!tasksContainer) return;
    tasksContainer.innerHTML = "";

    if (taskList.length === 0) {
        tasksContainer.innerHTML = `
            <div class="empty-state" style="padding: 40px; text-align: center; color: var(--text-muted);">
                <i class="fa-regular fa-folder-open" style="font-size: 2rem; margin-bottom: 12px;"></i>
                <p>No tasks found.</p>
            </div>
        `;
        return;
    }

    taskList.forEach(task => {
        const isCompleted = task.status === "completed" || task.completed === true;
        const taskElement = document.createElement("div");

        taskElement.className = `task-item ${isCompleted ? "completed" : ""}`;
        taskElement.style.cssText = "display: flex; align-items: center; justify-content: space-between; padding: 14px 20px; border-bottom: 1px solid var(--border);";

        taskElement.innerHTML = `
            <div style="display: flex; align-items: center; gap: 14px;">
                <button class="task-check ${isCompleted ? "completed" : ""}" data-id="${task.id}" type="button">
                    <i class="fa-solid fa-check"></i>
                </button>
                <div class="task-info">
                    <strong style="${isCompleted ? 'text-decoration: line-through; opacity: 0.6;' : ''}">${task.title}</strong>
                    <br>
                    <small style="color: var(--text-muted);"><i class="fa-regular fa-folder"></i> ${task.project || "General"}</small>
                </div>
            </div>

            <div style="display: flex; align-items: center; gap: 16px;">
                <span class="task-date" style="font-size: 0.85rem; color: var(--text-muted);">${task.dueDate || "No due date"}</span>
                <span class="priority ${task.priority}">${capitalize(task.priority || "medium")}</span>
                
                <button class="btn-edit" data-id="${task.id}" type="button" title="Edit Task" style="background: none; border: none; color: var(--text-muted); cursor: pointer;">
                    <i class="fa-solid fa-pen-to-square"></i>
                </button>
                <button class="btn-delete" data-id="${task.id}" type="button" title="Delete Task" style="background: none; border: none; color: #FF4D4D; cursor: pointer;">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            </div>
        `;

        tasksContainer.appendChild(taskElement);
    });

    addTaskEvents();
}

function capitalize(value) {
    if (!value) return "";
    return value.charAt(0).toUpperCase() + value.slice(1);
}

/* =================================
   FILTER & SORT
================================= */
function filterTasks() {
    const searchValue = searchInput ? searchInput.value.toLowerCase().trim() : "";
    const todayStr = new Date().toISOString().split("T")[0];

    let filteredTasks = tasks.filter(task => {
        const cleanDueDate = task.dueDate ? task.dueDate.split("T")[0] : "";
        const isPending = task.status !== "completed" && task.completed !== true;

        let matchesFilter = true;
        if (currentFilter === "active") matchesFilter = isPending;
        else if (currentFilter === "completed") matchesFilter = !isPending;
        else if (currentFilter === "overdue") {
            matchesFilter = cleanDueDate && cleanDueDate < todayStr && isPending;
        }

        const matchesSearch = task.title.toLowerCase().includes(searchValue) ||
                              (task.project && task.project.toLowerCase().includes(searchValue));

        return matchesFilter && matchesSearch;
    });

    sortTasks(filteredTasks);
}

function sortTasks(taskList) {
    if (!sortSelect) {
        renderTasks(taskList);
        return;
    }

    const sortValue = sortSelect.value;

    if (sortValue === "name") {
        taskList.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortValue === "priority") {
        const priorityOrder = { high: 1, medium: 2, low: 3 };
        taskList.sort((a, b) => (priorityOrder[a.priority] || 2) - (priorityOrder[b.priority] || 2));
    } else if (sortValue === "due") {
        taskList.sort((a, b) => {
            if (!a.dueDate) return 1;
            if (!b.dueDate) return -1;
            return new Date(a.dueDate) - new Date(b.dueDate);
        });
    }

    renderTasks(taskList);
}

/* =================================
   EVENT HANDLERS
================================= */
if (filterButtons) {
    filterButtons.forEach(button => {
        button.addEventListener("click", () => {
            filterButtons.forEach(btn => btn.classList.remove("active"));
            button.classList.add("active");
            currentFilter = button.dataset.filter;
            filterTasks();
        });
    });
}

if (searchInput) searchInput.addEventListener("input", filterTasks);
if (sortSelect) sortSelect.addEventListener("change", filterTasks);

function addTaskEvents() {
    // Checkbox / Completion Toggle
    document.querySelectorAll(".task-check").forEach(button => {
        button.addEventListener("click", () => {
            const id = Number(button.dataset.id);
            const task = tasks.find(t => t.id === id);
            if (!task) return;

            const isComp = task.status === "completed" || task.completed === true;
            task.status = isComp ? "active" : "completed";
            task.completed = !isComp;

            saveTasks();
            updateStatistics();
            filterTasks();
        });
    });

    // Edit Button Handler
    document.querySelectorAll(".btn-edit").forEach(button => {
        button.addEventListener("click", () => {
            const id = Number(button.dataset.id);
            const task = tasks.find(t => t.id === id);
            if (!task) return;

            taskTitleInput.value = task.title;

            const projectVal = task.project || "General";
            populateProjectFolders();

            const existingOptions = Array.from(taskProjectSelect.options).map(opt => opt.value);
            if (existingOptions.includes(projectVal)) {
                taskProjectSelect.value = projectVal;
                taskProjectCustom.style.display = "none";
                taskProjectCustom.value = "";
            } else {
                taskProjectSelect.value = "__NEW__";
                taskProjectCustom.style.display = "block";
                taskProjectCustom.value = projectVal;
            }

            taskDueDateInput.value = task.dueDate || "";
            taskPriorityInput.value = task.priority || "medium";
            editingTaskId = task.id;

            const modalTitle = taskModal.querySelector("h2");
            if (modalTitle) modalTitle.textContent = "Edit Task";

            taskModal.classList.add("show");
        });
    });

    // Delete Button Handler
    document.querySelectorAll(".btn-delete").forEach(button => {
        button.addEventListener("click", () => {
            const id = Number(button.dataset.id);
            const index = tasks.findIndex(t => t.id === id);
            if (index !== -1) {
                tasks.splice(index, 1);
                saveTasks();
                updateStatistics();
                filterTasks();
                if (typeof showToast === "function") showToast("Task deleted!");
            }
        });
    });
}

/* =================================
   STATISTICS UPDATE
================================= */
function updateStatistics() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === "completed" || t.completed === true).length;
    const active = tasks.filter(t => t.status === "active" && !t.completed).length;
    
    const todayStr = new Date().toISOString().split("T")[0];
    const overdue = tasks.filter(t => {
        const cleanDate = t.dueDate ? t.dueDate.split("T")[0] : "";
        return cleanDate && cleanDate < todayStr && t.status !== "completed" && !t.completed;
    }).length;

    const completedPercentage = total === 0 ? 0 : Math.round((completed / total) * 100);

    if (totalTasksElement) totalTasksElement.textContent = total;
    if (completedTasksElement) completedTasksElement.textContent = `${completedPercentage}%`;
    if (activeTasksElement) activeTasksElement.textContent = active;
    if (overdueTasksElement) overdueTasksElement.textContent = overdue;
    if (completedTaskCountElement) {
        completedTaskCountElement.textContent = `${completed} ${completed === 1 ? "task" : "tasks"}`;
    }
}

function calculateTaskStats() {
    const currentTasks = JSON.parse(localStorage.getItem("nexoraTasks")) || [];
    const totalTasks = currentTasks.length;
    const todayStr = new Date().toISOString().split("T")[0];

    const completedTasks = currentTasks.filter(task => task.status === "completed" || task.completed === true).length;
    const overdueTasks = currentTasks.filter(task => {
        const cleanDate = task.dueDate ? task.dueDate.split("T")[0] : "";
        return task.status !== "completed" && !task.completed && cleanDate && cleanDate < todayStr;
    }).length;
    const activeTasks = currentTasks.filter(task => {
        const cleanDate = task.dueDate ? task.dueDate.split("T")[0] : "";
        return task.status !== "completed" && !task.completed && (!cleanDate || cleanDate >= todayStr);
    }).length;

    const completedPercentage = totalTasks > 0 
        ? Math.round((completedTasks / totalTasks) * 100) 
        : 0;

    return {
        totalTasks: totalTasks,
        completed: completedPercentage,
        completedTasks: completedTasks,
        active: activeTasks,
        overdue: overdueTasks
    };
}

/* =================================
   MODAL ACTIONS
================================= */
if (newTaskButton) {
    newTaskButton.addEventListener("click", () => {
        editingTaskId = null;
        if (taskForm) taskForm.reset();
        populateProjectFolders();
        if (taskProjectCustom) {
            taskProjectCustom.style.display = "none";
            taskProjectCustom.value = "";
        }
        const modalTitle = taskModal.querySelector("h2");
        if (modalTitle) modalTitle.textContent = "Create Task";
        taskModal.classList.add("show");
    });
}

const closeModal = () => {
    taskModal.classList.remove("show");
    editingTaskId = null;
    if (taskForm) taskForm.reset();
    if (taskProjectCustom) {
        taskProjectCustom.style.display = "none";
        taskProjectCustom.value = "";
    }
};

if (closeTaskModal) closeTaskModal.addEventListener("click", closeModal);
if (cancelTask) cancelTask.addEventListener("click", closeModal);

if (taskForm) {
    taskForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const title = taskTitleInput.value.trim();
        
        let project = taskProjectSelect.value;
        if (project === "__NEW__") {
            project = taskProjectCustom.value.trim() || "General";
        }

        const dueDate = taskDueDateInput.value;
        const priority = taskPriorityInput.value;

        if (editingTaskId !== null) {
            const task = tasks.find(t => t.id === editingTaskId);
            if (task) {
                task.title = title;
                task.project = project;
                task.dueDate = dueDate;
                task.priority = priority;
            }
        } else {
            const newTask = {
                id: Date.now(),
                title,
                project,
                dueDate,
                priority,
                status: "active",
                completed: false
            };
            tasks.unshift(newTask);
        }

        saveTasks();
        closeModal();
        updateStatistics();
        filterTasks();

        if (typeof showToast === "function") {
            showToast(editingTaskId !== null ? "Task updated!" : "New task created!");
        }
    });
}

/* =================================
   NEXORA CALENDAR & NOTIFICATIONS
================================= */
function initCalendarNotifications() {
    const rawTasks = JSON.parse(localStorage.getItem("nexoraTasks")) || [];
    const calendarEvents = JSON.parse(localStorage.getItem("nexoraCalendarEvents")) || [];
    const todayStr = new Date().toISOString().split("T")[0];

    const sanitizeDate = (dateVal) => {
        if (!dateVal) return "";
        return dateVal.split("T")[0];
    };

    const isPending = (task) => {
        return task.status !== "completed" && task.completed !== true;
    };

    const dueTodayTasks = rawTasks.filter(t => isPending(t) && sanitizeDate(t.dueDate) === todayStr);
    const overdueTasks = rawTasks.filter(t => isPending(t) && t.dueDate && sanitizeDate(t.dueDate) < todayStr);
    const activeEvents = calendarEvents.filter(e => !e.isFromTask && sanitizeDate(e.date) >= todayStr && e.completed !== true);

    const alertCount = dueTodayTasks.length + overdueTasks.length + activeEvents.length;

    const notificationBtn = document.querySelector(".notification-btn, .notification");
    if (notificationBtn) {
        let badge = notificationBtn.querySelector(".notification-badge, .notification-dot");

        if (!badge) {
            badge = document.createElement("span");
            badge.className = "notification-badge";
            badge.style.cssText = `
                position: absolute !important;
                top: 2px !important;
                right: 2px !important;
                background: #FF4D4D !important;
                color: white !important;
                font-size: 0.65rem !important;
                font-weight: bold !important;
                padding: 2px 5px !important;
                border-radius: 50% !important;
                line-height: 1 !important;
                min-width: 16px !important;
                text-align: center !important;
                z-index: 9999 !important;
                pointer-events: none !important;
            `;
            notificationBtn.style.position = "relative";
            notificationBtn.appendChild(badge);
        }

        if (alertCount === 0) {
            badge.textContent = "0";
            badge.style.background = "#4B5563";
        } else if (alertCount === 1) {
            badge.textContent = "1";
            badge.style.background = "#FF4D4D";
        } else {
            badge.textContent = "1+";
            badge.style.background = "#FF4D4D";
        }

        notificationBtn.onclick = (e) => {
            e.stopPropagation();
            toggleNotificationDropdown(dueTodayTasks, overdueTasks, activeEvents);
        };
    }
}

/* =================================
   NOTIFICATION DROPDOWN PANEL
================================= */
function toggleNotificationDropdown(dueToday = [], overdue = [], events = []) {
    let dropdown = document.getElementById("calendarNotificationDropdown");

    if (dropdown) {
        dropdown.remove();
        return;
    }

    dropdown = document.createElement("div");
    dropdown.id = "calendarNotificationDropdown";
    dropdown.style.cssText = `
        position: absolute !important;
        top: 60px !important;
        right: 20px !important;
        width: 320px !important;
        max-height: 380px !important;
        overflow-y: auto !important;
        background: #181D24 !important;
        border: 1px solid #2A323D !important;
        border-radius: 12px !important;
        box-shadow: 0 10px 25px rgba(0,0,0,0.5) !important;
        padding: 16px !important;
        z-index: 99999 !important;
        color: #F8FAFC !important;
    `;

    let html = `<h4 style="margin: 0 0 12px 0; font-size: 0.95rem; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #2A323D; padding-bottom: 8px;">
                    <span style="color: #FFFFFF; font-weight: bold;">Notifications</span>
                    <small style="color: #94A3B8; font-weight: normal;">Tasks & Events</small>
                </h4>`;

    const totalItems = dueToday.length + overdue.length + events.length;

    if (totalItems === 0) {
        html += `<p style="font-size: 0.85rem; color: #94A3B8; text-align: center; padding: 10px 0; margin: 0;">No pending alerts for today!</p>`;
    } else {
        html += `<div style="display: flex; flex-direction: column; gap: 8px;">`;

        overdue.forEach(task => {
            const cleanDate = (task.dueDate || "").split("T")[0];
            html += `
                <div style="padding: 10px; background: rgba(255, 77, 77, 0.15); border-left: 3px solid #FF4D4D; border-radius: 6px;">
                    <strong style="display: block; font-size: 0.85rem; color: #FF4D4D;">Overdue: ${task.title || "Untitled Task"}</strong>
                    <small style="color: #94A3B8; font-size: 0.75rem;">Due date: ${cleanDate} • ${task.project || "General"}</small>
                </div>
            `;
        });

        dueToday.forEach(task => {
            html += `
                <div style="padding: 10px; background: rgba(245, 185, 66, 0.15); border-left: 3px solid #F5B942; border-radius: 6px;">
                    <strong style="display: block; font-size: 0.85rem; color: #F5B942;">Due Today: ${task.title || "Untitled Task"}</strong>
                    <small style="color: #94A3B8; font-size: 0.75rem;">Scheduled Today • ${task.project || "General"}</small>
                </div>
            `;
        });

        events.forEach(evt => {
            const cleanDate = (evt.date || "").split("T")[0];
            html += `
                <div style="padding: 10px; background: rgba(124, 92, 252, 0.15); border-left: 3px solid #7C5CFC; border-radius: 6px;">
                    <strong style="display: block; font-size: 0.85rem; color: #9B82FF;">Event: ${evt.title || evt.name || "Untitled Event"}</strong>
                    <small style="color: #94A3B8; font-size: 0.75rem;">Date: ${cleanDate}</small>
                </div>
            `;
        });

        html += `</div>`;
    }

    dropdown.innerHTML = html;
    document.body.appendChild(dropdown);

    setTimeout(() => {
        document.addEventListener("click", function closeMenu(e) {
            if (!dropdown.contains(e.target) && !e.target.closest(".notification-btn, .notification")) {
                dropdown.remove();
                document.removeEventListener("click", closeMenu);
            }
        });
    }, 100);
}

/* =================================
   CREATE / SYNC PROJECT
================================= */
function ensureProjectExists(projectName) {
    if (!projectName || projectName === "General") return;

    const PROJECTS_STORAGE_KEY = "nexoraProjects";

    let projects = [];

    try {
        projects = JSON.parse(
            localStorage.getItem(PROJECTS_STORAGE_KEY)
        ) || [];
    } catch (error) {
        console.error("Failed to load projects:", error);
        projects = [];
    }

    // Prevent duplicate projects
    const alreadyExists = projects.some(
        project =>
            project.name.trim().toLowerCase() ===
            projectName.trim().toLowerCase()
    );

    if (alreadyExists) return;

    const newProject = {
        id: Date.now(),
        name: projectName.trim(),
        description: "Project created from Tasks.",
        status: "active",
        progress: 0,
        createdAt: Date.now(),
        dueDate: ""
    };

    projects.push(newProject);

    localStorage.setItem(
        PROJECTS_STORAGE_KEY,
        JSON.stringify(projects)
    );

    // Tell Projects page that projects changed
    window.dispatchEvent(
        new CustomEvent("projectStateChanged", {
            detail: { projects }
        })
    );
}