import { initPage, boot } from "../ui.js";
import { getTeachers } from "../data.js";
import { teacherCard, emptyState } from "../render.js";

initPage({ active: "teachers", title: "教師" });

boot(async () => {
  const teachers = await getTeachers();
  document.getElementById("main").innerHTML = `
    <h1>認識老師</h1>
    <p class="lead">每位老師都經過審核，並且是教材的作者或使用者。不公開聯絡方式，預約一律透過表單。</p>
    <div class="grid" style="margin-top:24px">${
      teachers.length ? teachers.map(teacherCard).join("") : emptyState("老師陸續加入中")
    }</div>`;
});
