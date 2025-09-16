// ===== DOM SELECTORS =====
const addBtn = document.querySelector(".input-container .circle"); // زر الإضافة فوق
const input = document.querySelector(".input");
const taskListEl = document.querySelector(".uList");
const noMoreLeft = document.querySelector(".noMoreLeft");
const itemsLeft = document.querySelector(".total-left");
const themeToggleBtn = document.getElementById("theme-toggle");
const draggableList = document.getElementsByClassName(".listItem");
// ========== buttons ==========
const btnAll = document.querySelector(".buttons .all");
const btnActive = document.querySelector(".buttons .active");
const btnCompleted = document.querySelector(".buttons .completed");
const btnClear = document.querySelector(".buttons .clear");
// =======dark mode toggle=======
const body = document.body;
const lists = document.querySelector(".Lists");
const inputField = document.querySelector(".input");
const sunIcon = document.querySelector(".first-img.dark");
const moonIcon = document.querySelector(".first-img.light");
const bgImg = document.querySelector(".background-pic");
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
      <li draggable="true" class="listItem ${
        t.isCompleted ? "completed" : ""
      }" data-index="${t.index}">
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

  addDragAndDropEvents();
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

btnClear.addEventListener("click", clearCompleted);

function clearCompleted() {
  tasks = tasks.filter((t) => !t.isCompleted);
  saveTasks(tasks);
  renderTaskList();
}

function addDragAndDropEvents() {
  const listItems = document.querySelectorAll(".listItem");

  listItems.forEach((item) => {
    item.addEventListener("dragstart", () => {
      item.classList.add("dragging");
    });

    item.addEventListener("dragend", () => {
      item.classList.remove("dragging");
    });
  });

  taskListEl.addEventListener("dragover", (e) => {
    e.preventDefault();
    const dragging = document.querySelector(".dragging");
    const afterElement = getDragAfterElement(taskListEl, e.clientY);
    if (afterElement == null) {
      taskListEl.appendChild(dragging);
    } else {
      taskListEl.insertBefore(dragging, afterElement);
    }
  });
}

function getDragAfterElement(container, y) {
  const draggableElements = [
    ...container.querySelectorAll(".listItem:not(.dragging)"),
  ];

  return draggableElements.reduce(
    (closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
      if (offset < 0 && offset > closest.offset) {
        return { offset: offset, element: child };
      } else {
        return closest;
      }
    },
    { offset: Number.NEGATIVE_INFINITY }
  ).element;
}

function setTheme(isDark) {
  if (isDark) {
    body.classList.add("dark-body");
    body.classList.remove("light-body");
    lists.classList.add("darkList");
    lists.classList.remove("lightList");
    inputField.classList.add("darkInput");
    inputField.classList.remove("lightInput");
    sunIcon.style.display = "block";
    moonIcon.style.display = "none";
  } else {
    body.classList.add("light-body");
    body.classList.remove("dark-body");
    lists.classList.add("lightList");
    lists.classList.remove("darkList");
    inputField.classList.add("lightInput");
    inputField.classList.remove("darkInput");
    sunIcon.style.display = "none";
    moonIcon.style.display = "block";
  }
}

// افتراضي داكن
setTheme(true);

sunIcon.addEventListener("click", () => setTheme(false));
moonIcon.addEventListener("click", () => setTheme(true));

function setTheme(isDark) {
  if (isDark) {
    body.classList.add("dark-body");
    body.classList.remove("light-body");
    lists.classList.add("darkList");
    lists.classList.remove("lightList");
    inputField.classList.add("darkInput");
    inputField.classList.remove("lightInput");
    sunIcon.style.display = "block";
    moonIcon.style.display = "none";
    if (bgImg) bgImg.src = "images/bg-desktop-dark.jpg"; // صورة الدارك مود
  } else {
    body.classList.add("light-body");
    body.classList.remove("dark-body");
    lists.classList.add("lightList");
    lists.classList.remove("darkList");
    inputField.classList.add("lightInput");
    inputField.classList.remove("darkInput");
    sunIcon.style.display = "none";
    moonIcon.style.display = "block";
    if (bgImg) bgImg.src = "images/bg-desktop-light.jpg"; // صورة اللايت مود
  }
}
renderTaskList();
