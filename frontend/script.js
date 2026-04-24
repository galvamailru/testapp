const API_BASE = 'http://localhost:8085';

let currentDate = new Date();
let selectedDate = null;
let tasks = {};

const monthYearEl = document.getElementById('month-year');
const calendarGrid = document.getElementById('calendar-grid');
const selectedDateEl = document.getElementById('selected-date');
const taskList = document.getElementById('task-list');
const taskForm = document.getElementById('task-form');
const taskTitle = document.getElementById('task-title');
const taskDesc = document.getElementById('task-desc');

document.getElementById('prev-month').addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
});

document.getElementById('next-month').addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
});

taskForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!selectedDate) return;
    const title = taskTitle.value.trim();
    if (!title) return;
    const description = taskDesc.value.trim();
    const dueDate = selectedDate.toISOString().split('T')[0];
    const response = await fetch(`${API_BASE}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, due_date: dueDate })
    });
    if (response.ok) {
        taskTitle.value = '';
        taskDesc.value = '';
        await loadTasks(selectedDate);
        renderCalendar();
    }
});

async function loadTasks(date) {
    const dateStr = date.toISOString().split('T')[0];
    const response = await fetch(`${API_BASE}/tasks?date_from=${dateStr}&date_to=${dateStr}`);
    if (response.ok) {
        const data = await response.json();
        tasks[dateStr] = data;
        renderTasks(date);
    }
}

function renderTasks(date) {
    const dateStr = date.toISOString().split('T')[0];
    selectedDateEl.textContent = dateStr;
    taskList.innerHTML = '';
    const dayTasks = tasks[dateStr] || [];
    dayTasks.forEach(task => {
        const li = document.createElement('li');
        li.className = 'task-item';
        li.innerHTML = `
            <span><strong>${task.title}</strong> ${task.description ? '- ' + task.description : ''}</span>
            <div>
                <button onclick="editTask(${task.id})">Редактировать</button>
                <button onclick="deleteTask(${task.id})">Удалить</button>
            </div>
        `;
        taskList.appendChild(li);
    });
}

async function deleteTask(id) {
    const response = await fetch(`${API_BASE}/tasks/${id}`, { method: 'DELETE' });
    if (response.ok) {
        await loadTasks(selectedDate);
        renderCalendar();
    }
}

async function editTask(id) {
    const newTitle = prompt('Новое название:');
    if (!newTitle) return;
    const newDesc = prompt('Новое описание:');
    const dueDate = selectedDate.toISOString().split('T')[0];
    const response = await fetch(`${API_BASE}/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle, description: newDesc || '', due_date: dueDate })
    });
    if (response.ok) {
        await loadTasks(selectedDate);
        renderCalendar();
    }
}

function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    monthYearEl.textContent = `${currentDate.toLocaleString('ru', { month: 'long' })} ${year}`;
    calendarGrid.innerHTML = '';

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Add empty cells for days before first day
    for (let i = 0; i < (firstDay === 0 ? 6 : firstDay - 1); i++) {
        const empty = document.createElement('div');
        empty.className = 'calendar-day empty';
        calendarGrid.appendChild(empty);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const dateStr = date.toISOString().split('T')[0];
        const dayDiv = document.createElement('div');
        dayDiv.className = 'calendar-day';
        dayDiv.textContent = day;

        // Highlight today
        const today = new Date();
        if (date.toDateString() === today.toDateString()) {
            dayDiv.classList.add('today');
        }

        // Highlight selected
        if (selectedDate && date.toDateString() === selectedDate.toDateString()) {
            dayDiv.classList.add('selected');
        }

        // Show task count
        if (tasks[dateStr] && tasks[dateStr].length > 0) {
            const count = document.createElement('span');
            count.textContent = ` (${tasks[dateStr].length})`;
            dayDiv.appendChild(count);
        }

        dayDiv.addEventListener('click', () => {
            selectedDate = date;
            renderCalendar();
            loadTasks(date);
        });

        calendarGrid.appendChild(dayDiv);
    }
}

// Initial load
renderCalendar();
selectedDate = new Date();
loadTasks(selectedDate);
