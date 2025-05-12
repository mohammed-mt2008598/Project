document.addEventListener("DOMContentLoaded", () => {
  const instructor = JSON.parse(localStorage.getItem("loggedInUser"));
  if (!instructor || instructor.role !== "instructor") {
    window.location.href = "Login.html";
    return;
  }

  Promise.all([
    fetch("/api/courses").then(res => res.json()),
    fetch("/api/users").then(res => res.json())
  ])
    .then(([courses, users]) => {
      const myCourses   = courses.filter(c => c.instructor === instructor.name);
      const allStudents = users.filter(u => u.role === "student");
      displayMyClasses(myCourses, allStudents);
    })
    .catch(err => console.error("Error loading data", err));

  function displayMyClasses(courses, students) {
    const container = document.getElementById("classesContainer");
    container.innerHTML = "";

    courses.forEach(course => {
      // ✅ FIX: works for both string and object in currentlyRegistered
      const enrolled = students.filter(s =>
        s.currentlyRegistered?.some(reg =>
          typeof reg === "string" ? reg === course.crn : reg.crn === course.crn
        )
      );

      const section = document.createElement("div");
      section.className = "class-section";

      section.innerHTML = `
        <h2>${course.name} (${course.section})</h2>
        <table>
          <tr>
            <th>Student</th>
            <th>Grade</th>
            <th>Submit</th>
          </tr>
          ${
            enrolled.length
              ? enrolled.map(stu => `
                  <tr id="row-${course.crn}-${stu.username}">
                    <td>${stu.name}</td>
                    <td>
                      <input type="text"
                             id="grade-${course.crn}-${stu.username}"
                             placeholder="e.g. A" />
                    </td>
                    <td>
                      <button onclick="submitGrade('${stu.username}','${course.crn}')">
                        Save
                      </button>
                      <div class="msg-box" id="msg-${course.crn}-${stu.username}"></div>
                    </td>
                  </tr>
                `).join("")
              : `<tr><td colspan="3" style="text-align:center;">No students registered.</td></tr>`
          }
        </table>
      `;
      container.appendChild(section);
    });
  }

  window.submitGrade = (username, crn) => {
    const input = document.getElementById(`grade-${crn}-${username}`);
    const msgBox = document.getElementById(`msg-${crn}-${username}`);
    const grade = input.value.trim().toUpperCase();

    const showMessage = (message, success = true) => {
      msgBox.textContent = message;
      msgBox.style.color = success ? "green" : "red";
    };

    if (!["A", "B", "C", "D", "F"].includes(grade)) {
      showMessage("❌ Invalid grade. Please enter A, B, C, D, or F.", false);
      return;
    }

    fetch(`/api/users/${username}`)
      .then(res => {
        if (!res.ok) throw new Error("User not found");
        return res.json();
      })
      .then(user => {
        // Remove the course from currentlyRegistered
        user.currentlyRegistered = user.currentlyRegistered.filter(c =>
          (typeof c === "object" ? c.crn : c) !== crn
        );

        // Add the course to completedCourses
        user.completedCourses = user.completedCourses || [];
        user.completedCourses.push({ crn, grade });

        // Save updated user with PUT
        return fetch(`/api/users/${username}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            currentlyRegistered: user.currentlyRegistered,
            completedCourses: user.completedCourses
          })
        });
      })
      .then(res => {
        if (!res.ok) throw new Error("Failed to save grade");
        showMessage(`✅ Grade ${grade} saved.`);
        setTimeout(() => {
          document.getElementById(`row-${crn}-${username}`).remove();
        }, 1000);
      })
      .catch(err => {
        console.error("Failed to update user grade:", err);
        showMessage("❌ Could not save grade. Try again.", false);
      });
  };
});

document.getElementById("logoutbutton").addEventListener("click", () => {
  localStorage.removeItem("loggedInUser");
  window.location.href = "Login.html";
});
