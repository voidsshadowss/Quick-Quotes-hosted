import { initializeApp } from "https://www.gstatic.com/firebasejs/9.5.0/firebase-app.js";
import { getDatabase, ref, push, onChildAdded, remove } from "https://www.gstatic.com/firebasejs/9.5.0/firebase-database.js";

let bannedWords = [];

fetch('banned-words.txt')
    .then(response => response.text())
    .then(bannedWordsText => {
        bannedWords = bannedWordsText.split('\n').map(word => word.trim().toLowerCase());
    })
    .catch(error => console.error('Error fetching banned words:', error));

function containsBannedWord(quote, bannedWords) {
    var lowerCaseQuote = quote.toLowerCase();
    for (var i = 0; i < bannedWords.length; i++) {
        if (lowerCaseQuote.includes(bannedWords[i])) {
            return bannedWords[i];
        }
    }
    return null;
}


function displayBannedWordMessage(bannedWord) {
    var bannedWordMessage = document.getElementById('banned-word-message');
    bannedWordMessage.textContent = 'Sorry, the word "' + bannedWord + '" is not allowed.';
}

function displayErrorMessage(message) {
    var errorMessageContainer = document.getElementById('error-message');
    errorMessageContainer.textContent = message;
}



const firebaseConfig = {
    apiKey: "AIzaSyAjkMLkfqZety71KZ9DTkmxJg7w9CzT9cU",
    authDomain: "quick-q-quotes.firebaseapp.com",
    projectId: "quick-q-quotes",
    storageBucket: "quick-q-quotes.appspot.com",
    messagingSenderId: "1001682473398",
    appId: "1:1001682473398:web:103bda23c4792fe5a77117",
    measurementId: "G-BBP2Y4SLFY"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

function addQuote() {
    var nameInput = document.getElementById('name-input');
    var quoteInput = document.getElementById('quote-input');

    var newName = nameInput.value;
    var newQuote = quoteInput.value;

    var recaptchaResponse = grecaptcha.getResponse();
    if (!recaptchaResponse) {
        console.log("reCAPTCHA not solved. Please complete the reCAPTCHA challenge.");
        displayErrorMessage("Please complete the reCAPTCHA challenge.");
        return;
    }

    var bannedWord = containsBannedWord(newQuote, bannedWords);
    if (bannedWord) {
        console.log("Quote contains a banned word. Not adding.");
        displayBannedWordMessage(bannedWord);
        displayBannedWordNotification(bannedWord);
        return;
    }

    if (newName.trim() !== '' && newQuote.trim() !== '') {
        var timestamp = new Date().toLocaleString();

        const quotesRef = ref(database, 'quotes');
        push(quotesRef, {
            text: newQuote,
            author: newName,
            timestamp: timestamp
        });

        nameInput.value = '';
        quoteInput.value = '';
        displayErrorMessage('');
        displayBannedWordNotification('');
        showMessage('Success', 'Quote added successfully.', 'success');
    } else {
        var errorMessage = "Please provide both your name and a non-empty quote.";
        console.log(errorMessage);
        displayErrorMessage(errorMessage);
        showMessage('Error', errorMessage, 'error');
    }
}

let sortOrder = 'newest'; // Variable to track the sort order ('newest' or 'oldest')

function toggleSortOrder() {
    sortOrder = sortOrder === 'newest' ? 'oldest' : 'newest';
    loadQuotes();
}

function loadQuotes() {
    var quoteList = document.getElementById('quotes');
    quoteList.innerHTML = ''; // Clear existing quotes

    const quotesRef = ref(database, 'quotes');
    onChildAdded(quotesRef, function (snapshot) {
        var quoteObj = snapshot.val();
        var listItem = document.createElement('li');
        listItem.innerHTML = '<strong>' + quoteObj.timestamp + '</strong>: ' + quoteObj.author + ' - ' + quoteObj.text;
        if (sortOrder === 'oldest') {
            quoteList.prepend(listItem); // Add to the beginning for oldest order
        } else {
            quoteList.appendChild(listItem); // Add to the end for newest order
        }
    });
}

function clearQuotes() {
    const quotesRef = ref(database, 'quotes');
    remove(quotesRef);
}


loadQuotes();



document.getElementById('add-quote-btn').addEventListener('click', addQuote);
document.getElementById('sort-order-btn').addEventListener('click', toggleSortOrder);
