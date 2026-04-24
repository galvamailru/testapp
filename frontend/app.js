const API_BASE = 'http://localhost:8000';

let currentDate = new Date();
let selectedDate = null;

function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    document.getElementById('month-year').textContent = `${currentDate.toLocaleString('default', { month: 'long' })} ${year}`;

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const grid = document.getElementById('days-grid');
    grid.innerHTML = '';

    for (let i = 0; i < firstDay; i++) {
        const empty = document.createElement('div');
        empty.className = 'day empty';
        grid.appendChild(empty);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'day';
        dayDiv.textContent = day;
        dayDiv.dataset.date = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
        dayDiv.addEventListener('click', () => selectDate(dayDiv.dataset.date));
        if (selectedDate === dayDiv.dataset.date) {
            dayDiv.classList.add('selected');
        }
        grid.appendChild(dayDiv);
    }
}

function selectDate(dateStr) {
    selectedDate = dateStr;
    document.getElementById('selected-date').textContent = dateStr;
    loadTasks(dateStr);
    renderCalendar();
}

async function loadTasks(dateStr) {
    const response = await fetch(`${API_BASE}/tasks/?date=${dateStr}`);
    const tasks = await response.json();
    const list = document.getElementById('task-list');
    list.innerHTML = '';
    tasks.forEach(task => {
        const li = document.createElement('li');
        li.innerHTML = `<span>${task.title} ${task.time ? 'at ' + task.time : ''}</span>
                        <button onclick="deleteTask(${task.id})">Delete</button>`;
        list.appendChild(li);
    });
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
    const description = document.getElementById('task-desc').value;
    const time = document.getElementById('task-time').value;
    const task = {
        title,
        description: description || null,
        date: selectedDate,
        time: time || null,
        completed: false
    };
    await fetch(`${API_BASE}/tasks/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(task)
    });
    loadTasks(selectedDate);
    document.getElementById('task-form').reset();
});

async function deleteTask(id) {
    await fetch(`${API_BASE}/tasks/${id}`, { method: 'DELETE' });
    loadTasks(selectedDate);
}

// Initialize
renderCalendar();
selectDate(new Date().toISOString().split('T')[0]);