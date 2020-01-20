export function make_random_grid(start, end) {
  const copygrid = [];
  let counter = 0;
  for (let i = 0; i < 25; i++) {
    copygrid[i] = [];
    for (let j = 0; j < 35; j++) {
      var is_wall = Math.random() > 0.7;
      copygrid[i][j] = {
        name: counter,
        isWall: is_wall,
        isStart: counter === start,
        isEnd: counter === end,
        weight: 1,
        row: i,
        col: j
      };
      counter++;
    }
  }
  return copygrid;
}
