const express = require("express");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);
const path = require("path");
const Game = require("./classes/game.js");

const PORT = 3000 || process.env.PORT;

const rooms = {};

app.use(express.static(__dirname + "/public"));

app.use(express.json({ extended: true }));

app.post("/room/create", (req, res) => {
  const roomId = req.body.roomId;
  if (!roomId) res.json({ error: "No valid parameter for roomId" });
  const nick = req.body.nick;
  if (!nick) res.json({ error: "No valid parameter for nick" });

  if (rooms[roomId]) {
    const room = rooms[roomId];
    if (room.nicks.length >= 2) {
      res.json({ error: "Full room" });
    } else if (nick.localeCompare(room.nicks[0]) === 0) {
      res.json({ error: "This nickname is already in use!" });
    } else {
      room.nicks.push(nick);
      res.json({ success: true });
    }
  } else {
    rooms[roomId] = { nicks: [], players: [], game: new Game() };
    rooms[roomId].nicks.push(nick);
    res.json({ success: true });
  }
});

app.get("/room/:key", (req, res) => {
  const roomId = req.url.split("/").pop();

  if (rooms[roomId]) {
    if (rooms[roomId].players.length >= 2) {
      res.sendFile(path.join(__dirname, "/public/error/full.html"));
    }
    const { nicks } = rooms[roomId];
    if (nicks) {
      if (nicks.length > 2) {
        res.sendFile(path.join(__dirname, "/public/error/full.html"));
      } else if (rooms[roomId].players.length === 1 && nicks.length === 1) {
        res.sendFile(path.join(__dirname, "/public/error/nonick.html"));
      } else {
        res.sendFile(path.join(__dirname, "/public/room/game.html"));
      }
    } else {
      res.sendFile(path.join(__dirname, "/public/error/nonick.html"));
    }
  } else {
    res.sendFile(path.join(__dirname, "/public/error/noexist.html"));
  }
});

io.on("connection", (socket) => {
  console.log("Connection!");

  socket.on("join", (roomId) => {
    const { players } = rooms[roomId];
    if (players.length < 2) {
      players.push(socket);
      socket.join(roomId);
      if (rooms[roomId].nicks[players.length - 1]) {
        socket.emit("getMyNick", rooms[roomId].nicks[players.length - 1]);
      } else {
        socket.emit("error", "You do not have a nick");
      }
    } else {
      socket.emit("error", "The room is full");
    }
    if (players.length == 2) {
      rooms[roomId].game.makePlayable();
      io.to(roomId).emit(
        "getReady",
        rooms[roomId].nicks[0],
        rooms[roomId].nicks[1]
      );
    }
  });

  socket.on("askForMove", (roomId, nick, x, y) => {
    if (rooms[roomId].game.isPlayable) {
      let isConfirmed = false;
      coordX = +x;
      coordY = +y;
      const num = rooms[roomId].nicks.indexOf(nick);
      const game = rooms[roomId].game;
      if (num === 0 && game.turn === 0 && game.table[coordY][coordX] === -1) {
        isConfirmed = true;
        game.setTurn(1);
        game.putX(x, y);
        io.to(roomId).emit("confirmMove", x, y, "X");
      } else if (
        num === 1 &&
        game.turn === 1 &&
        game.table[coordY][coordX] === -1
      ) {
        isConfirmed = true;
        game.setTurn(0);
        game.putO(x, y);
        io.to(roomId).emit("confirmMove", x, y, "O");
      }

      if (isConfirmed) {
        const winNum = game.checkWin();
        if (winNum === 1) {
          io.to(roomId).emit("win", 1);
        } else if (winNum === 2) {
          io.to(roomId).emit("win", 2);
        } else if (winNum === 0) {
          io.to(roomId).emit("draw");
        }
      }
    }
  });

  socket.on("disconnecting", async () => {
    console.log("Disconnection!");
    const roomId = Array.from(socket.rooms.values()).pop() || "";
    socket.leave(roomId);
    const { players } = rooms[roomId] || {};
    const { nicks } = rooms[roomId] || {};
    if (nicks?.length > 1) {
      const nickNo = rooms[roomId].players.indexOf(socket);
      rooms[roomId].nicks = players.filter((nick, ind) => ind !== nickNo);
    } else {
      delete rooms[roomId];
    }
    if (rooms[roomId]) {
      if (players?.length > 1) {
        rooms[roomId].players = players.filter(
          (player) => player.id !== socket.id
        );
      } else {
        delete rooms[roomId];
      }
    }

    if (rooms[roomId]?.players.length == 1 && rooms[roomId].game.isPlayable) {
      rooms[roomId].game.setWinner(0);
      io.to(roomId).emit("draw");
    }
  });
});

server.listen(PORT);
