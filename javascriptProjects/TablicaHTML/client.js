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

// History for undo/redo
let history = [];
let currentStep = -1;
const maxHistory = 50;

// Create preview canvas
const previewCanvas = document.createElement('canvas');
previewCanvas.width = canvas.width;
previewCanvas.height = canvas.height;
previewCanvas.style.position = 'absolute';
previewCanvas.style.pointerEvents = 'none';
previewCanvas.style.left = '0';
previewCanvas.style.top = '0';
previewCanvas.style.zIndex = '1';
previewCanvas.style.borderRadius = '10px';
canvas.parentElement.appendChild(previewCanvas);
const previewCtx = previewCanvas.getContext('2d');

const toolSelector = document.getElementById('tool');
const colorPicker = document.getElementById('color');
const sizeInput = document.getElementById('size');
const clearButton = document.getElementById('clear');

let tool = 'brush';
let userColor = colorPicker.value;
let brushSize = parseInt(sizeInput.value, 10);
let drawing = false;
let lastX = 0;
let lastY = 0;
let startX, startY;
let fillShape = false;

// Save current state to history
function saveToHistory() {
    currentStep++;
    if (currentStep < history.length) {
        history.length = currentStep;
    }
    history.push(canvas.toDataURL());
    if (history.length > maxHistory) {
        history.shift();
        currentStep--;
    }
}

// Load image from history
function loadFromHistory(step) {
    if (step >= 0 && step < history.length) {
        const img = new Image();
        img.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
        };
        img.src = history[step];
    }
}

// Function to update cursor preview
function updatePreview(x, y) {
    previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
    
    previewCtx.strokeStyle = tool === 'eraser' ? '#000' : userColor;
    previewCtx.lineWidth = 1;
    
    if (tool === 'brush' || tool === 'spray' || tool === 'eraser') {
        previewCtx.beginPath();
        previewCtx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
        previewCtx.stroke();
    } else if (tool === 'line' && drawing) {
        previewCtx.beginPath();
        previewCtx.moveTo(startX, startY);
        previewCtx.lineTo(x, y);
        previewCtx.stroke();
    } else if (tool === 'rectangle' && drawing) {
        if (fillShape) {
            previewCtx.fillStyle = userColor;
            previewCtx.fillRect(startX, startY, x - startX, y - startY);
        } else {
            previewCtx.strokeRect(startX, startY, x - startX, y - startY);
        }
    } else if (tool === 'circle' && drawing) {
        const radius = Math.sqrt((x - startX) ** 2 + (y - startY) ** 2);
        previewCtx.beginPath();
        previewCtx.arc(startX, startY, radius, 0, Math.PI * 2);
        if (fillShape) {
            previewCtx.fillStyle = userColor;
            previewCtx.fill();
        } else {
            previewCtx.stroke();
        }
    }
}

// Set canvas container size
canvas.parentElement.style.width = canvas.width + 'px';
canvas.parentElement.style.height = canvas.height + 'px';

// Tool, color and size changes
toolSelector.addEventListener('change', (e) => tool = e.target.value);
colorPicker.addEventListener('change', (e) => userColor = e.target.value);
sizeInput.addEventListener('input', (e) => brushSize = parseInt(e.target.value, 10));

// Fill option
const fillCheckbox = document.getElementById('fill');
fillCheckbox.addEventListener('change', (e) => fillShape = e.target.checked);

// Undo/Redo buttons
document.getElementById('undo').addEventListener('click', () => {
    if (currentStep > 0) {
        currentStep--;
        loadFromHistory(currentStep);
        socket.send(JSON.stringify({ type: 'undo', step: currentStep }));
    }
});

document.getElementById('redo').addEventListener('click', () => {
    if (currentStep < history.length - 1) {
        currentStep++;
        loadFromHistory(currentStep);
        socket.send(JSON.stringify({ type: 'redo', step: currentStep }));
    }
});

// Save button
document.getElementById('save').addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = 'drawing.png';
    link.href = canvas.toDataURL();
    link.click();
});

// Load button and image loader
const imageLoader = document.getElementById('imageLoader');
document.getElementById('load').addEventListener('click', () => {
    imageLoader.click();
});

imageLoader.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                saveToHistory();
                socket.send(JSON.stringify({ 
                    type: 'load',
                    imageData: canvas.toDataURL()
                }));
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    }
});

// WebSocket handling
const socket = new WebSocket('ws://localhost:8080');

// Drawing on canvas
canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    startX = e.clientX - rect.left;
    startY = e.clientY - rect.top;
    drawing = true;

    if (tool === 'text') {
        const text = prompt("Wprowadź tekst:");
        if (text) {
            ctx.fillStyle = userColor;
            ctx.font = `${brushSize * 2}px Arial`;
            ctx.fillText(text, startX, startY);

            socket.send(JSON.stringify({
                type: 'draw',
                tool: 'text',
                x: startX,
                y: startY,
                color: userColor,
                size: brushSize,
                text
            }));
            saveToHistory();
        }
        drawing = false;
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
canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    updatePreview(x, y);
    
    if (!drawing || tool === 'text') return;

    if (tool === 'brush') {
        ctx.fillStyle = userColor;
        ctx.beginPath();
        ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
        ctx.fill();

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
canvas.addEventListener('mouseup', (e) => {
    if (!drawing) return;

    const rect = canvas.getBoundingClientRect();
    const endX = e.clientX - rect.left;
    const endY = e.clientY - rect.top;

    if (tool === 'line') {
        ctx.strokeStyle = userColor;
        ctx.lineWidth = brushSize;
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();

        socket.send(JSON.stringify({
            type: 'draw',
            tool: 'line',
            startX,
            startY,
            endX,
            endY,
            color: userColor,
            size: brushSize
        }));
    } else if (tool === 'rectangle') {
        ctx.strokeStyle = userColor;
        ctx.fillStyle = userColor;
        ctx.lineWidth = brushSize;
        
        if (fillShape) {
            ctx.fillRect(startX, startY, endX - startX, endY - startY);
        } else {
            ctx.strokeRect(startX, startY, endX - startX, endY - startY);
        }

        socket.send(JSON.stringify({
            type: 'draw',
            tool: 'rectangle',
            startX,
            startY,
            width: endX - startX,
            height: endY - startY,
            color: userColor,
            size: brushSize,
            fill: fillShape
        }));
    } else if (tool === 'circle') {
        const radius = Math.sqrt((endX - startX) ** 2 + (endY - startY) ** 2);
        ctx.strokeStyle = userColor;
        ctx.fillStyle = userColor;
        ctx.lineWidth = brushSize;
        ctx.beginPath();
        ctx.arc(startX, startY, radius, 0, Math.PI * 2);
        
        if (fillShape) {
            ctx.fill();
        } else {
            ctx.stroke();
        }

        socket.send(JSON.stringify({
            type: 'draw',
            tool: 'circle',
            startX,
            startY,
            radius,
            color: userColor,
            size: brushSize,
            fill: fillShape
        }));
    }

    saveToHistory();
    drawing = false;
});

// Clear canvas
clearButton.addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    socket.send(JSON.stringify({ type: 'clear' }));
    saveToHistory();
});

// Receiving data from server
socket.onmessage = (event) => {
    const data = JSON.parse(event.data);

    if (data.type === 'draw') {
        ctx.fillStyle = data.color || '#FFFFFF';
        ctx.strokeStyle = data.color;
        ctx.lineWidth = data.size;

        if (data.tool === 'brush') {
            ctx.beginPath();
            ctx.arc(data.x, data.y, data.size / 2, 0, Math.PI * 2);
            ctx.fill();
        } else if (data.tool === 'spray') {
            for (let i = 0; i < 20; i++) {
                const offsetX = (Math.random() - 0.5) * data.size;
                const offsetY = (Math.random() - 0.5) * data.size;
                ctx.fillRect(data.x + offsetX, data.y + offsetY, 1, 1);
            }
        } else if (data.tool === 'eraser') {
            ctx.beginPath();
            ctx.arc(data.x, data.y, data.size / 2, 0, Math.PI * 2);
            ctx.fill();
        } else if (data.tool === 'line') {
            ctx.beginPath();
            ctx.moveTo(data.startX, data.startY);
            ctx.lineTo(data.endX, data.endY);
            ctx.stroke();
        } else if (data.tool === 'rectangle') {
            if (data.fill) {
                ctx.fillRect(data.startX, data.startY, data.width, data.height);
            } else {
                ctx.strokeRect(data.startX, data.startY, data.width, data.height);
            }
        } else if (data.tool === 'circle') {
            ctx.beginPath();
            ctx.arc(data.startX, data.startY, data.radius, 0, Math.PI * 2);
            if (data.fill) {
                ctx.fill();
            } else {
                ctx.stroke();
            }
        } else if (data.tool === 'text') {
            ctx.font = `${data.size * 2}px Arial`;
            ctx.fillText(data.text, data.x, data.y);
        }
        saveToHistory();
    } else if (data.type === 'clear') {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        saveToHistory();
    } else if (data.type === 'undo') {
        currentStep = data.step;
        loadFromHistory(currentStep);
    } else if (data.type === 'redo') {
        currentStep = data.step;
        loadFromHistory(currentStep);
    } else if (data.type === 'load') {
        const img = new Image();
        img.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
            saveToHistory();
        };
        img.src = data.imageData;
    }
};

// Initialize history with empty canvas
saveToHistory();
