const API_BASE = '/tasks';

let currentDate = new Date();

function renderCalendar() {
    const calendar = document.getElementById('calendar');
    calendar.innerHTML = '';
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Empty cells before first day
    for (let i = 0; i < firstDay; i++) {
        const empty = document.createElement('div');
        empty.className = 'calendar-day empty';
        calendar.appendChild(empty);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'calendar-day';
        dayDiv.textContent = day;
        const date = new Date(year, month, day);
        if (date.toDateString() === new Date().toDateString()) {
            dayDiv.classList.add('today');
        }
        dayDiv.addEventListener('click', () => selectDate(date));
        calendar.appendChild(dayDiv);
    }
}

function selectDate(date) {
    document.getElementById('selected-date').textContent = date.toISOString().split('T')[0];
    document.getElementById('date').value = date.toISOString().split('T')[0];
    loadTasks(date);
}

async function loadTasks(date) {
    const dateStr = date.toISOString().split('T')[0];
    const response = await fetch(`${API_BASE}/?date=${dateStr}`);
    const tasks = await response.json();
    const taskList = document.getElementById('tasks');
    taskList.innerHTML = '';
    tasks.forEach(task => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span>${task.title} ${task.time ? 'at ' + task.time : ''}</span>
            <div>
                <button onclick="editTask(${task.id})">Edit</button>
                <button onclick="deleteTask(${task.id})">Delete</button>
            </div>
        `;
        taskList.appendChild(li);
    });
}

document.getElementById('task-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('title').value;
    const date = document.getElementById('date').value;
    const time = document.getElementById('time').value || null;
    const description = document.getElementById('description').value || null;

    const response = await fetch(API_BASE + '/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, date, time, description })
    });
    if (response.ok) {
        loadTasks(new Date(date));
        document.getElementById('task-form').reset();
    }
});

async function deleteTask(id) {
    await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
    const selectedDate = new Date(document.getElementById('selected-date').textContent);
    loadTasks(selectedDate);
}

async function editTask(id) {
    const response = await fetch(`${API_BASE}/${id}`);
    const task = await response.json();
    document.getElementById('title').value = task.title;
    document.getElementById('date').value = task.date;
    document.getElementById('time').value = task.time || '';
    document.getElementById('description').value = task.description || '';
    // Remove old form submission and add update
    const form = document.getElementById('task-form');
    form.onsubmit = async (e) => {
        e.preventDefault();
        const updatedTask = {
            title: document.getElementById('title').value,
            date: document.getElementById('date').value,
            time: document.getElementById('time').value || null,
            description: document.getElementById('description').value || null
        };
        await fetch(`${API_BASE}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedTask)
        });
        loadTasks(new Date(updatedTask.date));
        form.reset();
        form.onsubmit = null; // Reset to default
    };
}

// Initialize
renderCalendar();
selectDate(new Date());