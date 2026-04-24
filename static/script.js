const API_URL = '/tasks';

async function loadTasks() {
    const datePicker = document.getElementById('datePicker');
    const date = datePicker.value;
    if (!date) return;
    document.getElementById('selectedDate').innerText = date;
    const response = await fetch(`${API_URL}?date=${date}`);
    const tasks = await response.json();
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = '';
    tasks.forEach(task => {
        const li = document.createElement('li');
        li.className = task.completed ? 'completed' : '';
        li.innerHTML = `
            <strong>${task.title}</strong>
            ${task.description ? `- ${task.description}` : ''}
            ${task.time ? `at ${task.time}` : ''}
            <button onclick="toggleTask(${task.id})">Toggle</button>
            <button onclick="deleteTask(${task.id})">Delete</button>
        `;
        taskList.appendChild(li);
    });
}

document.getElementById('taskForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    const time = document.getElementById('time').value;
    const date = document.getElementById('datePicker').value;
    if (!title || !date) return;
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({title, description, date, time: time || null})
    });
    if (response.ok) {
        loadTasks();
        document.getElementById('taskForm').reset();
    }
});

async function toggleTask(id) {
    const response = await fetch(`${API_URL}/${id}`);
    const task = await response.json();
    const updated = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({completed: !task.completed})
    });
    if (updated.ok) loadTasks();
}

async function deleteTask(id) {
    const response = await fetch(`${API_URL}/${id}`, {method: 'DELETE'});
    if (response.ok) loadTasks();
}

// Load today's tasks on page load
window.onload = () => {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('datePicker').value = today;
    loadTasks();
};