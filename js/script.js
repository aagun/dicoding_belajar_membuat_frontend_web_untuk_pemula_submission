const books = [];
const RENDER_BOOK_EVENT = 'render-book';
const SEARCH_BOOK_EVENT = 'search-book';
const SAVED_EVENT = 'saved-book';
const STORAGE_KEY = 'BOOKSHELF';
const DOCUMENT_READY = 'DOMContentLoaded';
const TOAST_TYPE = {
  success: 'check-button',
  failed: 'check-button',
}

function bookObject(id, title, author, year, isCompleted) {
  return {
    id, title, author, year, isCompleted
  }
}

function generateId() {
  return +new Date();
}

function division(a, b) {
  return a / b;
}

function setDuration(millis) {
  return division(millis, 1_000);
}

function clearToast() {
  const toast = document.body.querySelector('.toast');
  if (toast) {
    toast.remove();
  }
}

function clearArray(arr) {
  arr.splice(0, arr.length);
}

function showToast(message = 'success', type = 'success', duration = 3000) {
  const icon = document.createElement('span');
  icon.classList.add(TOAST_TYPE[type]);

  const toastIcon = document.createElement('div');
  toastIcon.classList.add('toast-icon');
  toastIcon.append(icon);

  const toastMessage = document.createElement('div');
  toastMessage.classList.add('toast-message');
  toastMessage.innerText = message;

  const toastProgressBar = document.createElement('div');
  toastProgressBar.classList.add('toast-progress');
  toastProgressBar.style.animationDuration = `${setDuration(duration)}s`;

  const toastWrapper = document.createElement('div');
  toastWrapper.classList.add('toast-wrapper');

  const box = document.createElement('div');
  box.classList.add('toast', `toast-${type}`);
  box.append(toastIcon, toastMessage, toastProgressBar);

  clearToast();
  document.body.appendChild(box);
}

function isStorageExist() {
  if (!(typeof (Storage))) {
    showToast('Browser kamu tidak mendukung local storage', 'failed');
    return false;
  }
  return true;
}

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let deserializedData = JSON.parse(serializedData);

  if (deserializedData !== null) {
    deserializedData.forEach(data => books.push(data));
  }

  dispatchEvent(RENDER_BOOK_EVENT);
}

function findBookByTitle(title) {
  clearArray(books);

  if (title === '') {
    loadDataFromStorage();
    return;
  }

  const serializedData = localStorage.getItem(STORAGE_KEY);
  let deserializedData = JSON.parse(serializedData);

  deserializedData
    .filter(book => book.title.toLowerCase().includes(title.toLowerCase()))
    .forEach(book => books.push(book));

  console.log({books});

  dispatchEvent(RENDER_BOOK_EVENT);
}

function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    dispatchEvent(SAVED_EVENT);
  }
}

function renderAddBookCategoryButton(inputBookIsComplete) {
  const bookShelfCategory = document.querySelector('#bookSubmit > span');
  bookShelfCategory.innerText = '';

  if (inputBookIsComplete.checked) {
    bookShelfCategory.innerText = 'Selesai dibaca';
  } else {
    bookShelfCategory.innerText = 'Belum selesai dibaca';
  }
}

function findBookById(bookId) {
  return books.find(book => book.id === bookId);
}

function scrollToCreatedBook(targetId) {
  const top = document.getElementById(`${targetId}`).offsetTop
  window.scroll({
    top,
    behavior: 'smooth'
  });
}

function onlyNumber(event) {
  const MAPPED_KEYCODES = {
    ARROWS: [37, 38, 39, 40],
    REMOVE: [8, 46],
    JUMP: [35, 36]
  }

  return (MAPPED_KEYCODES.ARROWS.includes(event.keyCode)
    || MAPPED_KEYCODES.JUMP.includes(event.keyCode)
    || MAPPED_KEYCODES.REMOVE.includes(event.keyCode)
    || (event.keyCode >= 48 && event.keyCode <= 57));
}

function resetForm() {
  document.getElementById('bookReset').click();
}

function dispatchEvent(name) {
  document.dispatchEvent(new Event(name));
}

function markedBook(bookId, isComplete) {
  const book = findBookById(bookId);
  console.log({book});
  if (!book) {
    return;
  }
  book.isCompleted = !isComplete;
  dispatchEvent(RENDER_BOOK_EVENT);

  const section = book.isCompleted ? 'completeBookshelfList' : 'incompleteBookshelfList';
  scrollToCreatedBook(section);

  const bookItems = document.querySelectorAll(`#${section} > .book_item`);
  bookItems[0].classList.add('blink');
}

function createMarkedButton({bookId, isComplete, text, classList}) {
  const markedButton = document.createElement('button');
  markedButton.classList.add(...classList);
  markedButton.innerText = text
  markedButton.addEventListener('click', () => {
    markedBook(bookId, isComplete);
    saveData();
  });

  return markedButton;
}

function deleteBook(bookId) {
  const theBook = books.findIndex(book => book.id === bookId);

  if (theBook === -1) {
    return;
  }

  books.splice(theBook, 1);
  dispatchEvent(RENDER_BOOK_EVENT);
  showToast('Buku berhasil dihapus');
}

function createDeleteButton(bookId) {
  const deleteButton = document.createElement('button');
  deleteButton.innerText = 'Hapus Buku';
  deleteButton.classList.add('red');
  deleteButton.addEventListener('click', () => {
    deleteBook(bookId);
    saveData();
  });
  return deleteButton;
}

function makeBook(book) {
  const title = document.createElement('h3');
  title.innerText = book.title;

  const author = document.createElement('p');
  author.innerText = book.author;

  const year = document.createElement('p');
  year.innerText = book.year;

  const markedButtonConfig = {
    bookId: book.id,
    isComplete: book.isCompleted,
    text: book.isCompleted ? 'Belum selesai dibaca' : 'Selesai dibaca',
    classList: ['green']
  }
  const markedButton = createMarkedButton(markedButtonConfig);

  const deleteButton = createDeleteButton(book.id);

  const buttonActions = document.createElement('div');
  buttonActions.classList.add('action');
  buttonActions.append(markedButton, deleteButton);

  const container = document.createElement('article');
  container.classList.add('book_item')
  container.append(title, author, year, buttonActions);
  return container;
}

function addBook() {
  const title = document.getElementById('inputBookTitle');
  const author = document.getElementById('inputBookAuthor');
  const year = document.getElementById('inputBookYear');
  const isCompleted = document.getElementById('inputBookIsComplete');
  const id = generateId();

  const book = bookObject(id, title.value, author.value, year.value, isCompleted.checked);
  books.unshift(book);

  resetForm();

  saveData();

  dispatchEvent(RENDER_BOOK_EVENT);

  const rack = isCompleted.checked ? 'Selesai dibaca' : 'Belum selesai dibaca';
  showToast(`Buku berhasil ditambahkan ke rak ${rack}`);

  const section = isCompleted.checked ? 'completeBookshelfList' : 'incompleteBookshelfList';
  scrollToCreatedBook(section);

  const bookItems = document.querySelectorAll(`#${section} > .book_item`);
  console.log({bookItems, section})
  bookItems[0].classList.add('blink');

}


const inputBookIsComplete = document.getElementById('inputBookIsComplete');
inputBookIsComplete.addEventListener('change', (evt) => {
  evt.preventDefault();
  renderAddBookCategoryButton(inputBookIsComplete);
});

document.addEventListener(RENDER_BOOK_EVENT, () => {
  const incompleteBookshelfList = document.getElementById('incompleteBookshelfList');
  incompleteBookshelfList.innerHTML = '';

  const completeBookshelfList = document.getElementById('completeBookshelfList');
  completeBookshelfList.innerHTML = '';
  books.forEach(book => {
    const bookElement = makeBook(book);

    if (book.isCompleted) {
      completeBookshelfList.appendChild(bookElement);
    } else {
      incompleteBookshelfList.appendChild(bookElement);
    }
  })
});

document.addEventListener(SAVED_EVENT, function () {
  showToast('Data bookshelf berhasil diperbaharui', 'success', 5_000);
});

document.addEventListener('submit', (event) => {
  event.preventDefault();
  const searchTerm = document.getElementById('searchBookTitle').value;
  findBookByTitle(searchTerm);
})
document.addEventListener(DOCUMENT_READY, () => {
  const inputBook = document.getElementById('inputBook');
  inputBook.addEventListener('submit', (event) => {
    event.preventDefault();
    addBook();
  });

  if (isStorageExist()) {
    loadDataFromStorage();
  }
});