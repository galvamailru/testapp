const API_BASE = 'http://localhost:8085';

let currentDate = new Date();
let selectedDate = new Date();

const monthYear = document.getElementById('month-year');
const calendarGrid = document.getElementById('calendar-grid');
const prevMonthBtn = document.getElementById('prev-month');
const nextMonthBtn = document.getElementById('next-month');
const selectedDateSpan = document.getElementById('selected-date');
const taskList = document.getElementById('task-list');
const taskForm = document.getElementById('task-form');
const taskTitle = document.getElementById('task-title');
const taskDescription = document.getElementById('task-description');

prevMonthBtn.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
});

nextMonthBtn.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
});

taskForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = taskTitle.value.trim();
    const description = taskDescription.value.trim();
    if (!title) return;
    const dueDate = selectedDate.toISOString().split('T')[0];
    await fetch(`${API_BASE}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, due_date: dueDate })
    });
    taskTitle.value = '';
    taskDescription.value = '';
    loadTasks();
});

function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    monthYear.textContent = `${currentDate.toLocaleString('default', { month: 'long' })} ${year}`;

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    calendarGrid.innerHTML = '';
    for (let i = 0; i < firstDay; i++) {
        const empty = document.createElement('div');
        calendarGrid.appendChild(empty);
    }
    for (let day = 1; day <= daysInMonth; day++) {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'calendar-day';
        dayDiv.textContent = day;
        const dateObj = new Date(year, month, day);
        if (dateObj.toDateString() === selectedDate.toDateString()) {
            dayDiv.classList.add('selected');
        }
        dayDiv.addEventListener('click', () => {
            selectedDate = dateObj;
            renderCalendar();
            loadTasks();
        });
        calendarGrid.appendChild(dayDiv);
    }
    loadTasks();
}

async function loadTasks() {
    const dueDate = selectedDate.toISOString().split('T')[0];
    selectedDateSpan.textContent = dueDate;
    const response = await fetch(`${API_BASE}/tasks/${dueDate}`);
    const tasks = await response.json();
    taskList.innerHTML = '';
    tasks.forEach(task => {
        const li = document.createElement('li');
        li.className = 'task-item';
        li.innerHTML = `
            <span><strong>${task.title}</strong>: ${task.description || ''}</span>
            <div>
                <button onclick="editTask(${task.id}, '${task.title}', '${task.description || ''}')">Edit</button>
                <button onclick="deleteTask(${task.id})">Delete</button>
            </div>
        `;
        taskList.appendChild(li);
    });
}

async function deleteTask(id) {
    await fetch(`${API_BASE}/tasks/${id}`, { method: 'DELETE' });
    loadTasks();
}

function editTask(id, title, description) {
    taskTitle.value = title;
    taskDescription.value = description;
    taskForm.onsubmit = async (e) => {
        e.preventDefault();
        const newTitle = taskTitle.value.trim();
        const newDescription = taskDescription.value.trim();
        if (!newTitle) return;
        const dueDate = selectedDate.toISOString().split('T')[0];
        await fetch(`${API_BASE}/tasks/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: newTitle, description: newDescription, due_date: dueDate })
        });
        taskTitle.value = '';
        taskDescription.value = '';
        taskForm.onsubmit = null; // reset to default
        taskForm.addEventListener('submit', defaultSubmit);
        loadTasks();
    };
}

function defaultSubmit(e) {
    e.preventDefault();
    const title = taskTitle.value.trim();
    const description = taskDescription.value.trim();
    if (!title) return;
    const dueDate = selectedDate.toISOString().split('T')[0];
    fetch(`${API_BASE}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, due_date: dueDate })
    });
    taskTitle.value = '';
    taskDescription.value = '';
    loadTasks();
}

taskForm.addEventListener('submit', defaultSubmit);

renderCalendar();
