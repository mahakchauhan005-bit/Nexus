document.addEventListener("DOMContentLoaded", function () {

    /* =================================
       TASK & ACTIVITY STORAGE HELPERS
    ================================= */

    function getTasks() {

        // Supports both localStorage keys
        const savedTasks =
            localStorage.getItem("nexoraTasks") ||
            localStorage.getItem("nexora_tasks");

        if (!savedTasks) {
            return [];
        }

        try {
            return JSON.parse(savedTasks);
        } catch (error) {
            console.error("Could not read tasks from local storage.");
            return [];
        }
    }


    function getActivities() {

        const savedActivities =
            localStorage.getItem("nexoraActivities");

        if (!savedActivities) {
            return [];
        }

        try {
            return JSON.parse(savedActivities);
        } catch (error) {
            console.error("Could not read activities from local storage.");
            return [];
        }
    }


    /* =================================
       CALCULATE TASK STATISTICS
    ================================= */

    function calculateTaskStats() {

        const tasks = getTasks();

        const totalTasks = tasks.length;

        const todayStr =
            new Date().toISOString().split("T")[0];


        // 1. Completed Tasks
        const completedTasks = tasks.filter(function (task) {

            return task.status === "completed";

        }).length;


        // 2. Overdue Tasks
        const overdueTasks = tasks.filter(function (task) {

            if (task.status === "completed") return false;

            if (task.status === "overdue") return true;

            return task.dueDate && task.dueDate < todayStr;

        }).length;


        // 3. Active / Pending Tasks
        const activeTasks = tasks.filter(function (task) {

            if (task.status === "completed") return false;

            if (task.status === "overdue") return false;

            return !task.dueDate || task.dueDate >= todayStr;

        }).length;


        let completedPercentage = 0;


        if (totalTasks > 0) {

            completedPercentage =
                Math.round(
                    (completedTasks / totalTasks) * 100
                );

        }


        return {

            totalTasks: totalTasks,

            completed: completedPercentage,

            completedTasks: completedTasks,

            active: activeTasks,

            overdue: overdueTasks

        };

    }


    /* =================================
       SUMMARY CARDS
    ================================= */

    function updateSummaryCards() {

        const stats = calculateTaskStats();

        const cards =
            document.querySelectorAll(".card1");


        if (cards.length < 4) {
            return;
        }


        /* TOTAL TASKS */

        const totalHeading =
            cards[0].querySelector("h2");

        const totalText =
            cards[0].querySelector("span");


        if (totalHeading) {
            totalHeading.textContent =
                stats.totalTasks;
        }

        if (totalText) {
            totalText.textContent =
                "All tasks";
        }


        /* COMPLETED */

        const completedHeading =
            cards[1].querySelector("h2");

        const completedText =
            cards[1].querySelector("span");


        if (completedHeading) {
            completedHeading.textContent =
                stats.completed + "%";
        }

        if (completedText) {
            completedText.textContent =
                stats.completedTasks + " tasks";
        }


        /* ACTIVE */

        const activeHeading =
            cards[2].querySelector("h2");

        const activeText =
            cards[2].querySelector("span");


        if (activeHeading) {
            activeHeading.textContent =
                stats.active;
        }

        if (activeText) {
            activeText.textContent =
                "Active tasks";
        }


        /* OVERDUE */

        const overdueHeading =
            cards[3].querySelector("h2");

        const overdueText =
            cards[3].querySelector("span");


        if (overdueHeading) {
            overdueHeading.textContent =
                stats.overdue;
        }

        if (overdueText) {
            overdueText.textContent =
                "Need attention";
        }


        console.log(
            "Analytics statistics:",
            stats
        );

    }


    /* =================================
       PERIOD DROPDOWN & SELECTION
    ================================= */

    const periodButton =
        document.querySelector("#periodBtn");

    const periodOptions =
        document.querySelector("#periodOptions");

    const periodText =
        periodButton
            ? periodButton.querySelector("span")
            : null;

    const periodChoices =
        document.querySelectorAll(
            "#periodOptions button"
        );


    if (periodButton && periodOptions) {

        periodButton.addEventListener(
            "click",
            function () {

                const isVisible =
                    periodOptions.style.display === "block";

                periodOptions.style.display =
                    isVisible
                        ? "none"
                        : "block";

            }
        );

    }


    periodChoices.forEach(function (choice) {

        choice.addEventListener(
            "click",
            function () {

                const selectedText =
                    choice.textContent.trim();

                const parts =
                    selectedText.split(" ");

                const days =
                    Number(parts[1]) || 7;


                if (periodText) {
                    periodText.textContent =
                        selectedText;
                }

                if (periodOptions) {
                    periodOptions.style.display =
                        "none";
                }


                updateDashboard(days);

            }
        );

    });


    /* =================================
       BAR CHART RENDERER
    ================================= */

    function renderChart(days) {

        const chart =
            document.querySelector(".chart");

        if (!chart) return;


        const tasks = getTasks();

        chart.innerHTML = "";


        const today = new Date();

        today.setHours(0, 0, 0, 0);


        const chartData = [];


        for (let i = days - 1; i >= 0; i--) {

            const date =
                new Date(today);

            date.setDate(
                today.getDate() - i
            );

            date.setHours(0, 0, 0, 0);


            let completed = 0;

            let pending = 0;


            tasks.forEach(function (task) {

                const createdDate =
                    task.createdAt
                        ? new Date(task.createdAt)
                        : null;


                if (createdDate) {
                    createdDate.setHours(0, 0, 0, 0);
                }


                const completedDate =
                    task.completedAt
                        ? new Date(task.completedAt)
                        : null;


                if (completedDate) {
                    completedDate.setHours(0, 0, 0, 0);
                }


                if (task.status === "completed") {

                    if (
                        completedDate &&
                        completedDate.getTime() ===
                        date.getTime()
                    ) {

                        completed++;

                    } else if (
                        !completedDate &&
                        createdDate &&
                        createdDate.getTime() ===
                        date.getTime()
                    ) {

                        completed++;

                    }

                } else {

                    if (
                        createdDate &&
                        createdDate.getTime() <=
                        date.getTime()
                    ) {

                        pending++;

                    }

                }

            });


            chartData.push({

                date: date,

                completed: completed,

                pending: pending

            });

        }


        let maximum = 1;


        chartData.forEach(function (item) {

            maximum =
                Math.max(
                    maximum,
                    item.completed,
                    item.pending
                );

        });


        chartData.forEach(function (item) {

            const column =
                document.createElement("div");

            column.classList.add(
                "chart-column"
            );


            const bars =
                document.createElement("div");

            bars.classList.add("bars");


            const completedBar =
                document.createElement("div");

            completedBar.classList.add(
                "chart-bar",
                "completed"
            );

            completedBar.style.height =
                ((item.completed / maximum) * 100) +
                "%";


            const pendingBar =
                document.createElement("div");

            pendingBar.classList.add(
                "chart-bar",
                "pending"
            );

            pendingBar.style.height =
                ((item.pending / maximum) * 100) +
                "%";


            bars.appendChild(
                completedBar
            );

            bars.appendChild(
                pendingBar
            );


            const label =
                document.createElement("span");

            label.textContent =
                item.date.toLocaleDateString(
                    "en-US",
                    {
                        weekday: "short"
                    }
                );


            column.appendChild(bars);

            column.appendChild(label);


            chart.appendChild(column);

        });

    }


    /* =================================
       PROJECT / STATUS DONUT
    ================================= */

    function updateProjectDonut() {

        const tasks = getTasks();

        const total = tasks.length;


        const completed =
            tasks.filter(
                t => t.status === "completed"
            ).length;


        const active =
            tasks.filter(
                t => t.status === "active"
            ).length;


        const overdue =
            tasks.filter(
                t =>
                    t.status === "overdue" ||
                    (
                        t.dueDate &&
                        t.dueDate <
                        new Date()
                            .toISOString()
                            .split("T")[0] &&
                        t.status !== "completed"
                    )
            ).length;


        let completedPercent = 0;

        let activePercent = 0;

        let overduePercent = 0;


        if (total > 0) {

            completedPercent =
                Math.round(
                    (completed / total) * 100
                );

            activePercent =
                Math.round(
                    (active / total) * 100
                );

            overduePercent =
                Math.max(
                    0,
                    100 -
                    completedPercent -
                    activePercent
                );

        }


        const donut =
            document.querySelector(
                ".project-chart"
            );


        if (!donut) return;


        const center =
            donut.querySelector(
                ".donut-center"
            );


        if (center) {

            const strong =
                center.querySelector(
                    "strong"
                );

            const span =
                center.querySelector(
                    "span"
                );


            if (strong) {

                strong.textContent =
                    total > 0
                        ? completedPercent + "%"
                        : "0%";

            }


            if (span) {

                span.textContent =
                    "Completed";

            }

        }


        const legendItems =
            donut.parentElement.querySelectorAll(
                ".legend-item"
            );


        if (legendItems.length >= 3) {

            const completedNumber =
                legendItems[0].querySelector(
                    "strong"
                );

            const activeNumber =
                legendItems[1].querySelector(
                    "strong"
                );

            const overdueNumber =
                legendItems[2].querySelector(
                    "strong"
                );


            if (completedNumber) {

                completedNumber.textContent =
                    completedPercent + "%";

            }


            if (activeNumber) {

                activeNumber.textContent =
                    activePercent + "%";

            }


            if (overdueNumber) {

                overdueNumber.textContent =
                    overduePercent + "%";

            }


            const labels =
                donut.parentElement.querySelectorAll(
                    ".legend-item span"
                );


            if (labels.length >= 3) {

                labels[0].textContent =
                    "Completed";

                labels[1].textContent =
                    "Active";

                labels[2].textContent =
                    "Overdue";

            }

        }


        if (total === 0) {

            donut.style.background =
                "#2A323D";

        } else {

            const stop1 =
                completedPercent;

            const stop2 =
                completedPercent +
                activePercent;


            donut.style.background =
                `conic-gradient(
                    #35D07F 0% ${stop1}%,
                    #4F8CFF ${stop1}% ${stop2}%,
                    #FF5C6C ${stop2}% 100%
                )`;

        }

    }


    /* =================================
       PRIORITY DONUT
    ================================= */

    function updatePriorityDonut() {

        const tasks = getTasks();

        const total = tasks.length;


        const high =
            tasks.filter(
                t => t.priority === "high"
            ).length;


        const medium =
            tasks.filter(
                t => t.priority === "medium"
            ).length;


        const low =
            tasks.filter(
                t => t.priority === "low"
            ).length;


        const donut =
            document.querySelector(
                ".priority-chart"
            );


        if (!donut) return;


        const center =
            donut.querySelector(
                ".donut-center"
            );


        if (center) {

            const strong =
                center.querySelector(
                    "strong"
                );

            const span =
                center.querySelector(
                    "span"
                );


            if (strong) {
                strong.textContent =
                    total;
            }

            if (span) {
                span.textContent =
                    "Total";
            }

        }


        const legendItems =
            donut.parentElement.querySelectorAll(
                ".legend-item"
            );


        if (legendItems.length >= 3) {

            const highNumber =
                legendItems[0].querySelector(
                    "strong"
                );

            const mediumNumber =
                legendItems[1].querySelector(
                    "strong"
                );

            const lowNumber =
                legendItems[2].querySelector(
                    "strong"
                );


            if (highNumber) {
                highNumber.textContent =
                    high;
            }

            if (mediumNumber) {
                mediumNumber.textContent =
                    medium;
            }

            if (lowNumber) {
                lowNumber.textContent =
                    low;
            }

        }


        let highPercent = 0;

        let mediumPercent = 0;


        if (total > 0) {

            highPercent =
                (high / total) * 100;

            mediumPercent =
                (medium / total) * 100;

        }


        if (total === 0) {

            donut.style.background =
                "#2A323D";

        } else {

            const stop1 =
                highPercent;

            const stop2 =
                highPercent +
                mediumPercent;


            donut.style.background =
                `conic-gradient(
                    #FF5C6C 0% ${stop1}%,
                    #F5B942 ${stop1}% ${stop2}%,
                    #35D07F ${stop2}% 100%
                )`;

        }

    }


    /* =================================
       RECENT ACTIVITY
       SHOW ONLY 7
    ================================= */

    function getTimeAgo(timestamp) {

        const difference =
            Date.now() - Number(timestamp);


        const seconds =
            Math.floor(
                difference / 1000
            );


        const minutes =
            Math.floor(
                seconds / 60
            );


        const hours =
            Math.floor(
                minutes / 60
            );


        const days =
            Math.floor(
                hours / 24
            );


        if (seconds < 60) {
            return "just now";
        }


        if (minutes < 60) {

            return (
                minutes +
                (
                    minutes === 1
                        ? " minute ago"
                        : " minutes ago"
                )
            );

        }


        if (hours < 24) {

            return (
                hours +
                (
                    hours === 1
                        ? " hour ago"
                        : " hours ago"
                )
            );

        }


        return (
            days +
            (
                days === 1
                    ? " day ago"
                    : " days ago"
            )
        );

    }


    /* =================================
       CREATE TASK ACTIVITIES
    ================================= */

    function createTaskActivities() {

        const tasks = getTasks();

        const activities = [];


        tasks.forEach(function (task) {

            let createdTimestamp =
                Date.now();


            if (task.createdAt) {

                createdTimestamp =
                    new Date(
                        task.createdAt
                    ).getTime();

            } else if (task.dueDate) {

                createdTimestamp =
                    new Date(
                        task.dueDate
                    ).getTime();

            } else if (task.id) {

                const idNum =
                    Number(task.id);


                if (
                    !isNaN(idNum) &&
                    idNum > 1000000000000
                ) {

                    createdTimestamp =
                        idNum;

                }

            }


            /* TASK CREATED */

            activities.push({

                icon: "+",

                type: "created",

                title:
                    "Task created: " +
                    (
                        task.title ||
                        "Untitled Task"
                    ),

                user:
                    "by Alex Reed",

                timestamp:
                    createdTimestamp

            });


            /* TASK COMPLETED */

            if (
                task.status ===
                "completed"
            ) {

                let completedTimestamp =
                    task.completedAt
                        ? new Date(
                            task.completedAt
                        ).getTime()
                        : createdTimestamp + 1000;


                activities.push({

                    icon: "✓",

                    type: "completed",

                    title:
                        "Task completed: " +
                        (
                            task.title ||
                            "Untitled Task"
                        ),

                    user:
                        "by Alex Reed",

                    timestamp:
                        completedTimestamp

                });

            }

        });


        return activities;

    }


    /* =================================
       RENDER RECENT ACTIVITY
       ONLY 7 ITEMS
    ================================= */

    function renderActivities() {

        const activityList =
            document.querySelector(
                ".activity-list"
            );


        if (!activityList) {
            return;
        }


        const storedActivities =
            getActivities();


        const taskActivities =
            createTaskActivities();


        const activities =
            [
                ...storedActivities,
                ...taskActivities
            ];


        /* Remove invalid activities */

        const validActivities =
            activities.filter(
                function (activity) {

                    return (
                        activity &&
                        activity.title &&
                        activity.timestamp
                    );

                }
            );


        /* Sort newest first */

        validActivities.sort(
            function (a, b) {

                return (
                    Number(b.timestamp) -
                    Number(a.timestamp)
                );

            }
        );


        /* Remove exact duplicate activities */

        const uniqueActivities = [];

        const activityKeys =
            new Set();


        validActivities.forEach(
            function (activity) {

                const key =
                    (
                        activity.type ||
                        ""
                    ) +
                    "|" +
                    (
                        activity.title ||
                        ""
                    ) +
                    "|" +
                    (
                        activity.timestamp ||
                        ""
                    );


                if (
                    !activityKeys.has(key)
                ) {

                    activityKeys.add(key);

                    uniqueActivities.push(
                        activity
                    );

                }

            }
        );


        activityList.innerHTML = "";


        /* =================================
           NO ACTIVITY
        ================================= */

        if (
            uniqueActivities.length === 0
        ) {

            activityList.innerHTML = `
                <div class="activity-item">
                    <div class="activity-info">
                        <div class="activity-title">
                            No recent activity
                        </div>

                        <div class="activity-user">
                            Create or complete a task to see activity here.
                        </div>
                    </div>
                </div>
            `;


            const viewAllBtn =
                document.querySelector(
                    "#view-all"
                );


            if (viewAllBtn) {
                viewAllBtn.style.display =
                    "none";
            }


            return;

        }


        /* =================================
           ONLY SHOW LATEST 7
        ================================= */

        const displayList =
            uniqueActivities.slice(0, 7);


        displayList.forEach(
            function (activity) {

                const item =
                    document.createElement(
                        "div"
                    );


                item.classList.add(
                    "activity-item"
                );


                const icon =
                    activity.icon || "+";


                const type =
                    activity.type || "created";


                const title =
                    activity.title ||
                    "Recent activity";


                const user =
                    activity.user ||
                    "by Alex Reed";


                item.innerHTML = `
                    <div class="activity-icon ${type}">
                        ${icon}
                    </div>

                    <div class="activity-info">

                        <div class="activity-title">
                            ${title}
                        </div>

                        <div class="activity-user">
                            ${user}
                        </div>

                    </div>

                    <div class="activity-time">
                        ${getTimeAgo(activity.timestamp)}
                    </div>
                `;


                activityList.appendChild(
                    item
                );

            }
        );


        /* =================================
           VIEW ALL HIDDEN
           BECAUSE ONLY 7 ARE REQUIRED
        ================================= */

        const viewAllBtn =
            document.querySelector(
                "#view-all"
            );


        if (viewAllBtn) {

            viewAllBtn.style.display =
                "none";

        }

    }


    /* =================================
       CALENDAR & NOTIFICATIONS
    ================================= */

    function getCalendarEvents() {

        const savedEvents =
            localStorage.getItem(
                "nexoraCalendarEvents"
            );


        if (!savedEvents) {
            return [];
        }


        try {

            return JSON.parse(
                savedEvents
            );

        } catch (error) {

            return [];

        }

    }


    function initCalendarNotifications() {

        const tasks = getTasks();

        const events =
            getCalendarEvents();


        const todayStr =
            new Date()
                .toISOString()
                .split("T")[0];


        /* Due today */

        const dueTodayTasks =
            tasks.filter(
                t =>
                    t.dueDate === todayStr &&
                    t.status !== "completed"
            );


        /* Overdue */

        const overdueTasks =
            tasks.filter(
                t =>
                    t.dueDate &&
                    t.dueDate < todayStr &&
                    t.status !== "completed"
            );


        /* Active calendar events */

        const activeEvents =
            events.filter(
                e =>
                    e.date >= todayStr &&
                    e.completed !== true
            );


        const notificationBtn =
            document.querySelector(
                ".notification-btn, .notification"
            );


        if (notificationBtn) {

            let badge =
                notificationBtn.querySelector(
                    ".notification-badge"
                );


            const alertCount =
                dueTodayTasks.length +
                overdueTasks.length +
                activeEvents.length;


            if (alertCount > 0) {

                if (!badge) {

                    badge =
                        document.createElement(
                            "span"
                        );


                    badge.className =
                        "notification-badge";


                    badge.style.cssText = `
                        position: absolute !important;
                        top: 2px !important;
                        right: 2px !important;
                        min-width: 18px !important;
                        height: 18px !important;
                        display: flex !important;
                        align-items: center !important;
                        justify-content: center !important;
                        background: #FF4D4D !important;
                        color: white !important;
                        font-size: 0.65rem !important;
                        font-weight: bold !important;
                        padding: 0 4px !important;
                        border-radius: 50% !important;
                        z-index: 9999 !important;
                        pointer-events: none !important;
                    `;


                    notificationBtn.style.position =
                        "relative";


                    notificationBtn.appendChild(
                        badge
                    );

                }


                badge.textContent =
                    alertCount === 1
                        ? "1"
                        : "1+";


            } else if (badge) {

                badge.remove();

            }


            notificationBtn.onclick =
                function (e) {

                    e.stopPropagation();

                    toggleNotificationDropdown(
                        dueTodayTasks,
                        overdueTasks,
                        activeEvents
                    );

                };

        }

    }


    function toggleNotificationDropdown(
        dueToday,
        overdue,
        events
    ) {

        let dropdown =
            document.getElementById(
                "calendarNotificationDropdown"
            );


        if (dropdown) {

            dropdown.remove();

            return;

        }


        dropdown =
            document.createElement(
                "div"
            );


        dropdown.id =
            "calendarNotificationDropdown";


        dropdown.style.cssText = `
            position: absolute;
            top: 60px;
            right: 20px;
            width: 340px;
            max-height: 400px;
            overflow-y: auto;
            background: var(--surface, #181D24);
            border: 1px solid var(--border, #2A323D);
            border-radius: 12px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);
            padding: 16px;
            z-index: 1000;
            color: var(--text, #F8FAFC);
        `;


        let html = `
            <h4 style="
                margin: 0 0 12px 0;
                font-size: 0.95rem;
                display: flex;
                align-items: center;
                justify-content: space-between;
            ">
                <span>Notifications</span>

                <small style="
                    color: var(--text-muted, #8A94A6);
                    font-weight: normal;
                ">
                    Tasks & Events
                </small>
            </h4>
        `;


        const totalAlerts =
            dueToday.length +
            overdue.length +
            events.length;


        if (totalAlerts === 0) {

            html += `
                <p style="
                    font-size: 0.85rem;
                    color: var(--text-muted, #8A94A6);
                    text-align: center;
                    padding: 15px 0;
                    margin: 0;
                ">
                    No pending alerts or events!
                </p>
            `;

        } else {

            html += `
                <div style="
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                ">
            `;


            /* Overdue Tasks */

            overdue.forEach(
                task => {

                    html += `
                        <div style="
                            padding: 10px;
                            background: rgba(255, 77, 77, 0.1);
                            border-left: 3px solid #FF4D4D;
                            border-radius: 6px;
                        ">
                            <strong style="
                                display: block;
                                font-size: 0.85rem;
                                color: #FF4D4D;
                            ">
                                Overdue Task:
                                ${task.title || "Untitled Task"}
                            </strong>

                            <small style="
                                color: var(--text-muted, #8A94A6);
                                font-size: 0.75rem;
                            ">
                                Due: ${task.dueDate}
                                • ${task.project || "General"}
                            </small>
                        </div>
                    `;

                }
            );


            /* Tasks Due Today */

            dueToday.forEach(
                task => {

                    html += `
                        <div style="
                            padding: 10px;
                            background: rgba(245, 185, 66, 0.1);
                            border-left: 3px solid #F5B942;
                            border-radius: 6px;
                        ">
                            <strong style="
                                display: block;
                                font-size: 0.85rem;
                                color: #F5B942;
                            ">
                                Due Today:
                                ${task.title || "Untitled Task"}
                            </strong>

                            <small style="
                                color: var(--text-muted, #8A94A6);
                                font-size: 0.75rem;
                            ">
                                Scheduled for today
                                • ${task.project || "General"}
                            </small>
                        </div>
                    `;

                }
            );


            /* Calendar Events */

            events.forEach(
                event => {

                    html += `
                        <div style="
                            padding: 10px;
                            background: rgba(124, 92, 252, 0.1);
                            border-left: 3px solid #7C5CFC;
                            border-radius: 6px;
                        ">
                            <strong style="
                                display: block;
                                font-size: 0.85rem;
                                color: #9B82FF;
                            ">
                                Event:
                                ${
                                    event.title ||
                                    event.name ||
                                    "Untitled Event"
                                }
                            </strong>

                            <small style="
                                color: var(--text-muted, #8A94A6);
                                font-size: 0.75rem;
                            ">
                                Date: ${event.date}
                                ${
                                    event.time
                                        ? " at " + event.time
                                        : ""
                                }
                            </small>
                        </div>
                    `;

                }
            );


            html += `
                </div>
            `;

        }


        dropdown.innerHTML =
            html;


        document.body.appendChild(
            dropdown
        );


        setTimeout(
            function () {

                document.addEventListener(
                    "click",
                    function closeMenu(e) {

                        if (
                            !dropdown.contains(
                                e.target
                            ) &&
                            !e.target.closest(
                                ".notification-btn, .notification"
                            )
                        ) {

                            dropdown.remove();

                            document.removeEventListener(
                                "click",
                                closeMenu
                            );

                        }

                    }
                );

            },
            100
        );

    }


    /* =================================
       DYNAMIC ACTIVITY UPDATES
    ================================= */

    window.addEventListener(
        "storage",
        function (event) {

            if (
                event.key ===
                    "nexoraActivities" ||
                event.key ===
                    "nexoraTasks" ||
                event.key ===
                    "nexora_tasks" ||
                event.key ===
                    "nexoraCalendarEvents"
            ) {

                updateDashboard(7);

            }

        }
    );


    /*
       This catches task changes made
       from another Nexora page/tab.
    */

    window.addEventListener(
        "taskStateChanged",
        function () {

            updateDashboard(7);

        }
    );


    /*
       This catches activity changes
       immediately without waiting for
       the 5 second refresh.
    */

    window.addEventListener(
        "activityChanged",
        function () {

            renderActivities();

        }
    );


    window.addEventListener(
        "projectActivityChanged",
        function () {

            renderActivities();

        }
    );


    /* =================================
       DASHBOARD UPDATE MASTER
    ================================= */

    function updateDashboard(days) {

        updateSummaryCards();

        renderChart(days || 7);

        updateProjectDonut();

        updatePriorityDonut();

        renderActivities();

        initCalendarNotifications();

    }


    /* =================================
       INITIAL LOAD
    ================================= */

    updateDashboard(7);


    /* =================================
       AUTO REFRESH
       Keeps "2 minutes ago" etc. current
    ================================= */

    setInterval(
        function () {

            updateDashboard(7);

        },
        5000
    );

});