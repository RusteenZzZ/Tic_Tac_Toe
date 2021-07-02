const socket = io();

let myNick;

const pl1 = document.getElementById("player1");
const pl2 = document.getElementById("player2");

const roomId = window.location.pathname.split("/").pop();

socket.emit("join", roomId);

socket.on("getMyNick", (nickFromServer) => {
  myNick = nickFromServer;
  pl1.innerHTML = `${myNick}`;
});

socket.on("getReady", (nick1, nick2) => {
  if (myNick.localeCompare(nick1) !== 0) myNick = nick2;

  pl1.innerHTML = `${nick1}`;

  pl2.innerHTML = `${nick2}`;
});

socket.on("confirmMove", (x, y, sign) => {
  const tyle = document.querySelectorAll(`[x='${x}']`)[+y];
  tyle.innerHTML = sign;
});

socket.on("draw", () => {
  console.log("draw");

  pl1.innerHTML = `${pl1.innerHTML}<br>draw`;
  pl2.innerHTML = `${pl2.innerHTML}<br>draw`;
});

socket.on("win", (player) => {
  if (player === 1) {
    pl1.innerHTML = `${pl1.innerHTML}<br>Winner!!!`;
  } else if (player === 2) {
    pl2.innerHTML = `${pl2.innerHTML}<br>Winner!!!`;
  }
});

const cols = document.getElementsByClassName("col");

for (let i = 0; i < cols.length; i++) {
  cols[i].addEventListener("click", (e) => {
    const x = e.target.getAttribute("x");
    const y = e.target.getAttribute("y");
    socket.emit("askForMove", roomId, myNick, x, y);
  });
}
