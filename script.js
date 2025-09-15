// ===== DOM SELECTORS =====
const addBtn = document.querySelector(".input-container .circle"); // زر الإضافة فوق
const input = document.querySelector(".input");
const taskListEl = document.querySelector(".uList");
const noMoreLeft = document.querySelector(".noMoreLeft");
const itemsLeft = document.querySelector(".total-left");
const themeToggleBtn = document.getElementById("theme-toggle");

// ========== buttons ==========
const btnAll = document.querySelector(".buttons .all");
const btnActive = document.querySelector(".buttons .active");
const btnCompleted = document.querySelector(".buttons .completed");

// ===== storage helpers =====
const loadTasks = () => {
  try {
    return JSON.parse(localStorage.getItem("tasks")) || [];
  } catch {
    return [];
  }
};
const saveTasks = (tasks) => {
  localStorage.setItem("tasks", JSON.stringify(tasks));
};

// ===== state =====
let tasks = loadTasks();
let currentFilter = "all";

// ===== render =====
const renderTaskList = () => {
  if (!Array.isArray(tasks)) tasks = [];

  const indexed = tasks.map((t, i) => ({ ...t, index: i }));

  let toRender;
  if (currentFilter === "all") toRender = indexed;
  else if (currentFilter === "active")
    toRender = indexed.filter((t) => !t.isCompleted);
  else toRender = indexed.filter((t) => t.isCompleted);

  const html = toRender
    .map(
      (t) => `
      <li class="listItem ${t.isCompleted ? "completed" : ""}" data-index="${
        t.index
      }">
        <div class="circle">
          <img class="checkmark" src="./images/icon-check.svg" alt="check" />
        </div>
        <p class="task-text">${escapeHtml(t.value)}</p>
        <img class="delete-icon" src="./images/icon-cross.svg" alt="cross icon" data-index="${
          t.index
        }" />
      </li>`
    )
    .join("");

  taskListEl.innerHTML = html;

  noMoreLeft.style.display = tasks.length === 0 ? "block" : "none";

  itemsLeft.innerText = tasks.filter((t) => !t.isCompleted).length;

  updateFilterButtonsUI();
};

// ===== helpers =====
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function setFilter(filter) {
  currentFilter = filter;
  renderTaskList();
}

function updateFilterButtonsUI() {
  [btnAll, btnActive, btnCompleted].forEach(
    (b) => b && b.classList.remove("selected")
  );
  if (currentFilter === "all" && btnAll) btnAll.classList.add("selected");
  if (currentFilter === "active" && btnActive)
    btnActive.classList.add("selected");
  if (currentFilter === "completed" && btnCompleted)
    btnCompleted.classList.add("selected");
}

// ===== actions =====
const addTask = () => {
  const value = input.value.trim();
  if (!value) return;
  tasks.push({ value, isCompleted: false });
  saveTasks(tasks);
  input.value = "";
  renderTaskList();
};

const toggleComplete = (index) => {
  if (typeof index !== "number") return;
  if (tasks[index]) {
    tasks[index].isCompleted = !tasks[index].isCompleted;
    saveTasks(tasks);
    renderTaskList();
  }
};

const deleteTask = (index) => {
  if (typeof index !== "number") return;
  tasks.splice(index, 1);
  saveTasks(tasks);
  renderTaskList();
};

// ===== event listeners (delegation) =====
if (addBtn) addBtn.addEventListener("click", addTask);
// Enter key
if (input)
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") addTask();
  });

taskListEl.addEventListener("click", (e) => {
  const li = e.target.closest(".listItem");
  if (!li) return;
  const index = Number(li.dataset.index);

  if (e.target.classList.contains("delete-icon")) {
    deleteTask(index);
    return;
  }

  if (e.target.closest(".circle")) {
    toggleComplete(index);
    return;
  }
});

if (btnAll) btnAll.addEventListener("click", () => setFilter("all"));
if (btnActive) btnActive.addEventListener("click", () => setFilter("active"));
if (btnCompleted)
  btnCompleted.addEventListener("click", () => setFilter("completed"));

renderTaskList();
