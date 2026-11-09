// 教材內容（純資料，沒有任何 DOM 程式碼）。想改題目或關卡，只要改這個檔案。
export const meta = {
  badge: "Scratch 風格",
  title: "角色移動與座標",
  goal: "學會用 x、y 座標指揮角色，走到終點！",
  learn: ["看懂 (x, y) 代表的位置", "x 管左右、y 管上下", "排出走到終點的路線"],
  minutes: 10,
};

const coordSvg = `
<svg viewBox="0 0 250 160" width="250" role="img" aria-label="座標方格：角色在 x 等於 2、y 等於 1 的位置">
  <rect x="30" y="10" width="160" height="120" fill="#fff" stroke="#c9c2ae" stroke-width="2"/>
  <g stroke="#e6e0d3"><line x1="70" y1="10" x2="70" y2="130"/><line x1="110" y1="10" x2="110" y2="130"/><line x1="150" y1="10" x2="150" y2="130"/><line x1="30" y1="50" x2="190" y2="50"/><line x1="30" y1="90" x2="190" y2="90"/></g>
  <rect x="110" y="50" width="40" height="40" fill="#fdebd3"/>
  <circle cx="130" cy="70" r="13" fill="#d9730d"/>
  <g font-size="13" fill="#56626b" text-anchor="middle" font-weight="700">
    <text x="50" y="148">0</text><text x="90" y="148">1</text><text x="130" y="148">2</text><text x="170" y="148">3</text>
    <text x="16" y="115">0</text><text x="16" y="75">1</text><text x="16" y="35">2</text>
  </g>
  <text x="200" y="75" font-size="15" font-weight="800" fill="#1e2a32">(2, 1)</text>
</svg>`;

export const concepts = [
  {
    title: "舞台就像一張方格紙",
    html: `<p>要說清楚角色站在哪裡，只要兩個數字：<strong>(x, y)</strong>。</p>
      ${coordSvg}
      <p>在這個遊戲裡，左下角是 <strong>(0, 0)</strong>。角色在 <strong>(2, 1)</strong>，就是「往右 2 格、往上 1 格」。</p>`,
  },
  {
    title: "x 管左右",
    html: `<p><strong>x</strong> 是左右的位置。</p>
      <div class="demo-row"><span class="demo-blk">→ x 增加 1</span> 往右走一格</div>
      <div class="demo-row"><span class="demo-blk">← x 減少 1</span> 往左走一格</div>
      <p>x 越大，角色越靠右。</p>`,
  },
  {
    title: "y 管上下",
    html: `<p><strong>y</strong> 是上下的位置。</p>
      <div class="demo-row"><span class="demo-blk">↑ y 增加 1</span> 往上走一格</div>
      <div class="demo-row"><span class="demo-blk">↓ y 減少 1</span> 往下走一格</div>
      <p>y 越大，角色越靠上。準備好了嗎？來幫角色找路！</p>`,
  },
];

export const challenges = [
  {
    title: "走到右邊的星星",
    task: "角色在 <strong>(0, 0)</strong>，星星在 <strong>(3, 0)</strong>。排出路線讓角色走過去。",
    hint: "星星在右邊，x 要增加幾次呢？",
    success: "答對了！x 增加 3 次，就從 0 走到 3。",
    size: [5, 3],
    start: [0, 0],
    goal: [3, 0],
    walls: [],
    allowed: ["xp", "xm"],
    maxBlocks: 8,
    solution: ["xp", "xp", "xp"],
  },
  {
    title: "又要往右、又要往上",
    task: "這次星星在 <strong>(2, 3)</strong>。x 和 y 都要改變，要用到上下左右的積木。",
    hint: "先想：x 要從 0 變成 2，y 要從 0 變成 3。",
    success: "太棒了！x 增加 2 次、y 增加 3 次。",
    size: [4, 4],
    start: [0, 0],
    goal: [2, 3],
    walls: [],
    allowed: ["xp", "xm", "yp", "ym"],
    maxBlocks: 10,
    solution: ["xp", "xp", "yp", "yp", "yp"],
  },
  {
    title: "繞過牆壁",
    task: "咖啡色的是牆，不能穿過去。從 <strong>(0, 0)</strong> 走到 <strong>(4, 3)</strong>，找一條路！",
    hint: "試試先往上走，等過了第一道牆再往右；遇到第二道牆就先往下繞過去。",
    success: "你找到路了！遇到阻礙時，換個方向思考就好。",
    size: [5, 4],
    start: [0, 0],
    goal: [4, 3],
    walls: [[1, 0], [1, 1], [3, 2], [3, 3]],
    allowed: ["xp", "xm", "yp", "ym"],
    maxBlocks: 12,
    solution: ["yp", "yp", "xp", "xp", "ym", "xp", "xp", "yp", "yp"],
  },
];
