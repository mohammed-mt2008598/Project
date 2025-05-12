document.addEventListener("DOMContentLoaded", () => {

  function inlineMsg(card, text, type = "success") {
    let box = card.querySelector(".inline-msg");
    if (!box) {
      box = document.createElement("div");
      box.className = "inline-msg";
      card.appendChild(box);
    }
    box.textContent = text;
    box.className = `inline-msg ${type}`;
  }

  document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.removeItem("loggedInUser");
    window.location.href = "Login.html";
  });

  fetch("/api/courses")
    .then(r => r.json())
    .then(displayGroupedCourses)
    .catch(err => console.error("Error loading courses:", err));

  function displayGroupedCourses(courses) {
    const container = document.getElementById("coursesContainer");
    container.innerHTML = "";
    const grouped = {};

    courses.forEach(c => {
      if (!grouped[c.courseNo]) {
        grouped[c.courseNo] = { name: c.name, category: c.category, sections: [] };
      }
      grouped[c.courseNo].sections.push(c);
    });

    Object.values(grouped).forEach(group => {
      const block = document.createElement("div");
      block.className = "course-group";
      block.innerHTML = `
        <h2>${group.name}
            <span class="category-tag">(${group.category})</span>
        </h2>`;

      group.sections.forEach(sec => {
        const card = document.createElement("div");
        card.className = `course-card status-${sec.status.toLowerCase()}`;
        card.dataset.crn = sec.crn;

        card.innerHTML = `
          <p><strong>Section:</strong> ${sec.section}</p>
          <p><strong>CRN:</strong> ${sec.crn}</p>
          <p><strong>Instructor:</strong> ${sec.instructor}</p>
          <p><strong>Enrolled:</strong> ${sec.enrolled}/${sec.maxCapacity}</p>
          <p class="status-text"><strong>Status:</strong> ${sec.status}</p>
          <div class="admin-buttons"></div>
        `;

        const btnContainer = card.querySelector(".admin-buttons");

        if (sec.status === "Open") {
          btnContainer.innerHTML = `
            <button class="validate-btn">Validate</button>
            <button class="cancel-btn cancel">Cancel</button>
          `;
          card.querySelector(".validate-btn").onclick = () => validateCourse(sec, card);
          card.querySelector(".cancel-btn").onclick = () => cancelCourse(sec.crn, card);
        } else {
          btnContainer.innerHTML = `
            <button class="open-btn">Open</button>
          `;
          card.querySelector(".open-btn").onclick = () => reopenCourse(sec.crn, card);
        }

        block.appendChild(card);
      });

      container.appendChild(block);
    });
  }

  function validateCourse(sec, card) {
    if (sec.enrolled >= 5) {
      fetch(`/api/courses/${sec.crn}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Validated" })
      })
        .then(res => {
          if (!res.ok) throw new Error("Failed to validate course");
          card.classList.add("status-validated");
          card.querySelector(".status-text").innerHTML =
            "<strong>Status:</strong> Validated";

          const btnContainer = card.querySelector(".admin-buttons");
          btnContainer.innerHTML = `<button class="open-btn">Open</button>`;
          btnContainer.querySelector(".open-btn").onclick = () => reopenCourse(sec.crn, card);

          inlineMsg(card, `✅ Course ${sec.crn} validated.`, "success");
        })
        .catch(err => {
          console.error(err);
          inlineMsg(card, `❌ Server error while validating course.`, "error");
        });
    } else {
      inlineMsg(card, `❌ Not enough registrations to validate course ${sec.crn}.`, "error");
    }
  }

  function cancelCourse(crn, card) {
    fetch(`/api/courses/${crn}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "Closed" })
    })
      .then(res => {
        if (!res.ok) throw new Error("Failed to cancel course");

        card.classList.remove("status-open", "status-inprogress", "status-validated");
        card.classList.add("status-closed");

        card.querySelector(".status-text").innerHTML =
          "<strong>Status:</strong> Closed";

        const btnContainer = card.querySelector(".admin-buttons");
        btnContainer.innerHTML = `<button class="open-btn">Open</button>`;
        btnContainer.querySelector(".open-btn").onclick = () => reopenCourse(crn, card);

        inlineMsg(card, `⛔ Course ${crn} has been marked as closed.`, "error");
      })
      .catch(err => {
        console.error(err);
        inlineMsg(card, `❌ Server error while cancelling course.`, "error");
      });
  }

  function reopenCourse(crn, card) {
    fetch(`/api/courses/${crn}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "Open" })
    })
      .then(res => {
        if (!res.ok) throw new Error("Failed to reopen course");

        card.classList.remove("status-closed", "status-validated");
        card.classList.add("status-open");

        card.querySelector(".status-text").innerHTML =
          "<strong>Status:</strong> Open";

        const btnContainer = card.querySelector(".admin-buttons");
        btnContainer.innerHTML = `
          <button class="validate-btn">Validate</button>
          <button class="cancel-btn cancel">Cancel</button>
        `;
        btnContainer.querySelector(".validate-btn").onclick = () => validateCourse({ crn }, card);
        btnContainer.querySelector(".cancel-btn").onclick = () => cancelCourse(crn, card);

        inlineMsg(card, `🔄 Course ${crn} is now open for registration.`, "success");
      })
      .catch(err => {
        console.error(err);
        inlineMsg(card, `❌ Server error while reopening course.`, "error");
      });
  }
});
