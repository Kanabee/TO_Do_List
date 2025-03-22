const input = document.getElementById('todo-input');
const dateInput = document.getElementById('due-date');
const btn = document.getElementById('add-btn');
const filter = document.getElementById('filter');
const todoList = document.getElementById('todo-list');
const doneList = document.getElementById('done-list');

function getTimeCategory(dueDateStr) {
  if (!dueDateStr) return 'short';
  const due = new Date(dueDateStr);
  const now = new Date();
  if (due.getFullYear() === now.getFullYear()) {
    if (due.getMonth() === now.getMonth()) {
      return 'short';
    }
    return 'medium';
  }
  return 'long';
}

function getDaysUntil(dueDateStr) {
  if (!dueDateStr) return Infinity;
  const now = new Date();
  const due = new Date(dueDateStr);
  return Math.ceil((due - now) / (1000 * 60 * 60 * 24));
}

function saveState() {
  const todos = [];
  const dones = [];

  todoList.querySelectorAll('li').forEach(li => {
    todos.push({
      text: li.dataset.text,
      due: li.dataset.due
    });
  });
  doneList.querySelectorAll('li').forEach(li => {
    dones.push({
      text: li.dataset.text,
      due: li.dataset.due
    });
  });

  localStorage.setItem('todos', JSON.stringify(todos));
  localStorage.setItem('dones', JSON.stringify(dones));
}

function renderTodos() {
  todoList.innerHTML = '';
  const todos = JSON.parse(localStorage.getItem('todos')) || [];
   // 🔁 Sort by due date (empty due dates go to the end)
   todos.sort((a, b) => {
    if (!a.due) return 1;
    if (!b.due) return -1;
    return new Date(a.due) - new Date(b.due);
  });

  todos.forEach(item => addItem(item.text, item.due, false));
}

function addItem(text, due, isDone = false) {
  const displayDue = due ? ` (${due})` : '';
  const li = document.createElement('li');
  li.dataset.text = text;
  li.dataset.due = due || '';

  // 🔄 ลบคลาสเก่าสำหรับอัปเดตสีใหม่เสมอ
  li.classList.remove('short', 'medium', 'long');
  const category = getTimeCategory(due);
  li.classList.add(category);

  const daysLeft = getDaysUntil(due);
  if (!isDone && daysLeft <= 7 && daysLeft >= 0) {
    const alertCircle = document.createElement('span');
    alertCircle.className = 'alert-circle';
    if (daysLeft <= 1) {
      alertCircle.classList.add('urgent');
    } else if (daysLeft <= 3) {
      alertCircle.classList.add('warning');
    } else {
      alertCircle.classList.add('notice');
    }
    li.appendChild(alertCircle);
  }

  const textNode = document.createTextNode(`${text}${displayDue}`);
  li.appendChild(textNode);

  const delBtn = document.createElement('span');
  delBtn.textContent = '❌';
  delBtn.className = 'delete';
  delBtn.addEventListener('click', e => {
    e.stopPropagation();
    li.remove();
    saveState();
    renderTodos();
  });

  li.appendChild(delBtn);

  li.addEventListener('click', () => {
    li.remove();
    addItem(text, due, !isDone);
    saveState();
    renderTodos();
  });

  if (!isDone && filter.value !== 'all' && filter.value !== category) return;

  (isDone ? doneList : todoList).appendChild(li);
}

function loadState() {
  renderTodos();
  const dones = JSON.parse(localStorage.getItem('dones')) || [];
  dones.forEach(item => addItem(item.text, item.due, true));
}

btn.addEventListener('click', () => {
  const text = input.value.trim();
  const due = dateInput.value;
  if (text) {
    const todos = JSON.parse(localStorage.getItem('todos')) || [];
    todos.push({ text, due });
    localStorage.setItem('todos', JSON.stringify(todos));
    input.value = '';
    dateInput.value = '';
    renderTodos();
  }
});

filter.addEventListener('change', () => {
  renderTodos();
});

window.addEventListener('load', loadState);