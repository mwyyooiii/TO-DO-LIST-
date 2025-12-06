// ===== SELECTORS =====
const form = document.getElementById("taskForm");
const titleInput = document.getElementById("titleInput");
const dateInput = document.getElementById("dateInput");
const timeInput = document.getElementById("timeInput");
const reminderSelect = document.getElementById("reminderSelect");
const tasksContainer = document.getElementById("tasksContainer");
const noTasks = document.getElementById("noTasks");
const searchInput = document.getElementById("searchInput");
const sortSelect = document.getElementById("sortSelect");

const countTotal = document.getElementById("countTotal");
const countPending = document.getElementById("countPending");
const countDone = document.getElementById("countDone");

// ===== LOCAL STORAGE =====
function loadTasks() {
  return JSON.parse(localStorage.getItem("tasks") || "[]");
}
function saveTasks(tasks) {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// ===== COUNTERS =====
function updateCounters() {
  const tasks = loadTasks();
  countTotal.textContent = tasks.length;
  countDone.textContent = tasks.filter(t => t.completed).length;
  countPending.textContent = tasks.filter(t => !t.completed).length;
}

// ===== SORTING =====
function sortTasks(tasks) {
  if (sortSelect.value === "newest") return tasks.sort((a, b) => b.id - a.id);
  if (sortSelect.value === "oldest") return tasks.sort((a, b) => a.id - b.id);
  if (sortSelect.value === "date") return tasks.sort((a, b) => {
    const ad = a.date ? new Date(a.date + "T" + a.time) : Infinity;
    const bd = b.date ? new Date(b.date + "T" + b.time) : Infinity;
    return ad - bd;
  });
  return tasks;
}

// ===== RENDER UI =====
function renderTasks() {
  let tasks = loadTasks();

  const search = searchInput.value.toLowerCase();
  if (search.trim() !== "") {
    tasks = tasks.filter(t => t.title.toLowerCase().includes(search));
  }

  tasks = sortTasks(tasks);

  tasksContainer.innerHTML = "";

  if (tasks.length === 0) {
    noTasks.style.display = "block";
    updateCounters();
    return;
  }

  noTasks.style.display = "none";

  tasks.forEach(task => {
    const card = document.createElement("div");
    card.className = "task";

    const finishedClass = task.completed ? "finished" : "";

    card.innerHTML = `
      <div>
        <input type="checkbox" class="checkbox" ${task.completed ? "checked" : ""}>
        <h3 class="${finishedClass}">${task.title}</h3>
      </div>

      <div class="meta-row">
        ${task.date ? `<span class="badge">📅 ${task.date}</span>` : ""}
        ${task.time ? `<span class="badge">⏰ ${task.time}</span>` : ""}
        ${task.reminder !== "none" ? `<span class="badge">🔔 ${task.reminder}m before</span>` : ""}
      </div>

      <div class="actions">
        <button class="action-btn edit">✎</button>
        <button class="action-btn delete">✕</button>
      </div>
    `;

    const checkbox = card.querySelector(".checkbox");
    checkbox.addEventListener("change", () => toggleComplete(task.id));

    card.querySelector(".delete").addEventListener("click", () =>
      deleteTask(task.id)
    );

    card.querySelector(".edit").addEventListener("click", () =>
      editTask(task.id)
    );

    tasksContainer.appendChild(card);
  });

  updateCounters();
}

// ===== ADD TASK =====
form.addEventListener("submit", e => {
  e.preventDefault();

  const task = {
    id: Date.now(),
    title: titleInput.value,
    date: dateInput.value || "",
    time: timeInput.value || "",
    reminder: reminderSelect.value,
    completed: false
  };

  const tasks = loadTasks();
  tasks.push(task);
  saveTasks(tasks);
  renderTasks();

  form.reset();
});

// ===== DELETE =====
function deleteTask(id) {
  saveTasks(loadTasks().filter(t => t.id !== id));
  renderTasks();
}

// ===== EDIT =====
function editTask(id) {
  const tasks = loadTasks();
  const t = tasks.find(t => t.id === id);

  titleInput.value = t.title;
  dateInput.value = t.date;
  timeInput.value = t.time;
  reminderSelect.value = t.reminder;

  deleteTask(id);
}

// ===== COMPLETE =====
function toggleComplete(id) {
  const tasks = loadTasks();
  const t = tasks.find(t => t.id === id);
  t.completed = !t.completed;
  saveTasks(tasks);
  renderTasks();
}

// ===== SEARCH & SORT EVENTS =====
searchInput.addEventListener("input", renderTasks);
sortSelect.addEventListener("change", renderTasks);

// INIT
renderTasks();