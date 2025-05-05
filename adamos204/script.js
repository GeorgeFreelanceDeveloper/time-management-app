const apikey = 'c5c1efd5-ef25-4a3a-bd31-880ee426822b';
const apihost = 'https://todo-api.coderslab.pl';



document.addEventListener('DOMContentLoaded', async function () {
    const response = await apiListAlTasks();

    if (response && !response.error) {
        response.data.forEach(task => {
            renderTask(task.id, task.title, task.description, task.status);
        });
    }

    document.querySelector('.js-task-adding-form').addEventListener('submit', function (event) {
        event.preventDefault();
        const title = event.target.elements.title.value.trim();
        const description = event.target.elements.description.value.trim();

        if (!title || !description) {
            alert('Please fill in all fields');
            return;
        }

        apiCreateTask(title, description).then(response => {
            renderTask(response.data.id, title, description, 'open');
            event.target.reset();
        });
    })
});

async function apiListAlTasks() {
    try {
        const response = await fetch(`${apihost}/api/tasks`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization':  apikey,
            },
        });

        if (!response.ok) {
            alert("An error has occurred while fetching tasks.");
            return;
        }

        const data = await response.json();
        console.log(data);
        return data;
    } catch (error) {
        console.error('Fetch error: ', error);
    }
}

async function apiListOperations(taskId) {
    const response = await fetch(`${apihost}/api/tasks/${taskId}/operations`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization':  apikey,
        },
    })

    if (!response.ok) {
        alert("An error has occurred while fetching operations.");
        return {data: []};
    }

    return response.json();
}

async function apiCreateTask(title, description) {
    const response = await fetch(`${apihost}/api/tasks`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization':  apikey,
        },
        body: JSON.stringify({
            title: title,
            description: description,
            status: 'open'
        })
    });

    if (!response.ok) {
        alert("An error has occurred while creating the task.");
        return;
    }

    return response.json();
}

async function apiCreateOperationForTask(taskId, description) {
    const response = await fetch(`${apihost}/api/tasks/${taskId}/operations`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization':  apikey,
        },
        body: JSON.stringify({
            description: description,
            timeSpent: 0
        })
    });

    if (!response.ok) {
        alert("An error has occurred while creating the operation.");
        return;
    }

    return response.json();
}

async function apiDeleteTask(taskId) {
    const response = await fetch(`${apihost}/api/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization':  apikey,
        },
    });

    if (!response.ok) {
        alert("An error has occurred while deleting the data.");
    }

    return true;
}

async function apiUpdateOperation(operationId, description, timeSpent) {
    const response = await fetch(`${apihost}/api/operations/${operationId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization':  apikey,
        },
        body: JSON.stringify({
            description: description,
            timeSpent: timeSpent
        }),
    });

    if (!response.ok) {
        alert("An error has occurred while updating the operation.");
        return;
    }
    return response.json();
}

async function apiDeleteOperation(operationId) {
    const response = await fetch(`${apihost}/api/operations/${operationId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization':  apikey,
        },
    });

    if (!response.ok) {
        alert("An error has occurred while deleting the operation.");
        return;
    }

    return true;
}

async function apiUpdateTask(taskId, title, description, status) {
    const response = await fetch(`${apihost}/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization':  apikey,
        },
        body: JSON.stringify({
            title: title,
            description: description,
            status: status
        })
    });

    if (!response.ok) {
        alert("An error has occurred while updating the task.");
        return;
    }

    return response.json();
}

function renderTask(taskId, title, description, status) {
    const section = document.createElement('section');
    section.className = 'card mt-5 shadow-sm';
    document.querySelector('main').appendChild(section);

    const headerDiv = document.createElement('div');
    headerDiv.className = 'card-header d-flex justify-content-between align-items-center';
    section.appendChild(headerDiv);

    const headerLeftDiv = document.createElement('div');
    headerDiv.appendChild(headerLeftDiv);

    const h5 = document.createElement('h5');
    h5.innerText = title;
    headerLeftDiv.appendChild(h5);

    const h6 = document.createElement('h6');
    h6.className = 'card-subtitletext-muted'
    h6.innerText = description;
    headerLeftDiv.appendChild(h6);

    const headerRightDiv = document.createElement('div');
    headerDiv.appendChild(headerRightDiv);

    if (status === 'open') {
        const finishButton = document.createElement('button');
        finishButton.className = 'btn btn-dark btn-sm js-task-open-only';
        finishButton.innerText = 'Finish';
        headerRightDiv.appendChild(finishButton);

        finishButton.addEventListener('click', async function () {
            const response = await apiUpdateTask(taskId, title, description, 'closed');
            if (response) {
                section.querySelectorAll('.js-task-open-only').forEach(element => element.remove());
            }
        });
    }

    const deleteButton = document.createElement('button');
    deleteButton.className = 'btn btn-outline-danger btn-sm ml-2';
    deleteButton.innerText = 'Delete';
    headerRightDiv.appendChild(deleteButton);

    deleteButton.addEventListener('click', async function () {
        const success = await apiDeleteTask(taskId);
        if (success) {
            section.remove();
        }
    });

    const ul = document.createElement('ul');
    ul.className = 'list-group list-group-flush';
    section.appendChild(ul);

    apiListOperations(taskId).then(response => {
        console.log(response);
        response.data.forEach(operation => {
            renderOperations(ul, status, operation.id, operation.description, operation.timeSpent);
        });
    });

    if (status === 'open') {
        const cardBody = document.createElement('div');
        cardBody.className = 'card-body js-task-open-only';
        section.appendChild(cardBody);

        const form = document.createElement('form');
        cardBody.appendChild(form);

        const inputGroup = document.createElement('div');
        inputGroup.className = 'input-group';
        form.appendChild(inputGroup);

        const desInput = document.createElement('input');
        desInput.type = 'text';
        desInput.placeholder = 'Operation description';
        desInput.className = 'form-control';
        desInput.minLength = 5;
        inputGroup.appendChild(desInput);

        form.addEventListener('submit', async function (event) {
            event.preventDefault();

            const description = desInput.value.trim();

            if (!description) {
                alert('Please fill in all fields');
                return;
            }

            const operation = await apiCreateOperationForTask(taskId, description);
            if (operation){
                renderOperations(ul, status, operation.data.id, operation.data.description, operation.data.timeSpent);
                desInput.value = '';
            }
        })

        const appendDiv = document.createElement('div');
        appendDiv.className = 'input-group-append';
        inputGroup.appendChild(appendDiv);

        const addButton = document.createElement('button');
        addButton.className = 'btn btn-info';
        addButton.innerText = 'Add';
        appendDiv.appendChild(addButton);
    }
}

function formatTime(timeInMins) {
    const hours = Math.floor(timeInMins / 60);
    const minutes = timeInMins % 60;
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
}

function renderOperations(operationsList, status, operationId, operationDescription, timeSpent) {
    const li = document.createElement('li');
    li.className = 'list-group-item d-flex justify-content-between align-items-center';
    operationsList.appendChild(li);

    const descriptionDiv = document.createElement('div');
    descriptionDiv.innerText = operationDescription;
    li.appendChild(descriptionDiv);

    const time = document.createElement('span');
    time.className = 'badge badge-success badge-pill ml-2';
    time.innerText = formatTime(timeSpent);
    descriptionDiv.appendChild(time);

    if (status === 'open') {
        const controlDiv = document.createElement('div');
        controlDiv.className = 'js-task-open-only';
        li.appendChild(controlDiv);

        const add15btn = document.createElement('button');
        add15btn.className = 'btn btn-outline-success btn-sm ml-2';
        add15btn.innerText = '+15m';
        controlDiv.appendChild(add15btn);

        add15btn.addEventListener('click', async function () {
            const newTime = timeSpent + 15;
            const response = await apiUpdateOperation(operationId, operationDescription, newTime);
            if (response) {
                time.innerText = formatTime(response.data.timeSpent);
                timeSpent = response.data.timeSpent;
            }
        })

        const add60btn = document.createElement('button');
        add60btn.className = 'btn btn-outline-success btn-sm ml-2';
        add60btn.innerText = '+1h';
        controlDiv.appendChild(add60btn);

        add60btn.addEventListener('click', async function () {
            const newTime = timeSpent + 60;
            const response = await apiUpdateOperation(operationId, operationDescription, newTime);
            if (response) {
                time.innerText = formatTime(response.data.timeSpent);
                timeSpent = response.data.timeSpent;
            }
        })

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn btn-outline-danger btn-sm ml-2';
        deleteBtn.innerText = 'Delete';
        controlDiv.appendChild(deleteBtn);

        deleteBtn.addEventListener('click', async function () {
            const response = await apiDeleteOperation(operationId);
            if (response) {
                li.remove();
            }
        })

    }
}