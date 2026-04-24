let currentDate = new Date();
let selectedDate = new Date();

function renderCalendar() {
    const calendar = document.getElementById('calendar');
    calendar.innerHTML = '';
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Add empty cells for days before first day
    for (let i = 0; i < firstDay; i++) {
        const empty = document.createElement('div');
        empty.className = 'day empty';
        calendar.appendChild(empty);
    }

    // Add day cells
    for (let day = 1; day <= daysInMonth; day++) {
        const dayCell = document.createElement('div');
        dayCell.className = 'day';
        dayCell.textContent = day;
        dayCell.dataset.date = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
        dayCell.addEventListener('click', () => selectDate(dayCell.dataset.date));
        calendar.appendChild(dayCell);
    }
}

function selectDate(dateStr) {
    selectedDate = new Date(dateStr);
    document.getElementById('selected-date').textContent = dateStr;
    loadTasks(dateStr);
}

async function loadTasks(dateStr) {
    const response = await fetch('/tasks/');
    const tasks = await response.json();
    const filtered = tasks.filter(task => task.due_date === dateStr);
    const taskList = document.getElementById('tasks');
    taskList.innerHTML = '';
    filtered.forEach(task => {
        const li = document.createElement('li');
        li.textContent = `${task.title} - ${task.description || ''}`;
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.addEventListener('click', () => deleteTask(task.id));
        li.appendChild(deleteBtn);
        taskList.appendChild(li);
    });
}

async function deleteTask(taskId) {
    await fetch(`/tasks/${taskId}`, { method: 'DELETE' });
    loadTasks(selectedDate.toISOString().split('T')[0]);
}

document.getElementById('task-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    const dueDate = document.getElementById('due-date').value;
    await fetch('/tasks/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, due_date: dueDate })
    });
    loadTasks(dueDate);
    document.getElementById('title').value = '';
    document.getElementById('description').value = '';
});

// Initialize
renderCalendar();
selectDate(new Date().toISOString().split('T')[0]);