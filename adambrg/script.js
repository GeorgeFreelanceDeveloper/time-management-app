const apikey = '53fd9185-8db9-4ecd-8cd9-1e265d43c4b4';
const apihost = 'https://todo-api.coderslab.pl';


document.addEventListener('DOMContentLoaded', function () {
    apiListTasks().then(
        function (response) {
            response.data.forEach(
                function (task) {
                    renderTask(task.id, task.title, task.description, task.status);
                }
            );
        }
    );
});

function apiListTasks() {
    return fetch(
        apihost + '/api/tasks',
        {
            headers: {Authorization: apikey}
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

function renderTask(taskId, title, description, status) {

    const section = document.createElement("section");
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

    if (status === 'open') {
        const finishButton = document.createElement('button');
        finishButton.className = 'btn btn-dark btn-sm js-task-open-only';
        finishButton.innerText = 'Finish';
        headerRightDiv.appendChild(finishButton);
        finishButton.addEventListener('click', function () {
            apiUpdateTask(taskId, title, description, 'closed').then(() => {
                section.querySelectorAll('.js-task-open-only').forEach((element) => {
                    element.remove();
                });
                const addOpForm = section.querySelector('.js-add-operation')?.closest('.card-body');
                if (addOpForm) {
                    addOpForm.remove();
                }
            }).catch(error => {
                console.error('Error updating task:', error);
                alert('Failed to update task.');
            });
        });
    }

    const deleteButton = document.createElement('button');
    deleteButton.className = 'btn btn-outline-danger btn-sm ml-2';
    deleteButton.innerText = 'Delete';
    headerRightDiv.appendChild(deleteButton);
    deleteButton.addEventListener('click', function () {
        apiDeleteTask(taskId).then(function (response) {
            console.log('Delete Response:', response);

            if (!response.error) {

                section.remove();
            } else {
                alert('Failed to remove the task');
            }
        }).catch(function (error) {
            console.error('Error:', error);
            alert('An error occurred while deleting the task!');

            if (status === 'open') {

            }


        });
    });

    const ul = document.createElement('ul');

    ul.className = 'list-group list-group-flush';

    section.appendChild(ul);

    apiListOperationsForTask(taskId).then(
        function (response) {
            response.data.forEach(
                function (operation) {
                    renderOperation(ul, status, operation.id, operation.description, operation.timeSpent);
                }
            );

        }
    );
    if (status == 'open') {
        const addOperationDiv = document.createElement('div');
        addOperationDiv.className = 'card-body';
        section.appendChild(addOperationDiv);

        const form = document.createElement('form');
        form.className = 'js-add-operation';

        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = 'Operation description';
        input.className = 'form-control mb-2';
        input.minLength = 5;
        form.appendChild(input);

        const addOpButton = document.createElement('button');
        addOpButton.className = 'btn btn-info';
        addOpButton.innerText = 'Add operation';
        form.appendChild(addOpButton);

        addOperationDiv.appendChild(form);

        form.addEventListener('submit', function (event) {
            event.preventDefault();

            const description = input.value.trim();
            if (description == '') return;


            apiCreateOperationForTask(taskId, description).then(function (response) {
                renderOperation(ul, status, response.data.id, response.data.description, response.data.timeSpent);
                form.reset();
            });
        });
    }

}

function apiListOperationsForTask(taskId) {
    return fetch(
        apihost + '/api/tasks/' + taskId + '/operations',
        {
            headers: {Authorization: apikey}
        }
    ).then(
        function (resp) {
            if (!resp.ok) {
                alert('An error occurred! Open devtools and the Network tab, and locate the cause');
            }
            return resp.json();
        }
    );
}

function renderOperation(operationsList, status, operationId, operationDescription, timeSpent) {
    const li = document.createElement('li');
    li.className = 'list-group-item d-flex justify-content-between align-items-center';
    operationsList.append(li);

    const descriptionDiv = document.createElement('div');
    descriptionDiv.innerText = operationDescription;
    li.appendChild(descriptionDiv);

    const time = document.createElement('span');
    time.className = 'badge badge-success badge-pill ml-2';
    time.innerText = timeSpent + 'm';
    descriptionDiv.appendChild(time);

    if (status == 'open') {
        const controlDiv = document.createElement('div');
        controlDiv.className = 'js-task-open-only';
        li.appendChild(controlDiv);

        const add15minButton = document.createElement('button');
        add15minButton.className = 'btn btn-outline-success btn-sm mr-2';
        add15minButton.innerText = '+15m';
        controlDiv.appendChild(add15minButton);

        const add1hButton = document.createElement('button');
        add1hButton.className = 'btn btn-outline-success btn-sm mr-2';
        add1hButton.innerText = '+1h';
        controlDiv.appendChild(add1hButton);

        const deleteButton = document.createElement('button')
        deleteButton.className = 'btn btn-outline-danger btn-sm';
        deleteButton.innerText = 'Delete';
        controlDiv.appendChild(deleteButton);


        add15minButton.addEventListener('click', function () {
            timeSpent += 15;
            apiUpdateOperation(operationId, operationDescription, timeSpent).then(() => {
                time.innerText = formatTime(timeSpent);
            })
        })

        add1hButton.addEventListener('click', function () {
            timeSpent += 60;
            apiUpdateOperation(operationId, operationDescription, timeSpent).then(() => {
                time.innerText = formatTime(timeSpent);
            })
        })

        deleteButton.addEventListener('click', function () {
            apiDeleteOperation(operationId).then(
                function () {
                    li.parentElement.removeChild(li)
                }
            )
        })

    }

}

function apiCreateTask(title, description) {
    return fetch(
        apihost + '/api/tasks',
        {
            headers: {Authorization: apikey, 'Content-Type': 'application/json'},
            body: JSON.stringify({title: title, description: description, status: 'open'}),
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

document.addEventListener('DOMContentLoaded', function () {
    document.querySelector('.js-task-adding-form').addEventListener('submit', function (event) {
        event.preventDefault()

        const form = event.target;
        const title = form.elements.title.value;
        const description = form.elements.description.value;

        apiCreateTask(title, description).then(function (newTask) {
            renderTask(newTask.data.id, newTask.data.title, newTask.data.description, newTask.data.status);
            form.reset();
        })

    })
});

function formatTime(timeSpent) {
    const hours = Math.floor(timeSpent / 60);
    const minutes = timeSpent % 60;
    if (hours > 0) {
        return hours + 'h ' + minutes + 'm';
    } else {
        return minutes + 'm';
    }
}

function apiUpdateOperation(operationId, description, timeSpent) {
    return fetch(
        apihost + '/api/operations/' + operationId,
        {
            headers: {
                Authorization: apikey,
                'Content-Type': 'application/json'
            },
            method: 'PUT',
            body: JSON.stringify({description, timeSpent})
        }
    ).then(resp => {
        if (!resp.ok) {
            alert('An error occurred! Open devtools and the Network tab, and locate the cause');
        }
        return resp.json();
    });
}

function apiUpdateTask(taskId, title, description, status) {
    return fetch(
        apihost + '/api/tasks/' + taskId,
        {
            headers: {Authorization: apikey, 'Content-Type': 'application/json'},
            body: JSON.stringify({title: title, description: description, status: status}),
            method: 'PUT'
        }
    ).then(
        function (resp) {
            if (!resp.ok) {
                alert('An error occurred! Open devtools and the Network tab, and locate the cause');
            }
            return resp.json();
        }
    );
}


function apiCreateOperationForTask(taskId, description) {


    return fetch(
        apihost + '/api/tasks/' + taskId + '/operations',
        {
            headers: {Authorization: apikey, 'Content-Type': 'application/json'},
            body: JSON.stringify({description: description, timeSpent: 0}),
            method: 'POST'
        }
    ).then(
        function (resp) {
            if (!resp.ok) {
                alert('An error occurred! Open devtools and the Network tab, and locate the cause');
            }
            return resp.json();
        }
    );
}

function apiDeleteTask(taskId) {
    return fetch(
        apihost + '/api/tasks/' + taskId,
        {
            headers: {Authorization: apikey},
            method: 'DELETE'
        }
    ).then(
        function (resp) {
            if (!resp.ok) {
                alert('An error occurred! Open devtools and the Network tab, and locate the cause');
            }
            return resp.json();
        });

}

function apiDeleteOperation(operationId) {
    return fetch(
        apihost + '/api/operations/' + operationId,
        {
            headers: {Authorization: apikey},
            method: 'DELETE'
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

