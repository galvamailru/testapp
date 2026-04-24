const API_BASE = 'http://localhost:8000';

let currentDate = new Date();
let selectedDate = new Date();

function formatDate(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    document.getElementById('month-year').textContent = `${currentDate.toLocaleString('ru', { month: 'long' })} ${year}`;

    const grid = document.getElementById('days-grid');
    grid.innerHTML = '';

    // Empty cells for days before first day
    for (let i = 0; i < firstDay; i++) {
        const empty = document.createElement('div');
        empty.className = 'day empty';
        grid.appendChild(empty);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'day';
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

    const response = await fetch(`${API_BASE}/tasks/?date=${dateStr}`);
    const tasks = await response.json();

    const list = document.getElementById('task-list');
    list.innerHTML = '';

    tasks.forEach(task => {
        const li = document.createElement('li');
        li.className = 'task-item' + (task.completed ? ' completed' : '');
        li.innerHTML = `
            <span>${task.time ? task.time.substring(0,5) : ''} ${task.title}</span>
            <div>
                <button onclick="toggleTask(${task.id}, ${!task.completed})">${task.completed ? 'Восстановить' : 'Выполнить'}</button>
                <button onclick="deleteTask(${task.id})">Удалить</button>
            </div>
        `;
        list.appendChild(li);
    });
}

async function toggleTask(id, completed) {
    await fetch(`${API_BASE}/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed })
    });
    loadTasks();
}

async function deleteTask(id) {
    await fetch(`${API_BASE}/tasks/${id}`, { method: 'DELETE' });
    loadTasks();
}

document.getElementById('task-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('task-title').value;
    const time = document.getElementById('task-time').value || null;
    const description = document.getElementById('task-description').value || null;
    const date = formatDate(selectedDate);

    await fetch(`${API_BASE}/tasks/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, time, description, date })
    });

    document.getElementById('task-title').value = '';
    document.getElementById('task-time').value = '';
    document.getElementById('task-description').value = '';
    loadTasks();
});

document.getElementById('prev-month').addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
});

document.getElementById('next-month').addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
});

renderCalendar();
loadTasks();