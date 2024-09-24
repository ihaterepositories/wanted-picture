let images = [];
let currentIndex = 0;
let annotations = [];
let annotatedCount = 0;
let labels = [];

document.getElementById('imageUpload').addEventListener('change', handleFileUpload);
document.getElementById('addLabelButton').addEventListener('click', addLabel);
document.getElementById('prevButton').addEventListener('click', showPreviousImage);
document.getElementById('nextButton').addEventListener('click', showNextImage);
document.getElementById('exportButton').addEventListener('click', exportAnnotations);

function handleFileUpload(event) {
    images = Array.from(event.target.files);
    annotations = new Array(images.length).fill(null);
    currentIndex = 0;
    annotatedCount = 0;
    updateCounter();
    displayImage();
}

function displayImage() {
    const currentImage = images[currentIndex];
    if (currentImage) {
        const imageUrl = URL.createObjectURL(currentImage);
        document.getElementById('currentImage').src = imageUrl;
        document.getElementById('metadata').innerText = 
        `name: ${currentImage.name}, size: ${currentImage.size} bytes, type: ${currentImage.type}`;
        document.getElementById('labelList').innerHTML = annotations[currentIndex] || "No annotations";
    }
}

function addLabel() {
    const labelInput = document.getElementById('labelInput').value.trim();
    if (labelInput && images.length > 0) {
        if (labels.includes(labelInput)) {
            alert('This label already exists. Please enter a different label.');
            return;
        }

        annotations[currentIndex] = labelInput;
        annotatedCount = annotations.filter(Boolean).length;
        document.getElementById('labelList').innerText = labelInput;
        updateCounter();
        document.getElementById('labelInput').value = '';

        labels.push(labelInput);
        addLabelButton(labelInput);
    } else {
        alert('Please enter a valid label.');
    }
}

function removeAnnotation() {
    if (annotations[currentIndex]) {
        annotations[currentIndex] = null;
        annotatedCount = annotations.filter(Boolean).length;
        document.getElementById('labelList').innerText = '';
        updateCounter();
    } else {
        alert('This image has no annotation to remove.');
    }
}

function updateCounter() {
    const totalImages = images.length;
    document.getElementById('counter').innerText = `Annotated ${annotatedCount} / ${totalImages}`;
}

function addLabelButton(label) {
    const container = document.getElementById('labelButtonsContainer');
    const button = document.createElement('button');
    button.className = 'label-button';
    button.innerText = label;
    button.onclick = function() {
        addAnnotation(label);
    };
    container.appendChild(button);
}

function addAnnotation(label) {
    if (images.length > 0) {
        annotations[currentIndex] = label;
        annotatedCount = annotations.filter(Boolean).length;
        document.getElementById('labelList').innerText = label;
        updateCounter();
    }
}

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

function exportAnnotations() {
    let output = images.map((image, index) => {
        return {
            imageName: image.name,
            annotation: annotations[index] || "No annotation"
        };
    });

    const jsonOutput = encodeURIComponent(JSON.stringify(output));

    window.location.href = `export.html?data=${jsonOutput}`;
}

function getRandomColor() {
    const colors = ['#382933', '#3B5249', '#519872', '#A4B494'];
    return colors[Math.floor(Math.random() * colors.length)];
}

function addLabelButton(label) {
    const container = document.getElementById('labelButtonsContainer');
    const button = document.createElement('button');
    button.className = 'label-button';
    button.innerText = label;
    button.style.color = getRandomColor();
    button.onclick = function() {
        addAnnotation(label);
    };
    container.appendChild(button);
}

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
