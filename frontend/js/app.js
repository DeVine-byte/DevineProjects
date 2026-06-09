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
