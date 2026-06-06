
const dropZone =
    document.getElementById("dropZone");

const fileInput =
    document.getElementById("videoInput");

const selectedFile =
    document.getElementById("selectedFile");

const videoInfo =
    document.getElementById("videoInfo");

dropZone.addEventListener(
    "click",
    () => fileInput.click()
);

dropZone.addEventListener(
    "dragover",
    e => {
        e.preventDefault();
        dropZone.style.background =
            "rgba(255,255,255,.25)";
    }
);

dropZone.addEventListener(
    "dragleave",
    () => {
        dropZone.style.background =
            "rgba(255,255,255,.1)";
    }
);

dropZone.addEventListener(
    "drop",
    e => {

        e.preventDefault();

        fileInput.files =
            e.dataTransfer.files;

        updateFileInfo(
            e.dataTransfer.files[0]
        );
    }
);

fileInput.addEventListener(
    "change",
    () => {
        updateFileInfo(
            fileInput.files[0]
        );
    }
);

function updateFileInfo(file) {

    if (!file) return;

    selectedFile.textContent =
        file.name;

    let size =
        (file.size / 1024 / 1024)
        .toFixed(2);

    videoInfo.style.display =
        "block";

    videoInfo.innerHTML = `
        <strong>Name:</strong> ${file.name}<br>
        <strong>Size:</strong> ${size} MB
    `;
}

document
.getElementById("compressForm")
.addEventListener(
"submit",
function(){

    document
    .getElementById("loadingModal")
    .classList.add("is-active");

    let progress =
        document.getElementById(
            "progressBar"
        );

    let text =
        document.getElementById(
            "progressText"
        );

    let value = 0;

    const interval =
        setInterval(() => {

            value += 2;

            progress.value =
                value;

            text.innerHTML =
                `Processing... ${value}%`;

            if(value >= 95){
                clearInterval(interval);
            }

        },500);

});

