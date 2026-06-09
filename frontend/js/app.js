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
const menuBtn =
document.querySelector(".menu-btn");

const navLinks =
document.querySelector(".nav-links");

menuBtn.addEventListener(
"click",

() => {

navLinks.classList.toggle(
"active"
);

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


const appGrid =
document.getElementById("apps-grid");

apps.forEach(app => {

    appGrid.innerHTML += `

    <article class="app-card reveal">


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
