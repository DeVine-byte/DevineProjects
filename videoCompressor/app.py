import os
import uuid

from flask import (
    Flask,
    render_template,
    request,
    send_file,
    flash,
    redirect,
    url_for,
    after_this_request,
)

from werkzeug.utils import secure_filename

from compress import compress_video

app = Flask(__name__)
app.secret_key = "super-secret-key"


# Directories


BASE_DIR = os.path.dirname(
    os.path.abspath(__file__)
)

UPLOAD_FOLDER = os.path.join(
    BASE_DIR,
    "uploads"
)

OUTPUT_FOLDER = os.path.join(
    BASE_DIR,
    "outputs"
)

os.makedirs(
    UPLOAD_FOLDER,
    exist_ok=True
)

os.makedirs(
    OUTPUT_FOLDER,
    exist_ok=True
)

app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
app.config["OUTPUT_FOLDER"] = OUTPUT_FOLDER



# Routes


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/compress", methods=["POST"])
def compress():

    if "video" not in request.files:
        flash("Please select a video.")
        return redirect(
            url_for("index")
        )

    video = request.files["video"]

    if video.filename == "":
        flash("No file selected.")
        return redirect(
            url_for("index")
        )

    try:

        target_size = int(
            request.form.get(
                "target_size",
                100
            )
        )

        output_name = (
            request.form.get(
                "output_name",
                "compressed_video"
            )
            .strip()
        )

        if not output_name.endswith(
            ".mp4"
        ):
            output_name += ".mp4"

        
        # Unique filenames
        

        unique_id = str(
            uuid.uuid4()
        )

        original_name = secure_filename(
            video.filename
        )

        input_filename = (
            f"{unique_id}_"
            f"{original_name}"
        )

        output_filename = (
            f"{unique_id}_"
            f"{secure_filename(output_name)}"
        )

        input_path = os.path.join(
            app.config[
                "UPLOAD_FOLDER"
            ],
            input_filename,
        )

        output_path = os.path.join(
            app.config[
                "OUTPUT_FOLDER"
            ],
            output_filename,
        )

        # Save upload

        video.save(
            input_path
        )

        # Compress

        compress_video(
            input_path,
            output_path,
            target_size_mb=target_size,
        )

        
        # Cleanup after response
        

        @after_this_request
        def cleanup(response):

            try:

                if os.path.exists(
                    input_path
                ):
                    os.remove(
                        input_path
                    )

                if os.path.exists(
                    output_path
                ):
                    os.remove(
                        output_path
                    )

            except Exception as e:
                print(
                    f"Cleanup error: {e}"
                )

            return response

        return send_file(
            output_path,
            as_attachment=True,
            download_name=secure_filename(
                output_name
            ),
        )

    except Exception as e:

        flash(str(e))

        return redirect(
            url_for("index")
        )



# Standalone Development


if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=5001,
        debug=True
    )
