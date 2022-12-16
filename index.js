const main_body = document.querySelector("main"),
    generateRandom = document.querySelector("#generateRandomCockTail"),
    searchBar = document.querySelector("#searchBar");

//creates a html element and appends it to specified parent as a child
function createElement(el, attributes,parent_El=main_body,myTextContent=undefined) {
    const createdEl = document.createElement(el);
    for (let name of Object.keys(attributes)) {
        createdEl.setAttribute(name, attributes[name]);
    }

    //text content that will be inside the created element
    if (myTextContent) {
        createdEl.textContent = myTextContent;
    }
    

    parent_El.append(createdEl);
}

//a function used to build ingredients and the instructions list elements
function buildList(id, content) {
    const parent_El = document.querySelector(`#${id}`);
    for (let val of content) {
        if (val.length > 0) {
            createElement("li", {}, parent_El, val);
        }
    }
}

function rate(startPostions) {
    //first remove the previous rating
    for (let start = 1; start <= 5; start++) {
        let el = document.querySelector(`#star${start}`);
        el.classList.remove("fa-star");
        el.classList.add("fa-star-o");
    };

    //rate upto the chosen value
    for (let start = 1; start <= startPostions; start++) {
        let el = document.querySelector(`#star${start}`);
        el.classList.remove("fa-star-o");
        el.classList.add("fa-star");
    };
}

//generate the rating stars using js
function buildRating(parent_El) {
    createElement("div", { id: "rating_container" }, parent_El);
    const rating_container = document.querySelector("#rating_container");

    createElement("p", { id: "rate" }, rating_container, "Rate Drink :");

    for (let start = 1; start <= 5; start++){
        createElement("i", { class: "fa fa-star-o star", id: `star${start}` }, rating_container);
        let star = document.querySelector(`#star${start}`);

        star.addEventListener("mouseover", (evt) => {
            const id = evt.target.id;
            const starNum = parseInt(id[id.length - 1]);

            rate(starNum);
        });

        star.addEventListener("onclick", (evt) => {
            const id = evt.target.id;
            const starNum = parseInt(id[id.length - 1]);

            rate(starNum);
        });
    }

    
}

//a function used to build the cocktail picture and details
function buildMainBodyDisplay(value) {

    //extract useful data from the api response see sample response

    let drink_name = value.strDrink,
        ingredients = [],
        instructions = value.strInstructions.trim().split("."),
        cockTail_ImgUrl = value.strDrinkThumb;
    
    //get values of the ingredients and add them to the ingredients array
    Object.entries(value).forEach(([key, value]) => {
        if (key.includes("strIngredient") && value) {
            ingredients.push(value);
        }
    })

    //display the name of the cocktail as header
    createElement("h1", { id: "name" }, undefined, `Cocktail Name: ${drink_name}`);

    //cocktail details contents container ie the cocktail image and the cocktail recipe
    createElement("div", { id: "cockTailContents" });

    const cockTailContents = document.querySelector("#cockTailContents");

    //cocktail image display
    createElement("img", { id: "myCocktailImg", src: cockTail_ImgUrl }, cockTailContents);

    //right column it contains the rating, the ingredients list and instructions.
    createElement("div", { id: "recipe_details" }, cockTailContents);

    const recipe_details = document.querySelector("#recipe_details");

    createElement("section", { id: "tab_container" }, recipe_details);

    //container for the tab buttons to switch between instructions and ingredients
    const tab_container = document.querySelector("#tab_container");

    createElement("button", { id: "ingredients" }, tab_container, "ingredients");
    createElement("button", { id: "instructions" }, tab_container, "instructions");

    createElement("div", { id: "content" }, recipe_details);

    const contentContainer = document.querySelector("#content");

    //the actual list of ingredients and instructions
    createElement("ul", { id: "ingredients_List", class: "show" }, contentContainer);

    //use the buildlist function to build ingredients list

    buildList("ingredients_List", ingredients);

    createElement("ul", { id: "instructions_list", class: "hide" }, contentContainer);
    buildList("instructions_list", instructions);

    //build the rating system
    buildRating(recipe_details);

    //functionality to toggle the ingredients and instructions
    const show_Ingredients_Btn = document.querySelector("#ingredients"),
        show_Instructions_Btn = document.querySelector("#instructions");

    show_Ingredients_Btn.addEventListener("click", () => {
        toggleEl("ingredients_List", "show");
        toggleEl("instructions_list", "hide");
    });

    show_Instructions_Btn.addEventListener("click", () => {
        toggleEl("ingredients_List", "hide");
        toggleEl("instructions_list", "show");
    });
}

//change visibility between the ingredients and the instructions
function toggleEl(id, value) {
    const el = document.querySelector(`#${id}`);

    if (el.classList.contains(value)) {
        return;
    } else {
        el.className = "";
        el.classList.add(value);
    }
}

//remove all the generated content
function clearContent() {
    const el = document.querySelector("#name") || document.querySelector("#error");

    if (el) {
        main_body.innerHTML = "";
    }
}

//get data from the api
function getDataFromApi(url) {
    clearContent();
    fetch(url)
        .then(response => response.json())
        .then(response => {
            buildMainBodyDisplay(response.drinks[0])
        })
        .catch(() => {
            createElement("h1", { id: "error" },undefined,"Couldn't find a cocktail based on specified ingredient. Please try again");
        });
};

//click event on the generate random button
generateRandom.addEventListener("click", () => {
    const url = 'https://www.thecocktaildb.com/api/json/v1/1/random.php';
    getDataFromApi(url);
});

//used with the search functionality as it generates more than one result we pick the first one
async function getDrinksByIngredient(url) {
    clearContent();
    try {
        const res = await ((await fetch(url)).json());
        const new_url = `https:www.thecocktaildb.com/api/json/v1/1/search.php?s=${res.drinks[0].strDrink}`;
        getDataFromApi(new_url);
    } catch (err) {
        // console.log(err)
        createElement("h1", { id: "error" }, undefined, "Couldn't find a cocktail based on specified ingredient. Please try again");
    }
    
}

//reads an input on the search box
searchBar.addEventListener("change", (evt) => {
    const value = evt.target.value;
    searchBar.value = "";
    const url = `https://www.thecocktaildb.com/api/json/v1/1/filter.php?i=${value}`;
    getDrinksByIngredient(url);
});
