const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Create preview canvas
const previewCanvas = document.createElement('canvas');
previewCanvas.width = canvas.width;
previewCanvas.height = canvas.height;
previewCanvas.style.position = 'absolute';
previewCanvas.style.pointerEvents = 'none';
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

// Function to update cursor preview
function updatePreview(x, y) {
    previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
    
    if (tool === 'brush' || tool === 'spray' || tool === 'eraser') {
        previewCtx.beginPath();
        previewCtx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
        previewCtx.strokeStyle = tool === 'eraser' ? '#000' : userColor;
        previewCtx.stroke();
    }
}

// Update preview canvas position
function updatePreviewPosition() {
    const rect = canvas.getBoundingClientRect();
    previewCanvas.style.left = rect.left + 'px';
    previewCanvas.style.top = rect.top + 'px';
}

// Initial position update
updatePreviewPosition();
window.addEventListener('resize', updatePreviewPosition);

// Zmiana narzędzi, koloru i rozmiaru
toolSelector.addEventListener('change', (e) => tool = e.target.value);
colorPicker.addEventListener('change', (e) => userColor = e.target.value);
sizeInput.addEventListener('input', (e) => brushSize = parseInt(e.target.value, 10));

// Obsługa WebSocket
const socket = new WebSocket('ws://localhost:8080');

// Rysowanie na płótnie
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
        }
        drawing = false;
    }
});

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    lastX = e.clientX - rect.left;
    lastY = e.clientY - rect.top;
    
    updatePreview(lastX, lastY);
    
    if (!drawing || tool === 'text') return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (tool === 'brush') {
        ctx.fillStyle = userColor;
        ctx.beginPath();
        ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
        ctx.fill();

        socket.send(JSON.stringify({
            type: 'draw',
            tool: 'brush',
            x,
            y,
            color: userColor,
            size: brushSize
        }));
    } else if (tool === 'spray') {
        for (let i = 0; i < 20; i++) {
            const offsetX = (Math.random() - 0.5) * brushSize;
            const offsetY = (Math.random() - 0.5) * brushSize;
            ctx.fillStyle = userColor;
            ctx.fillRect(x + offsetX, y + offsetY, 1, 1);
        }

        socket.send(JSON.stringify({
            type: 'draw',
            tool: 'spray',
            x,
            y,
            color: userColor,
            size: brushSize
        }));
    } else if (tool === 'eraser') {
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
        ctx.fill();

        socket.send(JSON.stringify({
            type: 'draw',
            tool: 'eraser',
            x,
            y,
            size: brushSize
        }));
    }
});

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
        ctx.lineWidth = brushSize;
        ctx.strokeRect(startX, startY, endX - startX, endY - startY);

        socket.send(JSON.stringify({
            type: 'draw',
            tool: 'rectangle',
            startX,
            startY,
            width: endX - startX,
            height: endY - startY,
            color: userColor,
            size: brushSize
        }));
    } else if (tool === 'circle') {
        const radius = Math.sqrt((endX - startX) ** 2 + (endY - startY) ** 2);
        ctx.strokeStyle = userColor;
        ctx.lineWidth = brushSize;
        ctx.beginPath();
        ctx.arc(startX, startY, radius, 0, Math.PI * 2);
        ctx.stroke();

        socket.send(JSON.stringify({
            type: 'draw',
            tool: 'circle',
            startX,
            startY,
            radius,
            color: userColor,
            size: brushSize
        }));
    }

    drawing = false;
});

// Wyczyść płótno
clearButton.addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    socket.send(JSON.stringify({ type: 'clear' }));
});

// Odbieranie danych od serwera
socket.onmessage = (event) => {
    const data = JSON.parse(event.data);

    if (data.type === 'draw') {
        ctx.fillStyle = data.color || '#FFFFFF';
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
            ctx.strokeStyle = data.color;
            ctx.beginPath();
            ctx.moveTo(data.startX, data.startY);
            ctx.lineTo(data.endX, data.endY);
            ctx.stroke();
        } else if (data.tool === 'rectangle') {
            ctx.strokeStyle = data.color;
            ctx.strokeRect(data.startX, data.startY, data.width, data.height);
        } else if (data.tool === 'circle') {
            ctx.strokeStyle = data.color;
            ctx.beginPath();
            ctx.arc(data.startX, data.startY, data.radius, 0, Math.PI * 2);
            ctx.stroke();
        } else if (data.tool === 'text') {
            ctx.fillStyle = data.color;
            ctx.font = `${data.size * 2}px Arial`;
            ctx.fillText(data.text, data.x, data.y);
        }
    } else if (data.type === 'clear') {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
};
