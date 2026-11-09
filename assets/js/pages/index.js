import { initPage, boot } from "../ui.js";
import { getMaterials, getTeachers, getCourses } from "../data.js";
import { materialCard, teacherCard, courseCard, emptyState } from "../render.js";

initPage({ active: "home" });

boot(async () => {
  const [materials, teachers, courses] = await Promise.all([getMaterials(), getTeachers(), getCourses()]);
  const byId = (list, id) => list.find((x) => x.id === id);

  document.getElementById("featured").innerHTML = materials.length
    ? materials.slice(0, 3).map((m) => materialCard(m, byId(teachers, m.author_id))).join("")
    : emptyState("教材準備中，很快就來！");

  document.getElementById("teachers").innerHTML = teachers.length
    ? teachers.slice(0, 3).map(teacherCard).join("")
    : emptyState("老師陸續加入中");

  document.getElementById("courses").innerHTML = courses.length
    ? courses.slice(0, 3).map((c) => courseCard(c, byId(teachers, c.teacher_id))).join("")
    : emptyState("課程準備中");
});
