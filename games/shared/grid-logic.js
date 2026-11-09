// 方格移動遊戲的「純邏輯」：不碰 DOM，所以瀏覽器和 tools/check.mjs 都能用同一份來驗證關卡。
export const CMD = {
  xp: { label: "x 增加 1", icon: "→", dx: 1, dy: 0 },
  xm: { label: "x 減少 1", icon: "←", dx: -1, dy: 0 },
  yp: { label: "y 增加 1", icon: "↑", dx: 0, dy: 1 },
  ym: { label: "y 減少 1", icon: "↓", dx: 0, dy: -1 },
};

/**
 * 模擬一段程式。座標原點在左下角 (0,0)，x 往右、y 往上。
 * 回傳 { ok, reason: "goal" | "short" | "wall" | "edge", path, failAt?, end? }
 */
export function simulate(level, program) {
  let [x, y] = level.start;
  const [w, hh] = level.size;
  const walls = new Set((level.walls || []).map((p) => p.join(",")));
  const path = [[x, y]];
  for (let k = 0; k < program.length; k++) {
    const c = CMD[program[k]];
    const nx = x + c.dx;
    const ny = y + c.dy;
    if (nx < 0 || ny < 0 || nx >= w || ny >= hh) return { ok: false, reason: "edge", failAt: k, path };
    if (walls.has(`${nx},${ny}`)) return { ok: false, reason: "wall", failAt: k, path };
    x = nx;
    y = ny;
    path.push([x, y]);
  }
  const reached = x === level.goal[0] && y === level.goal[1];
  return { ok: reached, reason: reached ? "goal" : "short", path, end: [x, y] };
}

/** 廣度優先搜尋最短路線長度（驗證關卡一定有解；找不到回傳 -1） */
export function shortestLength(level, allowed = Object.keys(CMD)) {
  const key = (p) => p.join(",");
  const queue = [[level.start, 0]];
  const seen = new Set([key(level.start)]);
  while (queue.length) {
    const [pos, d] = queue.shift();
    if (pos[0] === level.goal[0] && pos[1] === level.goal[1]) return d;
    for (const name of allowed) {
      const step = simulate({ ...level, start: pos }, [name]);
      if (step.reason === "wall" || step.reason === "edge") continue;
      const next = step.path[1];
      if (!seen.has(key(next))) {
        seen.add(key(next));
        queue.push([next, d + 1]);
      }
    }
  }
  return -1;
}
