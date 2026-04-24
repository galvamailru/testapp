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
        empty.className = 'day empty';
        calendar.appendChild(empty);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'day';
        dayDiv.textContent = day;
        dayDiv.dataset.date = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
        dayDiv.addEventListener('click', () => selectDate(dayDiv.dataset.date));
        calendar.appendChild(dayDiv);
    }
}

function selectDate(dateStr) {
    selectedDate = new Date(dateStr + 'T00:00:00');
    document.getElementById('selected-date').textContent = dateStr;
    loadTasks(dateStr);
}

async function loadTasks(dateStr) {
    const response = await fetch(`/tasks/?date=${dateStr}`);
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
    const title = document.getElementById('task-title').value;
    const description = document.getElementById('task-desc').value;
    const time = document.getElementById('task-time').value;
    const dateStr = selectedDate.toISOString().split('T')[0];
    const response = await fetch('/tasks/', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({title, description, date: dateStr, time: time || null})
    });
    if (response.ok) {
        loadTasks(dateStr);
        document.getElementById('task-form').reset();
    }
});

async function toggleTask(id) {
    const response = await fetch(`/tasks/${id}`);
    const task = await response.json();
    const updated = await fetch(`/tasks/${id}`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({completed: !task.completed})
    });
    if (updated.ok) {
        loadTasks(selectedDate.toISOString().split('T')[0]);
    }
}

async function deleteTask(id) {
    const response = await fetch(`/tasks/${id}`, {method: 'DELETE'});
    if (response.ok) {
        loadTasks(selectedDate.toISOString().split('T')[0]);
    }
}

renderCalendar();
selectDate(new Date().toISOString().split('T')[0]);