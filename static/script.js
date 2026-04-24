const API_URL = '/tasks';

let currentDate = new Date().toISOString().split('T')[0];

document.addEventListener('DOMContentLoaded', function() {
    loadTasks(currentDate);
    document.getElementById('selected-date').textContent = currentDate;
    document.getElementById('date').value = currentDate;
    document.getElementById('task-form').addEventListener('submit', addTask);
});

async function loadTasks(date) {
    const response = await fetch(`${API_URL}?date=${date}`);
    const tasks = await response.json();
    const taskList = document.getElementById('task-list');
    taskList.innerHTML = '';
    tasks.forEach(task => {
        const li = document.createElement('li');
        li.innerHTML = `<strong>${task.title}</strong> ${task.time || ''} - ${task.description || ''} <button onclick="deleteTask(${task.id})">Delete</button>`;
        taskList.appendChild(li);
    });
}

async function addTask(event) {
    event.preventDefault();
    const title = document.getElementById('title').value;
    const date = document.getElementById('date').value;
    const time = document.getElementById('time').value || null;
    const description = document.getElementById('description').value;
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, date, time, description })
    });
    if (response.ok) {
        loadTasks(date);
        document.getElementById('title').value = '';
        document.getElementById('time').value = '';
        document.getElementById('description').value = '';
    }
}

async function deleteTask(id) {
    await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    loadTasks(currentDate);
}