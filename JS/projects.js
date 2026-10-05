/* ================================= 
   NEXORA PROJECTS 
   Dynamic Projects from Tasks 
================================= */ 
 
 
/* ================================= 
   LOCAL STORAGE 
================================= */ 
 
const TASKS_STORAGE_KEY = "nexoraTasks"; 
const PROJECTS_STORAGE_KEY = "nexoraProjects"; 
const CALENDAR_EVENTS_KEY = "nexoraCalendarEvents"; 
 
 
/* ================================= 
   DOM ELEMENTS 
================================= */ 
 
const projectsGrid = 
    document.querySelector(".projects-grid"); 
 
const totalProjectsElement = 
    document.querySelector(".card1:nth-child(1) h2"); 
 
const completedProjectsElement = 
    document.querySelector(".card1:nth-child(2) h2"); 
 
const inProgressProjectsElement = 
    document.querySelector(".card1:nth-child(3) h2"); 
 
const onHoldProjectsElement = 
    document.querySelector(".card1:nth-child(4) h2"); 
 
const filterButtons = 
    document.querySelectorAll(".filter-btn"); 
 
const searchInput = 
    document.getElementById("taskSearch"); 
 
const sortSelect = 
    document.getElementById("sortProjects"); 
 
const createProjectButton = 
    document.querySelector(".create_project"); 
 
const activityList = 
    document.querySelector(".activity-list"); 
 
const notificationButton = 
    document.querySelector(".notification"); 
 
 
/* ================================= 
   STATE 
================================= */ 
 
let currentFilter = "all"; 
 
 
/* ================================= 
   LOAD TASKS 
================================= */ 
 
function getTasks() { 
 
    const savedTasks = 
        localStorage.getItem( 
            TASKS_STORAGE_KEY 
        ); 
 
 
    if (!savedTasks) { 
        return []; 
    } 
 
 
    try { 
 
        return JSON.parse( 
            savedTasks 
        ); 
 
    } 
 
    catch (error) { 
 
        console.error( 
            "Unable to load tasks:", 
            error 
        ); 
 
        return []; 
 
    } 
 
} 
 
 
/* ================================= 
   LOAD PROJECTS 
================================= */ 
 
function getProjects() { 
 
    const savedProjects = 
        localStorage.getItem( 
            PROJECTS_STORAGE_KEY 
        ); 
 
 
    if (!savedProjects) { 
        return []; 
    } 
 
 
    try { 
 
        return JSON.parse( 
            savedProjects 
        ); 
 
    } 
 
    catch (error) { 
 
        console.error( 
            "Unable to load projects:", 
            error 
        ); 
 
        return []; 
 
    } 
 
} 
 
 
/* ================================= 
   SAVE PROJECTS 
================================= */ 
 
function saveProjects(projects) { 
 
    localStorage.setItem( 
        PROJECTS_STORAGE_KEY, 
        JSON.stringify(projects) 
    ); 
 
} 
 
 
/* ================================= 
   CREATE PROJECTS FROM TASKS 
================================= */ 
 
function syncProjectsFromTasks() { 
 
    const tasks = 
        getTasks(); 
 
 
    let projects = 
        getProjects(); 
 
 
    /* 
       Find every unique project 
       used by the Tasks page. 
    */ 
 
    const projectNames = [ 
        ...new Set( 
            tasks 
                .map(function (task) { 
 
                    return ( 
                        task.project || 
                        "" 
                    ).trim(); 
 
                }) 
                .filter(function (name) { 
 
                    return name !== ""; 
 
                }) 
        ) 
    ]; 
 
 
    /* 
       Create a project automatically 
       when a task contains a new 
       project name. 
    */ 
 
    projectNames.forEach( 
        function (projectName) { 
 
            const existingProject = 
                projects.find( 
                    function (project) { 
 
                        return ( 
                            project.name 
                                .toLowerCase() === 
                            projectName 
                                .toLowerCase() 
                        ); 
 
                    } 
                ); 
 
 
            if (!existingProject) { 
 
                projects.push({ 
 
                    id: Date.now() + 
                        Math.random(), 
 
                    name: projectName, 
 
                    description: 
                        "Project created from tasks.", 
 
                    status: "active", 
 
                    createdAt: Date.now() 
 
                }); 
 
            } 
 
        } 
    ); 
 
 
    /* 
       Update project statistics 
       using its tasks. 
    */ 
 
    projects.forEach( 
        function (project) { 
 
            const projectTasks = 
                tasks.filter( 
                    function (task) { 
 
                        return ( 
                            ( 
                                task.project || 
                                "" 
                            ).toLowerCase() === 
                            project.name.toLowerCase() 
                        ); 
 
                    } 
                ); 
 
 
            const completedTasks = 
                projectTasks.filter( 
                    function (task) { 
 
                        return ( 
                            task.status === 
                                "completed" || 
                            task.completed === true 
                        ); 
 
                    } 
                ).length; 
 
 
            /* 
               Calculate progress. 
            */ 
 
            if ( 
                projectTasks.length > 0 
            ) { 
 
                project.progress = 
                    Math.round( 
                        ( 
                            completedTasks / 
                            projectTasks.length 
                        ) * 100 
                    ); 
 
            } 
 
            else { 
 
                project.progress = 
                    0; 
 
            } 
 
 
            /* 
               Do not overwrite 
               manually selected 
               On Hold status. 
            */ 
 
            if ( 
                project.status !== 
                "on-hold" 
            ) { 
 
                if ( 
                    projectTasks.length > 0 && 
                    completedTasks === 
                        projectTasks.length 
                ) { 
 
                    project.status = 
                        "completed"; 
 
                } 
 
                else if ( 
                    projectTasks.length > 0 
                ) { 
 
                    project.status = 
                        "active"; 
 
                } 
 
                else { 
 
                    project.status = 
                        "active"; 
 
                } 
 
            } 
 
 
            /* 
               Find latest due date. 
            */ 
 
            const dates = 
                projectTasks 
                    .map(function (task) { 
 
                        return task.dueDate; 
 
                    }) 
                    .filter(Boolean) 
                    .sort(); 
 
 
            if ( 
                dates.length > 0 
            ) { 
 
                project.dueDate = 
                    dates[dates.length - 1]; 
 
            } 
 
            else { 
 
                project.dueDate = ""; 
 
            } 
 
        } 
    ); 
 
 
    saveProjects(projects); 
 
 
    return projects; 
 
} 
 
 
/* ================================= 
   GET PROJECT STATUS 
================================= */ 
 
function getProjectStatus( 
    project 
) { 
 
    if ( 
        project.status === 
        "on-hold" 
    ) { 
 
        return { 
            text: "On Hold", 
            className: "on-hold" 
        }; 
 
    } 
 
 
    if ( 
        project.status === 
        "completed" 
    ) { 
 
        return { 
            text: "Completed", 
            className: "completed" 
        }; 
 
    } 
 
 
    if ( 
        project.progress === 0 
    ) { 
 
        return { 
            text: "Active", 
            className: "active-status" 
        }; 
 
    } 
 
 
    return { 
        text: "In Progress", 
        className: "in-progress" 
    }; 
 
} 
 
 
/* ================================= 
   PROJECT ICON 
================================= */ 
 
function getProjectIcon( 
    index 
) { 
 
    const icons = [ 
 
        "fa-folder", 
 
        "fa-code", 
 
        "fa-mobile-screen", 
 
        "fa-bullhorn", 
 
        "fa-chart-pie", 
 
        "fa-file-lines", 
 
        "fa-users" 
 
    ]; 
 
 
    return ( 
        icons[ 
            index % icons.length 
        ] 
    ); 
 
} 
 
 
/* ================================= 
   PROJECT COLOR 
================================= */ 
 
function getProjectColor( 
    index 
) { 
 
    const colors = [ 
 
        "#9B82FF", 
 
        "#35D07F", 
 
        "#4F8CFF", 
 
        "#F5B942", 
 
        "#FF5C6C" 
 
    ]; 
 
 
    return ( 
        colors[ 
            index % colors.length 
        ] 
    ); 
 
} 
 
 
/* ================================= 
   ESCAPE HTML 
================================= */ 
 
function escapeHTML( 
    value 
) { 
 
    if (!value) { 
        return ""; 
    } 
 
 
    return String(value) 
        .replace(/&/g, "&amp;") 
        .replace(/</g, "&lt;") 
        .replace(/>/g, "&gt;") 
        .replace(/"/g, "&quot;") 
        .replace(/'/g, "&#039;"); 
 
} 
 
 
/* ================================= 
   FORMAT DATE 
================================= */ 
 
function formatDate( 
    date 
) { 
 
    if (!date) { 
 
        return "No due date"; 
 
    } 
 
 
    const cleanDate = 
        date.split("T")[0]; 
 
    const parts = 
        cleanDate.split("-"); 
 
 
    if ( 
        parts.length !== 3 
    ) { 
 
        return cleanDate; 
 
    } 
 
 
    const year = 
        Number(parts[0]); 
 
    const month = 
        Number(parts[1]) - 1; 
 
    const day = 
        Number(parts[2]); 
 
 
    const formattedDate = 
        new Date( 
            year, 
            month, 
            day 
        ); 
 
 
    return formattedDate.toLocaleDateString( 
        "en-US", 
        { 
            month: "short", 
            day: "numeric", 
            year: "numeric" 
        } 
    ); 
 
} 
 
 
/* ================================= 
   FILTER PROJECTS 
================================= */ 
 
function filterProjects() { 
 
    const projects = 
        syncProjectsFromTasks(); 
 
 
    const searchValue = 
        searchInput 
            ? searchInput.value 
                .toLowerCase() 
                .trim() 
            : ""; 
 
 
    let filteredProjects = 
        projects.filter( 
            function (project) { 
 
                /* 
                   Status filter 
                */ 
 
                let matchesFilter = 
                    true; 
 
 
                if ( 
                    currentFilter === 
                    "active" 
                ) { 
 
                    matchesFilter = 
                        project.status === 
                            "active"; 
 
                } 
 
 
                if ( 
                    currentFilter === 
                    "completed" 
                ) { 
 
                    matchesFilter = 
                        project.status === 
                            "completed"; 
 
                } 
 
 
                if ( 
                    currentFilter === 
                    "on-hold" 
                ) { 
 
                    matchesFilter = 
                        project.status === 
                            "on-hold"; 
 
                } 
 
 
                /* 
                   Search filter 
                */ 
 
                const matchesSearch = 
                    project.name 
                        .toLowerCase() 
                        .includes( 
                            searchValue 
                        ); 
 
 
                return ( 
                    matchesFilter && 
                    matchesSearch 
                ); 
 
            } 
        ); 
 
 
    sortProjects( 
        filteredProjects 
    ); 
 
} 
 
 
/* ================================= 
   SORT PROJECTS 
================================= */ 
 
function sortProjects( 
    projectList 
) { 
 
    if (!sortSelect) { 
 
        renderProjects( 
            projectList 
        ); 
 
        return; 
 
    } 
 
 
    const sortValue = 
        sortSelect.value; 
 
 
    if ( 
        sortValue === 
        "name" 
    ) { 
 
        projectList.sort( 
            function (a, b) { 
 
                return a.name.localeCompare( 
                    b.name 
                ); 
 
            } 
        ); 
 
    } 
 
 
    else if ( 
        sortValue === 
        "priority" 
    ) { 
 
        projectList.sort( 
            function (a, b) { 
 
                return ( 
                    b.progress - 
                    a.progress 
                ); 
 
            } 
        ); 
 
    } 
 
 
    else { 
 
        projectList.sort( 
            function (a, b) { 
 
                return ( 
                    (b.createdAt || 0) - 
                    (a.createdAt || 0) 
                ); 
 
            } 
        ); 
 
    } 
 
 
    renderProjects( 
        projectList 
    ); 
 
} 
 
 
/* ================================= 
   RENDER PROJECTS 
================================= */ 
 
function renderProjects( 
    projectList 
) { 
 
    if (!projectsGrid) { 
        return; 
    } 
 
 
    projectsGrid.innerHTML = 
        ""; 
 
 
    if ( 
        projectList.length === 0 
    ) { 
 
        projectsGrid.innerHTML = ` 
 
            <div 
                style=" 
                    grid-column: 1 / -1; 
                    padding: 50px 20px; 
                    text-align: center; 
                    color: var(--text-muted); 
                " 
            > 
 
                <i 
                    class="fa-regular fa-folder-open" 
                    style=" 
                        font-size: 2rem; 
                        margin-bottom: 12px; 
                    " 
                ></i> 
 
                <p> 
                    No projects found. 
                </p> 
 
            </div> 
 
        `; 
 
        return; 
 
    } 
 
 
    projectList.forEach( 
        function (project, index) { 
 
            const status = 
                getProjectStatus( 
                    project 
                ); 
 
 
            const color = 
                getProjectColor( 
                    index 
                ); 
 
 
            const icon = 
                getProjectIcon( 
                    index 
                ); 
 
 
            const projectCard = 
                document.createElement( 
                    "div" 
                ); 
 
 
            projectCard.className = 
                "project-card"; 
 
 
            projectCard.dataset.category = 
                project.status; 
 
 
            projectCard.dataset.status = 
                status.text; 
 
 
            projectCard.dataset.name = 
                project.name; 
 
 
            projectCard.innerHTML = ` 
 
                <div class="card-header-top"> 
 
                    <div class="project-icon-title"> 
 
                        <div 
                            class="proj-icon" 
                            style=" 
                                background: ${color}20; 
                                color: ${color}; 
                            " 
                        > 
 
                            <i 
                                class="fa-solid ${icon}" 
                            ></i> 
 
                        </div> 
 
 
                        <div> 
 
                            <h3> 
                                ${escapeHTML( 
                                    project.name 
                                )} 
                            </h3> 
 
                            <p> 
                                ${escapeHTML( 
                                    project.description || 
                                    "Project created from tasks." 
                                )} 
                            </p> 
 
                        </div> 
 
                    </div> 
 
 
                    <button 
                        class="card-options" 
                        type="button" 
                        data-id="${project.id}" 
                        title="Project options" 
                    > 
 
                        <i 
                            class="fa-solid fa-ellipsis-vertical" 
                        ></i> 
 
                    </button> 
 
                </div> 
 
 
                <div class="project-progress"> 
 
                    <div class="progress-bar-container"> 
 
                        <div 
                            class="progress-fill" 
                            style=" 
                                width: ${project.progress || 0}%; 
                                background: ${color}; 
                            " 
                        ></div> 
 
                    </div> 
 
 
                    <span class="progress-text"> 
 
                        ${project.progress || 0}% 
 
                    </span> 
 
                </div> 
 
 
                <div class="card-footer-bottom"> 
 
                    <span class="due-date"> 
 
                        <i 
                            class="fa-regular fa-calendar" 
                        ></i> 
 
                        ${ 
                            project.dueDate 
                                ? "Due: " + 
                                  formatDate( 
                                      project.dueDate 
                                  ) 
                                : "No due date" 
                        } 
 
                    </span> 
 
 
                    <span 
                        class="status-badge ${status.className}" 
                    > 
 
                        ${status.text} 
 
                    </span> 
 
                </div> 
 
            `; 
 
 
            projectsGrid.appendChild( 
                projectCard 
            ); 
 
        } 
    ); 
 
 
    addProjectEvents(); 
 
} 
 
 
/* ================================= 
   PROJECT OPTIONS 
================================= */ 
 
function addProjectEvents() { 
 
    const optionButtons = 
        document.querySelectorAll( 
            ".card-options" 
        ); 
 
 
    optionButtons.forEach( 
        function (button) { 
 
            button.addEventListener( 
                "click", 
                function () { 
 
                    const projectId = 
                        Number( 
                            button.dataset.id 
                        ); 
 
 
                    const projects = 
                        getProjects(); 
 
 
                    const project = 
                        projects.find( 
                            function (item) { 
 
                                return ( 
                                    Number( 
                                        item.id 
                                    ) === 
                                    projectId 
                                ); 
 
                            } 
                        ); 
 
 
                    if (!project) { 
                        return; 
                    } 
 
 
                    const action = 
                        prompt( 
                            `Project: ${project.name}\n\nType one of these:\nactive\non-hold\ncompleted\n\nOr type delete to remove the project.` 
                        ); 
 
 
                    if (!action) { 
                        return; 
                    } 
 
 
                    const value = 
                        action 
                            .trim() 
                            .toLowerCase(); 
 
 
                    if ( 
                        value === 
                        "delete" 
                    ) { 
 
                        const confirmDelete = 
                            confirm( 
                                `Delete project "${project.name}"?` 
                            ); 
 
 
                        if ( 
                            !confirmDelete 
                        ) { 
 
                            return; 
 
                        } 
 
 
                        const deletedProjectName = 
                            project.name; 
 
 
                        const updatedProjects = 
                            projects.filter( 
                                function (item) { 
 
                                    return ( 
                                        Number( 
                                            item.id 
                                        ) !== 
                                        projectId 
                                    ); 
 
                                } 
                            ); 
 
 
                        saveProjects( 
                            updatedProjects 
                        ); 
 
 
                        addProjectActivity( 
                            "deleted", 
                            deletedProjectName 
                        ); 
 
 
                        filterProjects(); 
 
                        updateStatistics(); 
 
                        return; 
 
                    } 
 
 
                    if ( 
                        value !== "active" && 
                        value !== "on-hold" && 
                        value !== "completed" 
                    ) { 
 
                        alert( 
                            "Please enter active, on-hold, completed, or delete." 
                        ); 
 
                        return; 
 
                    } 
 
 
                    project.status = 
                        value; 
 
 
                    saveProjects( 
                        projects 
                    ); 
 
 
                    if (value === "completed") { 
 
                        addProjectActivity( 
                            "completed", 
                            project.name 
                        ); 
 
                    } 
 
                    else { 
 
                        addProjectActivity( 
                            "updated", 
                            project.name 
                        ); 
 
                    } 
 
 
                    filterProjects(); 
 
                    updateStatistics(); 
 
                } 
            ); 
 
        } 
    ); 
 
} 
 
 
/* ================================= 
   UPDATE STATISTICS 
================================= */ 
 
function updateStatistics() { 
 
    const projects = 
        syncProjectsFromTasks(); 
 
 
    const total = 
        projects.length; 
 
 
    const completed = 
        projects.filter( 
            function (project) { 
 
                return ( 
                    project.status === 
                    "completed" 
                ); 
 
            } 
        ).length; 
 
 
    const inProgress = 
        projects.filter( 
            function (project) { 
 
                return ( 
                    project.status === 
                        "active" && 
                    project.progress > 0 
                ); 
 
            } 
        ).length; 
 
 
    const onHold = 
        projects.filter( 
            function (project) { 
 
                return ( 
                    project.status === 
                    "on-hold" 
                ); 
 
            } 
        ).length; 
 
 
    const completedPercentage = 
        total === 0 
            ? 0 
            : Math.round( 
                ( 
                    completed / 
                    total 
                ) * 100 
            ); 
 
 
    if ( 
        totalProjectsElement 
    ) { 
 
        totalProjectsElement.textContent = 
            total; 
 
    } 
 
 
    if ( 
        completedProjectsElement 
    ) { 
 
        completedProjectsElement.textContent = 
            completedPercentage + "%"; 
 
    } 
 
 
    if ( 
        inProgressProjectsElement 
    ) { 
 
        inProgressProjectsElement.textContent = 
            inProgress; 
 
    } 
 
 
    if ( 
        onHoldProjectsElement 
    ) { 
 
        onHoldProjectsElement.textContent = 
            onHold; 
 
    } 
 
 
    /* 
       Update card subtitles. 
    */ 
 
    const cards = 
        document.querySelectorAll( 
            ".card1" 
        ); 
 
 
    if ( 
        cards.length >= 4 
    ) { 
 
        cards[0] 
            .querySelector("span") 
            .textContent = 
            `${total} ${ 
                total === 1 
                    ? "Project" 
                    : "Projects" 
            }`; 
 
 
        cards[1] 
            .querySelector("span") 
            .textContent = 
            `${completed} ${ 
                completed === 1 
                    ? "Finished Project" 
                    : "Finished Projects" 
            }`; 
 
 
        cards[2] 
            .querySelector("span") 
            .textContent = 
            `${inProgress} Ongoing Projects`; 
 
 
        cards[3] 
            .querySelector("span") 
            .textContent = 
            `${onHold} Paused Projects`; 
 
    } 
 
} 
 
 
/* ================================= 
   CREATE PROJECT 
================================= */ 
 
if (createProjectButton) { 
 
    createProjectButton.addEventListener( 
        "click", 
        function () { 
 
            const projectName = prompt( 
                "Enter project name:" 
            ); 
 
            if (!projectName) { 
                return; 
            } 
 
            const cleanName = projectName.trim(); 
 
            if (!cleanName) { 
                return; 
            } 
 
            /* ========================= 
               LOAD PROJECTS 
            ========================= */ 
 
            const projects = getProjects(); 
 
            const alreadyExists = projects.some( 
                function (project) { 
                    return ( 
                        project.name.toLowerCase() === 
                        cleanName.toLowerCase() 
                    ); 
                } 
            ); 
 
            if (alreadyExists) { 
                alert("This project already exists."); 
                return; 
            } 
 
            /* ========================= 
               CREATE PROJECT 
            ========================= */ 
 
            const projectId = Date.now(); 
 
            const newProject = { 
                id: projectId, 
                name: cleanName, 
                description: "Project created manually.", 
                status: "active", 
                progress: 0, 
                createdAt: projectId, 
                dueDate: "" 
            }; 
 
            projects.push(newProject); 
 
            saveProjects(projects); 
 
 
            /* ================================= 
               PROJECT ACTIVITY 
            ================================= */ 
 
            addProjectActivity( 
                "created", 
                cleanName 
            ); 
 
 
            /* ========================= 
               CREATE TASK ENTRY 
               FOR THE PROJECT 
            ========================= */ 
 
            const tasks = getTasks(); 
 
            /* 
               Create a special task representing 
               the project inside the Tasks page. 
 
               This makes the project visible 
               in both Projects and Tasks. 
            */ 
 
            const projectTaskExists = tasks.some( 
                function (task) { 
                    return ( 
                        task.project && 
                        task.project.toLowerCase() === 
                        cleanName.toLowerCase() && 
                        task.isProjectTask === true 
                    ); 
                } 
            ); 
 
            if (!projectTaskExists) { 
 
                const projectTask = { 
                    id: Date.now() + 1, 
 
                    title: cleanName, 
 
                    project: cleanName, 
 
                    dueDate: "", 
 
                    priority: "medium", 
 
                    status: "active", 
 
                    completed: false, 
 
                    /* 
                       Identifies this task as the 
                       automatic project task. 
                    */ 
                    isProjectTask: true, 
 
                    projectId: projectId, 
 
                    createdAt: Date.now() 
                }; 
 
                tasks.unshift(projectTask); 
 
                localStorage.setItem( 
                    TASKS_STORAGE_KEY, 
                    JSON.stringify(tasks) 
                ); 
 
                /* 
                   Tell the Tasks page and other 
                   parts of the application that 
                   tasks changed. 
                */ 
                window.dispatchEvent( 
                    new CustomEvent( 
                        "taskStateChanged", 
                        { 
                            detail: { 
                                tasks: tasks 
                            } 
                        } 
                    ) 
                ); 
            } 
 
            /* ========================= 
               REFRESH PROJECT PAGE 
            ========================= */ 
 
            filterProjects(); 
            updateStatistics(); 
            renderRecentActivity(); 
            updateNotifications(); 
 
            /* ========================= 
               NOTIFICATION 
            ========================= */ 
 
            addProjectNotification( 
                cleanName 
            ); 
 
            alert( 
                `Project "${cleanName}" created successfully.` 
            ); 
        } 
    ); 
 
} 
 
 
/* ================================= 
   PROJECT RECENT ACTIVITY 
================================= */ 
 
const PROJECT_ACTIVITIES_KEY = 
    "nexoraProjectActivities"; 
 
 
function getProjectActivities() { 
 
    const savedActivities = 
        localStorage.getItem( 
            PROJECT_ACTIVITIES_KEY 
        ); 
 
 
    if (!savedActivities) { 
        return []; 
    } 
 
 
    try { 
 
        const activities = 
            JSON.parse( 
                savedActivities 
            ); 
 
 
        return Array.isArray(activities) 
            ? activities 
            : []; 
 
    } 
 
    catch (error) { 
 
        console.error( 
            "Unable to load project activities:", 
            error 
        ); 
 
        return []; 
 
    } 
 
} 
 
 
function saveProjectActivities( 
    activities 
) { 
 
    localStorage.setItem( 
        PROJECT_ACTIVITIES_KEY, 
        JSON.stringify( 
            activities 
        ) 
    ); 
 
} 
 
 
function addProjectActivity( 
    type, 
    projectName 
) { 
 
    if (!projectName) { 
        return; 
    } 
 
 
    const activities = 
        getProjectActivities(); 
 
 
    let title = ""; 
 
    let icon = "fa-folder"; 
 
 
    if (type === "created") { 
 
        title = 
            `Project created: ${projectName}`; 
 
        icon = "fa-plus"; 
 
    } 
 
    else if (type === "updated") { 
 
        title = 
            `Project updated: ${projectName}`; 
 
        icon = "fa-pen"; 
 
    } 
 
    else if (type === "completed") { 
 
        title = 
            `Project completed: ${projectName}`; 
 
        icon = "fa-check"; 
 
    } 
 
    else if (type === "deleted") { 
 
        title = 
            `Project deleted: ${projectName}`; 
 
        icon = "fa-trash"; 
 
    } 
 
 
    const activity = { 
 
        id: Date.now() + 
            Math.random(), 
 
        type: type, 
 
        title: title, 
 
        projectName: projectName, 
 
        icon: icon, 
 
        user: "Alex Reed", 
 
        timestamp: Date.now() 
 
    }; 
 
 
    activities.unshift( 
        activity 
    ); 
 
 
    /* 
       Keep only recent project 
       activities. 
    */ 
 
    const limitedActivities = 
        activities.slice( 
            0, 
            50 
        ); 
 
 
    saveProjectActivities( 
        limitedActivities 
    ); 
 
 
    renderRecentActivity(); 
 
 
    window.dispatchEvent( 
        new CustomEvent( 
            "projectActivityChanged", 
            { 
                detail: { 
                    activity: activity 
                } 
            } 
        ) 
    ); 
 
} 
 
 
/* ================================= 
   RENDER PROJECT RECENT ACTIVITY 
================================= */ 
 
function renderRecentActivity() { 
 
    if (!activityList) { 
        return; 
    } 
 
 
    const activities = 
        getProjectActivities() 
            .sort( 
                function (a, b) { 
 
                    return ( 
                        b.timestamp - 
                        a.timestamp 
                    ); 
 
                } 
            ); 
 
 
    const latestActivities = 
        activities.slice( 
            0, 
            7 
        ); 
 
 
    activityList.innerHTML = 
        ""; 
 
 
    if ( 
        latestActivities.length === 0 
    ) { 
 
        activityList.innerHTML = ` 
 
            <div 
                style=" 
                    padding: 30px; 
                    text-align: center; 
                    color: var(--text-muted); 
                " 
            > 
 
                No recent project activity. 
 
            </div> 
 
        `; 
 
        return; 
 
    } 
 
 
    latestActivities.forEach( 
        function (activity) { 
 
            const item = 
                document.createElement( 
                    "div" 
                ); 
 
 
            item.className = 
                "activity-item"; 
 
 
            let iconClass = 
                "primary"; 
 
 
            if ( 
                activity.type === 
                "completed" 
            ) { 
 
                iconClass = 
                    "success"; 
 
            } 
 
            else if ( 
                activity.type === 
                "deleted" 
            ) { 
 
                iconClass = 
                    "danger"; 
 
            } 
 
            else if ( 
                activity.type === 
                "updated" 
            ) { 
 
                iconClass = 
                    "warning"; 
 
            } 
 
 
            item.innerHTML = ` 
 
                <div 
                    class="activity-icon ${iconClass}" 
                > 
 
                    <i 
                        class="fa-solid ${escapeHTML( 
                            activity.icon || 
                            "fa-folder" 
                        )}" 
                    ></i> 
 
                </div> 
 
 
                <div 
                    class="activity-details" 
                > 
 
                    <h4> 
                        ${escapeHTML( 
                            activity.title 
                        )} 
                    </h4> 
 
                    <p> 
                        by ${escapeHTML( 
                            activity.user || 
                            "Alex Reed" 
                        )} 
                    </p> 
 
                </div> 
 
 
                <span 
                    class="activity-time" 
                > 
 
                    ${getTimeAgo( 
                        activity.timestamp 
                    )} 
 
                </span> 
 
            `; 
 
 
            activityList.appendChild( 
                item 
            ); 
 
        } 
    ); 
 
} 
 
 
/* ================================= 
   PROJECT ACTIVITY LIVE UPDATE 
================================= */ 
 
window.addEventListener( 
    "projectActivityChanged", 
    function () { 
 
        renderRecentActivity(); 
 
    } 
); 
 
 
window.addEventListener( 
    "storage", 
    function (event) { 
 
        if ( 
            event.key === 
            PROJECT_ACTIVITIES_KEY 
        ) { 
 
            renderRecentActivity(); 
 
        } 
 
    } 
); 
 
 
/* ================================= 
   TIME AGO 
================================= */ 
 
function getTimeAgo( 
    timestamp 
) { 
 
    const difference = 
        Date.now() - 
        timestamp; 
 
 
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
 
 
    if ( 
        seconds < 60 
    ) { 
 
        return "just now"; 
 
    } 
 
 
    if ( 
        minutes < 60 
    ) { 
 
        return ( 
            minutes + 
            ( 
                minutes === 1 
                    ? " minute ago" 
                    : " minutes ago" 
            ) 
        ); 
 
    } 
 
 
    if ( 
        hours < 24 
    ) { 
 
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
   PROJECT NOTIFICATIONS 
================================= */ 
 
function addProjectNotification( 
    projectName 
) { 
 
    const key = 
        "nexoraProjectNotifications"; 
 
 
    const saved = 
        localStorage.getItem( 
            key 
        ); 
 
 
    let notifications = 
        saved 
            ? JSON.parse(saved) 
            : []; 
 
 
    notifications.unshift({ 
 
        id: Date.now(), 
 
        title: 
            "New project created", 
 
        message: 
            projectName, 
 
        createdAt: 
            Date.now() 
 
    }); 
 
 
    notifications = 
        notifications.slice( 
            0, 
            20 
        ); 
 
 
    localStorage.setItem( 
        key, 
        JSON.stringify( 
            notifications 
        ) 
    ); 
 
 
    updateNotifications(); 
 
} 
 
 
/* ================================= 
   GET PROJECT NOTIFICATIONS 
================================= */ 
 
function getProjectNotifications() { 
 
    const saved = 
        localStorage.getItem( 
            "nexoraProjectNotifications" 
        ); 
 
 
    if (!saved) { 
        return []; 
    } 
 
 
    try { 
 
        return JSON.parse( 
            saved 
        ); 
 
    } 
 
    catch { 
 
        return []; 
 
    } 
 
} 
 
 
/* ================================= 
   TASK NOTIFICATIONS 
================================= */ 
 
function getTaskNotifications() { 
 
    const tasks = 
        getTasks(); 
 
 
    const today = 
        getTodayString(); 
 
 
    const dueToday = 
        tasks.filter( 
            function (task) { 
 
                return ( 
                    task.status !== 
                        "completed" && 
                    task.completed !== true && 
                    cleanDate( 
                        task.dueDate 
                    ) === today 
                ); 
 
            } 
        ); 
 
 
    const overdue = 
        tasks.filter( 
            function (task) { 
 
                const date = 
                    cleanDate( 
                        task.dueDate 
                    ); 
 
                return ( 
                    task.status !== 
                        "completed" && 
                    task.completed !== true && 
                    date && 
                    date < today 
                ); 
 
            } 
        ); 
 
 
    return { 
        dueToday, 
        overdue 
    }; 
 
} 
 
 
/* ================================= 
   CALENDAR NOTIFICATIONS 
================================= */ 
 
function getCalendarNotifications() { 
 
    let events = []; 
 
 
    try { 
 
        events = 
            JSON.parse( 
                localStorage.getItem( 
                    CALENDAR_EVENTS_KEY 
                ) 
            ) || []; 
 
    } 
 
    catch { 
 
        events = []; 
 
    } 
 
 
    const today = 
        getTodayString(); 
 
 
    return events.filter( 
        function (event) { 
 
            return ( 
                !event.isFromTask && 
                cleanDate( 
                    event.date 
                ) >= today 
            ); 
 
        } 
    ); 
 
} 
 
 
/* ================================= 
   DATE HELPERS 
================================= */ 
 
function cleanDate( 
    date 
) { 
 
    if (!date) { 
        return ""; 
    } 
 
 
    return date.split("T")[0]; 
 
} 
 
 
function getTodayString() { 
 
    const date = 
        new Date(); 
 
 
    const year = 
        date.getFullYear(); 
 
 
    const month = 
        String( 
            date.getMonth() + 1 
        ).padStart(2, "0"); 
 
 
    const day = 
        String( 
            date.getDate() 
        ).padStart(2, "0"); 
 
 
    return `${year}-${month}-${day}`; 
 
} 
 
 
/* ================================= 
   UPDATE NOTIFICATION BADGE 
================================= */ 
 
function updateNotifications() { 
 
    const { 
        dueToday, 
        overdue 
    } = 
        getTaskNotifications(); 
 
 
    const events = 
        getCalendarNotifications(); 
 
 
    const projectNotifications = 
        getProjectNotifications(); 
 
 
    const total = 
        dueToday.length + 
        overdue.length + 
        events.length + 
        projectNotifications.length; 
 
 
    if ( 
        !notificationButton 
    ) { 
 
        return; 
 
    } 
 
 
    let badge = 
        notificationButton.querySelector( 
            ".notification-badge" 
        ); 
 
 
    if ( 
        total > 0 
    ) { 
 
        if (!badge) { 
 
            badge = 
                document.createElement( 
                    "span" 
                ); 
 
 
            badge.className = 
                "notification-badge"; 
 
 
            badge.style.cssText = ` 
 
                position: absolute; 
 
                top: 2px; 
 
                right: 2px; 
 
                background: #FF4D4D; 
 
                color: white; 
 
                font-size: 0.65rem; 
 
                font-weight: bold; 
 
                padding: 2px 5px; 
 
                border-radius: 50%; 
 
                line-height: 1; 
 
                min-width: 16px; 
 
                text-align: center; 
 
                z-index: 9999; 
 
                pointer-events: none; 
 
            `; 
 
 
            notificationButton.style.position = 
                "relative"; 
 
 
            notificationButton.appendChild( 
                badge 
            ); 
 
        } 
 
 
        badge.textContent = total > 0 ? "1+" : total; 
 
    } 
 
    else { 
 
        if (badge) { 
            badge.remove(); 
        } 
 
    } 
 
} 
 
 
/* ================================= 
   NOTIFICATION DROPDOWN 
================================= */ 
 
function toggleNotificationDropdown() { 
 
    let dropdown = 
        document.getElementById( 
            "projectNotificationDropdown" 
        ); 
 
 
    if (dropdown) { 
 
        dropdown.remove(); 
 
        return; 
 
    } 
 
 
    const { 
        dueToday, 
        overdue 
    } = 
        getTaskNotifications(); 
 
 
    const events = 
        getCalendarNotifications(); 
 
 
    const projectNotifications = 
        getProjectNotifications(); 
 
 
    dropdown = 
        document.createElement( 
            "div" 
        ); 
 
 
    dropdown.id = 
        "projectNotificationDropdown"; 
 
 
    dropdown.style.cssText = ` 
 
        position: absolute; 
 
        top: 60px; 
 
        right: 20px; 
 
        width: 340px; 
 
        max-width: 
            calc(100vw - 40px); 
 
        max-height: 480px; 
 
        overflow-y: auto; 
 
        background: #181D24; 
 
        border: 
            1px solid #2A323D; 
 
        border-radius: 12px; 
 
        box-shadow: 
            0 10px 25px 
            rgba(0,0,0,0.5); 
 
        padding: 16px; 
 
        z-index: 99999; 
 
        color: #F8FAFC; 
 
    `; 
 
 
    let html = ` 
 
        <h4 
            style=" 
                margin: 0 0 12px 0; 
                font-size: 0.95rem; 
                display: flex; 
                align-items: center; 
                justify-content: space-between; 
                border-bottom: 1px solid #2A323D; 
                padding-bottom: 8px; 
            " 
        > 
 
            <span> 
                Notifications 
            </span> 
 
            <small 
                style=" 
                    color: #94A3B8; 
                    font-weight: normal; 
                " 
            > 
                Tasks & Projects 
            </small> 
 
        </h4> 
 
    `; 
 
 
    const total = 
        dueToday.length + 
        overdue.length + 
        events.length + 
        projectNotifications.length; 
 
 
    if ( 
        total === 0 
    ) { 
 
        html += ` 
 
            <p 
                style=" 
                    font-size: 0.85rem; 
                    color: #94A3B8; 
                    text-align: center; 
                    padding: 20px 0; 
                    margin: 0; 
                " 
            > 
                No notifications yet. 
            </p> 
 
        `; 
 
    } 
 
 
    /* 
       OVERDUE TASKS 
    */ 
 
    overdue.forEach( 
        function (task) { 
 
            html += ` 
 
                <div 
                    style=" 
                        padding: 10px; 
                        margin-bottom: 8px; 
                        background: 
                            rgba( 
                                255, 
                                77, 
                                77, 
                                0.15 
                            ); 
                        border-left: 
                            3px solid #FF4D4D; 
                        border-radius: 6px; 
                    " 
                > 
 
                    <strong 
                        style=" 
                            display: block; 
                            font-size: 0.85rem; 
                            color: #FF4D4D; 
                        " 
                    > 
                        Overdue: 
                        ${escapeHTML( 
                            task.title || 
                            "Untitled Task" 
                        )} 
                    </strong> 
 
 
                    <small 
                        style=" 
                            color: #94A3B8; 
                            font-size: 0.75rem; 
                        " 
                    > 
                        Due: 
                        ${cleanDate( 
                            task.dueDate 
                        )} 
                        • 
                        ${escapeHTML( 
                            task.project || 
                            "General" 
                        )} 
                    </small> 
 
                </div> 
 
            `; 
 
        } 
    ); 
 
 
    /* 
       DUE TODAY 
    */ 
 
    dueToday.forEach( 
        function (task) { 
 
            html += ` 
 
                <div 
                    style=" 
                        padding: 10px; 
                        margin-bottom: 8px; 
                        background: 
                            rgba( 
                                245, 
                                185, 
                                66, 
                                0.15 
                            ); 
                        border-left: 
                            3px solid #F5B942; 
                        border-radius: 6px; 
                    " 
                > 
 
                    <strong 
                        style=" 
                            display: block; 
                            font-size: 0.85rem; 
                            color: #F5B942; 
                        " 
                    > 
                        Due Today: 
                        ${escapeHTML( 
                            task.title || 
                            "Untitled Task" 
                        )} 
                    </strong> 
 
 
                    <small 
                        style=" 
                            color: #94A3B8; 
                            font-size: 0.75rem; 
                        " 
                    > 
                        ${escapeHTML( 
                            task.project || 
                            "General" 
                        )} 
                    </small> 
 
                </div> 
 
            `; 
 
        } 
    ); 
 
 
    /* 
       CALENDAR EVENTS 
    */ 
 
    events.forEach( 
        function (event) { 
 
            html += ` 
 
                <div 
                    style=" 
                        padding: 10px; 
                        margin-bottom: 8px; 
                        background: 
                            rgba( 
                                124, 
                                92, 
                                252, 
                                0.15 
                            ); 
                        border-left: 
                            3px solid #7C5CFC; 
                        border-radius: 6px; 
                    " 
                > 
 
                    <strong 
                        style=" 
                            display: block; 
                            font-size: 0.85rem; 
                            color: #9B82FF; 
                        " 
                    > 
                        Event: 
                        ${escapeHTML( 
                            event.title || 
                            "Untitled Event" 
                        )} 
                    </strong> 
 
 
                    <small 
                        style=" 
                            color: #94A3B8; 
                            font-size: 0.75rem; 
                        " 
                    > 
                        ${cleanDate( 
                            event.date 
                        )} 
                    </small> 
 
                </div> 
 
            `; 
 
        } 
    ); 
 
 
    /* 
       PROJECT CREATED 
       NOTIFICATIONS 
    */ 
 
    projectNotifications.forEach( 
        function (notification) { 
 
            html += ` 
 
                <div 
                    style=" 
                        padding: 10px; 
                        margin-bottom: 8px; 
                        background: 
                            rgba( 
                                53, 
                                208, 
                                127, 
                                0.15 
                            ); 
                        border-left: 
                            3px solid #35D07F; 
                        border-radius: 6px; 
                    " 
                > 
 
                    <strong 
                        style=" 
                            display: block; 
                            font-size: 0.85rem; 
                            color: #35D07F; 
                        " 
                    > 
                        ${escapeHTML( 
                            notification.title 
                        )} 
                    </strong> 
 
 
                    <small 
                        style=" 
                            color: #94A3B8; 
                            font-size: 0.75rem; 
                        " 
                    > 
                        ${escapeHTML( 
                            notification.message 
                        )} 
 
                        • 
                        ${getTimeAgo( 
                            notification.createdAt 
                        )} 
                    </small> 
 
                </div> 
 
            `; 
 
        } 
    ); 
 
 
    dropdown.innerHTML = 
        html; 
 
 
    document.body.appendChild( 
        dropdown 
    ); 
 
 
    /* 
       Close when clicking outside. 
    */ 
 
    setTimeout( 
        function () { 
 
            document.addEventListener( 
                "click", 
                function closeDropdown( 
                    event 
                ) { 
 
                    if ( 
                        !dropdown.contains( 
                            event.target 
                        ) && 
                        !event.target.closest( 
                            ".notification" 
                        ) 
                    ) { 
 
                        dropdown.remove(); 
 
                        document.removeEventListener( 
                            "click", 
                            closeDropdown 
                        ); 
 
                    } 
 
                } 
            ); 
 
        }, 
        100 
    ); 
 
} 
 
 
/* ================================= 
   NOTIFICATION CLICK 
================================= */ 
 
if ( 
    notificationButton 
) { 
 
    notificationButton.addEventListener( 
        "click", 
        function (event) { 
 
            event.stopPropagation(); 
 
            toggleNotificationDropdown(); 
 
        } 
    ); 
 
} 
 
 
/* ================================= 
   STORAGE CHANGES 
================================= */ 
 
/* 
   If tasks are changed from 
   another page/tab, refresh the 
   Projects page automatically. 
*/ 
 
window.addEventListener( 
    "storage", 
    function (event) { 
 
        if ( 
            event.key === 
                TASKS_STORAGE_KEY || 
            event.key === 
                PROJECTS_STORAGE_KEY || 
            event.key === 
                CALENDAR_EVENTS_KEY 
        ) { 
 
            syncProjectsFromTasks(); 
 
            updateStatistics(); 
 
            filterProjects(); 
 
            renderRecentActivity(); 
 
            updateNotifications(); 
 
        } 
 
    } 
); 
 
 
/* ================================= 
   CUSTOM TASK UPDATE EVENT 
================================= */ 
 
window.addEventListener( 
    "taskStateChanged", 
    function () { 
 
        syncProjectsFromTasks(); 
 
        updateStatistics(); 
 
        filterProjects(); 
 
        renderRecentActivity(); 
 
        updateNotifications(); 
 
    } 
); 
 
 
/* ================================= 
   AUTO REFRESH 
================================= */ 
 
setInterval( 
    function () { 
 
        syncProjectsFromTasks(); 
 
        updateStatistics(); 
 
        filterProjects(); 
 
        renderRecentActivity(); 
 
        updateNotifications(); 
 
    }, 
    5000 
); 
 
 
/* ================================= 
   INITIALIZE PROJECT PAGE 
================================= */ 
 
function initializeProjectsPage() { 
 
    syncProjectsFromTasks(); 
 
    updateStatistics(); 
 
    filterProjects(); 
 
    renderRecentActivity(); 
 
    updateNotifications(); 
 
} 
 
 
if ( 
    document.readyState === 
    "loading" 
) { 
 
    document.addEventListener( 
        "DOMContentLoaded", 
        initializeProjectsPage 
    ); 
 
} 
 
else { 
 
    initializeProjectsPage(); 
 
}