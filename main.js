window.onload = loadTasks;

function loadTasks() {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks.forEach(task => {
        const validDeadline = task.deadline ? formatDate(task.deadline) : ''; // Validate deadline
        createTaskElement(task.name, validDeadline, task.completed, task.isOverdue, task.id);
    });
}

function saveTasks() {
    const tasks = Array.from(document.querySelectorAll('.task')).map(taskElement => {
        return {
            id: taskElement.dataset.id,
            name: taskElement.querySelector('input[type="text"]').value,
            deadline: formatDate(taskElement.querySelector('input[type="date"]').value),
            completed: taskElement.querySelector('input[type="checkbox"]').checked,
            isOverdue: taskElement.classList.contains('overdue')
        };
    });
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function isOverdue(deadline) {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Ignore time part for accurate comparison

    const taskDeadline = new Date(deadline);
    taskDeadline.setHours(0, 0, 0, 0);

    return taskDeadline < today; // Check if deadline is in the past
}

function formatDate(date) {
    const d = new Date(date);
    if (isNaN(d)) return ''; // Handle invalid dates gracefully
    return d.toISOString().split('T')[0]; // Convert to 'YYYY-MM-DD' format
}

function createTaskElement(name, deadline, completed, isOverdueFlag, id = Date.now()) {
    const taskList = document.getElementById('taskList');

    const task = document.createElement('div');
    task.className = 'task';
    task.dataset.id = id;

    if (completed) task.classList.add('completed');
    if (isOverdueFlag) task.classList.add('overdue');

    const taskName = document.createElement('input');
    taskName.type = 'text';
    taskName.value = name;
    taskName.readOnly = true;

    const taskDeadline = document.createElement('input');
    taskDeadline.type = 'date';
    taskDeadline.value = formatDate(deadline);
    taskDeadline.readOnly = true;

    const taskCompleted = document.createElement('input');
    taskCompleted.type = 'checkbox';
    taskCompleted.checked = completed;
    taskCompleted.onchange = () => {
        task.classList.toggle('completed', taskCompleted.checked);
        saveTasks();
    };

    const updateButton = document.createElement('button');
    updateButton.textContent = 'Update';
    updateButton.className = 'update';
    updateButton.onclick = () => {
        if (taskName.readOnly) {
            taskName.readOnly = false;
            taskDeadline.readOnly = false;
            taskName.focus();
            updateButton.textContent = 'Save';
        } else {
            taskName.readOnly = true;
            taskDeadline.readOnly = true;
            updateButton.textContent = 'Update';

            // Update overdue status after saving
            if (isOverdue(taskDeadline.value)) {
                task.classList.add('overdue');
            } else {
                task.classList.remove('overdue');
            }

            saveTasks();
        }
    };

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.onclick = () => {
        task.remove();
        saveTasks();
    };

    task.append(taskCompleted, taskName, taskDeadline, updateButton, deleteButton);
    taskList.appendChild(task);
    saveTasks();
}

function addTask() {
    const taskName = document.getElementById('taskName').value.trim();
    const taskDeadline = document.getElementById('taskDeadline').value;

    if (!taskName || !taskDeadline || isNaN(new Date(taskDeadline))) {
        showAlert('Please enter a valid task name and deadline.', 'error');
        return;
    }

    const overdueFlag = isOverdue(taskDeadline);
    createTaskElement(taskName, taskDeadline, false, overdueFlag);

    document.getElementById('taskName').value = '';
    document.getElementById('taskDeadline').value = '';
}

function showAlert(message, type) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert ${type}`;
    alertDiv.textContent = message;

    document.body.appendChild(alertDiv);

    setTimeout(() => {
        alertDiv.style.opacity = '0';
        setTimeout(() => alertDiv.remove(), 500);
    }, 3000);
}
