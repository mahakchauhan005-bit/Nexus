/* ==========================================================================
   NEXORA CALENDAR & TASK MANAGER - CALENDAR.JS (ERROR-FREE)
   ========================================================================== */

/* =================================
   CALENDAR ELEMENTS
================================= */
const calendarGrid = document.getElementById("calendarGrid");
const monthDisplay = document.getElementById("monthDisplay");
const prevMonthButton = document.getElementById("prevMonth");
const nextMonthButton = document.getElementById("nextMonth");
const todayButton = document.getElementById("todayBtn");

/* =================================
   TASK ELEMENTS
================================= */
const taskModal = document.getElementById("taskModal");
const addTaskButton = document.getElementById("addTaskBtn");
const closeTaskModal = document.getElementById("closeTaskModal");
const cancelTask = document.getElementById("cancelTask");
const taskForm = document.getElementById("taskForm");
const taskTitle = document.getElementById("taskTitle");
const taskDate = document.getElementById("taskDate");
const taskPriority = document.getElementById("taskPriority");
const taskDescription = document.getElementById("taskDescription");

/* =================================
   EVENT ELEMENTS
================================= */
const eventModal = document.getElementById("eventModal");
const addEventButton = document.getElementById("addEventBtn");
const closeEventModal = document.getElementById("closeEventModal");
const cancelEvent = document.getElementById("cancelEvent");
const eventForm = document.getElementById("eventForm");
const eventTitle = document.getElementById("eventTitle");
const eventDate = document.getElementById("eventDate");
const eventTime = document.getElementById("eventTime");
const eventLocation = document.getElementById("eventLocation");
const eventColor = document.getElementById("eventColor");
const eventDescription = document.getElementById("eventDescription");

/* =================================
   ACTION & NAVIGATION ELEMENTS
================================= */
const viewAllBtn = document.getElementById("viewAllBtn");
const notificationButton = document.querySelector(".notification");

/* =================================
   MONTH NAMES
================================= */
const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

/* =================================
   CURRENT DATE & TRACKING
================================= */
const today = new Date();
let currentDate = new Date(today.getFullYear(), today.getMonth(), 1);
let editingEventId = null;

/* =================================
   LOCAL STORAGE KEYS
================================= */
const EVENTS_STORAGE_KEY = "nexoraCalendarEvents";
const TASKS_STORAGE_KEY = "nexoraTasks";
const NOTIFICATIONS_STORAGE_KEY = "nexoraNotifications";

/* =================================
   DEFAULT EVENTS
================================= */
const defaultEvents = [
    { id: 1, title: "Team Standup", date: "2026-10-02", time: "09:00", location: "Meeting Room A", color: "purple", description: "" },
    { id: 2, title: "Design Review", date: "2026-10-04", time: "11:00", location: "Conference Room", color: "green", description: "" },
    { id: 3, title: "Project Meeting", date: "2026-10-08", time: "13:00", location: "Meeting Room B", color: "yellow", description: "" },
    { id: 4, title: "Client Call", date: "2026-10-11", time: "14:00", location: "Zoom", color: "purple", description: "" }
];

/* =================================
   LOAD & SAVE EVENTS
================================= */
let events = JSON.parse(localStorage.getItem(EVENTS_STORAGE_KEY)) || [];

if (events.length === 0) {
    events = defaultEvents;
    localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(events));
}

function saveEvents() {
    localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(events));
    notifyModules();
}

/* =================================
   LOAD & SAVE TASKS
================================= */
function getStoredTasks() {
    const savedTasks = localStorage.getItem(TASKS_STORAGE_KEY);
    if (!savedTasks) return [];
    try {
        return JSON.parse(savedTasks);
    } catch (error) {
        console.error("Unable to read tasks:", error);
        return [];
    }
}

function saveTasks(tasks) {
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
    notifyModules();
}

/* =================================
   CROSS-MODULE EVENT DISPATCHER
================================= */
function notifyModules() {
    window.dispatchEvent(new CustomEvent("nexoraNotificationsUpdated", {
        detail: {
            notifications: getNotifications(),
            unreadCount: getNotifications().filter(n => !n.read).length
        }
    }));
}

/* =================================
   DATE HELPERS
================================= */
function getDateKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function getTodayKey() {
    return getDateKey(new Date());
}

/* =================================
   RENDER CALENDAR
================================= */
function renderCalendar() {
    if (!calendarGrid) return;

    calendarGrid.innerHTML = "";

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    if (monthDisplay) {
        monthDisplay.textContent = `${monthNames[month]} ${year}`;
    }

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPreviousMonth = new Date(year, month, 0).getDate();

    // Previous month filler days
    for (let i = firstDay - 1; i >= 0; i--) {
        const day = daysInPreviousMonth - i;
        createDay(day, year, month - 1, true);
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
        createDay(day, year, month, false);
    }

    // Next month filler days
    const totalDays = calendarGrid.children.length;
    const remainingDays = 42 - totalDays;

    for (let day = 1; day <= remainingDays; day++) {
        createDay(day, year, month + 1, true);
    }
}

function createDay(day, year, month, otherMonth) {
    const date = new Date(year, month, day);
    const dateKey = getDateKey(date);

    const dayElement = document.createElement("div");
    dayElement.classList.add("calendar-day");

    if (otherMonth) dayElement.classList.add("other-month");
    if (dateKey === getTodayKey()) dayElement.classList.add("today");

    const dayNumber = document.createElement("div");
    dayNumber.classList.add("day-number");
    dayNumber.textContent = date.getDate();
    dayElement.appendChild(dayNumber);

    // Active events
    const dayEvents = events.filter((event) => event.date === dateKey);
    dayEvents.forEach((event) => {
        const eventElement = document.createElement("div");
        eventElement.classList.add("calendar-event");
        eventElement.innerHTML = `
            <span class="event-dot ${event.color}"></span>
            <span>${event.title}</span>
        `;
        eventElement.addEventListener("click", (e) => {
            e.stopPropagation();
            editEvent(event.id);
        });
        dayElement.appendChild(eventElement);
    });

    // Active tasks (pending only)
    const allTasks = getStoredTasks();
    const dayTasks = allTasks.filter((task) => task.dueDate === dateKey && task.status !== "completed");
    dayTasks.forEach((task) => {
        const taskElement = document.createElement("div");
        taskElement.classList.add("calendar-event", "calendar-task");

        let color = "green";
        if (task.priority === "high") color = "red";
        else if (task.priority === "medium") color = "yellow";

        taskElement.innerHTML = `
            <span class="event-dot ${color}"></span>
            <span>${task.title}</span>
        `;
        dayElement.appendChild(taskElement);
    });

    // Quick-add event on cell click
    dayElement.addEventListener("click", (e) => {
        if (e.target.closest(".calendar-event")) return;
        if (eventModal) {
            editingEventId = null;
            eventModal.classList.add("active");
            if (eventDate) eventDate.value = dateKey;
            if (eventTime) eventTime.value = "09:00";
            if (eventTitle) eventTitle.focus();
        }
    });

    calendarGrid.appendChild(dayElement);
}

/* =================================
   MONTH NAVIGATION
================================= */
if (prevMonthButton) {
    prevMonthButton.addEventListener("click", function () {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });
}

if (nextMonthButton) {
    nextMonthButton.addEventListener("click", function () {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });
}

if (todayButton) {
    todayButton.addEventListener("click", function () {
        const todayDate = new Date();
        currentDate = new Date(todayDate.getFullYear(), todayDate.getMonth(), 1);
        renderCalendar();
    });
}

/* =================================
   TASK MODAL & SUBMISSION
================================= */
if (addTaskButton) {
    addTaskButton.addEventListener("click", function () {
        if (taskModal) taskModal.classList.add("active");
        if (taskDate) taskDate.value = getTodayKey();
        if (taskTitle) taskTitle.focus();
    });
}

function closeTaskModalWindow() {
    if (!taskModal) return;
    taskModal.classList.remove("active");
    if (taskForm) taskForm.reset();
}

if (closeTaskModal) closeTaskModal.addEventListener("click", closeTaskModalWindow);
if (cancelTask) cancelTask.addEventListener("click", closeTaskModalWindow);

if (taskModal) {
    taskModal.addEventListener("click", function (event) {
        if (event.target === taskModal) closeTaskModalWindow();
    });
}

if (taskForm) {
    taskForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const title = taskTitle.value.trim();
        const date = taskDate.value;
        const priority = taskPriority.value;
        const description = taskDescription.value.trim();

        if (!title || !date) return;

        let tasks = getStoredTasks();
        const newTask = {
            id: Date.now(),
            title: title,
            project: "Calendar",
            dueDate: date,
            priority: priority,
            description: description,
            status: "active",
            createdAt: Date.now()
        };

        tasks.push(newTask);
        saveTasks(tasks);

        addNotification("task", "New task created", title, date);

        renderCalendar();
        renderUpcomingEvents();
        updateNotifications();
        closeTaskModalWindow();
    });
}

/* =================================
   EVENT MODAL, EDIT & SUBMISSION
================================= */
if (addEventButton) {
    addEventButton.addEventListener("click", function () {
        editingEventId = null;
        if (eventForm) eventForm.reset();
        if (eventModal) eventModal.classList.add("active");
        if (eventDate) eventDate.value = getTodayKey();
        if (eventTime) eventTime.value = "09:00";
        if (eventTitle) eventTitle.focus();
    });
}

function closeEventModalWindow() {
    if (!eventModal) return;
    eventModal.classList.remove("active");
    editingEventId = null;
    if (eventForm) eventForm.reset();
}

if (closeEventModal) closeEventModal.addEventListener("click", closeEventModalWindow);
if (cancelEvent) cancelEvent.addEventListener("click", closeEventModalWindow);

if (eventModal) {
    eventModal.addEventListener("click", function (event) {
        if (event.target === eventModal) closeEventModalWindow();
    });
}

function editEvent(eventId) {
    const eventToEdit = events.find((e) => e.id === eventId);
    if (!eventToEdit) return;

    editingEventId = eventId;
    if (eventTitle) eventTitle.value = eventToEdit.title;
    if (eventDate) eventDate.value = eventToEdit.date;
    if (eventTime) eventTime.value = eventToEdit.time;
    if (eventLocation) eventLocation.value = eventToEdit.location || "";
    if (eventColor) eventColor.value = eventToEdit.color || "purple";
    if (eventDescription) eventDescription.value = eventToEdit.description || "";

    if (eventModal) eventModal.classList.add("active");
}

if (eventForm) {
    eventForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const title = eventTitle.value.trim();
        const date = eventDate.value;
        const time = eventTime.value;
        const location = eventLocation ? eventLocation.value.trim() : "";
        const color = eventColor ? eventColor.value : "purple";
        const description = eventDescription ? eventDescription.value.trim() : "";

        if (!title || !date || !time) return;

        if (editingEventId) {
            events = events.map((e) =>
                e.id === editingEventId
                    ? { ...e, title, date, time, location, color, description }
                    : e
            );
        } else {
            const newEvent = {
                id: Date.now(),
                title: title,
                date: date,
                time: time,
                location: location,
                color: color,
                description: description,
                createdAt: Date.now()
            };
            events.push(newEvent);
            addNotification("event", "New event created", title, date, time);
        }

        saveEvents();
        renderCalendar();
        renderUpcomingEvents();
        updateNotifications();
        closeEventModalWindow();
    });
}

/* =================================
   DYNAMIC UPCOMING EVENTS & TASKS
================================= */
function renderUpcomingEvents() {
    const upcomingEventsList = document.getElementById("upcomingEventsList");
    if (!upcomingEventsList) return;

    upcomingEventsList.innerHTML = "";
    const now = new Date();

    // Active events
    const activeEvents = events
        .map((event) => ({
            ...event,
            itemType: "event",
            dateObject: new Date(`${event.date}T${event.time || "00:00"}`)
        }))
        .filter((event) => event.dateObject >= now);

    // Active tasks (pending)
    const activeTasks = getStoredTasks()
        .filter((task) => task.status !== "completed")
        .map((task) => ({
            ...task,
            itemType: "task",
            time: "23:59",
            color: task.priority === "high" ? "red" : task.priority === "medium" ? "yellow" : "green",
            dateObject: new Date(`${task.dueDate}T23:59`)
        }))
        .filter((task) => task.dateObject >= now);

    const combinedList = [...activeEvents, ...activeTasks].sort((a, b) => a.dateObject - b.dateObject);
    const itemsToShow = combinedList.slice(0, 4);

    if (itemsToShow.length === 0) {
        upcomingEventsList.innerHTML = `
            <div style="padding: 20px; text-align: center; color: var(--text-muted, #8B93A1);">
                No upcoming events or tasks.
            </div>
        `;
        return;
    }

    itemsToShow.forEach((item) => {
        const itemElement = document.createElement("div");
        itemElement.classList.add("upcoming-event");
        itemElement.style.cssText = `
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 10px 12px;
            margin-bottom: 8px;
            background: var(--surface, #181D24);
            border-radius: 8px;
        `;

        const isTask = item.itemType === "task";

        itemElement.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px; flex: 1;">
                <span class="event-time" style="font-size: 0.8rem; color: #8B93A1;">
                    ${isTask ? "Task" : formatEventTime(item.time)}
                </span>
                <span class="event-color ${item.color}"></span>
                <div class="event-details">
                    <strong style="display: block; font-size: 0.9rem;">${item.title}</strong>
                    <small style="color: #8B93A1;">${isTask ? `Due: ${item.dueDate}` : item.location || "No location"}</small>
                </div>
            </div>
            <div style="display: flex; gap: 8px;">
                ${
                    isTask
                        ? `<button type="button" class="complete-task-btn" data-id="${item.id}" style="background: transparent; border: none; color: #35D07F; cursor: pointer;" title="Mark Complete">
                            <i class="fa-solid fa-circle-check"></i>
                           </button>`
                        : `<button type="button" class="edit-event-btn" data-id="${item.id}" style="background: transparent; border: none; color: #9B82FF; cursor: pointer;" title="Edit">
                            <i class="fa-solid fa-pen-to-square"></i>
                           </button>`
                }
                <button type="button" class="delete-item-btn" data-id="${item.id}" data-type="${item.itemType}" style="background: transparent; border: none; color: #FF5C6C; cursor: pointer;" title="Delete">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        `;

        upcomingEventsList.appendChild(itemElement);
    });

    // Complete Task Listeners
    upcomingEventsList.querySelectorAll(".complete-task-btn").forEach((btn) => {
        btn.addEventListener("click", function (e) {
            e.stopPropagation();
            completeTask(Number(btn.getAttribute("data-id")));
        });
    });

    // Edit Event Listeners
    upcomingEventsList.querySelectorAll(".edit-event-btn").forEach((btn) => {
        btn.addEventListener("click", function (e) {
            e.stopPropagation();
            editEvent(Number(btn.getAttribute("data-id")));
        });
    });

    // Delete Item Listeners
    upcomingEventsList.querySelectorAll(".delete-item-btn").forEach((btn) => {
        btn.addEventListener("click", function (e) {
            e.stopPropagation();
            deleteItem(Number(btn.getAttribute("data-id")), btn.getAttribute("data-type"));
        });
    });
}

function completeTask(taskId) {
    let tasks = getStoredTasks();
    tasks = tasks.map((t) => (t.id === taskId ? { ...t, status: "completed" } : t));
    saveTasks(tasks);

    renderCalendar();
    renderUpcomingEvents();
    updateNotifications();
}

function deleteItem(id, type) {
    if (type === "event") {
        events = events.filter((e) => e.id !== id);
        saveEvents();
    } else if (type === "task") {
        let tasks = getStoredTasks().filter((t) => t.id !== id);
        saveTasks(tasks);
    }

    renderCalendar();
    renderUpcomingEvents();
    updateNotifications();
}

/* =================================
   VIEW ALL (UPCOMING EVENTS & TASKS MODAL)
================================= */
document.addEventListener("click", (e) => {
    // Detect click on any view-all button
    const btn = e.target.closest("#viewAllEventsBtn, .view-all-btn, [data-action='view-all']");
    if (btn) {
        e.preventDefault();
        showUpcomingModal();
    }
});

function showUpcomingModal() {
    let modal = document.getElementById("viewAllModal");
    if (modal) modal.remove();

    // Fetch latest tasks and calendar events from LocalStorage
    const tasks = JSON.parse(localStorage.getItem("nexoraTasks")) || JSON.parse(localStorage.getItem("nexora_tasks")) || [];
    const calendarEvents = JSON.parse(localStorage.getItem("nexoraCalendarEvents")) || [];

    const todayStr = new Date().toISOString().split("T")[0];

    // 1. Filter upcoming active tasks (Not completed & Due today or in future)
    const upcomingTasks = tasks
        .filter(t => (t.status !== "completed" && t.completed !== true) && t.dueDate && t.dueDate.split("T")[0] >= todayStr)
        .map(t => ({
            title: t.title || "Untitled Task",
            date: t.dueDate.split("T")[0],
            time: "Due Date",
            type: "Task",
            category: t.project || "General",
            color: "#F5B942"
        }));

    // 2. Filter upcoming calendar events (Excluding auto-synced tasks to prevent duplicates)
    const upcomingEvents = calendarEvents
        .filter(e => !e.isFromTask && e.date && e.date.split("T")[0] >= todayStr && e.completed !== true)
        .map(e => ({
            title: e.title || e.name || "Untitled Event",
            date: e.date.split("T")[0],
            time: e.time || "",
            type: "Event",
            category: e.category || "General",
            color: "#7C5CFC"
        }));

    // Combine both and sort chronologically by date
    const allUpcoming = [...upcomingTasks, ...upcomingEvents].sort((a, b) => new Date(a.date) - new Date(b.date));

    modal = document.createElement("div");
    modal.id = "viewAllModal";
    modal.style.cssText = `
        position: fixed !important; top: 0 !important; left: 0 !important; width: 100vw !important; height: 100vh !important;
        background: rgba(0, 0, 0, 0.7) !important; display: flex !important; align-items: center !important;
        justify-content: center !important; z-index: 99999 !important; color: #F8FAFC !important;
    `;

    let html = `
        <div style="background: var(--surface, #181D24); width: 480px; max-width: 90vw; max-height: 80vh; border-radius: 12px; border: 1px solid #2A323D; padding: 20px; overflow-y: auto;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                <h3 style="margin: 0; color: #FFFFFF;">All Upcoming Events & Tasks</h3>
                <button id="closeViewAllModal" style="background: transparent; border: none; color: #8B93A1; font-size: 1.2rem; cursor: pointer;">&times;</button>
            </div>
    `;

    if (allUpcoming.length === 0) {
        html += `<p style="color: #8B93A1; font-size: 0.85rem; text-align: center; padding: 20px 0;">No upcoming events or tasks found.</p>`;
    } else {
        html += `<div style="display: flex; flex-direction: column; gap: 8px;">`;
        allUpcoming.forEach((item) => {
            html += `
                <div style="padding: 10px 14px; background: #222831; border-left: 4px solid ${item.color}; border-radius: 6px; display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <strong style="display: block; font-size: 0.9rem; color: #F8FAFC;">${item.title}</strong>
                        <small style="color: #8B93A1; font-size: 0.75rem;">${item.category} • ${item.date} ${item.time && item.time !== "Due Date" ? "at " + formatEventTime(item.time) : ""}</small>
                    </div>
                    <span style="font-size: 0.7rem; padding: 3px 8px; border-radius: 10px; background: ${item.color}22; color: ${item.color}; font-weight: 600;">
                        ${item.type}
                    </span>
                </div>
            `;
        });
        html += `</div>`;
    }

    html += `</div>`;
    modal.innerHTML = html;
    document.body.appendChild(modal);

    document.getElementById("closeViewAllModal").addEventListener("click", () => modal.remove());
    modal.addEventListener("click", (e) => {
        if (e.target === modal) modal.remove();
    });
}

/* =================================
   FORMAT EVENT TIME HELPER
================================= */
function formatEventTime(time) {
    if (!time) return "";
    const parts = time.split(":");
    let hour = Number(parts[0]);
    const minute = parts[1] || "00";
    const period = hour >= 12 ? "PM" : "AM";

    if (hour === 0) hour = 12;
    else if (hour > 12) hour -= 12;

    return `${String(hour).padStart(2, "0")}:${minute} ${period}`;
}

/* =================================
   NOTIFICATION MANAGERS
================================= */
function getNotifications() {
    const saved = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    if (!saved) return [];
    try {
        return JSON.parse(saved);
    } catch (error) {
        console.error("Unable to read notifications:", error);
        return [];
    }
}

function saveNotifications(notifications) {
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications));
    notifyModules();
}

function addNotification(type, title, message, date = "", time = "") {
    const notifications = getNotifications();
    const notification = {
        id: Date.now(),
        type: type,
        title: title,
        message: message,
        date: date,
        time: time,
        createdAt: Date.now(),
        read: false,
        completed: false
    };

    notifications.unshift(notification);
    saveNotifications(notifications.slice(0, 50));
}

function createTaskNotifications() {
    const tasks = getStoredTasks();
    const todayStr = getTodayKey();

    tasks.forEach((task) => {
        if (!task.dueDate || task.status === "completed" || task.completed) return;

        let notificationType = "";
        let notificationTitle = "";

        if (task.dueDate === todayStr) {
            notificationType = "due";
            notificationTitle = "Task due today";
        } else if (task.dueDate < todayStr) {
            notificationType = "overdue";
            notificationTitle = "Task overdue";
        } else {
            return;
        }

        const notificationKey = `${notificationType}-task-${task.id || task.title}-${task.dueDate}`;
        const notifications = getNotifications();

        if (notifications.some((n) => n.key === notificationKey)) return;

        notifications.unshift({
            id: `task-${task.id || task.title}`,
            key: notificationKey,
            type: notificationType,
            title: notificationTitle,
            message: task.title || "Untitled Task",
            date: task.dueDate,
            time: "",
            createdAt: Date.now(),
            read: false,
            completed: false
        });

        saveNotifications(notifications.slice(0, 50));
    });
}

function createEventNotifications() {
    const todayStr = getTodayKey();
    const todayEvents = events.filter((e) => e.date === todayStr);

    todayEvents.forEach((event) => {
        const notificationKey = `today-event-${event.id}-${event.date}`;
        const notifications = getNotifications();

        if (notifications.some((n) => n.key === notificationKey)) return;

        notifications.unshift({
            id: `event-${event.id}`,
            key: notificationKey,
            type: "event",
            title: "Event today",
            message: event.title,
            date: event.date,
            time: event.time,
            createdAt: Date.now(),
            read: false,
            completed: false
        });

        saveNotifications(notifications.slice(0, 50));
    });
}

function updateNotifications() {
    createTaskNotifications();
    createEventNotifications();
    renderNotificationBadge();
}

function renderNotificationBadge() {
    const notificationButton = document.querySelector(".notification");
    if (!notificationButton) return;

    const notifications = getNotifications();

    // Calculate active unread notifications
    const activeCount = notifications.filter((n) => n.completed !== true && n.read !== true).length;
    
    let badge = notificationButton.querySelector(".notification-badge");

    if (activeCount > 0) {
        if (!badge) {
            badge = document.createElement("span");
            badge.className = "notification-badge";
            notificationButton.appendChild(badge);
        }

        notificationButton.style.position = "relative";
        notificationButton.style.overflow = "visible";

        badge.style.cssText = `
            position: absolute !important;
            top: -2px !important;
            right: -2px !important;
            min-width: 18px !important;
            height: 18px !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            background-color: #FF4D4D !important;
            color: #ffffff !important;
            font-size: 0.65rem !important;
            font-weight: 700 !important;
            padding: 0 4px !important;
            border-radius: 50% !important;
            z-index: 99999 !important;
            pointer-events: none !important;
        `;

        // Shows exact count if 1, or "1+" if more than 1
        badge.textContent = activeCount === 1 ? "1" : "1+";
    } else if (badge) {
        badge.remove();
    }
}

// Global generator override supporting multi-item persistence and prevention of duplicates
window.generateNotificationsFromData = function() {
    updateNotifications();
    console.log("Notifications regenerated successfully!");
};

/* =================================
   AUTO-INITIALIZE ON PAGE LOAD
================================= */
document.addEventListener("DOMContentLoaded", function () {
    renderCalendar();
    renderUpcomingEvents();
    updateNotifications();
});
