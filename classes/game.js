class Game {
  constructor() {
    this.table = [
      [-1, -1, -1],
      [-1, -1, -1],
      [-1, -1, -1],
    ];
    this.isPlayable = false;
    this.isFinished = false;
    this.turn = 0;
    this.winner = -1;
  }

  putX(x, y) {
    this.table[y][x] = 1;
  }

  putO(x, y) {
    this.table[y][x] = 2;
  }

  makePlayable() {
    this.isPlayable = true;
  }

  finish() {
    this.isFinished = true;
    this.isPlayable = false;
  }

  setTurn(t) {
    this.turn = t;
  }

  checkDraw(arr, search) {
    return arr.some((row) => row.includes(search));
  }

  checkWin() {
    let sign;
    let isWon = false;

    //check for horizontal lines
    for (let i = 0; i <= 2; i++) {
      sign = this.table[i][0];
      if (sign == -1) continue;
      for (let j = 1; j <= 2; j++) {
        if (this.table[i][j] != sign) break;
        if (j === 2) isWon = true;
      }
      if (isWon) break;
    }

    //check for vertical lines
    if (!isWon) {
      for (let i = 0; i <= 2; i++) {
        sign = this.table[0][i];
        if (sign == -1) continue;
        for (let j = 0; j <= 2; j++) {
          if (this.table[j][i] != sign) break;
          if (j === 2) isWon = true;
        }
        if (isWon) break;
      }
    }

    //check for diagonal lines
    if (!isWon) {
      sign = this.table[1][1];
      if (sign != -1 && this.table[0][0] == sign && this.table[2][2] == sign)
        isWon = true;
      if (sign != -1 && this.table[2][0] == sign && this.table[0][2] == sign)
        isWon = true;
    }

    if (isWon) {
      this.setWinner(sign);
      this.finish();
      return sign;
    }

    if (!isWon && !this.checkDraw(this.table, -1)) {
      this.setWinner(0);
      this.finish();
      return 0;
    }

    return -1;
  }

  setWinner(player) {
    // 0 - draw    1 - player1    2 - player2
    this.isFinished = true;
    this.winner = player;
  }
}

module.exports = Game;
