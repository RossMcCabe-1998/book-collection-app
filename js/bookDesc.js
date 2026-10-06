// get bookList from Local Storage.
const STORAGE_KEY = 'bookList_v1';
const bookList = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

// displays books with descriptions.
function displayBooks() {
    const container = document.getElementById('bookItemContainer');
    if (bookList.length === 0) {
        container.innerHTML = '<p>No books available.</p>';
        return;
    }

    container.innerHTML = bookList.map(book => `
        <div class="bookItem">
            <h2>${book.title}</h2>
            <img src="${book.coverUrl || `placeholder.jpg`}">
            <p><span>Author: </span> ${book.author}</p>
            <p><span>Year: </span> ${book.year}</p>
            <hr id="line">
            <p><span>Description: </span> ${book.description}</p>
        </div>
    `).join('');
}

displayBooks();