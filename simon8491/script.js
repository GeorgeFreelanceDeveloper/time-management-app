const apikey = '7cb2c91b-393e-411b-bcaf-cf84c140e509';
const apihost = 'https://todo-api.coderslab.pl';

function apiListTasks() {
    return fetch(
    apihost + '/api/tasks',
    {
        method: 'GET',
        headers: { Authorization: apikey}
    }
    ).then(resp => {
        if (!resp.ok) {
            alert('An error occurred! Open devtools and the Network tab.');
        }
        return resp.json();
    });
}

function apiCreateTask(title, description) {
    return fetch(
        apihost + '/api/tasks',
        {
            method: 'POST',
            headers: { Authorization: apikey, 'Content-Type': 'application/json' },
            body: JSON.stringify({title: title, description: description, status: 'open'}),
        }
    ).then(resp => {
        if (!resp.ok) {
            alert('An error occurred! Open devtools and the Network tab.');
        }
        return resp.json();
    });
}

function apiDeleteTask(taskId) {
    return fetch(
        apihost + '/api/tasks/' + taskId, {
            method: 'DELETE',
            headers: { Authorization: apikey }
        }
    ).then(resp => {
        if (!resp.ok) {
            alert('An error occurred! Open devtools and the Network tab.');
        }
        return resp.json();
    });
}

function apiUpdateTask(taskId, title, description, status) {
    return fetch(
        apihost + '/api/tasks/' + taskId,
        {
            method: 'PUT',
            headers: { Authorization: apikey, 'Content-Type': 'application/json' },
            body: JSON.stringify({title: title, description: description, status: status}),
        }
    ).then(resp => {
        if (!resp.ok) {
            alert('An error occurred! Open devtools and the Network tab.');
        }
        return resp.json();
    });
}

function apiOperationsOfTask(taskId) {
    return fetch(
        apihost + '/api/tasks/' + taskId + '/operations',
        {
            method: 'GET',
            headers: { Authorization: apikey }
        }
    ).then(resp => {
        if (!resp.ok) {
            alert('An error occurred! Open devtools and the Network tab.');
        }
        return resp.json();
    });
}

function apiCreateOperationOfTask(taskId, description) {
    return fetch(
        apihost + '/api/tasks/' + taskId + '/operations',
        {
            method: 'POST',
            headers: { Authorization: apikey, 'Content-Type': 'application/json' },
            body: JSON.stringify({description: description, timeSpent: 0})
        }
    ).then(resp => {
        if (!resp.ok) {
            alert('An error occurred! Open devtools and the Network tab.');
        }
        return resp.json();
    });
}

function apiUpdateOperation(operationId, description, reqTime){
    return fetch(
        apihost + '/api/operations/' + operationId,
        {
            method: 'PUT',
            headers: { Authorization: apikey, 'Content-Type': 'application/json' },
            body: JSON.stringify({description: description, timeSpent: reqTime})
        }
    ).then(resp => {
        if (!resp.ok) {
            alert('An error occurred! Open devtools and the Network tab.');
        }
        return resp.json();
    });
}

function apiDeleteOperation(operationId) {
    return fetch(
        apihost + '/api/operations/' + operationId,
        {
            method: 'DELETE',
            headers: { Authorization: apikey }
        }
    ).then(resp => {
        if (!resp.ok) {
            alert('An error occurred! Open devtools and the Network tab.');
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
    h6.className = 'card-subtitle text-muted'
    h6.innerText = description;
    headerLeftDiv.appendChild(h6);

    const headerRightDiv = document.createElement('div');
    headerDiv.appendChild(headerRightDiv);

    if (status === 'open') {
        const finishBtn = document.createElement('button');
        finishBtn.className = 'btn btn-dark btn-sm js-task-open-only';
        finishBtn.innerText = 'Finish';
        headerRightDiv.appendChild(finishBtn);
        finishBtn.addEventListener('click', () => {
            apiUpdateTask(taskId, title, description, 'closed').then(() => {
                section.querySelectorAll('.js-task-open-only').forEach(element => {
                    element.parentElement.removeChild(element);
                });
            });
        });
    }

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn btn-outline-danger btn-sm ml-2';
    deleteBtn.innerText = 'Delete';
    headerRightDiv.appendChild(deleteBtn);
    deleteBtn.addEventListener('click', () => {
        apiDeleteTask(taskId).then(() => {
            section.parentElement.removeChild(section);
        });
    });

    const ul = document.createElement('ul');
    ul.className = 'list-group list-group-flush';
    section.appendChild(ul);

    apiOperationsOfTask(taskId).then(resp => {
        resp.data.forEach((operation) => {
            renderOperation(ul, status, operation.id, operation.description, operation.timeSpent);
            console.log('Operation: ' + operation.description);
        });
    });

    if (status === 'open') {
        const addOpsDiv = document.createElement('div');
        addOpsDiv.className = 'card-body js-task-open-only';
        section.appendChild(addOpsDiv);

        const form = document.createElement('form');
        addOpsDiv.appendChild(form);

        const descDiv = document.createElement('div');
        descDiv.className = 'input-group';
        form.appendChild(descDiv);

        const descInput = document.createElement('input');
        descInput.setAttribute('type', 'text');
        descInput.setAttribute('placeholder', 'New operation');
        descInput.setAttribute('minlength', '5');
        descInput.className = 'form-control';
        descDiv.appendChild(descInput);

        const btnDiv = document.createElement('div');
        btnDiv.className = 'input-group-append';
        descDiv.appendChild(btnDiv);

        const addBtn = document.createElement('button');
        addBtn.className = 'btn btn-info';
        addBtn.innerText = 'Add';
        btnDiv.appendChild(addBtn);

        form.addEventListener('submit', (event) => {
            event.preventDefault();
            apiCreateOperationOfTask(taskId, descInput.value).then(resp => {
                renderOperation(ul, status, resp.data.id, resp.data.description, resp.data.timeSpent);
            });
        });
    }
}

function renderOperation(opsList, status, opsId, opsDesc, reqTime) {
    const li = document.createElement('li');
    li.className = 'list-group-item d-flex justify-content-between align-items-center';
    opsList.appendChild(li);

    const opsDescDiv = document.createElement('div');
    opsDescDiv.innerText = opsDesc;
    li.appendChild(opsDescDiv);

    const time = document.createElement('span');
    time.className = 'badge badge-success badge-pill ml-2';
    time.innerText = formatTime(reqTime);
    opsDescDiv.appendChild(time);

    if (status === 'open') {
        const btnDiv = document.createElement('div');
        btnDiv.className = 'js-task-open-only';
        li.appendChild(btnDiv);

        const fifteenMinBtn = document.createElement('button');
        fifteenMinBtn.className = 'btn btn-outline-success btn-sm mr-2';
        fifteenMinBtn.innerText = '+15m';
        btnDiv.appendChild(fifteenMinBtn);

        fifteenMinBtn.addEventListener('click', () => {
            apiUpdateOperation(opsId, opsDesc, reqTime + 15).then(
                resp => {
                    time.innerText = formatTime(resp.data.timeSpent);
                    reqTime = resp.data.timeSpent;
            });
        });

        const oneHrBtn = document.createElement('button');
        oneHrBtn.className = 'btn btn-outline-success btn-sm mr-2';
        oneHrBtn.innerText = '+1h';
        btnDiv.appendChild(oneHrBtn);

        oneHrBtn.addEventListener('click', () => {
            apiUpdateOperation(opsId, opsDesc, reqTime + 60).then(
                resp => {
                    time.innerText = formatTime(resp.data.timeSpent);
                    reqTime = resp.data.timeSpent;
            });
        });

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn btn-outline-danger btn-sm';
        deleteBtn.innerText = 'Delete';
        btnDiv.appendChild(deleteBtn);

        deleteBtn.addEventListener('click', () => {
            apiDeleteOperation(opsId).then(() => {
                li.parentElement.removeChild(li);
            });
        });
    }
}

function formatTime(time) {
    const hours = Math.floor(time / 60);
    const minutes = time % 60;
    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    } else {
        return `${minutes}m`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded');

    apiListTasks().then((response) => {
        response.data.forEach(
            (task) => {
                renderTask(task.id, task.title, task.description, task.status);
            });
    });

    document.querySelector('.js-task-adding-form').addEventListener('submit', (event) => {
        event.preventDefault();
        apiCreateTask(event.target.elements.title.value, event.target.elements.description.value)
        .then(response => {
            renderTask(response.data.id, response.data.title, response.data.description, response.data.status);
        });
    });
});
