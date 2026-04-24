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
        empty.className = 'calendar-day empty';
        calendar.appendChild(empty);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'calendar-day';
        dayDiv.textContent = day;
        dayDiv.dataset.date = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
        dayDiv.addEventListener('click', () => selectDate(dayDiv.dataset.date));
        if (dayDiv.dataset.date === formatDate(selectedDate)) {
            dayDiv.style.backgroundColor = '#007bff';
            dayDiv.style.color = 'white';
        }
        calendar.appendChild(dayDiv);
    }
}

function formatDate(date) {
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function selectDate(dateStr) {
    selectedDate = new Date(dateStr + 'T00:00:00');
    document.getElementById('selected-date').textContent = dateStr;
    document.getElementById('date').value = dateStr;
    loadTasks(dateStr);
    renderCalendar();
}

async function loadTasks(dateStr) {
    const response = await fetch(`${API_BASE}/?date=${dateStr}`);
    const tasks = await response.json();
    const taskList = document.getElementById('tasks');
    taskList.innerHTML = '';
    tasks.forEach(task => {
        const li = document.createElement('li');
        li.innerHTML = `<span>${task.title} ${task.time ? 'at ' + task.time : ''}</span>
                        <button onclick="deleteTask(${task.id})">Delete</button>`;
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
        loadTasks(date);
        document.getElementById('task-form').reset();
    }
});

async function deleteTask(id) {
    await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
    loadTasks(formatDate(selectedDate));
}

// Initialize
renderCalendar();
selectDate(formatDate(new Date()));