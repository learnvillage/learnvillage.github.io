// 純文字頁面（關於、條款）共用：只需要導覽列與頁尾
import { initPage } from "../ui.js";

const file = location.pathname.split("/").pop();
initPage({ active: file === "about.html" ? "about" : "", title: document.title.split("｜")[0] });
