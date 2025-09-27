document.addEventListener("DOMContentLoaded", function () {
  const inputBox = document.getElementById("input-box");
  const listContainer = document.getElementById("list-container");
  const addBtn = document.getElementById("add-btn");
  const taskCounter = document.getElementById("task-counter");
  const filterButtons = document.querySelectorAll(".filter-buttons button");
  const prioritySelect = document.getElementById("priority-select");
  const clearBtn = document.getElementById("clear-btn");

  let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  let currentFilter = "all";

  function renderTasks() {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    const sortedTasks = [...tasks].sort(
      (a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]
    );

    listContainer.innerHTML = "";
    sortedTasks.forEach((task) => {
      if (currentFilter === "active" && task.done) return;
      if (currentFilter === "completed" && !task.done) return;

      const li = document.createElement("li");
      li.dataset.id = task.id; // attach unique id
      if (task.done) li.classList.add("checked");

      // Priority badge
      const badge = document.createElement("span");
      badge.classList.add("priority-badge", `priority-${task.priority}`);
      li.appendChild(badge);

      li.appendChild(document.createTextNode(task.text));

      // Delete button
      const span = document.createElement("span");
      span.textContent = "\u00d7"; // × symbol
      li.appendChild(span);

      listContainer.appendChild(li);

      // Animate new task
      li.classList.add("new");
      requestAnimationFrame(() => li.classList.add("show"));
      li.addEventListener("transitionend", () =>
        li.classList.remove("new", "show")
      );
    });

    updateCounter();
  }

  function addTask() {
    const text = inputBox.value.trim();
    if (text === "") return alert("You must write something!");
    const priority = prioritySelect.value;

    const id = Date.now(); // unique task id
    tasks.push({ id, text, done: false, priority });

    saveTasks();
    renderTasks();
    inputBox.value = "";
    inputBox.focus();
    prioritySelect.value = "low";
  }

  function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }

  function updateCounter() {
    const remaining = tasks.filter((t) => !t.done).length;
    taskCounter.textContent = `Tasks remaining: ${remaining}`;
  }

  // Toggle done / delete tasks
  listContainer.addEventListener("click", function (e) {
    const li = e.target.closest("li");
    if (!li) return;

    const taskId = Number(li.dataset.id);
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    if (e.target.tagName === "SPAN" && e.target !== li.querySelector(".priority-badge")) {
      // Delete button clicked
      li.style.opacity = 0;
      li.style.transform = "translateX(20px)";
      setTimeout(() => {
        tasks = tasks.filter((t) => t.id !== taskId);
        saveTasks();
        renderTasks();
      }, 200);
      return;
    }

    // Toggle done for any other click (text or badge)
    task.done = !task.done;
    saveTasks();
    renderTasks();
  });

  // Add task on Enter key
  inputBox.addEventListener("keypress", function (e) {
    if (e.key === "Enter") addTask();
  });

  addBtn.addEventListener("click", addTask);

  // Filter buttons
  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      currentFilter = btn.dataset.filter;
      renderTasks();
    });
  });

  // Clear all tasks
  clearBtn.addEventListener("click", () => {
    if (tasks.length === 0) return alert("No tasks to clear!");
    if (confirm("Are you sure you want to clear all tasks?")) {
      tasks = [];
      saveTasks();
      renderTasks();
    }
  });

  // Initial render
  renderTasks();
});