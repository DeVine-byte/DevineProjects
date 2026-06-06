import subprocess
import os


def compress_video(input_path, output_path, target_size_mb=100):
    if not os.path.exists(input_path):
        raise FileNotFoundError(input_path)

    probe = subprocess.run(
        [
            "ffprobe",
            "-v",
            "error",
            "-show_entries",
            "format=duration",
            "-of",
            "default=noprint_wrappers=1:nokey=1",
            input_path,
        ],
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
    )

    duration = float(probe.stdout.strip())

    target_bitrate = int((target_size_mb * 8192) / duration) - 128

    audio_bitrate = 128
    video_bitrate = max(target_bitrate, 100)

    # Pass 1
    subprocess.run(
        [
            "ffmpeg",
            "-y",
            "-i",
            input_path,
            "-c:v",
            "libx264",
            "-b:v",
            f"{video_bitrate}k",
            "-pass",
            "1",
            "-an",
            "-f",
            "mp4",
            os.devnull,
        ]
    )

    # Pass 2
    subprocess.run(
        [
            "ffmpeg",
            "-y",
            "-i",
            input_path,
            "-c:v",
            "libx264",
            "-b:v",
            f"{video_bitrate}k",
            "-c:a",
            "aac",
            "-b:a",
            f"{audio_bitrate}k",
            "-pass",
            "2",
            output_path,
        ]
    )

    for f in [
        "ffmpeg2pass-0.log",
        "ffmpeg2pass-0.log.mbtree",
    ]:
        if os.path.exists(f):
            os.remove(f)

    return output_path
