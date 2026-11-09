// 教材內容（純資料）。想改題目，只要改這個檔案。
export const meta = {
  badge: "Python 入門",
  title: "變數與 print",
  goal: "認識變數，並且猜得出 print 會印出什麼。",
  learn: ["變數是貼了名字的盒子", "print() 可以把結果印出來", "能預測簡單程式的輸出"],
  minutes: 10,
};

export const concepts = [
  {
    title: "變數：貼了名字的盒子",
    html: `<p>變數就像一個<strong>貼了名字的盒子</strong>，可以把資料放進去，之後用名字就能找到它。</p>
      <pre class="q-code"><code>age = 10</code></pre>
      <p>這行的意思是：做一個叫 <strong>age</strong> 的盒子，把 <strong>10</strong> 放進去。</p>`,
  },
  {
    title: "print：讓電腦說話",
    html: `<p><strong>print()</strong> 會把括號裡的東西顯示在螢幕上。</p>
      <pre class="q-code"><code>print("Hello")</code></pre>
      <p>文字要用<strong>引號</strong>包起來；變數的名字則<strong>不用</strong>引號，電腦會打開盒子，印出裡面的東西。</p>`,
  },
  {
    title: "盒子裡的東西可以換",
    html: `<p>變數裡的值可以隨時改變。</p>
      <pre class="q-code"><code>score = 10
score = score + 5
print(score)</code></pre>
      <p>第二行的意思是：把 score 裡的 10 拿出來加 5，再放回 score。現在盒子裡是 <strong>15</strong>。</p>`,
  },
];

export const challenges = [
  {
    title: "預測輸出（一）",
    type: "choice",
    task: "看程式，猜猜螢幕會印出什麼。",
    prompt: "這段程式會印出什麼？",
    code: "age = 10\nprint(age)",
    hint: "print(age) 的 age 沒有引號，電腦會打開叫 age 的盒子。",
    options: ["age", "10", "\"age\"", "會出錯"],
    answer: 1,
    explain: "age 是變數，裡面放著 10，所以印出 10。",
  },
  {
    title: "預測輸出（二）",
    type: "choice",
    task: "print 可以一次印出好幾個東西。",
    prompt: "這段程式會印出什麼？",
    code: "name = \"Mia\"\nprint(\"Hello\", name)",
    hint: "\"Hello\" 有引號，是文字；name 沒有引號，是變數。print 會在兩個東西中間加一個空格。",
    options: ["Hello name", "Hello Mia", "\"Hello\" \"Mia\"", "HelloMia"],
    answer: 1,
    explain: "文字照原樣印出，變數換成裡面的值，中間用空格隔開。",
  },
  {
    title: "盒子裡的值變了",
    type: "choice",
    task: "變數的值會被後面的程式改掉。",
    prompt: "最後會印出什麼？",
    code: "score = 10\nscore = score + 5\nprint(score)",
    hint: "第二行會把 score 變成「原本的值加 5」。",
    options: ["10", "5", "15", "score + 5"],
    answer: 2,
    explain: "10 + 5 = 15，新的值 15 放回 score 裡。",
  },
  {
    title: "填空：讓電腦說 Hello",
    type: "choice",
    task: "想讓電腦把 Hello 印在螢幕上，空格要填什麼？",
    prompt: "選出能放進 ___ 的字：",
    code: "___(\"Hello\")",
    hint: "上一頁剛學過，負責「讓電腦說話」的是哪個？",
    options: ["print", "say", "show", "write"],
    answer: 0,
    explain: "在 Python 裡，把東西印出來用的是 print()。",
  },
];
