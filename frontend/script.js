const API_BASE = 'http://localhost:8085';

let currentDate = new Date();
let selectedDate = new Date();

const monthNames = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];

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

    document.getElementById('current-month').textContent = `${monthNames[month]} ${year}`;

    const calendar = document.getElementById('calendar');
    calendar.innerHTML = '';

    // Empty cells for days before first day
    for (let i = 0; i < (firstDay === 0 ? 6 : firstDay - 1); i++) {
        const empty = document.createElement('div');
        empty.className = 'calendar-day empty';
        calendar.appendChild(empty);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const dayDiv = document.createElement('div');
        dayDiv.className = 'calendar-day';
        if (formatDate(date) === formatDate(selectedDate)) {
            dayDiv.classList.add('selected');
        }
        dayDiv.textContent = day;
        dayDiv.addEventListener('click', () => {
            selectedDate = date;
            renderCalendar();
            loadTasks();
        });
        calendar.appendChild(dayDiv);
    }
}

async function loadTasks() {
    const dateStr = formatDate(selectedDate);
    document.getElementById('selected-date').textContent = dateStr;

    const response = await fetch(`${API_BASE}/tasks?date=${dateStr}`);
    const tasks = await response.json();

    const taskList = document.getElementById('task-list');
    taskList.innerHTML = '';

    tasks.forEach(task => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span><strong>${task.title}</strong>${task.description ? ': ' + task.description : ''}</span>
            <div>
                <button onclick="editTask(${task.id})">Редактировать</button>
                <button onclick="deleteTask(${task.id})">Удалить</button>
            </div>
        `;
        taskList.appendChild(li);
    });
}

document.getElementById('task-form').addEventListener('submit', async (e) => {
    e.preventDefault();
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
});

async function deleteTask(id) {
    await fetch(`${API_BASE}/tasks/${id}`, { method: 'DELETE' });
    loadTasks();
}

async function editTask(id) {
    const newTitle = prompt('Новое название:');
    if (newTitle) {
        const newDescription = prompt('Новое описание:');
        await fetch(`${API_BASE}/tasks/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: newTitle, description: newDescription })
        });
        loadTasks();
    }
}

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