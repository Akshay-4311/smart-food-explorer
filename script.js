let allMeals = [];

function searchFood() {
    const input = document.getElementById("searchInput").value;
    const results = document.getElementById("results");

    if (!input) {
        results.innerHTML = "<p>Please enter something</p>";
        return;
    }

    results.innerHTML = "<p>Loading...</p>";

    fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${input}`)
        .then(res => res.json())
        .then(data => {
            if (!data.meals) {
                results.innerHTML = "<p>No results found</p>";
                return;
            }

            allMeals = data.meals;
            displayFood(allMeals); 
        })
        .catch(() => {
            results.innerHTML = "<p>Error loading data</p>";
        });
}

function applyFilterSort() {
    let meals = [...allMeals];

    const filterValue = document.getElementById("filter").value;
    const sortValue = document.getElementById("sort").value;


    if (filterValue !== "all") {
        meals = meals.filter(meal =>
            meal.strMeal.toLowerCase().includes(filterValue.toLowerCase())
        );
    }

    if (sortValue === "az") {
        meals.sort((a, b) => a.strMeal.localeCompare(b.strMeal));
    } else if (sortValue === "za") {
        meals.sort((a, b) => b.strMeal.localeCompare(a.strMeal));
    }

    displayFood(meals);
}
function displayFood(meals) {
    const results = document.getElementById("results");
    results.innerHTML = "";

    meals.map(meal => {
        const div = document.createElement("div");
        div.classList.add("card");

        div.innerHTML = `
            <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
            <h3>${meal.strMeal}</h3>
            <p>${meal.strCategory}</p>
        `;

        results.appendChild(div);
    });
}

function handleEnter(event) {
    if (event.key === "Enter") {
        searchFood();
    }
}