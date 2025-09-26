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
    // Sort tasks by priority: high > medium > low
    const priorityOrder = { "high": 3, "medium": 2, "low": 1 };
    const sortedTasks = [...tasks].sort((a, b) => {
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });

    listContainer.innerHTML = "";
    sortedTasks.forEach((task, index) => {
      if (currentFilter === "active" && task.done) return;
      if (currentFilter === "completed" && !task.done) return;

      const li = document.createElement("li");
      if (task.done) li.classList.add("checked");

      // Priority badge
      const badge = document.createElement("span");
      badge.classList.add("priority-badge");
      if (task.priority === "high") badge.classList.add("priority-high");
      else if (task.priority === "medium") badge.classList.add("priority-medium");
      else badge.classList.add("priority-low");

      li.appendChild(badge);
      li.appendChild(document.createTextNode(task.text));

      // Delete button
      const span = document.createElement("span");
      span.textContent = "\u00d7";
      li.appendChild(span);

      listContainer.appendChild(li);

      // Animate new task
      li.classList.add("new");
      requestAnimationFrame(() => li.classList.add("show"));
      li.addEventListener("transitionend", () => li.classList.remove("new", "show"));
    });
    updateCounter();
  }

  function addTask() {
    const text = inputBox.value.trim();
    if (text === "") return alert("You must write something!");
    const priority = prioritySelect.value;
    tasks.push({ text: text, done: false, priority: priority });
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

  // Toggle check / delete
  listContainer.addEventListener("click", function (e) {
    const li = e.target.closest("li");
    if (!li) return;
    const index = Array.from(listContainer.children).indexOf(li);

    if (e.target.tagName === "LI") {
      tasks[index].done = !tasks[index].done;
    } else if (e.target.tagName === "SPAN") {
      li.style.opacity = 0;
      li.style.transform = "translateX(20px)";
      setTimeout(() => {
        tasks.splice(index, 1);
        saveTasks();
        renderTasks();
      }, 200);
      return;
    }
    saveTasks();
    renderTasks();
  });

  // Add task on Enter key
  inputBox.addEventListener("keypress", function (e) {
    if (e.key === "Enter") addTask();
  });

  addBtn.addEventListener("click", addTask);

  // Filter buttons
  filterButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      filterButtons.forEach(b => b.classList.remove("active"));
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
