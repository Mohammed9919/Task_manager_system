window.onload = loadTasks;

function loadTasks() {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks.forEach(task => createTaskElement(task.name, task.deadline, task.completed, task.isOverdue, task.id));
}

function saveTasks() {
    const tasks = Array.from(document.querySelectorAll('.task')).map(taskElement => {
        return {
            id: taskElement.dataset.id,
            name: taskElement.querySelector('input[type="text"]').value,
            deadline: taskElement.querySelector('input[type="date"]').value,
            completed: taskElement.querySelector('input[type="checkbox"]').checked,
            isOverdue: taskElement.classList.contains('overdue')
        };
    });
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function isOverdue(deadline) {
    const today = new Date();
    const taskDeadline = new Date(deadline);
    return taskDeadline < today;
}

function createTaskElement(name, deadline, completed, isOverdueFlag, id = Date.now()) {
    const taskList = document.getElementById('taskList');

    const task = document.createElement('div');
    task.className = 'task';
    task.dataset.id = id; // Add an ID to each task

    if (completed) task.classList.add('completed');
    if (isOverdueFlag) task.classList.add('overdue'); // Apply overdue status if stored

    const taskName = document.createElement('input');
    taskName.type = 'text';
    taskName.value = name;
    taskName.readOnly = true;

    const taskDeadline = document.createElement('input');
    taskDeadline.type = 'date';
    taskDeadline.value = deadline;
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

            // Check overdue status after saving
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

    if (!taskName || !taskDeadline) {
        showAlert('Please enter both task name and deadline.', 'error');
        return;
    }

    const overdueFlag = isOverdue(taskDeadline); // Check if the task is overdue when adding it
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