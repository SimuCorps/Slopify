document.addEventListener("DOMContentLoaded", () => {
  const hamburgerInput = document.querySelector(".hamburger-menu input");
  const sidebar = document.querySelector(".sidebar");
  hamburgerInput.addEventListener("change", () => {
    if (hamburgerInput.checked) {
      sidebar.classList.add("active");
    } else {
      sidebar.classList.remove("active");
    }
  });
  // Close menu when clicking outside
  document.addEventListener("click", (e) => {
    if (!sidebar.contains(e.target) && !hamburgerInput.contains(e.target)) {
      hamburgerInput.checked = false;
      sidebar.classList.remove("active");
    }
  });
  // Handle escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      hamburgerInput.checked = false;
      sidebar.classList.remove("active");
    }
  });
});
