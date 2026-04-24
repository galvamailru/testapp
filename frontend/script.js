const API_BASE = 'http://localhost:8085';

let currentDate = new Date();
let selectedDate = new Date();

const monthYearSpan = document.getElementById('month-year');
const calendarGrid = document.getElementById('calendar-grid');
const selectedDateSpan = document.getElementById('selected-date');
const taskList = document.getElementById('task-list');
const taskForm = document.getElementById('task-form');
const taskTitleInput = document.getElementById('task-title');
const taskDescInput = document.getElementById('task-desc');

document.getElementById('prev-month').addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
});
document.getElementById('next-month').addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
});

taskForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = taskTitleInput.value.trim();
    const description = taskDescInput.value.trim() || null;
    if (!title) return;
    const dueDate = selectedDate.toISOString().split('T')[0];
    await fetch(`${API_BASE}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, due_date: dueDate })
    });
    taskTitleInput.value = '';
    taskDescInput.value = '';
    loadTasks();
});

function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    monthYearSpan.textContent = `${currentDate.toLocaleString('ru', { month: 'long' })} ${year}`;
    
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    calendarGrid.innerHTML = '';
    
    // Add day names
    const dayNames = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
    dayNames.forEach(name => {
        const div = document.createElement('div');
        div.textContent = name;
        div.style.fontWeight = 'bold';
        calendarGrid.appendChild(div);
    });
    
    // Add empty cells before first day
    for (let i = 0; i < firstDay; i++) {
        const div = document.createElement('div');
        calendarGrid.appendChild(div);
    }
    
    // Add days
    for (let day = 1; day <= daysInMonth; day++) {
        const div = document.createElement('div');
        div.textContent = day;
        div.classList.add('calendar-day');
        const dateObj = new Date(year, month, day);
        if (dateObj.toDateString() === selectedDate.toDateString()) {
            div.classList.add('selected');
        }
        div.addEventListener('click', () => {
            selectedDate = dateObj;
            document.querySelectorAll('.calendar-day').forEach(el => el.classList.remove('selected'));
            div.classList.add('selected');
            selectedDateSpan.textContent = selectedDate.toLocaleDateString('ru');
            loadTasks();
        });
        calendarGrid.appendChild(div);
    }
    
    selectedDateSpan.textContent = selectedDate.toLocaleDateString('ru');
    loadTasks();
}

async function loadTasks() {
    const dueDate = selectedDate.toISOString().split('T')[0];
    const response = await fetch(`${API_BASE}/tasks/${dueDate}`);
    const tasks = await response.json();
    taskList.innerHTML = '';
    tasks.forEach(task => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span><strong>${task.title}</strong>${task.description ? ': ' + task.description : ''}</span>
            <div>
                <button onclick="editTask(${task.id}, '${task.title}', '${task.description || ''}')">Редактировать</button>
                <button onclick="deleteTask(${task.id})">Удалить</button>
            </div>
        `;
        taskList.appendChild(li);
    });
}

async function deleteTask(id) {
    await fetch(`${API_BASE}/tasks/${id}`, { method: 'DELETE' });
    loadTasks();
}

async function editTask(id, currentTitle, currentDesc) {
    const newTitle = prompt('Название задачи:', currentTitle);
    if (newTitle === null) return;
    const newDesc = prompt('Описание задачи:', currentDesc);
    if (newDesc === null) return;
    await fetch(`${API_BASE}/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle, description: newDesc || null })
    });
    loadTasks();
}

renderCalendar();
