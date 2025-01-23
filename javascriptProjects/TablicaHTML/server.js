const WebSocket = require('ws');
const server = new WebSocket.Server({ port: 8080 });

let state = [];

server.on('connection', (socket) => {
    // Wyślij aktualny stan tablicy do nowego klienta
    state.forEach((action) => socket.send(JSON.stringify(action)));

    socket.on('message', (message) => {
        const data = JSON.parse(message);

        if (data.type === 'draw') {
            state.push(data);
            server.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify(data));
                }
            });
        } else if (data.type === 'clear') {
            state = [];
            server.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({ type: 'clear' }));
                }
            });
        }
    });
});
