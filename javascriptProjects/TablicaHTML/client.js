const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let isDrawing = false;
let lastX = 0;
let lastY = 0;
let selectedTool = 'brush';
let selectedColor = '#000000';
let fillColor = '#ffffff';
let backgroundColor = '#ffffff';
let lineWidth = 5;
let isFillMode = false;
let startX = 0;
let startY = 0;
let canvasState = null;

// Initialize canvas background
function initCanvas() {
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// Save canvas state
function saveState() {
    canvasState = ctx.getImageData(0, 0, canvas.width, canvas.height);
}

// Restore canvas state
function restoreState() {
    if (canvasState) {
        ctx.putImageData(canvasState, 0, 0);
    }
}

// Tool selection
document.querySelectorAll('.tool-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelector('.tool-btn.active').classList.remove('active');
        btn.classList.add('active');
        selectedTool = btn.dataset.tool;
    });
});

// Color selection
document.getElementById('color').addEventListener('change', (e) => {
    selectedColor = e.target.value;
});

// Fill color selection
document.getElementById('fillColor').addEventListener('change', (e) => {
    fillColor = e.target.value;
});

// Background color selection
document.getElementById('bgColor').addEventListener('change', (e) => {
    backgroundColor = e.target.value;
    initCanvas();
});

// Line width selection
document.getElementById('size').addEventListener('change', (e) => {
    lineWidth = e.target.value;
});

// Fill mode toggle
const fillModeBtn = document.getElementById('fillMode');
fillModeBtn.addEventListener('click', () => {
    isFillMode = !isFillMode;
    fillModeBtn.textContent = `Wypełnienie: ${isFillMode ? 'Wł.' : 'Wył.'}`;
});

// Clear canvas
document.getElementById('clear').addEventListener('click', () => {
    initCanvas();
});

// Drawing functions
function startDrawing(e) {
    isDrawing = true;
    [lastX, lastY] = [e.offsetX, e.offsetY];
    [startX, startY] = [e.offsetX, e.offsetY];
    saveState();
}

function draw(e) {
    if (!isDrawing) return;

    switch (selectedTool) {
        case 'brush':
            drawBrush(e);
            break;
        case 'eraser':
            erase(e);
            break;
        case 'line':
            drawLine(e);
            break;
        case 'rectangle':
            drawRectangle(e);
            break;
        case 'triangle':
            drawTriangle(e);
            break;
        case 'circle':
            drawCircle(e);
            break;
    }
}

function stopDrawing() {
    isDrawing = false;
}

function drawBrush(e) {
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.strokeStyle = selectedColor;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.stroke();
    [lastX, lastY] = [e.offsetX, e.offsetY];
}

function erase(e) {
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.strokeStyle = backgroundColor;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.stroke();
    [lastX, lastY] = [e.offsetX, e.offsetY];
}

function drawLine(e) {
    restoreState();
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.strokeStyle = selectedColor;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
}

function drawRectangle(e) {
    restoreState();
    const width = e.offsetX - startX;
    const height = e.offsetY - startY;
    
    if (isFillMode) {
        ctx.fillStyle = fillColor;
        ctx.fillRect(startX, startY, width, height);
    }
    
    ctx.strokeStyle = selectedColor;
    ctx.lineWidth = lineWidth;
    ctx.strokeRect(startX, startY, width, height);
}

function drawTriangle(e) {
    restoreState();
    
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.lineTo(startX - (e.offsetX - startX), e.offsetY);
    ctx.closePath();
    
    if (isFillMode) {
        ctx.fillStyle = fillColor;
        ctx.fill();
    }
    
    ctx.strokeStyle = selectedColor;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
}

function drawCircle(e) {
    restoreState();
    const radius = Math.sqrt(Math.pow(e.offsetX - startX, 2) + Math.pow(e.offsetY - startY, 2));
    
    ctx.beginPath();
    ctx.arc(startX, startY, radius, 0, Math.PI * 2);
    
    if (isFillMode) {
        ctx.fillStyle = fillColor;
        ctx.fill();
    }
    
    ctx.strokeStyle = selectedColor;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
}

// Event listeners
canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseout', stopDrawing);

// Initialize canvas with white background
initCanvas();
