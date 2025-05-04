const apikey = '04135071-9b1d-4671-8b22-d3baa9700e0f';
const apihost = 'https://todo-api.coderslab.pl';

function apiListTasks() {
    return fetch(apihost + '/api/tasks', {
        headers: { Authorization: apikey }
    }).then(function (resp) {
        if (!resp.ok) {
            alert('An error occurred! Open devtools and the Network tab, and locate the cause');
        }
        return resp.json();
    });
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
    h6.className = 'card-subtitle text-muted';
    h6.innerText = description;
    headerLeftDiv.appendChild(h6);

    const headerRightDiv = document.createElement('div');
    headerDiv.appendChild(headerRightDiv);

    const finishButton = document.createElement('button');
    finishButton.className = 'btn btn-dark btn-sm js-task-open-only';
    finishButton.innerText = 'Finish';
    headerRightDiv.appendChild(finishButton);

    const deleteButton = document.createElement('button');
    deleteButton.className = 'btn btn-outline-danger btn-sm ml-2';
    deleteButton.innerText = 'Delete';
    headerRightDiv.appendChild(deleteButton);

    const ul = document.createElement('ul');
    section.appendChild(ul);

    apiListOperationsForTask(taskId).then(function (response) {
        response.data.forEach(function (operation) {
            renderOperation(ul, operation.id, status, operation.description, operation.timeSpent);
        });
    });

    const form = document.createElement('form');
    form.className = 'd-flex mt-2 js-task-open-only';
    section.appendChild(form);

    const descriptionInput = document.createElement('input');
    descriptionInput.type = 'text';
    descriptionInput.name = 'description';
    descriptionInput.className = 'form-control';
    descriptionInput.placeholder = 'Enter operation description';
    form.appendChild(descriptionInput);

    const submitButton = document.createElement('button');
    submitButton.type = 'submit';
    submitButton.className = 'btn btn-outline-success ml-2';
    submitButton.innerText = 'Add Operation';
    form.appendChild(submitButton);

    form.addEventListener('submit', function (event) {
        event.preventDefault();
        const description = descriptionInput.value.trim();
        if (description !== '') {
            apiCreateOperationForTask(taskId, description).then(function (response) {
                renderOperation(ul, response.data.id, status, response.data.description, response.data.timeSpent);
                descriptionInput.value = '';
            });
        }
    });

    finishButton.addEventListener('click', function () {
        apiUpdateTask(taskId, title, description, 'closed').then(function () {
            // Remove operations and UI elements for "open" tasks
            ul.innerHTML = '';  // Clears the list of operations
            finishButton.remove();
            form.remove();
            // Keep delete button
        });
    });

    deleteButton.addEventListener('click', function () {
        apiDeleteTask(taskId).then(function () {
            section.remove();
        });
    });

    // If the task is closed, hide the UI elements related to open tasks
    if (status === 'closed') {
        finishButton.remove();
        form.remove();
        ul.querySelectorAll('.js-task-open-only').forEach(function (element) {
            element.remove();
        });
    }
}

function apiListOperationsForTask(taskId) {
    return fetch(apihost + '/api/tasks/' + taskId + '/operations', {
        headers: { Authorization: apikey }
    }).then(function (resp) {
        if (!resp.ok) {
            alert('An error occurred! Open devtools and the Network tab, and locate the cause');
        }
        return resp.json();
    });
}

function renderOperation(ul, operationId, status, description, timeSpent) {
    const li = document.createElement('li');
    li.className = 'list-group-item d-flex justify-content-between align-items-center';
    ul.appendChild(li);

    const div = document.createElement('div');
    div.innerText = description + ' ' + formatTime(timeSpent);
    li.appendChild(div);

    const divButtons = document.createElement('div');
    li.appendChild(divButtons);

    if (status == 'open') {
        const add15Button = document.createElement('button');
        add15Button.className = 'btn btn-outline-success btn-sm mr-2';
        add15Button.innerText = '+15m';
        divButtons.appendChild(add15Button);

        const add1hButton = document.createElement('button');
        add1hButton.className = 'btn btn-outline-success btn-sm mr-2';
        add1hButton.innerText = '+1h';
        divButtons.appendChild(add1hButton);

        add15Button.addEventListener('click', function () {
            apiUpdateOperation(operationId, description, timeSpent + 15).then(function (response) {
                div.innerText = response.data.description + ' ' + formatTime(response.data.timeSpent);
                timeSpent = response.data.timeSpent;
            });
        });

        add1hButton.addEventListener('click', function () {
            apiUpdateOperation(operationId, description, timeSpent + 60).then(function (response) {
                div.innerText = response.data.description + ' ' + formatTime(response.data.timeSpent);
                timeSpent = response.data.timeSpent;
            });
        });
    }

    const deleteButton = document.createElement('button');
    deleteButton.className = 'btn btn-outline-danger btn-sm';
    deleteButton.innerText = 'Delete';
    divButtons.appendChild(deleteButton);

    deleteButton.addEventListener('click', function () {
        apiDeleteOperation(operationId).then(function () {
            li.remove();
        });
    });
}

function formatTime(timeSpent) {
    const hours = Math.floor(timeSpent / 60);
    const minutes = timeSpent % 60;
    if (hours > 0) {
        return hours + 'h ' + minutes + 'm';
    }
    return minutes + 'm';
}

function apiCreateOperationForTask(taskId, description) {
    return fetch(apihost + '/api/tasks/' + taskId + '/operations', {
        headers: { Authorization: apikey, 'Content-Type': 'application/json' },
        method: 'POST',
        body: JSON.stringify({
            description: description,
            timeSpent: 0
        })
    }).then(function (resp) {
        if (!resp.ok) {
            alert('An error occurred! Open devtools and the Network tab, and locate the cause');
        }
        return resp.json();
    });
}

function apiUpdateOperation(operationId, description, timeSpent) {
    return fetch(apihost + '/api/operations/' + operationId, {
        headers: { Authorization: apikey, 'Content-Type': 'application/json' },
        method: 'PUT',
        body: JSON.stringify({
            description: description,
            timeSpent: timeSpent
        })
    }).then(function (resp) {
        if (!resp.ok) {
            alert('An error occurred! Open devtools and the Network tab, and locate the cause');
        }
        return resp.json();
    });
}

function apiDeleteTask(taskId) {
    return fetch(apihost + '/api/tasks/' + taskId, {
        headers: { Authorization: apikey },
        method: 'DELETE'
    }).then(function (resp) {
        if (!resp.ok) {
            alert('An error occurred! Open devtools and the Network tab, and locate the cause');
        }
    });
}

function apiDeleteOperation(operationId) {
    return fetch(apihost + '/api/operations/' + operationId, {
        headers: { Authorization: apikey },
        method: 'DELETE'
    }).then(function (resp) {
        if (!resp.ok) {
            alert('An error occurred! Open devtools and the Network tab, and locate the cause');
        }
    });
}

// Add the missing apiUpdateTask function here:
function apiUpdateTask(taskId, title, description, status) {
    return fetch(apihost + '/api/tasks/' + taskId, {
        headers: { Authorization: apikey, 'Content-Type': 'application/json' },
        method: 'PUT',
        body: JSON.stringify({
            title: title,
            description: description,
            status: status
        })
    }).then(function (resp) {
        if (!resp.ok) {
            alert('An error occurred! Open devtools and the Network tab, and locate the cause');
        }
        return resp.json();
    });
}

apiListTasks().then(function (response) {
    response.data.forEach(function (task) {
        renderTask(task.id, task.title, task.description, task.status);
    });
});

function apiCreateTask(title, description) {
    return fetch(
        apihost + '/api/tasks',
        {
            headers: { Authorization: apikey, 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: title, description: description, status: 'open' }),
            method: 'POST'
        }
    ).then(
        function (resp) {
            if (!resp.ok) {
                alert('An error occurred! Open devtools and the Network tab, and locate the cause');
            }
            return resp.json();
        }
    )
}

const form = document.querySelector('form');

form.addEventListener('submit', function (event) {
    event.preventDefault();

    const titleInput = form.querySelector('input[name="title"]');
    const descriptionInput = form.querySelector('input[name="description"]');

    const title = titleInput.value.trim();
    const description = descriptionInput.value.trim();

    if (title !== '' && description !== '') {
        apiCreateTask(title, description).then(function (response) {
            renderTask(response.data.id, response.data.title, response.data.description, response.data.status);
            form.reset();
        });
    }
});