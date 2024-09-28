let images = [];
let currentIndex = 0;
let annotations = [];
let comments = [];
let tags = [];
let annotatedCount = 0;
labelButtonsList = [];

// Files uploading
document.getElementById('imageUpload').addEventListener('change', handleFileUpload);

function handleFileUpload(event) {
    images = Array.from(event.target.files);
    annotations = new Array(images.length).fill(null);
    comments = new Array(images.length).fill(null);
    currentIndex = 0;
    annotatedCount = 0;
    updateCounter();
    displayImage();
}

// Navigation
document.getElementById('prevButton').addEventListener('click', showPreviousImage);
document.getElementById('nextButton').addEventListener('click', showNextImage);

function showPreviousImage() {
    if (currentIndex > 0) {
        currentIndex--;
        displayImage();
    }
}

function showNextImage() {
    if (annotations[currentIndex]) {
        if (currentIndex < images.length - 1) {
            currentIndex++;
            displayImage();
        }
    } else {
        alert('Please add an annotation before moving to the next image.');
    }
}

function displayImage() {
    const currentImage = images[currentIndex];
    if (currentImage) {
        const imageUrl = URL.createObjectURL(currentImage);
        document.getElementById('currentImage').src = imageUrl;
        document.getElementById('metadata').innerText = 
        `name: ${currentImage.name}, size: ${currentImage.size} bytes, type: ${currentImage.type}`;
        
        const label = annotations[currentIndex] || ' ';
        const comment = comments[currentIndex] || ' ';
        const tag = tags[currentIndex] || ' ';
        document.getElementById('imageAnnotationsInfo').innerText = `LABEL: ${label}, TAG: ${tag}, COMMENT: ${comment}`;
    }
}

// Counter update
function updateCounter() {
    const totalImages = images.length;
    document.getElementById('counter').innerText = `Annotated ${annotatedCount} / ${totalImages}`;
}

// Labels adding
document.getElementById('labelInput').addEventListener('keypress', async function(event) {
    if (event.key === 'Enter') {
        const label = event.target.value.trim();
        if (label !== '') {

            const spellCheck = await checkSpelling(label);
            if (!spellCheck) {
                return;
            }

            if (!checkSimilarLabels(label, labelButtonsList)) {
                createLabelButton(label);
                addLabel(label);
            }
            else {
                handleSimilarLabelsError(label);
            }
            event.target.value = '';
        }
    }
});

function addLabel(label) {
    if (images.length > 0) {
        annotations[currentIndex] = label;
        annotatedCount = annotations.filter(Boolean).length;
        document.getElementById('imageAnnotationsInfo').innerText = 
        `LABEL: ${label}, TAG: ${tags[currentIndex] || ' '}, COMMENT: ${comments[currentIndex] || ' '}`;

        updateCounter();
    }
}

function createLabelButton(label) {
    if (labelButtonsList.includes(label)) {
        return;
    }
    const container = document.getElementById('labelButtonsContainer');
    const button = document.createElement('button');
    button.className = 'label-button';
    button.innerText = label;
    button.style.color = getRandomColor();
    button.onclick = function() {
        addLabel(label);
    };
    container.appendChild(button);
    labelButtonsList.push(label);
}

// Colors generation
function getRandomColor() {
    const colors = ['#382933', '#3B5249', '#519872', '#A4B494'];
    return colors[Math.floor(Math.random() * colors.length)];
}

// Potential new label creating error handling
function handleSimilarLabelsError(label) {
    const userResponse = prompt('Do you want to add it anyway? (yes/no)');
    if (userResponse && userResponse.toLowerCase() === 'yes') {
        createLabelButton(label);
        addLabel(label);
    }
}

function levenshteinDistance(str1, str2) {
    const len1 = str1.length;
    const len2 = str2.length;
    const matrix = [];

    for (let i = 0; i <= len1; i++) {
        matrix[i] = [i];
    }
    for (let j = 0; j <= len2; j++) {
        matrix[0][j] = j;
    }

    for (let i = 1; i <= len1; i++) {
        for (let j = 1; j <= len2; j++) {
            if (str1[i - 1] === str2[j - 1]) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    matrix[i][j - 1] + 1,     
                    matrix[i - 1][j] + 1      
                );
            }
        }
    }
    return matrix[len1][len2];
}

function checkSimilarLabels(newLabel, labels) {
    const threshold = 3; // Maximum allowed Levenshtein distance between labels
    const similarLabels = [];

    labels.forEach(label => {
        const distance = levenshteinDistance(newLabel.toLowerCase(), label.toLowerCase());
        if (distance > 0 && distance <= threshold) {
            similarLabels.push(label);
        }
    });

    if (similarLabels.length > 0) {
        alert(`The label "${newLabel}" is very similar to: ${similarLabels.join(', ')}`);
        return true; 
    }

    return false;
}

async function checkSpelling(inputWord) {
    const apiUrl = 'https://api.languagetoolplus.com/v2/check';
    const params = new URLSearchParams({
        text: inputWord.toLowerCase(),
        language: 'en-US', // Мова: англійська (американська)
    });

    try {
        const response = await fetch(`${apiUrl}?${params.toString()}`);
        const data = await response.json();

        if (data.matches.length > 0) {

            const suggestions = data.matches[0].replacements
                .map(rep => ({
                    value: rep.value,
                    score: rep.score
                }))
                .sort((a, b) => b.score - a.score)

            const topSuggestions = suggestions.slice(0, 5).map(sug => sug.value);
            const suggestionMessage = `The word "${inputWord}" is incorrect. Possible suggestions: ${topSuggestions.join(', ').toLowerCase()}`;
            alert(suggestionMessage);
            return false;
        } else {
            return true;
        }
    } catch (error) {
        console.error('Error:', error);
        return true;
    }
}

// Comments adding
document.getElementById('commentInput').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        const comment = document.getElementById('commentInput').value.trim();
        if (comment !== '') {
            addComment(comment);
            document.getElementById('commentInput').value = '';
        }
    }
});

function addComment(comment) {
    if (images.length > 0) {
        comments[currentIndex] = comment;
        document.getElementById('imageAnnotationsInfo').innerText = 
        `LABEL: ${annotations[currentIndex] || ' '}, TAG: ${tags[currentIndex] || ' '}, COMMENT: ${comment}`;
    }
}

// Tags adding
document.getElementById('tagInput').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        const tag = document.getElementById('tagInput').value.trim();
        if (tag !== '') {
            addTag(tag);
            document.getElementById('tagInput').value = '';
        }
    }
});

function addTag(tag) {
    if (images.length > 0) {
        tags[currentIndex] = tag;
        document.getElementById('imageAnnotationsInfo').innerText = 
        `LABEL: ${annotations[currentIndex] || ' '}, TAG: ${tag}, COMMENT: ${comments[currentIndex] || ' '}`;
    }
}

// Exporting annotations
document.getElementById('exportButton').addEventListener('click', exportAnnotations);

function exportAnnotations() {
    let output = images.map((image, index) => {
        return {
            imageName: image.name,
            imageSize: image.size,
            label: annotations[index] || " ",
            tags: tags[index] || " ",
            comment: comments[index] || " "
        };
    });

    const jsonOutput = encodeURIComponent(JSON.stringify(output));
    window.location.href = `export.html?data=${jsonOutput}`;
}

// Session timer
let startTime = Date.now();

function updateSessionTimer() {
    const timerElement = document.getElementById("sessionTimer");
    
    const currentTime = Date.now();
    const timeElapsed = currentTime - startTime;

    const hours = Math.floor(timeElapsed / 3600000);
    const minutes = Math.floor((timeElapsed % 3600000) / 60000);
    const seconds = Math.floor((timeElapsed % 60000) / 1000);

    const formattedTime = 
        String(hours).padStart(2, '0') + ':' + 
        String(minutes).padStart(2, '0') + ':' + 
        String(seconds).padStart(2, '0');

    timerElement.textContent = `${formattedTime}`;
}

setInterval(updateSessionTimer, 1000);
