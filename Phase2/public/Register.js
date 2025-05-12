document.addEventListener("DOMContentLoaded", () => {
  const registerBtn = document.getElementById("registerCourseBtn");
  const params = new URLSearchParams(window.location.search);
  const crn = params.get("crn");
  const errorMessage = document.getElementById("errorMessage");

  registerBtn.addEventListener("click", async () => {
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
    if (!loggedInUser) {
      showError("You must be logged in to register.");
      return;
    }

    try {
      const coursesRes = await fetch("/api/courses");
      const courses = await coursesRes.json();
      const course = courses.find(c => c.crn === crn);

      if (!course) return showError("Course not found.");

      const completedCRNs = (loggedInUser.completedCourses || []).map(obj => obj.crn);
      const completedCourseNos = new Set();
      courses.forEach(c => {
        if (completedCRNs.includes(c.crn)) {
          completedCourseNos.add(c.courseNo);
        }
      });

      if (!course.eligibleMajors.includes(loggedInUser.major)) {
        return showError("This course is not available for your major.");
      }

      if (course.gender !== loggedInUser.gender) {
        return showError("You cannot register for this section due to gender restriction.");
      }

      if (completedCourseNos.has(course.courseNo)) {
        return showError("You have already completed this course.");
      }

      const hasPrerequisites = (course.prerequisites || []).every(req =>
        completedCourseNos.has(req)
      );
      if (!hasPrerequisites) {
        return showError("You have not completed all prerequisites.");
      }

      if (course.enrolled >= course.maxCapacity) {
        return showError("No seats available for this course.");
      }

      if (course.status === "Closed") {
        return showError("This course is closed for registration.");
      }
      

      const alreadyRegistered = (loggedInUser.currentlyRegistered || []).some(
        entry => (typeof entry === "object" ? entry.crn : entry) === course.crn
      );
      if (alreadyRegistered) {
        return showError("You're already registered in this course.");
      }

      // Update local user object
      loggedInUser.currentlyRegistered = loggedInUser.currentlyRegistered || [];
      loggedInUser.currentlyRegistered.push(course.crn);

      // PUT request to update user in backend
      const userUpdateRes = await fetch(`/api/users/${loggedInUser.username}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentlyRegistered: loggedInUser.currentlyRegistered })
      });

      if (!userUpdateRes.ok) throw new Error("Failed to update user");

      // Update course enrollment on backend (optional)
      const courseUpdateRes = await fetch(`/api/courses/${course.crn}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enrolled: course.enrolled + 1 })
      });

      if (!courseUpdateRes.ok) throw new Error("Failed to update course");

      // Update localStorage to reflect updated user
      localStorage.setItem("loggedInUser", JSON.stringify(loggedInUser));

      showSuccess("✅ You have successfully registered. Awaiting admin approval.");
    } catch (err) {
      console.error("Registration failed:", err);
      showError("Something went wrong during registration.");
    }
  });

  function showError(message) {
    errorMessage.style.display = "block";
    errorMessage.style.color = "red";
    errorMessage.textContent = message;
  }

  function showSuccess(message) {
    errorMessage.style.display = "block";
    errorMessage.style.color = "green";
    errorMessage.textContent = message;
  }
});
