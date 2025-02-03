let allowedWords = [];
let word = "";


fetch('words.txt')
    .then(response => response.text())
    .then(data => {
        allowedWords = data.split('\n').map(word => word.trim().toLowerCase());

        word = allowedWords[Math.floor(Math.random() * allowedWords.length)];
        console.log(word)

    });


let boxes = [...document.querySelectorAll('.boxes')];
boxes = [
    boxes.slice(0, 5),
    boxes.slice(5, 10),
    boxes.slice(10, 15),
    boxes.slice(15, 20),
    boxes.slice(20, 25),
    boxes.slice(25, 30)
];

let currentLine = 0;
let currentIndex = 0;
let guess = "";
let correct_letter_color = "hsl(97, 42%, 52%)";
let elsewhere_letter_color = "hsl(44, 89%, 58%)"; 
let wrong_word_color = "hsl(221, 21%, 71%)";

const errorBox = document.getElementById('errorBox');

const switchElement = document.getElementById('toggleSwitch');
const statusText = document.getElementById('status');

keyBoard = document.getElementById("kb");

let isDark = true;
let isFlipping = false;

errorBox.textContent = "New Game Begins!";
showErrorMessage();


document.addEventListener('keydown', function(event) {
    if (event.key.length === 1 && event.key.match(/^[a-zA-Z]$/)) {
        handleKeyPress(event.key.toUpperCase());
    } 
    else if (event.key === 'Backspace' && currentIndex > 0) {
        handleBackspace();
    }
    else if (event.key === 'Enter' && currentIndex > 4) {
        handleEnter();
    }
    else if (event.key === 'Enter') {
        errorBox.textContent = "Too short";
        showErrorMessage();
    }
    else {
        event.preventDefault();
    }
});

const virtualKeys = document.querySelectorAll('.virtual-key'); // Assuming your virtual keys have the class 'virtual-key'

virtualKeys.forEach(key => {
    key.addEventListener('click', function() {
        const keyPressed = key.textContent.toUpperCase();

        if (keyPressed === 'ENTER') {
            handleEnter();
        } else if (keyPressed === '⌫') {
            handleBackspace();
        } else {
            handleKeyPress(keyPressed);
        }
    });
});

function handleKeyPress(key) {
    boxes[currentLine][currentIndex].value = key;
    if (isDark){
        boxes[currentLine][currentIndex].classList.add('filledw');
    }
    else {
        boxes[currentLine][currentIndex].classList.add('filledb');
    }

    boxes[currentLine][currentIndex].classList.remove('animated');

    setTimeout(() => {
        boxes[currentLine][currentIndex].classList.add('animated');
        currentIndex++;
    }, 10);
}

function handleBackspace() {
    if (currentIndex > 0) {
        currentIndex--;
        boxes[currentLine][currentIndex].value = '';
        if (isDark){
            boxes[currentLine][currentIndex].classList.remove('filledw');
        }
        else {
            boxes[currentLine][currentIndex].classList.remove('filledb');
        }
    }
}

function handleEnter() {
    let guess = "";
    for (let i = 0; i < 5; i++) {
        guess += boxes[currentLine][i].value;
        guess = guess.toLowerCase();
    }

    if (!allowedWords.includes(guess)) {
        errorBox.textContent = "Word not found";
        showErrorMessage();
        return;
    }

    let letterCount = countLetters(word);

    for (let i = 0; i < 5; i++) {
        boxes[currentLine][i].classList.add('locked');
    }

    const flipPromises = [];
    isFlipping = true;
    for (let i = 0; i < 5; i++) {
        const flipPromise = new Promise(resolve => {
            setTimeout(() => {
                boxes[currentLine][i].classList.add('flip');

                if (guess[i] === word[i]) {
                    boxes[currentLine][i].style.color = "white";
                    boxes[currentLine][i].style.backgroundColor = correct_letter_color;
                    boxes[currentLine][i].style.borderColor = correct_letter_color;
                    letterCount[guess[i]]--;
                } else if (letterCount[guess[i]] > 0) {
                    boxes[currentLine][i].style.color = "white";
                    boxes[currentLine][i].style.backgroundColor = elsewhere_letter_color;
                    boxes[currentLine][i].style.borderColor = elsewhere_letter_color;
                    letterCount[guess[i]]--;
                } else {
                    boxes[currentLine][i].style.color = "white";
                    boxes[currentLine][i].style.backgroundColor = wrong_word_color;
                    boxes[currentLine][i].style.borderColor = wrong_word_color;
                }

                resolve();
            }, i * 200);
        });

        flipPromises.push(flipPromise);
    }

    Promise.all(flipPromises).then(() => {
        isFlipping = false;
        if (guess === word) {
            showResultModal("You Won!", word);
        } 
        else if (currentLine === 5) {
            showResultModal("You Lost!", word); 
        }
        else{
            currentLine++;
            currentIndex = 0;
        }
    });
}


function showErrorMessage() {
    errorBox.classList.remove('hidden');
    errorBox.classList.add('show'); 

    setTimeout(() => {
        errorBox.classList.remove('show');
        setTimeout(() => {
            errorBox.classList.add('hidden');
        }, 500);
    }, 2000);
}

function countLetters(word) {
    let letterCount = {};
    for (let letter of word) {
        letterCount[letter] = (letterCount[letter] || 0) + 1;
    }
    return letterCount;
}

switchElement.addEventListener('click', () => {
    if (isFlipping) return;
    isDark = !isDark;
    if (isDark) {
        switchElement.classList.add('on');
        errorBox.style.backgroundColor = "hsl(240, 3%, 7%)";
        errorBox.style.color = "white"
        errorBox.style.boxShadow = '10px 10px 20px rgba(92, 92, 92, 0.2)';
        statusText.style.color = "white";
        kb.style.backgroundColor = "";
        document.body.style.backgroundColor = "hsl(240, 3%, 7%)";
        for (let line=currentLine; line<6; line++){
            for (let i=0; i<5; i++){
                boxes[line][i].style.borderColor = "hsl(0, 0%, 65%)";
                boxes[line][i].style.backgroundColor = "hsl(240, 3%, 7%)";
                boxes[line][i].style.color = "white";
            }
        }
        
    } else {
        switchElement.classList.remove('on');
        errorBox.style.backgroundColor = "white";
        errorBox.style.color = "black";
        errorBox.style.boxShadow = '10px 10px 20px rgba(0, 0, 0, 0.3)';
        statusText.style.color = "black";
        kb.style.backgroundColor = "white";

        document.body.style.backgroundColor = "white";
        for (let line=currentLine; line<6; line++){
            for (let i=0; i<5; i++){
                boxes[line][i].style.borderColor = "hsl(240, 3%, 7%)";
                boxes[line][i].style.backgroundColor = "white";
                boxes[line][i].style.color = "black";
            }
        }
    }
});

document.getElementById('newGame').addEventListener('click', function() {
    location.reload();
});

document.getElementById("closeModal").addEventListener('click', function() {
    document.getElementById("resultModal").style.display = "none";
    location.reload();
});

function showResultModal(message, word) {
    const modal = document.getElementById("resultModal");
    const resultMessage = document.getElementById("resultMessage");
    const actualWord = document.getElementById("actualWord");

    resultMessage.textContent = message;
    actualWord.textContent = word;

    modal.style.display = "block";
}