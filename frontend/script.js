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
    const description = taskDescriptionInput.value.trim();
    if (!title) return;
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
    
    // Add day headers
    const dayHeaders = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
    dayHeaders.forEach(day => {
        const header = document.createElement('div');
        header.textContent = day;
        header.style.fontWeight = 'bold';
        calendarGrid.appendChild(header);
    });
    
    // Adjust firstDay to Monday-based (0=Monday, 6=Sunday)
    let startDay = firstDay === 0 ? 6 : firstDay - 1;
    
    // Empty cells before first day
    for (let i = 0; i < startDay; i++) {
        const empty = document.createElement('div');
        calendarGrid.appendChild(empty);
    }
    
    // Day cells
    for (let day = 1; day <= daysInMonth; day++) {
        const dayCell = document.createElement('div');
        dayCell.className = 'calendar-day';
        dayCell.textContent = day;
        const cellDate = new Date(year, month, day);
        if (cellDate.toDateString() === selectedDate.toDateString()) {
            dayCell.classList.add('selected');
        }
        dayCell.addEventListener('click', () => {
            selectedDate = cellDate;
            renderCalendar();
            loadTasks();
        });
        calendarGrid.appendChild(dayCell);
    }
}

async function loadTasks() {
    const dateStr = formatDate(selectedDate);
    selectedDateSpan.textContent = dateStr;
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
    await fetch(`${API_BASE}/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle, description: newDescription })
    });
    loadTasks();
}

function formatDate(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

renderCalendar();
loadTasks();