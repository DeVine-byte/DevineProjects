// Elements
const fileInput =
    document.getElementById("videoInput");

const selectedFile =
    document.getElementById("selectedFile");

const form =
    document.getElementById("compressForm");

const loadingModal =
    document.getElementById("loadingModal");

const compressBtn =
    document.getElementById("compressBtn");



// Display selected filename


if (fileInput && selectedFile) {

    fileInput.addEventListener(
        "change",
        function () {

            if (
                this.files &&
                this.files.length > 0
            ) {

                const file =
                    this.files[0];

                const size =
                    (
                        file.size /
                        1024 /
                        1024
                    ).toFixed(2);

                selectedFile.innerHTML =
                    `
                    <strong>Selected:</strong>
                    ${file.name}
                    <br>

                    <strong>Size:</strong>
                    ${size} MB
                    `;
            }

        }
    );

}



// Show loading modal


if (form) {

    form.addEventListener(
        "submit",
        function () {

            if (
                loadingModal
            ) {

                loadingModal
                    .classList
                    .add(
                        "is-active"
                    );

            }

            if (
                compressBtn
            ) {

                compressBtn.disabled =
                    true;

                compressBtn.textContent =
                    "Compressing...";
            }

        }
    );

}
