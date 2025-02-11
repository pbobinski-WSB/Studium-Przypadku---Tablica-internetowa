const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let isDrawing = false;
let lastX = 0;
let lastY = 0;
let selectedTool = 'brush';
let selectedColor = '#000000';
let fillColor = '#ffffff';
let lineWidth = 5;
let isFillMode = false;
let startAngle = 0;
let startX = 0;
let startY = 0;

// Tool selection
document.getElementById('tool').addEventListener('change', (e) => {
    selectedTool = e.target.value;
});

// Color selection
document.getElementById('color').addEventListener('change', (e) => {
    selectedColor = e.target.value;
});

// Fill color selection
document.getElementById('fillColor').addEventListener('change', (e) => {
    fillColor = e.target.value;
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
    ctx.clearRect(0, 0, canvas.width, canvas.height);
});

// Drawing functions
function startDrawing(e) {
    isDrawing = true;
    [lastX, lastY] = [e.offsetX, e.offsetY];
    [startX, startY] = [e.offsetX, e.offsetY];
    
    if (selectedTool === 'protractor') {
        startAngle = Math.atan2(e.offsetY - startY, e.offsetX - startX);
    }
}

function draw(e) {
    if (!isDrawing) return;

    switch (selectedTool) {
        case 'brush':
            drawBrush(e);
            break;
        case 'spray':
            drawSpray(e);
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
        case 'circle':
            drawCircle(e);
            break;
        case 'protractor':
            drawProtractor(e);
            break;
    }
}

function stopDrawing() {
    if (!isDrawing) return;
    isDrawing = false;

    // Finalize shapes with fill if fill mode is on
    if (isFillMode) {
        ctx.fillStyle = fillColor;
        if (selectedTool === 'rectangle') {
            const width = lastX - startX;
            const height = lastY - startY;
            ctx.fillRect(startX, startY, width, height);
        } else if (selectedTool === 'circle') {
            const radius = Math.sqrt(Math.pow(lastX - startX, 2) + Math.pow(lastY - startY, 2));
            ctx.beginPath();
            ctx.arc(startX, startY, radius, 0, Math.PI * 2);
            ctx.fill();
        }
    }
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

function drawSpray(e) {
    const density = 50;
    ctx.fillStyle = selectedColor;
    for (let i = 0; i < density; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * lineWidth;
        const x = e.offsetX + radius * Math.cos(angle);
        const y = e.offsetY + radius * Math.sin(angle);
        ctx.beginPath();
        ctx.arc(x, y, 0.5, 0, Math.PI * 2);
        ctx.fill();
    }
}

function erase(e) {
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.stroke();
    [lastX, lastY] = [e.offsetX, e.offsetY];
}

function drawLine(e) {
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.strokeStyle = selectedColor;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
}

function drawRectangle(e) {
    const width = e.offsetX - startX;
    const height = e.offsetY - startY;
    
    // Clear the canvas and redraw
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.beginPath();
    ctx.strokeStyle = selectedColor;
    ctx.lineWidth = lineWidth;
    ctx.strokeRect(startX, startY, width, height);
    
    if (isFillMode) {
        ctx.fillStyle = fillColor;
        ctx.fillRect(startX, startY, width, height);
    }
}

function drawCircle(e) {
    const radius = Math.sqrt(Math.pow(e.offsetX - startX, 2) + Math.pow(e.offsetY - startY, 2));
    
    // Clear the canvas and redraw
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.beginPath();
    ctx.arc(startX, startY, radius, 0, Math.PI * 2);
    ctx.strokeStyle = selectedColor;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
    
    if (isFillMode) {
        ctx.fillStyle = fillColor;
        ctx.fill();
    }
}

function drawProtractor(e) {
    const currentAngle = Math.atan2(e.offsetY - startY, e.offsetX - startX);
    let angleDiff = (currentAngle - startAngle) * (180 / Math.PI);
    
    // Ensure angle is positive
    if (angleDiff < 0) {
        angleDiff += 360;
    }
    
    // Clear the canvas and redraw
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw the angle lines
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(startX + Math.cos(startAngle) * 100, startY + Math.sin(startAngle) * 100);
    ctx.moveTo(startX, startY);
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.strokeStyle = selectedColor;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
    
    // Draw the angle arc
    ctx.beginPath();
    ctx.arc(startX, startY, 30, startAngle, currentAngle);
    ctx.stroke();
    
    // Display the angle
    ctx.fillStyle = selectedColor;
    ctx.font = '16px Arial';
    ctx.fillText(`${Math.round(angleDiff)}°`, startX + 40, startY + 40);
}

// Event listeners
canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseout', stopDrawing);
