import os
from flask import (
    Flask,
    render_template,
    request,
    send_file,
    flash,
    redirect,
)
from werkzeug.utils import secure_filename

from compress import compress_video

app = Flask(__name__)
app.secret_key = "super-secret-key"

UPLOAD_FOLDER = "uploads"
OUTPUT_FOLDER = "outputs"

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(OUTPUT_FOLDER, exist_ok=True)

app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
app.config["OUTPUT_FOLDER"] = OUTPUT_FOLDER


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/compress", methods=["POST"])
def compress():
    if "video" not in request.files:
        flash("Please select a video.")
        return redirect("/")

    video = request.files["video"]

    if video.filename == "":
        flash("No file selected.")
        return redirect("/")

    target_size = int(request.form.get("target_size", 100))

    filename = secure_filename(video.filename)

    input_path = os.path.join(
        app.config["UPLOAD_FOLDER"],
        filename,
    )

    output_name = request.form.get("output_name")

    if not output_name.endswith(".mp4"):
        output_name += ".mp4"

    output_filename = secure_filename(output_name)
    output_path = os.path.join(
        app.config["OUTPUT_FOLDER"],
        output_filename,
    )

    video.save(input_path)

    try:
        compress_video(
            input_path,
            output_path,
            target_size_mb=target_size,
        )

        return send_file(
            output_path,
            as_attachment=True,
            download_name=output_filename,
        )

    except Exception as e:
        flash(str(e))
        return redirect("/")


if __name__ == "__main__":
    app.run(debug=True)
