const form = document.querySelector("#login-form");

const validateForm = async (event) => {
  event.preventDefault();

  const email = document.querySelector("#email").value;
  const password = document.querySelector("#password").value;

  const errorMessage = document.querySelector("#login-error");

  try {
    const result = await loginUser(email, password);
    sessionStorage.setItem("token", result.token);
    window.location.href = "index.html";
  } catch (error) {
    if (errorMessage) {
      errorMessage.textContent = "Erreur : email ou mot de passe incorrect.";
    } else {
      alert("Erreur : " + error.message);
    }
  }
};

form.addEventListener("submit", validateForm);
