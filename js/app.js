const sortTasksButton = document.querySelector('.todo-app__sort-button');
const addTaskButton = document.querySelector('.todo-app__button-add');

const mainInput = document.querySelector('.todo-app__item:last-child');
const inputList = document.querySelector('.todo-app__list');

const inputListItems = document.getElementsByClassName('todo-app__item');

sortTasksButton.addEventListener('click', () => {
    // just for design purposes
    sortTasksButton.classList.toggle('todo-app__sort-button--down');
    sortTasksButton.classList.toggle('todo-app__sort-button--up');

    // live collection to an array
    const inputText = [...inputListItems]

    // array for new data
    newArr = [];
    inputText.splice(-1, 1);
    inputText.forEach((item) => {
        newArr.push(item.querySelector('input').value);
    })

    sortTasksButton.classList.contains('todo-app__sort-button--up') ? newArr.sort() : newArr.sort().reverse();

    // set new sorted array for inputs into list items
    inputText
        .forEach(
            (item) => {
                item.querySelector('input').value = newArr.shift();
            }
        )
    updateStorage();
})

const addNewTaskInMarkup = (arr) => {
    if (!arr) {
        const newInput = mainInput.cloneNode(true);
        const newInputItem = newInput.querySelector('input');
        newInputItem.value = '';
        inputList.appendChild(newInput);
        newInputItem.focus();
        updateStorage();
    } else if (arr) {
        console.log(arr);
        arr.reverse().map((el) => {
            const newInput = mainInput.cloneNode(true);
            const newInputItem = newInput.querySelector('input');
            newInputItem.value = el;
            inputList.prepend(newInput);
        })

        updateStorage();
    }

}

const updateStorage = (data) => {
    if (data) {
        console.log('has data');
        localStorage.setItem('urazaev_github_io_task_tracker_content', JSON.stringify(data));
        return
    }

    console.log('hasnt data');
    const inputText = [...inputListItems];
    let arrOfValues = inputText.map((item) => item.querySelector('input').value)
    arrOfValues.splice(-1, 1);

    localStorage.setItem('urazaev_github_io_task_tracker_content', JSON.stringify(arrOfValues));
    console.log(localStorage.getItem('urazaev_github_io_task_tracker_content'));

}

addTaskButton.addEventListener('click', () => {
    if (document.querySelector('.todo-app__item:last-child').querySelector('input').value) {
        addNewTaskInMarkup();
    }
})

document.addEventListener('keydown', (e) => {
    if (e.code === 'Enter' && document.activeElement.classList.contains('todo-app__item-input') && document.activeElement.value) {
        addNewTaskInMarkup();
    }
})

inputList.addEventListener('click', (e) => {
    if (e.target.classList.contains('todo-app__item-button-delete')) {
        if (inputListItems.length > 1) {
            e.target.closest('li').remove();
            updateStorage();
        } else {
            inputListItems[0].querySelector('input').value = '';
            updateStorage();
        }
    } else if (e.target.classList.contains('todo-app__item-button-done') || e.target.closest('.todo-app__item-button-done')) {
        e.target.closest('.todo-app__item-button-done').classList.toggle('todo-app__item-button-done--checked');
        updateStorage();
    }
});

const list = inputList;

let draggingEle;
let placeholder;
let isDraggingStarted = false;

// The current position of mouse relative to the dragging element
let x = 0;
let y = 0;

// Swap two nodes
const swap = function (nodeA, nodeB) {
    const parentA = nodeA.parentNode;
    const siblingA = nodeA.nextSibling === nodeB ? nodeA : nodeA.nextSibling;

    // Move `nodeA` to before the `nodeB`
    nodeB.parentNode.insertBefore(nodeA, nodeB);

    // Move `nodeB` to before the sibling of `nodeA`
    parentA.insertBefore(nodeB, siblingA);
};

// Check if `nodeA` is above `nodeB`
const isAbove = function (nodeA, nodeB) {
    // Get the bounding rectangle of nodes
    const rectA = nodeA.getBoundingClientRect();
    const rectB = nodeB.getBoundingClientRect();

    return rectA.top + rectA.height / 2 < rectB.top + rectB.height / 2;
};

const mouseDownHandler = function (e) {
    if (e.target.classList.contains('todo-app__item')
        || e.target.closest('.todo-app__item-button-drag')) {

        draggingEle = e.target.closest('li');

        // Calculate the mouse position
        const rect = draggingEle.getBoundingClientRect();
        x = e.pageX - rect.left;
        y = e.pageY - rect.top;

        // Attach the listeners to `document`
        document.addEventListener("mousemove", mouseMoveHandler);
        document.addEventListener("mouseup", mouseUpHandler);
    }
};

const mouseMoveHandler = function (e) {
    const draggingRect = draggingEle.getBoundingClientRect();

    if (!isDraggingStarted) {
        isDraggingStarted = true;

        // Let the placeholder take the height of dragging element
        // So the next element won't move up
        placeholder = document.createElement("li");
        placeholder.classList.add("placeholder");
        draggingEle.parentNode.insertBefore(placeholder, draggingEle.nextSibling);
        placeholder.style.height = `${draggingRect.height}px`;
    }

    // Set position for dragging element

    const correction = list.getBoundingClientRect();
    draggingEle.style.position = "absolute";
    draggingEle.style.top = `${e.pageY - y - correction.top}px`;
    draggingEle.style.left = `${e.pageX - x - correction.left}px`;

    // The current order
    // prevEle
    // draggingEle
    // placeholder
    // nextEle
    const prevEle = draggingEle.previousElementSibling;
    const nextEle = placeholder.nextElementSibling;

    // The dragging element is above the previous element
    // User moves the dragging element to the top
    if (prevEle && isAbove(draggingEle, prevEle)) {
        // The current order    -> The new order
        // prevEle              -> placeholder
        // draggingEle          -> draggingEle
        // placeholder          -> prevEle
        swap(placeholder, draggingEle);
        swap(placeholder, prevEle);
        return;
    }

    // The dragging element is below the next element
    // User moves the dragging element to the bottom
    if (nextEle && isAbove(nextEle, draggingEle)) {
        // The current order    -> The new order
        // draggingEle          -> nextEle
        // placeholder          -> placeholder
        // nextEle              -> draggingEle
        swap(nextEle, placeholder);
        swap(nextEle, draggingEle);
    }
};

const mouseUpHandler = function () {
    // Remove the placeholder
    placeholder && placeholder.parentNode && placeholder.parentNode.removeChild(placeholder);

    draggingEle.style.removeProperty("top");
    draggingEle.style.removeProperty("left");
    draggingEle.style.removeProperty("position");

    x = null;
    y = null;
    draggingEle = null;
    isDraggingStarted = false;

    // Remove the handlers of `mousemove` and `mouseup`
    document.removeEventListener("mousemove", mouseMoveHandler);
    document.removeEventListener("mouseup", mouseUpHandler);
};

// add EL for DND on parrent element for li
list.addEventListener("mousedown", mouseDownHandler);

var storage = localStorage.getItem('urazaev_github_io_task_tracker_content');
if (storage) {
    console.log(JSON.parse(storage));
    addNewTaskInMarkup(JSON.parse(storage));
}
// var hasShown = localStorage.getItem('urazaev_github_io_task_tracker_shown');


