import {fetchData} from './appData.js';
import {
  addListAPI, changeListNameAPI, toggleListPinAPI, deleteListAPI,
  addTaskAPI, changeTaskNameAPI, toggleTaskCompleteAPI, deleteTaskAPI
} from './API_connector.js';


// masonry library initialization
let masonryInstance;
document.addEventListener('DOMContentLoaded', function () {
  masonryInstance = new Masonry('#lists-container', {
    itemSelector: '.list',
    columnWidth: 500,
    gutter: 25,
    fitWidth: true,
  });
});


// variables made to list creation
let listsCounter = 0;
const listsContainer = document.getElementById("lists-container");
const listToBeCloned = document.getElementById("listBeta");



// task modifiers
function addTask(button) {
  const targetList = button.closest('.list');
  const inputBox = targetList.querySelector('.input-box');
  const tasksContainer = targetList.querySelector('#tasks-container');

  if(inputBox.value === '') {
    alert("You must write something!");
  } else {
    const li = document.createElement('li');

    // items instanciation
    const checkmark = document.createElement('span');
    checkmark.classList.add('checkmark');
    checkmark.onclick = function() {
      toggleCheck(this);
    };
    const taskText = document.createElement('span');
    taskText.classList.add('taskText');
    taskText.textContent = inputBox.value;
    taskText.onclick = function() {
      editTask(this);
    };
    const deleteButton = document.createElement('span');
    deleteButton.textContent = '\u00d7';
    deleteButton.classList.add('deleteButton');
    deleteButton.onclick = function() {
      deleteTask(this);
    };

    // items transfer
    li.appendChild(checkmark);
    li.appendChild(taskText);
    li.appendChild(deleteButton);
    tasksContainer.appendChild(li);
  }

  const listId = targetList.dataset.id;
  addTaskAPI(inputBox.value, listId);

  inputBox.value = "";

  // masonry update
  masonryInstance.reloadItems();
  masonryInstance.layout();
}
function toggleCheck(checkmark) { // função de mudança de checkmark da tarefa
  checkmark.classList.toggle('checked');

  // task text changer
  const taskText = checkmark.parentElement.querySelector('.taskText');
  if(taskText) {
    if(checkmark.classList.contains('checked')) {
      taskText.style.textDecoration = 'line-through';
      taskText.style.color = '#aaa';
    } else {
      taskText.style.textDecoration = 'none';
      taskText.style.color = '#000';
    }
  }

  const taskElement = checkmark.parentElement;
  const taskId = taskElement.dataset.id;
  toggleTaskCompleteAPI(taskId);
}
function editTask(taskText) { // função de modificação do texto da tarefa e seu auxiliar(replacer)
  const currentText = taskText.textContent;

  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = currentText;
  taskText.replaceWith(input);
  input.focus();

  input.addEventListener('blur', () => {
    const newText = input.value || 'Untitled';
    replacer(input, newText);
  });
  input.addEventListener('keydown', (e) => {
    if(e.key === 'Enter') {input.blur()}
  });

  function replacer(input, newText) {
    const newSpan = document.createElement('span');
    newSpan.textContent = newText;
    newSpan.classList.add('taskText');
    newSpan.onclick = function() {
      editTask(this);
    };

    input.replaceWith(newSpan);

    const taskElement = newSpan.parentElement;
    const taskId = taskElement.dataset.id;
    changeTaskNameAPI(taskId, newText);
  }
}
function deleteTask(deleteButton) { // função de exclusão da tarefa
  const task = deleteButton.closest('li');
  task.remove();

  const taskId = task.dataset.id;
  deleteTaskAPI(taskId);
}



// lists creator function
function addList() {
  listsCounter++;
  let newList = listToBeCloned.cloneNode(true);
  newList.removeAttribute('id');
  newList.setAttribute('data-id', `list-${listsCounter}`);
  listsContainer.appendChild(newList);

  const listName = 'Task List';
  addListAPI(listName);

  // masonry update
  masonryInstance.reloadItems();
  masonryInstance.layout();
}



// Lists title changer
document.addEventListener('click', function(e) {
  if(e.target.tagName === "H2") {
    const listHeader = e.target;
    editTitle(listHeader);
  }
})
function editTitle(listHeader) {
  const currentTitle = listHeader.textContent;
  const textInput = document.createElement('input');
  textInput.type = 'text';
  textInput.placeholder = currentTitle;

  listHeader.replaceWith(textInput);
  textInput.focus();

  textInput.addEventListener('blur', () => {saveTitle(textInput)} )
  textInput.addEventListener('keydown', (e) => {
    if(e.key === "Enter") {textInput.blur()}
  })

  function saveTitle(textInput) {
    const newTitle = textInput.value || 'Untitled';
    const newHeader = document.createElement('h2');
    
    newHeader.classList.add('listHeader');
    newHeader.textContent = newTitle;
    textInput.replaceWith(newHeader);
  
    console.log(newHeader);
    const targetList = newHeader.closest('.list');
    console.log(targetList);
    const listId = targetList.dataset.id;
    changeListNameAPI(listId, newTitle);
  }
}



// lists deleter
function deleteList(button) {
  const targetList = button.closest('.list');
  targetList.remove();

  const listId = targetList.dataset.id;
  deleteListAPI(listId);

  // masonry update
  masonryInstance.reloadItems();
  masonryInstance.layout();
}



// lists pinner
function pinList(button) {
  const targetList = button.closest('.list');
  const listsContainer = document.getElementById('lists-container');
  const pinnedList = targetList.classList.contains('pinned');
  if(!pinnedList) {
    listsContainer.insertBefore(targetList, listsContainer.firstChild);
    targetList.classList.add('pinned');
    button.classList.add('active');
  } else {
    targetList.classList.remove('pinned');
    button.classList.remove('active');
    updateList();
  }

  const listId = targetList.dataset.id;
  toggleListPinAPI(listId);

  // masonry update
  masonryInstance.reloadItems();
  masonryInstance.layout();
}
function updateList() { // lists container organizator
  const listsContainer = document.getElementById('lists-container');
  const pinnedLists = Array.from(listsContainer.querySelectorAll('.list.pinned'));

  pinnedLists.forEach(list => {
    listsContainer.prepend(list);
  })
  
  // masonry update
  masonryInstance.reloadItems();
  masonryInstance.layout();
}



async function showData() {
  await fetchData(listsContainer);
  updateList();
  
  requestAnimationFrame(() => {
    masonryInstance.reloadItems();
    masonryInstance.layout();
  })
}
document.addEventListener('DOMContentLoaded', () => {
  showData();
})


// controladores
window.addList = addList;
window.pinList = pinList;
window.deleteList = deleteList;

window.addTask = addTask;
window.editTask = editTask;
window.toggleCheck = toggleCheck;
window.deleteTask = deleteTask;