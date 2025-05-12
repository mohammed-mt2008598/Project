document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.querySelector("form");
  const usernameField = document.getElementById("username");
  const passwordField = document.getElementById("password");
  const errorMessage = document.getElementById("errorMessage");

  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const enteredUsername = usernameField.value.trim();
    const enteredPassword = passwordField.value.trim();
    errorMessage.style.display = "none";

    fetch("/api/users")
      .then((response) => {
        if (!response.ok) throw new Error(`Server error: ${response.status}`);
        return response.json();
      })
      .then((usersArray) => {
        const matchedUser = usersArray.find(
          (user) =>
            user.username === enteredUsername &&
            user.password === enteredPassword
        );

        if (matchedUser) {
          localStorage.setItem("loggedInUser", JSON.stringify(matchedUser));

          switch (matchedUser.role) {
            case "student":
              window.location.href = "Search.html";
              break;
            case "admin":
              window.location.href = "adminDashboard.html";
              break;
            case "instructor":
              window.location.href = "grades.html";
              break;
            default:
              alert("Role not recognized.");
          }
        } else {
          errorMessage.style.display = "block";
          errorMessage.textContent = "Invalid username or password.";
        }
      })
      .catch((error) => {
        console.error("Error fetching users:", error);
        errorMessage.style.display = "block";
        errorMessage.textContent =
          "Could not retrieve user data from server.";
      });
  });
});
