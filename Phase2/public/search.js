const coursesUrl = '/api/courses';
const tableEntries = document.querySelector('#tableEntries');
const searchBox = document.querySelector('#searchbox');
const logoutButton = document.querySelector('#logoutbutton');
let courses = [];

const studentButtons = document.getElementById("studentButtons");
const adminButtons = document.getElementById("adminButtons");
const instructorButtons = document.getElementById("instructorButtons");


const storedUserString = localStorage.getItem("loggedInUser");
let currentUser = null;
if (storedUserString) {
  currentUser = JSON.parse(storedUserString);
  console.log("Currently logged in user:", currentUser);
} else {
  window.location.href = "Login.html";
}

if (currentUser && currentUser.role === "student" && studentButtons) {
  studentButtons.style.display = "inline-block";
} else if (currentUser && currentUser.role === "admin" && adminButtons) {
  adminButtons.style.display = "inline-block";
} else if (currentUser && currentUser.role === "instructor" && instructorButtons) {
  instructorButtons.style.display = "inline-block";
}

if (courses.length === 0) {
  fetchCourses();
} else {
  displayCourses(courses);
}

async function fetchCourses() {
  try {
    const response = await fetch(coursesUrl);
    const data = await response.json();
    courses = data;
    displayCourses(courses);
  } catch (error) {
    console.error('Error fetching courses:', error);
  }
}

const pageMode = document.documentElement.dataset.page;
let detailsPage = 'CourseDetails.html';
if (pageMode === 'register') {
  detailsPage = 'RegisterCourseDetails.html';
}

function displayCourses(coursesArray) {
  const rows = coursesArray.map((course) => {
    return `
      <tr>
        <td>
          <a href="${detailsPage}?crn=${course.crn}">
            ${course.name}
          </a>
        </td>
        <td>${course.category}</td>
        <td>${course.instructor}</td>
        <td>${course.gender}</td>
        <td>${course.section}</td>
        <td>${course.status}</td>
      </tr>
    `;
  });
  tableEntries.innerHTML = rows.join('');
}

searchBox.addEventListener('input', handleSearch);

function handleSearch(e) {
  tableEntries.style.opacity = '0';
  setTimeout(() => {
    const searchTerm = e.target.value.toLowerCase().trim();
    const filtered = courses.filter((course) => {
      const nameMatch = course.name.toLowerCase().includes(searchTerm);
      const categoryMatch = course.category.toLowerCase().includes(searchTerm);
      return nameMatch || categoryMatch;
    });

    displayCourses(filtered);
    tableEntries.style.opacity = '1';
  }, 300);
}

logoutButton.addEventListener('click', () => {
  localStorage.removeItem("loggedInUser");
  window.location.href = "Login.html";
});
