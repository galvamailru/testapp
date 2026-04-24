const API_BASE = '/tasks';
let currentDate = new Date();

function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const calendar = document.getElementById('calendar');
    calendar.innerHTML = '';
    
    // Add empty cells for days before first day
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
    document.getElementById('selected-date').textContent = dateStr;
    fetchTasks(dateStr);
}

async function fetchTasks(date) {
    const response = await fetch(`${API_BASE}/?date=${date}`);
    const tasks = await response.json();
    const taskList = document.getElementById('task-list');
    taskList.innerHTML = '';
    tasks.forEach(task => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span class="${task.completed ? 'completed' : ''}">${task.title} ${task.time ? 'at ' + task.time : ''}</span>
            <button onclick="deleteTask(${task.id})">Delete</button>
            <button onclick="toggleTask(${task.id}, ${!task.completed})">Toggle</button>
        `;
        taskList.appendChild(li);
    });
}

document.getElementById('task-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const date = document.getElementById('selected-date').textContent;
    if (!date) return;
    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    const time = document.getElementById('time').value;
    const response = await fetch(API_BASE + '/', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({title, description, date, time: time || null, completed: false})
    });
    if (response.ok) {
        fetchTasks(date);
        document.getElementById('title').value = '';
        document.getElementById('description').value = '';
        document.getElementById('time').value = '';
    }
});

async function deleteTask(id) {
    const date = document.getElementById('selected-date').textContent;
    await fetch(`${API_BASE}/${id}`, {method: 'DELETE'});
    fetchTasks(date);
}

async function toggleTask(id, completed) {
    const date = document.getElementById('selected-date').textContent;
    const response = await fetch(`${API_BASE}/${id}`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({completed})
    });
    if (response.ok) fetchTasks(date);
}

renderCalendar();
// Select today by default
const today = new Date();
const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
selectDate(todayStr);