document.addEventListener("DOMContentLoaded", () => {
  // === Chargement des catégories ===
  async function displayCategoryButtons() {
    const containerButtons = document.getElementById("container-buttons");
    let button = document.createElement("button");
    button.textContent = "Tous";
    button.addEventListener("click", function () {
      displayWorks();
      selectButton(button);
    });
    containerButtons.appendChild(button);

    const categories = await getCategories();
    for (let category of categories) {
      button = document.createElement("button");
      button.textContent = category.name;
      button.addEventListener("click", function (event) {
        displayWorks(category.id);
        selectButton(event.target);
      });
      containerButtons.appendChild(button);
    }

    // Active par défaut le bouton "Tous"
    const allBtn = containerButtons.querySelector("button");
    if (allBtn) {
      allBtn.classList.add("selected");
    }
  }

  async function displayWorks(categoryId) {
    const gallery = document.querySelector(".gallery");
    gallery.innerHTML = "";
    const works = await getWorks();
    for (let work of works) {
      if (categoryId === undefined || work.categoryId === categoryId) {
        let figure = document.createElement("figure");
        let image = document.createElement("img");
        image.src = work.imageUrl;
        image.alt = work.title;

        let figcaption = document.createElement("figcaption");
        figcaption.textContent = work.title;
        figure.appendChild(image);
        figure.appendChild(figcaption);
        gallery.appendChild(figure);
      }
    }
  }

  function selectButton(button) {
    const buttons = document.querySelectorAll("#container-buttons button");
    buttons.forEach((btn) => btn.classList.remove("selected"));
    button.classList.add("selected");
  }

  function checkLoginStatus() {
    const token = getToken();
    if (token) {
      changePageWhenLog();
    }
  }

  function changePageWhenLog() {
    const loginLink = document.querySelector('nav a[href="login.html"]');
    loginLink.textContent = "logout";
    loginLink.href = "#";
    loginLink.addEventListener("click", function (event) {
      event.preventDefault();
      sessionStorage.removeItem("token");
      location.reload();
    });

    document.getElementById("edition-banner").classList.remove("hidden");

    const editBtn = document.querySelector(".edit-wrapper");
    editBtn.classList.remove("hidden");

    // Masquer les boutons de filtre
    const containerButtons = document.getElementById("container-buttons");
    containerButtons.classList.add("admin-hidden");

    createModal();

    editBtn.addEventListener("click", () => {
      changeGalleryModal();
      document.getElementById("modal").classList.remove("hidden");
    });
  }

  function getToken() {
    return sessionStorage.getItem("token") || localStorage.getItem("token");
  }

  function createModal() {
    const modal = document.createElement("div");
    modal.id = "modal";
    modal.classList.add("modal", "hidden");

    modal.innerHTML = `
      <div class="modal-content">
        <span class="close">&times;</span>
        <div class="modal-gallery-view">
          <h3>Galerie photo</h3>
          <div class="modal-gallery"></div>
          <button id="btn-add-photo">Ajouter une photo</button>
        </div>
        <div class="modal-add-view hidden">
          <button id="btn-back">&larr;</button>
          <h3>Ajout photo</h3>
          <form id="photo-form">
            <input type="file" id="image-input" accept="image/*" required />
            <input type="text" id="title-input" placeholder="Titre" required />
            <select id="category-select" required></select>
            <button type="submit">Valider</button>
          </form>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    // Fermer modale
    modal.querySelector(".close").addEventListener("click", () => {
      modal.classList.add("hidden");
      resetForm();
    });

    window.addEventListener("click", (e) => {
      if (e.target === modal) modal.classList.add("hidden");
    });

    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") modal.classList.add("hidden");
    });

    modal.querySelector("#btn-add-photo").addEventListener("click", () => {
      modal.querySelector(".modal-gallery-view").classList.add("hidden");
      modal.querySelector(".modal-add-view").classList.remove("hidden");
      loadCategories();
    });

    modal.querySelector("#btn-back").addEventListener("click", () => {
      modal.querySelector(".modal-gallery-view").classList.remove("hidden");
      modal.querySelector(".modal-add-view").classList.add("hidden");
    });

    modal
      .querySelector("#photo-form")
      .addEventListener("submit", handleAddPhoto);
  }

  async function changeGalleryModal() {
    const works = await getWorks();
    const gallery = document.querySelector(".modal-gallery");
    gallery.innerHTML = "";

    works.forEach((work) => {
      const figure = document.createElement("figure");
      figure.classList.add("modal-figure");

      const img = document.createElement("img");
      img.src = work.imageUrl;
      img.alt = work.title;

      const delBtn = document.createElement("button");
      delBtn.classList.add("delete-btn");
      delBtn.innerHTML = '<i class="fa-solid fa-trash-can"></i>';
      delBtn.addEventListener("click", async () => {
        const token = getToken();
        const res = await fetch(`http://localhost:5678/api/works/${work.id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          changeGalleryModal();
          displayWorks();
        } else {
          alert("Erreur suppression");
        }
      });

      figure.appendChild(img);
      figure.appendChild(delBtn);
      gallery.appendChild(figure);
    });
  }

  async function loadCategories() {
    const select = document.getElementById("category-select");
    const categories = await getCategories();
    select.innerHTML = "";
    categories.forEach((cat) => {
      const option = document.createElement("option");
      option.value = cat.id;
      option.textContent = cat.name;
      select.appendChild(option);
    });
  }

  async function handleAddPhoto(e) {
    e.preventDefault();
    const image = document.getElementById("image-input").files[0];
    const title = document.getElementById("title-input").value;
    const category = document.getElementById("category-select").value;

    const formData = new FormData();
    formData.append("image", image);
    formData.append("title", title);
    formData.append("category", category);

    const res = await fetch("http://localhost:5678/api/works", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
      body: formData,
    });

    if (res.ok) {
      alert("Image ajoutée !");
      resetForm();
      document.getElementById("modal").classList.add("hidden");
      changeGalleryModal();
      displayWorks();
    } else {
      alert("Erreur ajout image");
    }
  }

  function resetForm() {
    const form = document.getElementById("photo-form");
    if (form) {
      form.reset();
    }
  }

  // Initialisation
  checkLoginStatus();
  displayWorks();
  displayCategoryButtons();
});
