const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const axios = require("axios");

const port = process.env.PORT || 4001;
const index = require("./routes/index");

const app = express();
app.use(index);

const server = http.createServer(app);
const io = socketIo(server);

const getApiAndEmit = async socket => {
    try {
        const res = await axios.get(
            "https://api.darksky.net/forecast/PUT_YOUR_API_KEY_HERE/43.7695,11.2558"
        ); // Getting the data from DarkSky
        // Emitting a new message. It will be consumed by the client
        socket.emit("FromAPI", res.data.currently.temperature); 
    } catch (error) {
        console.error(`Error: ${error.code}`);
    }
};

// io.on("connection", (socket) => {
//     console.log("New client connected"), setInterval(() => getApiAndEmit(socket),10000);
//     socket.on("disconnect", () => console.log("Client disconnected"));
// });

// more serious version would be clear the interval upon subsequent connections:
let interval;
io.on("connection", socket => {
    console.log("New client connected");
    if (interval) {
        clearInterval(interval);
    }
    interval = setInterval(() => getApiAndEmit(socket), 10000);
    socket.on("disconnect", () => {
        console.log("Client disconnected");
    });
});

server.listen(port, () => console.log(`Listening on port ${port}`));