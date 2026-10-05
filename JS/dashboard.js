/* =================================
   NEXORA DASHBOARD (FINAL CLEAN FIX)
================================= */

document.addEventListener("DOMContentLoaded", function () {
    updateDashboardUI();

    // Listen for cross-module state updates
    window.addEventListener("storage", updateDashboardUI);
    window.addEventListener("taskStateChanged", updateDashboardUI);
});

function updateDashboardUI() {
    /* 1. USER PROFILE */
    const savedName = localStorage.getItem("nexora_user_name") || localStorage.getItem("nexoraUserName") || "Alex Reed";
    const savedPhoto = localStorage.getItem("nexora_user_photo");

    const userNameElement = document.querySelector(".user-info strong");
    if (userNameElement) userNameElement.textContent = savedName;

    const welcomeHeading = document.querySelector(".welcome-card h2");
    if (welcomeHeading) {
        const firstName = savedName.trim().split(" ")[0];
        welcomeHeading.textContent = `Welcome back, ${firstName}.`;
    }

    const avatarElement = document.getElementById("headerAvatar") || document.querySelector(".user-avatar");
    if (avatarElement) {
        if (savedPhoto) {
            avatarElement.style.backgroundImage = `url(${savedPhoto})`;
            avatarElement.style.backgroundSize = "cover";
            avatarElement.style.backgroundPosition = "center";
            avatarElement.textContent = "";
        } else {
            const nameParts = savedName.trim().split(" ").filter(p => p.length > 0);
            let initials = nameParts[0] ? nameParts[0][0].toUpperCase() : "A";
            if (nameParts.length > 1) initials += nameParts[nameParts.length - 1][0].toUpperCase();
            avatarElement.textContent = initials;
        }
    }

    /* 2. DYNAMIC TASKS & CALENDAR EVENTS DATA */
    const rawTasks = JSON.parse(localStorage.getItem("nexoraTasks")) || JSON.parse(localStorage.getItem("nexora_tasks")) || [];
    const calendarEvents = JSON.parse(localStorage.getItem("nexoraCalendarEvents")) || [];

    const sanitizeDate = (dateVal) => (dateVal ? dateVal.split("T")[0] : "");
    const isCompleted = (t) => t.status === "completed" || t.completed === true;

    const uniqueProjects = [...new Set(rawTasks.map(t => t.project).filter(Boolean))];
    const totalProjects = uniqueProjects.length;

    const totalTasks = rawTasks.length;
    const completedTasks = rawTasks.filter(isCompleted).length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const todayStr = new Date().toISOString().split("T")[0];
    const dueTodayCount = rawTasks.filter(t => !isCompleted(t) && sanitizeDate(t.dueDate) === todayStr).length;

    // Update Stat Cards
    const statCards = document.querySelectorAll(".stat-card");
    if (statCards.length >= 4) {
        statCards[0].querySelector("strong").textContent = String(totalProjects).padStart(2, "0");
        statCards[1].querySelector("strong").textContent = String(totalTasks).padStart(2, "0");
        statCards[2].querySelector("strong").textContent = `${completionRate}%`;
        statCards[3].querySelector("strong").textContent = String(dueTodayCount).padStart(2, "0");
    }

    /* 3. DYNAMIC PROGRESS BAR */
    const progressContainer = document.querySelector(".progress-placeholder");
    if (progressContainer) {
        progressContainer.innerHTML = `
            <div style="width: 100%; padding: 10px 0;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 0.85rem;">
                    <span style="color: var(--text-muted, #94A3B8);">Overall Workspace Progress</span>
                    <strong style="color: var(--text, #F8FAFC);">${completionRate}%</strong>
                </div>
                <div style="width: 100%; height: 10px; background: var(--surface-3, #1D232C); border-radius: 6px; overflow: hidden;">
                    <div style="width: ${completionRate}%; height: 100%; background: linear-gradient(90deg, #9B82FF, #7C5CFC); transition: width 0.5s ease;"></div>
                </div>
                <div style="display: flex; gap: 16px; margin-top: 14px; font-size: 0.78rem; color: var(--text-muted, #94A3B8);">
                    <span><i class="fa-solid fa-circle" style="color: #35D07F; font-size: 0.6rem;"></i> ${completedTasks} Completed</span>
                    <span><i class="fa-solid fa-circle" style="color: #F5B942; font-size: 0.6rem;"></i> ${totalTasks - completedTasks} Active</span>
                </div>
            </div>
        `;
    }

    /* 4. RECENT TASKS FEED (Top 3 Items) */
    const taskListContainer = document.querySelector(".task-list");
    if (taskListContainer) {
        const formattedTasks = rawTasks.map(t => ({
            title: t.title || "Untitled Task",
            subtitle: t.project || "General",
            date: sanitizeDate(t.dueDate),
            completed: isCompleted(t),
            type: "Task",
            timestamp: new Date(t.dueDate || 0).getTime()
        }));

        const formattedEvents = calendarEvents
            .filter(e => !e.isFromTask)
            .map(e => ({
                title: e.title || e.name || "Untitled Event",
                subtitle: e.category || "Calendar Event",
                date: sanitizeDate(e.date),
                completed: e.completed === true,
                type: "Event",
                timestamp: new Date(e.date || 0).getTime()
            }));

        const allItems = [...formattedTasks, ...formattedEvents].sort((a, b) => b.timestamp - a.timestamp);
        const top3Items = allItems.slice(0, 3);

        if (top3Items.length === 0) {
            taskListContainer.innerHTML = `<p style="padding: 12px 0; color: var(--text-muted, #94A3B8); font-size: 0.85rem;">No recent tasks.</p>`;
        } else {
            taskListContainer.innerHTML = top3Items.map(item => `
                <div class="task-item" style="display: flex; align-items: center; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid var(--border, #2A323D);">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <span class="task-status ${item.completed ? "completed" : "active"}" 
                              style="width: 8px; height: 8px; border-radius: 50%; background: ${item.completed ? "#35D07F" : item.type === "Event" ? "#7C5CFC" : "#F5B942"};"></span>
                        <div>
                            <strong style="display: block; font-size: 0.9rem; color: var(--text, #F8FAFC); ${item.completed ? 'text-decoration: line-through; opacity: 0.6;' : ''}">
                                ${item.title}
                            </strong>
                            <small style="color: var(--text-muted, #94A3B8); font-size: 0.75rem;">
                                ${item.subtitle} ${item.date ? "• " + item.date : ""}
                            </small>
                        </div>
                    </div>
                    <span style="font-size: 0.7rem; padding: 2px 8px; border-radius: 10px; background: rgba(255,255,255,0.05); color: var(--text-muted, #94A3B8);">
                        ${item.type}
                    </span>
                </div>
            `).join("");
        }
    }

    // Bind "View all" click event safely
    const viewAllLink = document.getElementById("dashboardViewAllLink");
    if (viewAllLink) {
        viewAllLink.onclick = (e) => {
            e.preventDefault();
            showAllItemsModal();
        };
    }
}

/* =================================
   SAME-PAGE "VIEW ALL" POPUP MODAL
================================= */
function showAllItemsModal() {
    let modal = document.getElementById("nexoraAllItemsModal");
    if (modal) modal.remove();

    const rawTasks = JSON.parse(localStorage.getItem("nexoraTasks")) || [];
    const calendarEvents = JSON.parse(localStorage.getItem("nexoraCalendarEvents")) || [];
    const isCompleted = (t) => t.status === "completed" || t.completed === true;

    modal = document.createElement("div");
    modal.id = "nexoraAllItemsModal";
    modal.style.cssText = `
        position: fixed !important; top: 0 !important; left: 0 !important; width: 100vw !important; height: 100vh !important;
        background: rgba(0, 0, 0, 0.75) !important; display: flex !important; align-items: center !important;
        justify-content: center !important; z-index: 999999 !important; color: #F8FAFC !important;
        backdrop-filter: blur(4px);
    `;

    let html = `
        <div style="background: var(--surface, #181D24); width: 500px; max-width: 90vw; max-height: 85vh; border-radius: 14px; border: 1px solid var(--border, #2A323D); padding: 24px; display: flex; flex-direction: column; box-shadow: 0 20px 40px rgba(0,0,0,0.5);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; border-bottom: 1px solid var(--border, #2A323D); padding-bottom: 12px;">
                <h3 style="margin: 0; font-size: 1.1rem; color: #FFFFFF;">All Workspace Activities (${rawTasks.length + calendarEvents.length})</h3>
                <button id="closeNexoraModal" style="background: transparent; border: none; color: #94A3B8; font-size: 1.4rem; cursor: pointer; padding: 0 4px;">&times;</button>
            </div>
            
            <div style="overflow-y: auto; flex-grow: 1; display: flex; flex-direction: column; gap: 10px; padding-right: 4px;">
    `;

    if (rawTasks.length === 0 && calendarEvents.length === 0) {
        html += `<p style="text-align: center; color: #94A3B8; padding: 30px 0;">No tasks or events found.</p>`;
    } else {
        rawTasks.forEach(task => {
            const comp = isCompleted(task);
            html += `
                <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; background: rgba(255,255,255,0.03); border-radius: 8px; border-left: 3px solid ${comp ? '#35D07F' : '#F5B942'};">
                    <div>
                        <strong style="font-size: 0.9rem; ${comp ? 'text-decoration: line-through; opacity: 0.6;' : ''}">${task.title || "Untitled Task"}</strong>
                        <div style="font-size: 0.75rem; color: #94A3B8; margin-top: 2px;">${task.project || "General"} ${task.dueDate ? "• Due: " + task.dueDate.split("T")[0] : ""}</div>
                    </div>
                    <span style="font-size: 0.7rem; padding: 3px 8px; border-radius: 6px; background: ${comp ? 'rgba(53,208,127,0.15)' : 'rgba(245,185,66,0.15)'}; color: ${comp ? '#35D07F' : '#F5B942'}; font-weight: 500;">
                        ${comp ? 'Completed' : 'Active'}
                    </span>
                </div>
            `;
        });

        calendarEvents.filter(e => !e.isFromTask).forEach(evt => {
            html += `
                <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; background: rgba(255,255,255,0.03); border-radius: 8px; border-left: 3px solid #7C5CFC;">
                    <div>
                        <strong style="font-size: 0.9rem;">${evt.title || evt.name || "Untitled Event"}</strong>
                        <div style="font-size: 0.75rem; color: #94A3B8; margin-top: 2px;">${evt.category || "General"} • Date: ${evt.date ? evt.date.split("T")[0] : ""}</div>
                    </div>
                    <span style="font-size: 0.7rem; padding: 3px 8px; border-radius: 6px; background: rgba(124,92,252,0.15); color: #7C5CFC; font-weight: 500;">
                        Event
                    </span>
                </div>
            `;
        });
    }

    html += `</div></div>`;
    modal.innerHTML = html;
    document.body.appendChild(modal);

    document.getElementById("closeNexoraModal").addEventListener("click", () => modal.remove());
    modal.addEventListener("click", (e) => {
        if (e.target === modal) modal.remove();
    });
}