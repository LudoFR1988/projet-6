async function getCategories() {
  const res = await fetch("http://localhost:5678/api/categories");
  const categories = await res.json();
  return categories;
}

async function getWorks() {
  const res = await fetch("http://localhost:5678/api/works");
  const works = await res.json();
  return works;
}

async function loginUser(email, password) {
  const res = await fetch("http://localhost:5678/api/users/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  console.log(res);

  if (!res.ok) {
    throw new Error("Email ou mot de passe incorrect");
  }

  const data = await res.json();
  console.log(data);
  return data;
}
