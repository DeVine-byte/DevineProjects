
// Loader

function hideLoader() {
    const loader = document.getElementById("loader");

    if (!loader) return;

    loader.style.opacity = "0";

    setTimeout(() => {
        loader.style.display = "none";
    }, 800);
}

window.addEventListener("load", hideLoader);


// Mobile Navigation


function initMobileMenu() {
    const menuBtn = document.querySelector(".menu-btn");
    const navLinks = document.querySelector(".nav-links");

    if (!menuBtn || !navLinks) return;

    menuBtn.addEventListener("click", () => {
        navLinks.classList.toggle("active");
    });
}


// Search

function initSearch() {
    const search = document.getElementById("search");

    if (!search) return;

    search.addEventListener("keyup", (e) => {

        const value = e.target.value.toLowerCase();

        document
            .querySelectorAll(".app-card")
            .forEach(card => {

                const text =
                    card.innerText.toLowerCase();

                card.style.display =
                    text.includes(value)
                        ? "block"
                        : "none";

            });

    });
}


// Reveal Animation

function revealSections() {

    document
        .querySelectorAll(".reveal")
        .forEach(section => {

            const top =
                section.getBoundingClientRect().top;

            if (top < window.innerHeight - 100) {
                section.classList.add("active");
            }

        });

}

window.addEventListener(
    "scroll",
    revealSections
);


// Render Apps

function renderApps() {

    const appGrid =
        document.getElementById(
            "apps-grid"
        );

    if (!appGrid || !apps) return;

    appGrid.innerHTML = "";

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

}


// Categories


function loadCategories() {

    if (!apps) return;

    const categories = [
        ...new Set(
            apps.map(
                app => app.category
            )
        )
    ];

    console.log(categories);

}


// Custom Cursor


function initCursor() {

    const cursor =
        document.querySelector(".cursor");

    if (!cursor) return;

    window.addEventListener(
        "mousemove",
        e => {

            cursor.style.left =
                e.clientX + "px";

            cursor.style.top =
                e.clientY + "px";

        }
    );

}


// Spotlight


function initSpotlight() {

    const light =
        document.querySelector(
            ".spotlight"
        );

    if (!light) return;

    window.addEventListener(
        "mousemove",
        e => {

            light.style.left =
                e.clientX - 150 + "px";

            light.style.top =
                e.clientY - 150 + "px";

        }
    );

}


// 3D Card Tilt


function initCardTilt() {

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
                        (y - rect.height / 2) / 20;

                    const rotateY =
                        (rect.width / 2 - x) / 20;

                    card.style.transform =
                        `rotateX(${rotateX}deg)
                         rotateY(${rotateY}deg)`;

                }
            );

            card.addEventListener(
                "mouseleave",
                () => {

                    card.style.transform =
                        "rotateX(0) rotateY(0)";

                }
            );

        });

}


// Counter Animation

function initCounters() {

    document
        .querySelectorAll(".counter")
        .forEach(counter => {

            const target =
                +counter.dataset.target;

            let current = 0;

            function update() {

                if (current < target) {

                    current++;

                    counter.innerText =
                        current;

                    requestAnimationFrame(
                        update
                    );

                }

            }

            update();

        });

}


// App Initialization


document.addEventListener(
    "DOMContentLoaded",
    () => {

        renderApps();

        loadCategories();

        initMobileMenu();

        initSearch();

        initCursor();

        initSpotlight();

        initCardTilt();

        initCounters();

        revealSections();

    }
);
