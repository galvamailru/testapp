let currentDate = new Date();

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
        dayDiv.className = 'day';
        dayDiv.textContent = day;
        dayDiv.dataset.date = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
        dayDiv.addEventListener('click', () => loadTasks(dayDiv.dataset.date));
        calendar.appendChild(dayDiv);
    }
}

async function loadTasks(date) {
    document.getElementById('selected-date').textContent = date;
    const response = await fetch(`/api/tasks/?date=${date}`);
    const tasks = await response.json();
    const taskList = document.getElementById('task-list');
    taskList.innerHTML = '';
    tasks.forEach(task => {
        const li = document.createElement('li');
        li.innerHTML = `<span class="${task.completed ? 'completed' : ''}">${task.title} ${task.time ? 'at ' + task.time : ''}</span>
                        <button onclick="toggleTask(${task.id})">Toggle</button>
                        <button onclick="deleteTask(${task.id})">Delete</button>`;
        taskList.appendChild(li);
    });
}

document.getElementById('task-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const date = document.getElementById('selected-date').textContent;
    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    const time = document.getElementById('time').value;
    const response = await fetch('/api/tasks/', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({title, description, date, time: time || null})
    });
    if (response.ok) {
        loadTasks(date);
        document.getElementById('title').value = '';
        document.getElementById('description').value = '';
        document.getElementById('time').value = '';
    }
});

async function toggleTask(id) {
    const date = document.getElementById('selected-date').textContent;
    const response = await fetch(`/api/tasks/${id}`);
    const task = await response.json();
    const updated = await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({completed: !task.completed})
    });
    if (updated.ok) loadTasks(date);
}

async function deleteTask(id) {
    const date = document.getElementById('selected-date').textContent;
    await fetch(`/api/tasks/${id}`, {method: 'DELETE'});
    loadTasks(date);
}

renderCalendar();
loadTasks(new Date().toISOString().split('T')[0]);