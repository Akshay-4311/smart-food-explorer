let allMeals = [];

const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const themeBtn = document.getElementById("themeBtn");
const filterSelect = document.getElementById("filter");
const sortSelect = document.getElementById("sort");
const results = document.getElementById("results");
const statusBox = document.getElementById("status");
const detailsBox = document.getElementById("details");

searchBtn.addEventListener("click", searchFood);

searchInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        searchFood();
    }
});

filterSelect.addEventListener("change", applyFilterSort);
sortSelect.addEventListener("change", applyFilterSort);
themeBtn.addEventListener("click", toggleDarkMode);

function searchFood() {
    const input = searchInput.value.trim();

    if (!input) {
        statusBox.textContent = "Please enter a food name.";
        results.innerHTML = '<div class="empty">Type something and search.</div>';
        detailsBox.style.display = "none";
        detailsBox.innerHTML = "";
        return;
    }

    statusBox.textContent = "Loading...";
    results.innerHTML = '<div class="loading">Loading...</div>';
    detailsBox.style.display = "none";
    detailsBox.innerHTML = "";

    fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(input)}`)
        .then(res => res.json())
        .then(data => {
            if (!data.meals) {
                allMeals = [];
                statusBox.textContent = "No results found.";
                results.innerHTML = '<div class="no-results">No meals found.</div>';
                return;
            }

            allMeals = data.meals;
            statusBox.textContent = `Found ${allMeals.length} meal(s).`;
            applyFilterSort();
        })
        .catch(() => {
            statusBox.textContent = "Error loading data.";
            results.innerHTML = '<div class="error">Could not fetch data.</div>';
        });
}

function applyFilterSort() {
    let meals = [...allMeals];

    const filterValue = filterSelect.value;
    const sortValue = sortSelect.value;

    if (filterValue !== "all") {
        meals = meals.filter(meal => meal.strCategory === filterValue);
    }

    if (sortValue === "az") {
        meals.sort((a, b) => a.strMeal.localeCompare(b.strMeal));
    } else if (sortValue === "za") {
        meals.sort((a, b) => b.strMeal.localeCompare(a.strMeal));
    }

    displayMeals(meals);
}

function displayMeals(meals) {
    results.innerHTML = "";
    detailsBox.style.display = "none";
    detailsBox.innerHTML = "";

    if (!meals.length) {
        results.innerHTML = '<div class="no-results">No meals match the selected filter.</div>';
        return;
    }

    meals.map(meal => {
        const card = document.createElement("div");
        card.className = "card";

        card.innerHTML = `
            <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
            <div class="card-body">
                <h3>${meal.strMeal}</h3>
                <p>${meal.strCategory}</p>
                <button type="button" onclick="showDetails('${meal.idMeal}')">View details</button>
            </div>
        `;

        results.appendChild(card);
    });
}

function showDetails(mealId) {
    detailsBox.style.display = "block";
    detailsBox.innerHTML = "<p>Loading details...</p>";

    fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`)
        .then(res => res.json())
        .then(data => {
            const meal = data.meals && data.meals[0];

            if (!meal) {
                detailsBox.innerHTML = "<p>Could not load details.</p>";
                return;
            }

            const ingredients = getIngredients(meal);

            detailsBox.innerHTML = `
                <h2>${meal.strMeal}</h2>
                <p><strong>Category:</strong> ${meal.strCategory || "N/A"}</p>
                <p><strong>Area:</strong> ${meal.strArea || "N/A"}</p>
                <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
                <h3>Ingredients</h3>
                <ul>
                    ${ingredients.map(item => `<li>${item}</li>`).join("")}
                </ul>
                <h3>Instructions</h3>
                <p>${meal.strInstructions || "No instructions available."}</p>
                ${meal.strYoutube ? `<a href="${meal.strYoutube}" target="_blank" rel="noreferrer">Watch on YouTube</a>` : ""}
            `;
        })
        .catch(() => {
            detailsBox.innerHTML = "<p>Error loading details.</p>";
        });
}

function getIngredients(meal) {
    const list = [];

    for (let i = 1; i <= 20; i++) {
        const ingredient = meal[`strIngredient${i}`];
        const measure = meal[`strMeasure${i}`];

        if (ingredient && ingredient.trim()) {
            list.push(`${measure ? measure.trim() + " " : ""}${ingredient.trim()}`);
        }
    }

    return list;
}

function toggleDarkMode() {
    document.body.classList.toggle("dark");

    if (document.body.classList.contains("dark")) {
        themeBtn.textContent = "Light mode";
        localStorage.setItem("theme", "dark");
    } else {
        themeBtn.textContent = "Dark mode";
        localStorage.setItem("theme", "light");
    }
}

window.addEventListener("DOMContentLoaded", () => {
    if (localStorage.getItem("theme") === "dark") {
        document.body.classList.add("dark");
        themeBtn.textContent = "Light mode";
    }
});