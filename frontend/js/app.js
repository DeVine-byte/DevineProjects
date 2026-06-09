window.addEventListener("load", () => {

    document
    .getElementById("loader")
    .style.opacity = "0";

    setTimeout(() => {

        document
        .getElementById("loader")
        .style.display = "none";

    }, 800);

});
document
.getElementById("search")

.addEventListener(
"keyup",

e => {

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

? "block"

: "none";

});

});
const reveals =
document.querySelectorAll(".reveal");

window.addEventListener("scroll", () => {

    reveals.forEach(section => {

        const top =
        section.getBoundingClientRect().top;

        if(top < window.innerHeight - 100){

            section.classList.add("active");

        }

    });

});

const categories =
[...new Set(
apps.map(
app => app.category
)
)];

console.log(categories);

const apps = [

    {

        name: "Keyholder",

        description:
        "Security-focused password management platform with layered encryption.",

        url: "/keyholder",

        status: "Live",

        category: "Security"
    },

    {

        name: "Expense Tracker",

        description:
        "Track income, expenses and financial analytics.",

        url: "/finance",

        status: "Live",

        category: "Finance"
    },

    {

        name: "Video Compressor",

        description:
        "Compress videos efficiently using FFmpeg.",

        url: "/videoCompressor",

        status: "Live",

        category: "Media"
    }

];

const appGrid =
document.getElementById("apps-grid");

apps.forEach(app => {

    appGrid.innerHTML += `

    <article class="app-card reveal">

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
const cursor =
document.querySelector(".cursor");

window.addEventListener(
    "mousemove",
    e => {

    cursor.style.left =
    e.clientX + "px";

    cursor.style.top =
    e.clientY + "px";

});
const light =
document.querySelector(
".spotlight"
);

window.addEventListener(
"mousemove",

e => {

light.style.left =
e.clientX - 150 + "px";

light.style.top =
e.clientY - 150 + "px";

});

document
.querySelectorAll(".app-card")

.forEach(card => {

card.addEventListener(

"mousemove",

e => {

const rect =
card.getBoundingClientRect();

const x =
e.clientX - rect.left;

const y =
e.clientY - rect.top;

const rotateX =
(y - rect.height/2) / 20;

const rotateY =
(rect.width/2 - x) / 20;

card.style.transform =
`
rotateX(${rotateX}deg)
rotateY(${rotateY}deg)
`;

});

card.addEventListener(
"mouseleave",

() => {

card.style.transform =
"rotateX(0) rotateY(0)";

});

});
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
