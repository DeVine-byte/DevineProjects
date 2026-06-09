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
