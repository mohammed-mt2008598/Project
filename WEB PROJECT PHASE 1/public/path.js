document.addEventListener("DOMContentLoaded", () => {
  const stored = localStorage.getItem("loggedInUser");
  if (!stored) {
    window.location.href = "Login.html";
    return;
  }
  const user = JSON.parse(stored);

  document.getElementById("studentName").textContent  = user.name;
  document.getElementById("studentId").textContent    = user.username; 
  document.getElementById("studentMajor").textContent = user.major;

  const completedUL   = document.getElementById("completedList");
  const inProgressUL  = document.getElementById("inProgressList");
  const pendingUL     = document.getElementById("pendingList");


  fetch("/api/courses")
    .then(r => r.json())
    .then(courses => {
      const crnToCourse = Object.fromEntries(courses.map(c => [c.crn, c]));

      const completedCRNs = (user.completedCourses || []).map(o => o.crn);
      const registeredCRNs = (user.currentlyRegistered || []).map(o =>
        typeof o === "string" ? o : o.crn
      );

      const completedCourseNos = new Set(
        completedCRNs
          .map(crn => crnToCourse[crn]?.courseNo)
          .filter(Boolean)
      );

      (user.completedCourses || []).forEach(({ crn, grade }) => {
        const course = crnToCourse[crn];
        if (!course) return;
        completedUL.insertAdjacentHTML(
          "beforeend",
          `<li>${course.name} – Grade: ${grade}</li>`
        );
      });

      registeredCRNs.forEach(crn => {
        const course = crnToCourse[crn];
        if (!course) return;
        inProgressUL.insertAdjacentHTML(
          "beforeend",
          `<li>${course.name} (${course.section})</li>`
        );
      });

      courses.forEach(course => {
        if (
          completedCRNs.includes(course.crn) ||
          registeredCRNs.includes(course.crn)
        )
          return;

        if (course.status !== "Open") return;
        const genderOK = course.gender === user.gender;
        const majorOK =
          !course.eligibleMajors || course.eligibleMajors.includes(user.major);
        if (!genderOK || !majorOK) return;
        const prereqOK = (course.prerequisites || []).every(p =>
          completedCourseNos.has(p)
        );
        if (!prereqOK) return;

        pendingUL.insertAdjacentHTML(
          "beforeend",
          `<li>${course.name} (${course.section})</li>`
        );
      });
    })
    .catch(err => console.error("Error fetching courses:", err));

  document
    .getElementById("logoutbutton")
    .addEventListener("click", () => {
      localStorage.removeItem("loggedInUser");
      window.location.href = "Login.html";
    });
});
