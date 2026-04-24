const API_BASE = 'http://localhost:8000';
let currentDate = new Date();
let selectedDate = null;

function formatDate(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

async function fetchTasks(date) {
    const response = await fetch(`${API_BASE}/tasks?date=${date}`);
    return response.json();
}

async function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    document.getElementById('month-year').textContent = `${year} ${new Date(year, month).toLocaleString('ru', { month: 'long' })}`;
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
        const dateStr = formatDate(new Date(year, month, day));
        dayDiv.dataset.date = dateStr;
        if (selectedDate === dateStr) {
            dayDiv.classList.add('selected');
        }
        dayDiv.addEventListener('click', () => selectDate(dateStr));
        grid.appendChild(dayDiv);
    }
}

async function selectDate(dateStr) {
    selectedDate = dateStr;
    document.getElementById('selected-date').textContent = dateStr;
    renderCalendar();
    const tasks = await fetchTasks(dateStr);
    renderTasks(tasks);
}

function renderTasks(tasks) {
    const list = document.getElementById('task-list');
    list.innerHTML = '';
    tasks.forEach(task => {
        const li = document.createElement('li');
        li.innerHTML = `<span>${task.title}</span>
            <button onclick="editTask(${task.id})">Редактировать</button>
            <button onclick="deleteTask(${task.id})">Удалить</button>`;
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

document.getElementById('add-task-btn').addEventListener('click', () => {
    document.getElementById('task-id').value = '';
    document.getElementById('task-title').value = '';
    document.getElementById('task-description').value = '';
    document.getElementById('modal-title').textContent = 'Новая задача';
    document.getElementById('task-modal').classList.remove('hidden');
});

document.querySelector('.close').addEventListener('click', () => {
    document.getElementById('task-modal').classList.add('hidden');
});

document.getElementById('task-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('task-id').value;
    const title = document.getElementById('task-title').value;
    const description = document.getElementById('task-description').value;
    const date = selectedDate;
    if (id) {
        await fetch(`${API_BASE}/tasks/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, description })
        });
    } else {
        await fetch(`${API_BASE}/tasks`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, description, date })
        });
    }
    document.getElementById('task-modal').classList.add('hidden');
    if (selectedDate) selectDate(selectedDate);
});

async function editTask(id) {
    const tasks = await fetchTasks(selectedDate);
    const task = tasks.find(t => t.id === id);
    if (task) {
        document.getElementById('task-id').value = task.id;
        document.getElementById('task-title').value = task.title;
        document.getElementById('task-description').value = task.description || '';
        document.getElementById('modal-title').textContent = 'Редактировать задачу';
        document.getElementById('task-modal').classList.remove('hidden');
    }
}

async function deleteTask(id) {
    await fetch(`${API_BASE}/tasks/${id}`, { method: 'DELETE' });
    if (selectedDate) selectDate(selectedDate);
}

// Initial render
renderCalendar();
