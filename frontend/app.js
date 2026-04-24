const API_BASE = 'http://localhost:8000/api/tasks';

let currentDate = new Date();
let selectedDate = new Date();

function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

async function fetchTasks(date) {
    const response = await fetch(`${API_BASE}/?date=${formatDate(date)}`);
    return response.json();
}

async function addTask(task) {
    const response = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(task)
    });
    return response.json();
}

async function updateTask(id, task) {
    await fetch(`${API_BASE}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(task)
    });
}

async function deleteTask(id) {
    await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
}

function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    document.getElementById('current-month').textContent = `${year} ${new Date(year, month).toLocaleString('ru', { month: 'long' })}`;

    const grid = document.getElementById('calendar-grid');
    grid.innerHTML = '';

    for (let i = 0; i < firstDay; i++) {
        const empty = document.createElement('div');
        empty.className = 'calendar-day empty';
        grid.appendChild(empty);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'calendar-day';
        dayDiv.textContent = day;
        const date = new Date(year, month, day);
        if (formatDate(date) === formatDate(selectedDate)) {
            dayDiv.classList.add('selected');
        }
        dayDiv.addEventListener('click', () => {
            selectedDate = date;
            renderCalendar();
            renderTasks();
        });
        grid.appendChild(dayDiv);
    }
}

async function renderTasks() {
    const dateStr = formatDate(selectedDate);
    document.getElementById('selected-date').textContent = dateStr;
    const tasks = await fetchTasks(selectedDate);
    const list = document.getElementById('task-list');
    list.innerHTML = '';
    tasks.forEach(task => {
        const li = document.createElement('li');
        li.className = 'task-item' + (task.completed ? ' completed' : '');
        li.innerHTML = `
            <span>${task.title} ${task.time ? ' - ' + task.time : ''}</span>
            <div>
                <button onclick="toggleTask(${task.id}, ${!task.completed})">${task.completed ? 'Восстановить' : 'Выполнить'}</button>
                <button onclick="deleteTaskHandler(${task.id})">Удалить</button>
            </div>
        `;
        list.appendChild(li);
    });
}

async function toggleTask(id, completed) {
    await updateTask(id, { completed });
    renderTasks();
}

async function deleteTaskHandler(id) {
    await deleteTask(id);
    renderTasks();
}

document.getElementById('prev-month').addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
});

document.getElementById('next-month').addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
});

document.getElementById('task-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('task-title').value;
    const time = document.getElementById('task-time').value || null;
    await addTask({ title, date: formatDate(selectedDate), time });
    document.getElementById('task-title').value = '';
    document.getElementById('task-time').value = '';
    renderTasks();
});

renderCalendar();
renderTasks();