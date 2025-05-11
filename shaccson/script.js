const apikey = '97558255-281e-463f-8705-fc98a50f910e';
const apihost = 'https://todo-api.coderslab.pl';

function formatTime(time) {
    const hours = Math.floor(time / 60);
    const minutes = time % 60;
    return `${hours}h ${minutes}m`;
}

function apiListTasks() {
    return fetch(`${apihost}/api/tasks`, {
        headers: { Authorization: apikey }
    }).then(resp => resp.json());
}

function apiCreateTask(title, description) {
    return fetch(`${apihost}/api/tasks`, {
        method: 'POST',
        headers: {
            Authorization: apikey,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title, description, status: 'open' })
    }).then(resp => resp.json());
}

function apiDeleteTask(taskId) {
    return fetch(`${apihost}/api/tasks/${taskId}`, {
        method: 'DELETE',
        headers: { Authorization: apikey }
    });
}

function apiListOperationsForTask(taskId) {
    return fetch(`${apihost}/api/tasks/${taskId}/operations`, {
        headers: { Authorization: apikey }
    }).then(resp => resp.json());
}

function apiCreateOperationForTask(taskId, description) {
    return fetch(`${apihost}/api/tasks/${taskId}/operations`, {
        method: 'POST',
        headers: {
            Authorization: apikey,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ description, timeSpent: 0 })
    }).then(resp => resp.json());
}

function apiDeleteOperation(operationId) {
    return fetch(`${apihost}/api/operations/${operationId}`, {
        method: 'DELETE',
        headers: { Authorization: apikey }
    });
}

function apiUpdateOperation(operationId, description, timeSpent) {
    return fetch(`${apihost}/api/operations/${operationId}`, {
        method: 'PUT',
        headers: {
            Authorization: apikey,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ description, timeSpent })
    }).then(resp => resp.json());
}

function apiUpdateTask(taskId, title, description, status) {
    return fetch(`${apihost}/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
            Authorization: apikey,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title, description, status })
    }).then(resp => resp.json());
}

function renderOperation(operationsList, operationId, status, description, timeSpent) {
    const li = document.createElement('li');
    li.className = 'list-group-item d-flex justify-content-between align-items-center';

    const descDiv = document.createElement('div');
    descDiv.innerText = description;

    const timeBadge = document.createElement('span');
    timeBadge.className = 'badge badge-success badge-pill ml-2';
    timeBadge.innerText = formatTime(timeSpent);
    descDiv.appendChild(timeBadge);

    const controlsDiv = document.createElement('div');

    if (status === 'open') {
        const btn15 = document.createElement('button');
        btn15.className = 'btn btn-outline-success btn-sm mr-2 js-task-open-only';
        btn15.innerText = '+15m';
        btn15.addEventListener('click', () => {
            const newTime = timeSpent + 15;
            apiUpdateOperation(operationId, description, newTime).then(() => {
                timeSpent = newTime;
                timeBadge.innerText = formatTime(timeSpent);
            });
        });

        const btn60 = document.createElement('button');
        btn60.className = 'btn btn-outline-success btn-sm mr-2 js-task-open-only';
        btn60.innerText = '+1h';
        btn60.addEventListener('click', () => {
            const newTime = timeSpent + 60;
            apiUpdateOperation(operationId, description, newTime).then(() => {
                timeSpent = newTime;
                timeBadge.innerText = formatTime(timeSpent);
            });
        });

        const btnDel = document.createElement('button');
        btnDel.className = 'btn btn-outline-danger btn-sm js-task-open-only';
        btnDel.innerText = 'Delete';
        btnDel.addEventListener('click', () => {
            apiDeleteOperation(operationId).then(() => li.remove());
        });

        controlsDiv.append(btn15, btn60, btnDel);
    }

    li.append(descDiv, controlsDiv);
    operationsList.appendChild(li);
}

function renderTask(taskId, title, description, status) {
    const section = document.createElement('section');
    section.className = 'card mt-5 shadow-sm';

    const header = document.createElement('div');
    header.className = 'card-header d-flex justify-content-between align-items-center';

    const left = document.createElement('div');
    const h5 = document.createElement('h5');
    h5.innerText = title;
    const h6 = document.createElement('h6');
    h6.className = 'card-subtitle text-muted';
    h6.innerText = description;
    left.append(h5, h6);

    const right = document.createElement('div');

    if (status === 'open') {
        const finishBtn = document.createElement('button');
        finishBtn.className = 'btn btn-dark btn-sm js-task-open-only';
        finishBtn.innerText = 'Finish';
        finishBtn.addEventListener('click', () => {
            apiUpdateTask(taskId, title, description, 'closed').then(() => {
                section.querySelectorAll('.js-task-open-only').forEach(el => el.remove());
            });
        });
        right.appendChild(finishBtn);
    }

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn btn-outline-danger btn-sm ml-2';
    deleteBtn.innerText = 'Delete';
    deleteBtn.addEventListener('click', () => {
        apiDeleteTask(taskId).then(() => section.remove());
    });
    right.appendChild(deleteBtn);

    header.append(left, right);
    section.appendChild(header);

    const ul = document.createElement('ul');
    ul.className = 'list-group list-group-flush';
    section.appendChild(ul);

    apiListOperationsForTask(taskId).then(response => {
        response.data.forEach(op => {
            renderOperation(ul, op.id, status, op.description, op.timeSpent);
        });
    });

    if (status === 'open') {
        const formWrap = document.createElement('div');
        formWrap.className = 'card-body js-task-open-only';

        const form = document.createElement('form');
        form.className = 'js-task-open-only';

        const group = document.createElement('div');
        group.className = 'input-group';

        const input = document.createElement('input');
        input.className = 'form-control';
        input.placeholder = 'Operation description';
        input.minLength = 5;

        const append = document.createElement('div');
        append.className = 'input-group-append';

        const btn = document.createElement('button');
        btn.className = 'btn btn-info';
        btn.innerText = 'Add';

        append.appendChild(btn);
        group.append(input, append);
        form.appendChild(group);
        formWrap.appendChild(form);
        section.appendChild(formWrap);

        form.addEventListener('submit', e => {
            e.preventDefault();
            const desc = input.value.trim();
            if (desc.length >= 5) {
                apiCreateOperationForTask(taskId, desc).then(res => {
                    renderOperation(ul, res.data.id, status, res.data.description, res.data.timeSpent);
                    input.value = '';
                });
            }
        });
    }

    document.querySelector('main').appendChild(section);
}

document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('.js-task-adding-form');

    apiListTasks().then(response => {
        response.data.forEach(task => {
            renderTask(task.id, task.title, task.description, task.status);
        });
    });

    form.addEventListener('submit', e => {
        e.preventDefault();
        const title = form.elements.title.value.trim();
        const description = form.elements.description.value.trim();
        if (title.length >= 5 && description.length >= 5) {
            apiCreateTask(title, description).then(res => {
                renderTask(res.data.id, res.data.title, res.data.description, res.data.status);
                form.reset();
            });
        }
    });
});
