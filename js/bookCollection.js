const STORAGE_KEY = 'bookList_v1';
// Array for book objects
let bookList = [];


// Load saved books from localStorage on page load
function loadBooks() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
        try {
            bookList = JSON.parse(raw);
        } catch (e) {
            console.error('Failed to parse stored bookList:', e);
            bookList = [];
        }
    } else {
        bookList = [];
    }
    updateDisplay();
}


// Save current book list to localStorage
function saveBooks() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookList));
}


// Handle form submit
document.getElementById('bookForm').addEventListener('submit', function(e) {
  e.preventDefault();

    const mode = document.querySelector('input[name="searchMode"]:checked').value;
    const title = document.getElementById('bookTitle').value.trim();
    const isbnInput = document.getElementById('bookISBN').value.trim();
    const status = document.getElementById('status');
    
    // Search if isbn selected
    if (mode === `isbn`) {
        if (!isbnInput) {
            status.textContent = 'Please enter and ISBN.';
            return;
        }
    status.textContent = 'Searching by ISBN...';
    fetch(`https://openlibrary.org/search.json?isbn=` + encodeURIComponent(isbnInput) + `&limit=1`)
        .then(response => response.json())
        .then(data => handleApiResult(data, status))
        .catch(error => status.textContent = `Error: ` + error.message);
    return;
    }
    
    // default search
    if (!title) {
        status.textContent = 'Please enter a title.';
        return;
    }
    status.textContent = 'Searching by tile...';
    fetch(`https://openlibrary.org/search.json?q=` + encodeURIComponent(title) + `&limit=1`)
        .then(response => response.json())
        .then(data => handleApiResult(data, status))
        .catch(error => status.textContent = `Error: ` + error.message);
});


// uses the API data to build book object and adds it to array
function handleApiResult(data, status) {
    const doc = data.docs && data.docs[0];
    if (!doc) {
        status.textContent = 'no book found.';
        return;
    }
    // Create book object
    const book = {
        title: `Unknown Title`,
        author: `Unknown Author`,
        year: `Year N/A`,
        isbn: ``,
        coverUrl: ``,
        description: `Description unavailable`,
        favourite: false
    };
    if (doc.title) {
        book.title = doc.title;
    }
    if (doc.author_name && Array.isArray(doc.author_name) && doc.author_name[0]) {
        book.author = doc.author_name[0];
    }
    if (typeof doc.first_publish_year !== 'undefined' && doc.first_publish_year !== null) {
        book.year = String(doc.first_publish_year);
    }
    if (doc.isbn && Array.isArray(doc.isbn) && doc.isbn[0]) {
        book.isbn = doc.isbn[0];
    }
    // Get book cover
    if (doc.cover_i) {
        book.coverUrl = `https://covers.openlibrary.org/b/id/` + doc.cover_i + `-M.jpg`;
    } else if (doc.isbn && doc.isbn[0]) {
     book.coverUrl = `https://covers.openlibrary.org/b/isbn/` + doc.isbn[0] + `-M.jpg`;
    }
    // Get book description
    if (doc.key) {
        fetch(`https://openlibrary.org${doc.key}.json`)
        .then(response => response.json())
        .then(workData => {
           if (workData.description) {
               book.description = typeof workData.description === `string` ? workData.description : 
               workData.description.value;
           }
            addBook(book, status);
        })
        .catch(() => addBook(book, status));
    }else {
        addBook(book, status);
    }
}


    // prevent adding duplicate books
function addBook(book, status) {
    const exists = bookList.some(b => 
                    (book.isbn && b.isbn === book.isbn) || 
                    (b.title === book.title && b.author === book.author && b.year === book.year));
    if (exists) {
        status.textContent = 'That book is already added to collection.';
        return;
    }
    // Add to array
    bookList.push(book);
    saveBooks();
    status.textContent = `Added: ` + book.title;
    document.getElementById('bookForm').reset();
    updateDisplay();
}


// toggle favourates
function toggleFavourite(index) {
    bookList[index].favourite = !bookList[index].favourite;
    saveBooks();
    updateDisplay();
}
window.toggleFavourite = toggleFavourite;


// Update display
function updateDisplay() {
    const container = document.getElementById('bookContainer');
    const favOnly = document.getElementById('filterFavourites')?.checked;
    const listToShow = favOnly ? bookList.filter(b => b.favourite) : bookList;
    if (bookList.length === 0){
        container.innerHTML = `<p> No books added yet...</p>`;
        return;
    }
    container.innerHTML = listToShow.map(book => { 
        const originalIndex = bookList.indexOf(book);
        return `
            <div class="book-item">
                <img src="${book.coverUrl ? `${book.coverUrl}` : ''}">
                <div class="book-details">
                    <p>${book.title}</p>
                    <p>${book.author} (${book.year})</p>
                    ${book.isbn ? `<p>ISBN: ${book.isbn}</p>` : ''}
                    <label><input type="checkbox" ${book.favourite ? 'checked' : ''} 
                    onclick="toggleFavourite(${originalIndex})">
                    <span>${book.favourite ? '★ Favourite' : '☆ Mark favourite'}</span>
                    </label>
                    <div>
                        <button onclick="removeBook(${originalIndex})">Remove</button>
                    </div>
                </div>
            </div>
        `;
        }).join('');
}


// Wire filter checkbox to re-render
document.getElementById('filterFavourites').addEventListener('change', updateDisplay);

// Removes book
function removeBook(index) {
    bookList.splice(index, 1);
    saveBooks();
    updateDisplay();
}
// Expose removeBook globally so it can be called from inline (onclick)
window.removeBook = removeBook;


// Load books on page load
loadBooks();
