const createRoom = document.getElementById("createRoom");

const nickname = document.getElementById("nickname");
const key = document.getElementById("join");

joinRoom.addEventListener("submit", (e) => {
  e.preventDefault();

  const nicknameValue = nickname.value;
  const keyValue = key.value;

  const checkNick = nicknameValue.trim();
  const checkKey = keyValue.trim();

  if (checkNick.length == 0) {
    alert("Please, type your nickname!");
  } else if (checkKey.length == 0) {
    alert("Please, type the room key!");
  } else {
    fetch("/room/create", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ roomId: checkKey, nick: checkNick }),
    })
      .then((res) => res.json())
      .then((res) => {
        const { error, success } = res;
        if (error) {
          alert(error);
        } else if (success) {
          window.location.href = `/room/${checkKey}`;
        }
      });
  }
});
