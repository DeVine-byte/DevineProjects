
// Loader

window.addEventListener("load", () => {

    const loader =
    document.getElementById("loader");

    loader.style.opacity = "0";

    setTimeout(() => {

        loader.style.display = "none";

    }, 800);

});

// Scroll Reveal

function revealSections() {

    const sections =
    document.querySelectorAll(".reveal");

    sections.forEach(section => {

        const top =
        section.getBoundingClientRect().top;

        if (
            top <
            window.innerHeight - 100
        ) {
            section.classList.add(
                "active"
            );
        }

    });

}

window.addEventListener(
    "scroll",
    revealSections
);

revealSections();

// Cursor

const cursor =
document.querySelector(".cursor");

window.addEventListener(
    "mousemove",
    e => {

        if(cursor){

            cursor.style.left =
            e.clientX + "px";

            cursor.style.top =
            e.clientY + "px";

        }

    }
);

// Spotlight

const spotlight =
document.querySelector(
".spotlight"
);

window.addEventListener(
    "mousemove",

    e => {

        if(spotlight){

            spotlight.style.left =
            e.clientX - 150 + "px";

            spotlight.style.top =
            e.clientY - 150 + "px";

        }

    }

);

// Counters

document
.querySelectorAll(".counter")
.forEach(counter => {

    const target =
    +counter.dataset.target;

    let current = 0;

    const update = () => {

        if(current < target){

            current++;

            counter.innerText =
            current;

            requestAnimationFrame(
                update
            );

        }

    };

    update();

});

// Load Apps

async function loadApps(){

    const response =
    await fetch("/api/apps");

    const apps =
    await response.json();

    const grid =
    document.getElementById(
        "apps-grid"
    );

    if(!grid){
        return;
    }

    grid.innerHTML = "";

    apps.forEach(app => {

        grid.innerHTML += `

        <article class="app-card">

            <div class="app-icon">

                ${app.icon}

            </div>

            <span class="category">

                ${app.category}

            </span>

            <h3>

                ${app.name}

            </h3>

            <p>

                ${app.description}

            </p>

            <a href="${app.url}">

                Launch App →

            </a>

        </article>

        `;

    });

    enableCardTilt();

}

// Search

document
.addEventListener(
"input",

e => {

if(
e.target.id === "search"
){

const value =
e.target.value
.toLowerCase();

document
.querySelectorAll(
".app-card"
)

.forEach(card => {

const text =
card.innerText
.toLowerCase();

card.style.display =
text.includes(value)

? ""

: "none";

});

}

}
);

// Hero Button

const heroBtn =
document.querySelector(
".hero-btn"
);

if(heroBtn){

heroBtn.addEventListener(
"click",

() => {

document
.getElementById(
"apps"
)
.scrollIntoView({
behavior:
"smooth"
});

});

}

// Card Tilt

function enableCardTilt(){

document
.querySelectorAll(
".app-card"
)

.forEach(card => {

card.addEventListener(
"mousemove",

e => {

const rect =
card.getBoundingClientRect();

const x =
e.clientX -
rect.left;

const y =
e.clientY -
rect.top;

const rotateX =
(y -
rect.height / 2)
/
20;

const rotateY =
(rect.width / 2
-
x)
/
20;

card.style.transform =
`
rotateX(${rotateX}deg)
rotateY(${rotateY}deg)
translateY(-8px)
`;

});

card.addEventListener(
"mouseleave",

() => {

card.style.transform =
"rotateX(0) rotateY(0)";

});

});

}

// Initialize

loadApps();
                
