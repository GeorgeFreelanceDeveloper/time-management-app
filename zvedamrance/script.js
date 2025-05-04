const apikey = 'f3bed601-d953-4be2-8609-085f1aa49a21';
const apihost = 'https://todo-api.coderslab.pl';



document.addEventListener('DOMContentLoaded', function() {

});

function apiListTasks() {
    return fetch(
        apihost + '/api/tasks',
        {
            headers: { Authorization: apikey }
        }
    ).then(
        function(resp) {
            if(!resp.ok) {
                alert('An error occurred! Open devtools and the Network tab, and locate the cause');
            }
            return resp.json();
        }
    )
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

    const ul = document.createElement('ul');
    ul.className = 'list-group';
    section.appendChild(ul);

    const h6 = document.createElement('h6');
    h6.className = 'card-subtitle text-muted';
    h6.innerText = description;
    headerLeftDiv.appendChild(h6);

    const headerRightDiv = document.createElement('div');
    headerDiv.appendChild(headerRightDiv);

    if(status === 'open') {
        const finishButton = document.createElement('button');
        finishButton.className = 'btn btn-dark btn-sm js-task-open-only';
        finishButton.innerText = 'Finish';
        headerRightDiv.appendChild(finishButton);

        finishButton.addEventListener('click', function () {
            apiUpdateTask(taskId, title, description, 'closed').then(function () {
                // Najdi všechny prvky s class "js-task-open-only" uvnitř této section a odstraň je
                const openOnlyElements = section.querySelectorAll('.js-task-open-only');
                openOnlyElements.forEach(function (element) {
                    element.remove();
                });
            });
        });

    }

    const deleteButton = document.createElement('button');
    deleteButton.className = 'btn btn-outline-danger btn-sm ml-2';
    deleteButton.innerText = 'Delete';
    headerRightDiv.appendChild(deleteButton);
    deleteButton.addEventListener('click', function() {
        apiDeleteTask(taskId).then(function () {
            section.remove();
        });
    });

    apiListOperationsForTask(taskId).then(
        function(response) {
            response.data.forEach(
                function(operation) { renderOperation(ul, operation.id, status, operation.description, operation.timeSpent); }
            );
        }
    );

    if (status === 'open') {
        const form = document.createElement('form');
        form.className = 'p-2 d-flex align-items-center js-task-open-only';
        section.appendChild(form);

        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = 'Operation description';
        input.className = 'form-control mr-2';
        input.style.maxWidth = '970px';
        form.appendChild(input);

        const button = document.createElement('button');
        button.type = 'submit';
        button.className = 'btn btn-primary btn-sm';
        button.innerText = 'Add operation';
        form.appendChild(button);

        form.addEventListener('submit', function (event) {
            event.preventDefault();
            const description = input.value.trim();
            if (description === '') {
                alert('Please enter an operation description.');
                return;
            }

            apiCreateOperationForTask(taskId, description).then(function (response) {
                const operation = response.data;
                renderOperation(ul, operation.id, status, operation.description, operation.timeSpent);
                form.reset();
            });
        });
    }
}

document.addEventListener('DOMContentLoaded', function() {
    apiListTasks().then(
        function(response) {

            // "response" contains an object with keys "error" and "data" (see above)
            // "data" is an array of task objects
            // you run renderTask function for each task obtained from backend
            response.data.forEach(
                function(task) { renderTask(task.id, task.title, task.description, task.status); }
            );
        }
    );
});

function apiListOperationsForTask(taskId) {
    return fetch(
        apihost + '/api/tasks/' + taskId + '/operations',
        {
            headers: { Authorization: apikey }
        }
    ).then(
        function(resp) {
            if(!resp.ok) {
                alert('An error occurred! Open devtools and the Network tab, and locate the cause');
            }
            return resp.json();
        }
    );
}

function renderOperation(operationsList, operationId, status, operationDescription, timeSpent) {
    const li = document.createElement('li');
    li.className = 'list-group-item d-flex justify-content-between align-items-center';

    console.log(status);

    operationsList.appendChild(li);
    // Vlevo: popis + badge s časem
    const leftDiv = document.createElement('div');
    leftDiv.innerText = operationDescription;
    li.appendChild(leftDiv);

    const timeBadge = document.createElement('span');
    timeBadge.className = 'badge badge-success badge-pill ml-2';
    timeBadge.innerText = formatTime(timeSpent); // přehlednější formát času
    leftDiv.appendChild(timeBadge);

    // Vpravo: tlačítka
    const rightDiv = document.createElement('div');
    li.appendChild(rightDiv);

    if (status === "open") {
        const add15Btn = document.createElement('button');
        add15Btn.className = 'btn btn-outline-success btn-sm mr-2 js-task-open-only';
        add15Btn.innerText = '+15m';
        rightDiv.appendChild(add15Btn);

        const add60Btn = document.createElement('button');
        add60Btn.className = 'btn btn-outline-success btn-sm mr-2 js-task-open-only';
        add60Btn.innerText = '+1h';
        rightDiv.appendChild(add60Btn);

        add15Btn.addEventListener('click', function () {
            const newTime = timeSpent + 15;
            apiUpdateOperation(operationId, operationDescription, newTime).then(function () {
                timeSpent = newTime;
                timeBadge.innerText = formatTime(timeSpent);
            });
        });

        add60Btn.addEventListener('click', function () {
            const newTime = timeSpent + 60;
            apiUpdateOperation(operationId, operationDescription, newTime).then(function () {
                timeSpent = newTime;
                timeBadge.innerText = formatTime(timeSpent);
            });
        });
    }

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn btn-outline-danger btn-sm js-task-open-only';
    deleteBtn.innerText = 'Delete';
    rightDiv.appendChild(deleteBtn);

    deleteBtn.addEventListener('click', function () {
        apiDeleteOperation(operationId).then(function () {
            li.remove(); // odstraní <li> z DOM
        });
    });

}

// Pomocná funkce pro formátování minut hodiny
function formatTime(minutes) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h > 0 && m > 0) return `${h}h ${m}m`;
    if (h > 0) return `${h}h`;
    return `${m}m`;
}

function apiCreateTask(title, description) {
    return fetch(
        apihost + '/api/tasks',
        {
            headers: { Authorization: apikey, 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: title, description: description, status: 'open' }),
            method: 'POST'
        }
    ).then(
        function(resp) {
            if(!resp.ok) {
                alert('An error occurred! Open devtools and the Network tab, and locate the cause');
            }
            return resp.json();
        }
    )
}

document.addEventListener('DOMContentLoaded', function () {
    const form = document.querySelector('.js-task-adding-form');

    form.addEventListener('submit', function (event) {
        event.preventDefault();

        const titleInput = form.querySelector('input[name="title"]');
        const descriptionInput = form.querySelector('input[name="description"]');
        const title = titleInput.value.trim();
        const description = descriptionInput.value.trim();

        if (title.length < 5 || description.length < 5) {
            alert('Title and description must be at least 5 characters.');
            return;
        }

        apiCreateTask(title, description).then(function (response) {
            const task = response.data;
            renderTask(task.id, task.title, task.description, task.status);

            form.reset(); // Vyčistí formulář
        });
    });
});

function apiDeleteTask(taskId) {
    return fetch(
        apihost + '/api/tasks/' + taskId,
        {
            method: 'DELETE',
            headers: { Authorization: apikey }
        }
    ).then(
        function(resp) {
            if(!resp.ok) {
                alert('An error occurred! Open devtools and the Network tab, and locate the cause');
            }
            return resp.json();
        }
    );
}

function apiCreateOperationForTask(taskId, description) {
    return fetch(
        `${apihost}/api/tasks/${taskId}/operations`,
        {
            method: 'POST',
            headers: {
                Authorization: apikey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                description: description,
                timeSpent: 0
            })
        }
    ).then(function (resp) {
        if (!resp.ok) {
            alert('An error occurred while creating operation.');
        }
        return resp.json();
    });
}

function apiUpdateOperation(operationId, description, timeSpent) {
    return fetch(`${apihost}/api/operations/${operationId}`, {
        method: 'PUT',
        headers: {
            Authorization: apikey,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            description: description,
            timeSpent: timeSpent
        })
    }).then(function (resp) {
        if (!resp.ok) {
            alert('An error occurred while updating the operation.');
        }
        return resp.json();
    });
}

function apiDeleteOperation(operationId) {
    return fetch(`${apihost}/api/operations/${operationId}`, {
        method: 'DELETE',
        headers: {
            Authorization: apikey
        }
    }).then(function (resp) {
        if (!resp.ok) {
            alert('An error occurred while deleting the operation.');
        }
        return;
    });
}

function apiUpdateTask(taskId, title, description, status) {
    return fetch(`${apihost}/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
            Authorization: apikey,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            title: title,
            description: description,
            status: status
        })
    }).then(function (resp) {
        if (!resp.ok) {
            alert('An error occurred while updating the task.');
        }
        return resp.json();
    });
}




