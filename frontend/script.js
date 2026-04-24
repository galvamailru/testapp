const API_BASE = 'http://localhost:8085';

let currentDate = new Date();
let selectedDate = new Date();

const monthYearSpan = document.getElementById('month-year');
const calendarGrid = document.getElementById('calendar-grid');
const selectedDateSpan = document.getElementById('selected-date');
const taskList = document.getElementById('task-list');
const taskForm = document.getElementById('task-form');
const taskTitleInput = document.getElementById('task-title');
const taskDescriptionInput = document.getElementById('task-description');

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
    const title = taskTitleInput.value.trim();
    if (!title) return;
    const description = taskDescriptionInput.value.trim();
    const dateStr = formatDate(selectedDate);
    await fetch(`${API_BASE}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, date: dateStr })
    });
    taskTitleInput.value = '';
    taskDescriptionInput.value = '';
    loadTasks();
});

function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    monthYearSpan.textContent = `${currentDate.toLocaleString('ru', { month: 'long' })} ${year}`;
    
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    calendarGrid.innerHTML = '';
    
    // Empty cells for days before first day
    for (let i = 0; i < (firstDay === 0 ? 6 : firstDay - 1); i++) {
        const emptyDiv = document.createElement('div');
        emptyDiv.className = 'calendar-day empty';
        calendarGrid.appendChild(emptyDiv);
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
    
    selectedDateSpan.textContent = formatDate(selectedDate);
    loadTasks();
}

async function loadTasks() {
    const dateStr = formatDate(selectedDate);
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
    if (newTitle === null) return;
    const newDescription = prompt('Новое описание:');
    const body = {};
    if (newTitle.trim()) body.title = newTitle.trim();
    if (newDescription.trim()) body.description = newDescription.trim();
    await fetch(`${API_BASE}/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });
    loadTasks();
}

function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

renderCalendar();