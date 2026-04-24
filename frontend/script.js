const API_BASE = '/api';

let currentDate = new Date();
let selectedDate = new Date();

function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    document.getElementById('month-year').textContent = `${currentDate.toLocaleString('ru', { month: 'long' })} ${year}`;

    const grid = document.getElementById('calendar-grid');
    grid.innerHTML = '';

    // Empty cells for days before first day
    for (let i = 0; i < firstDay; i++) {
        const empty = document.createElement('div');
        empty.className = 'calendar-day empty';
        grid.appendChild(empty);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'calendar-day';
        dayDiv.textContent = day;
        const dateObj = new Date(year, month, day);
        if (formatDate(dateObj) === formatDate(selectedDate)) {
            dayDiv.classList.add('selected');
        }
        dayDiv.addEventListener('click', () => {
            selectedDate = dateObj;
            renderCalendar();
            loadTasks();
        });
        grid.appendChild(dayDiv);
    }
}

async function loadTasks() {
    const dateStr = formatDate(selectedDate);
    document.getElementById('selected-date').textContent = dateStr;

    const response = await fetch(`${API_BASE}/tasks?date=${dateStr}`);
    const tasks = await response.json();

    const list = document.getElementById('task-list');
    list.innerHTML = '';

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
        list.appendChild(li);
    });
}

async function addTask(event) {
    event.preventDefault();
    const title = document.getElementById('task-title').value;
    const description = document.getElementById('task-description').value;
    const date = formatDate(selectedDate);

    await fetch(`${API_BASE}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, date })
    });

    document.getElementById('task-title').value = '';
    document.getElementById('task-description').value = '';
    loadTasks();
}

async function deleteTask(id) {
    await fetch(`${API_BASE}/tasks/${id}`, { method: 'DELETE' });
    loadTasks();
}

async function editTask(id) {
    const newTitle = prompt('Новое название:');
    if (newTitle === null) return;
    const newDescription = prompt('Новое описание:');
    if (newDescription === null) return;

    await fetch(`${API_BASE}/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle, description: newDescription })
    });
    loadTasks();
}

document.getElementById('prev-month').addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
});

document.getElementById('next-month').addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
});

document.getElementById('task-form').addEventListener('submit', addTask);

renderCalendar();
loadTasks();