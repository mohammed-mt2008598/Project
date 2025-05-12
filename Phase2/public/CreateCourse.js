document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.removeItem("loggedInUser");
    window.location.href = "Login.html";
  });

  const form = document.getElementById("courseForm");
  const errorBox = document.getElementById("errorMessage");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const prerequisitesRaw  = document.getElementById("prerequisites").value.trim();
    const eligibleMajorsRaw = document.getElementById("eligibleMajors").value.trim();

    const courseNo = document.getElementById("courseNo").value.trim();
    const gender = document.getElementById("gender").value;

    try {
      // Fetch existing courses
      const res = await fetch("/api/courses");
      const existingCourses = await res.json();

      // Generate unique CRN
      const usedCrns = new Set(existingCourses.map(c => parseInt(c.crn)));
      let newCrn = 10000;
      while (usedCrns.has(newCrn)) newCrn++;

      // Generate next available section (L01, L02, ...)
      const sameCourseSections = existingCourses
      .filter(c => c.courseNo === courseNo)
      .map(c => c.section);
    

      let nextSection = "L01";
      let index = 1;
      while (sameCourseSections.includes(`L${String(index).padStart(2, '0')}`)) {
        index++;
        nextSection = `L${String(index).padStart(2, '0')}`;
      }

      const newCourse = {
        courseNo,
        name:       document.getElementById("courseName").value.trim(),
        category:   document.getElementById("category").value.trim(),
        instructor: document.getElementById("instructor").value.trim(),
        gender,
        section:    nextSection,
        crn:        String(newCrn),
        status:     document.getElementById("status").value,
        maxCapacity: parseInt(document.getElementById("maxCapacity").value, 10),
        enrolled:   0,
        schedule:   document.getElementById("schedule").value.trim(),
        prerequisites:  prerequisitesRaw  ? prerequisitesRaw.split(",").map(s => s.trim()) : [],
        eligibleMajors: eligibleMajorsRaw ? eligibleMajorsRaw.split(",").map(s => s.trim()) : []
      };

      const response = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCourse)
      });

      if (!response.ok) throw new Error("Failed to create course.");

      errorBox.style.color = "green";
      errorBox.textContent = `✅ Course "${newCourse.name}" (CRN: ${newCrn}, Section: ${nextSection}) created!`;
      form.reset();

      setTimeout(() => {
        window.location.href = "AdminDashboard.html";
      }, 1500);
    } catch (err) {
      console.error(err);
      errorBox.style.color = "red";
      errorBox.textContent = "❌ Could not create course. Please try again.";
    }
  });
});
