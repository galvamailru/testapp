const API_BASE = 'http://localhost:8085';

let currentDate = new Date();
let selectedDate = new Date();

const monthYearElem = document.getElementById('month-year');
const calendarGrid = document.getElementById('calendar-grid');
const selectedDateElem = document.getElementById('selected-date');
const taskList = document.getElementById('task-list');
const taskForm = document.getElementById('task-form');
const taskTitle = document.getElementById('task-title');
const taskDescription = document.getElementById('task-description');

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
    const title = taskTitle.value.trim();
    if (!title) return;
    const description = taskDescription.value.trim();
    const date = selectedDate.toISOString().split('T')[0];
    await fetch(`${API_BASE}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, date })
    });
    taskTitle.value = '';
    taskDescription.value = '';
    loadTasks();
});

function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    monthYearElem.textContent = `${currentDate.toLocaleString('ru', { month: 'long' })} ${year}`;
    
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    calendarGrid.innerHTML = '';
    
    // Empty cells for days before first day (Monday start)
    const startOffset = firstDay === 0 ? 6 : firstDay - 1;
    for (let i = 0; i < startOffset; i++) {
        const empty = document.createElement('div');
        calendarGrid.appendChild(empty);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
        const dayElem = document.createElement('div');
        dayElem.className = 'calendar-day';
        dayElem.textContent = day;
        const dateObj = new Date(year, month, day);
        if (dateObj.toDateString() === selectedDate.toDateString()) {
            dayElem.classList.add('selected');
        }
        dayElem.addEventListener('click', () => {
            selectedDate = dateObj;
            renderCalendar();
            loadTasks();
        });
        calendarGrid.appendChild(dayElem);
    }
}

async function loadTasks() {
    const dateStr = selectedDate.toISOString().split('T')[0];
    selectedDateElem.textContent = dateStr;
    const response = await fetch(`${API_BASE}/tasks?date=${dateStr}`);
    const tasks = await response.json();
    taskList.innerHTML = '';
    tasks.forEach(task => {
        const li = document.createElement('li');
        li.className = 'task-item';
        li.innerHTML = `
            <span><strong>${task.title}</strong>${task.description ? ': ' + task.description : ''}</span>
            <div>
                <button onclick="editTask(${task.id})">Редактировать</button>
                <button onclick="deleteTask(${task.id})">Удалить</button>
            </div>
        `;
        taskList.appendChild(li);
    });
}

async function deleteTask(id) {
    await fetch(`${API_BASE}/tasks/${id}`, { method: 'DELETE' });
    loadTasks();
}

async function editTask(id) {
    const newTitle = prompt('Новое название:');
    if (!newTitle) return;
    const newDescription = prompt('Новое описание:');
    await fetch(`${API_BASE}/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle, description: newDescription })
    });
    loadTasks();
}

renderCalendar();
loadTasks();
