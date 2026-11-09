import { initPage, boot } from "../ui.js";
import { getCourses, getTeachers } from "../data.js";
import { courseCard, emptyState } from "../render.js";

initPage({ active: "courses", title: "體驗課程" });

boot(async () => {
  const [courses, teachers] = await Promise.all([getCourses(), getTeachers()]);
  document.getElementById("main").innerHTML = `
    <h1>體驗課程</h1>
    <p class="lead">一堂 60 分鐘的線上體驗課，由老師陪著孩子玩、學、做。先體驗，覺得合適再決定。</p>
    <div class="grid" style="margin-top:24px">${
      courses.length
        ? courses.map((c) => courseCard(c, teachers.find((t) => t.id === c.teacher_id))).join("")
        : emptyState("課程準備中")
    }</div>`;
});
