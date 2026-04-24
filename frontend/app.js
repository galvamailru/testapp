const API_BASE = 'http://localhost:8000/api/tasks';

let currentDate = new Date();
let selectedDate = new Date();

function renderCalendar() {
    const calendar = document.getElementById('calendar');
    calendar.innerHTML = '';
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let i = 0; i < firstDay; i++) {
        const empty = document.createElement('div');
        calendar.appendChild(empty);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'calendar-day';
        dayDiv.textContent = day;
        dayDiv.dataset.date = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
        dayDiv.addEventListener('click', () => selectDate(new Date(year, month, day)));
        calendar.appendChild(dayDiv);
    }
}

function selectDate(date) {
    selectedDate = date;
    document.getElementById('selected-date').textContent = date.toDateString();
    loadTasks();
}

async function loadTasks() {
    const dateStr = selectedDate.toISOString().split('T')[0];
    const response = await fetch(`${API_BASE}/?date=${dateStr}`);
    const tasks = await response.json();
    const taskList = document.getElementById('task-list');
    taskList.innerHTML = '';
    tasks.forEach(task => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span class="${task.completed ? 'completed' : ''}">${task.title} ${task.time ? 'at ' + task.time : ''}</span>
            <div>
                <button onclick="toggleTask(${task.id}, ${!task.completed})">${task.completed ? 'Undo' : 'Complete'}</button>
                <button onclick="deleteTask(${task.id})">Delete</button>
            </div>
        `;
        taskList.appendChild(li);
    });
}

document.getElementById('task-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('task-title').value;
    const description = document.getElementById('task-description').value;
    const time = document.getElementById('task-time').value;
    const dateStr = selectedDate.toISOString().split('T')[0];
    const response = await fetch(API_BASE + '/', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({title, description, date: dateStr, time: time || null, completed: false})
    });
    if (response.ok) {
        loadTasks();
        document.getElementById('task-form').reset();
    }
});

async function toggleTask(id, completed) {
    await fetch(`${API_BASE}/${id}`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({completed})
    });
    loadTasks();
}

async function deleteTask(id) {
    await fetch(`${API_BASE}/${id}`, {method: 'DELETE'});
    loadTasks();
}

renderCalendar();
selectDate(new Date());