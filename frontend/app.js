const API_BASE = 'http://localhost:8000/api/tasks';

let currentDate = new Date();
let selectedDate = new Date();

const monthNames = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];

function formatDate(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    document.getElementById('current-month').textContent = `${monthNames[month]} ${year}`;

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const grid = document.getElementById('calendar-grid');
    grid.innerHTML = '';

    // Empty cells before first day
    for (let i = 0; i < firstDay; i++) {
        const empty = document.createElement('div');
        empty.className = 'calendar-day empty';
        grid.appendChild(empty);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'calendar-day';
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
    const response = await fetch(`${API_BASE}/?date=${dateStr}`);
    const tasks = await response.json();
    const list = document.getElementById('tasks');
    list.innerHTML = '';
    tasks.forEach(task => {
        const li = document.createElement('li');
        li.className = task.completed ? 'completed' : '';
        li.innerHTML = `
            <span>${task.title} ${task.time ? ' - ' + task.time : ''}</span>
            <div>
                <button onclick="editTask(${task.id})">Редактировать</button>
                <button onclick="deleteTask(${task.id})">Удалить</button>
            </div>
        `;
        list.appendChild(li);
    });
}

async function deleteTask(id) {
    if (confirm('Удалить задачу?')) {
        await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
        loadTasks();
    }
}

function editTask(id) {
    fetch(`${API_BASE}/${id}`)
        .then(res => res.json())
        .then(task => {
            document.getElementById('task-id').value = task.id;
            document.getElementById('title').value = task.title;
            document.getElementById('description').value = task.description || '';
            document.getElementById('time').value = task.time || '';
            document.getElementById('completed').checked = task.completed;
            document.getElementById('modal-title').textContent = 'Редактировать задачу';
            document.getElementById('task-modal').style.display = 'block';
        });
}

document.getElementById('add-task-btn').addEventListener('click', () => {
    document.getElementById('task-id').value = '';
    document.getElementById('title').value = '';
    document.getElementById('description').value = '';
    document.getElementById('time').value = '';
    document.getElementById('completed').checked = false;
    document.getElementById('modal-title').textContent = 'Новая задача';
    document.getElementById('task-modal').style.display = 'block';
});

document.querySelector('.close').addEventListener('click', () => {
    document.getElementById('task-modal').style.display = 'none';
});

document.getElementById('task-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('task-id').value;
    const data = {
        title: document.getElementById('title').value,
        description: document.getElementById('description').value,
        date: formatDate(selectedDate),
        time: document.getElementById('time').value || null,
        completed: document.getElementById('completed').checked
    };
    if (id) {
        await fetch(`${API_BASE}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
    } else {
        await fetch(`${API_BASE}/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
    }
    document.getElementById('task-modal').style.display = 'none';
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

// Initial render
renderCalendar();
loadTasks();