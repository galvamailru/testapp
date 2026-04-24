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
    selectedDate = new Date(dateStr);
    document.getElementById('selected-date').textContent = dateStr;
    loadTasks(dateStr);
}

async function loadTasks(dateStr) {
    const response = await fetch(`/tasks/?date=${dateStr}`);
    const tasks = await response.json();
    const list = document.getElementById('task-list');
    list.innerHTML = '';
    tasks.forEach(task => {
        const li = document.createElement('li');
        li.innerHTML = `<strong>${task.title}</strong> - ${task.description || ''} <button onclick="deleteTask(${task.id})">Delete</button>`;
        list.appendChild(li);
    });
}

document.getElementById('task-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    const dueDate = document.getElementById('due-date').value;
    const response = await fetch('/tasks/', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({title, description, due_date: dueDate})
    });
    if (response.ok) {
        loadTasks(selectedDate.toISOString().split('T')[0]);
        document.getElementById('title').value = '';
        document.getElementById('description').value = '';
        document.getElementById('due-date').value = '';
    }
});

async function deleteTask(id) {
    await fetch(`/tasks/${id}`, {method: 'DELETE'});
    loadTasks(selectedDate.toISOString().split('T')[0]);
}

renderCalendar();
selectDate(new Date().toISOString().split('T')[0]);