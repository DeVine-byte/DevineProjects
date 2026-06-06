import os
import uuid
import subprocess


def compress_video(
    input_path,
    output_path,
    target_size_mb=100
):
    if not os.path.exists(input_path):
        raise FileNotFoundError(
            f"Input file not found: {input_path}"
        )

    
    # Get video duration
    

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
        stderr=subprocess.PIPE,
        text=True,
    )

    if probe.returncode != 0:
        raise RuntimeError(
            f"ffprobe failed:\n{probe.stderr}"
        )

    try:
        duration = float(
            probe.stdout.strip()
        )
    except ValueError:
        raise RuntimeError(
            "Unable to determine video duration."
        )

    if duration <= 0:
        raise RuntimeError(
            "Invalid video duration."
        )

    
    # Bitrate calculation
    

    target_bitrate = (
        int(
            (target_size_mb * 8192)
            / duration
        )
        - 128
    )

    audio_bitrate = 128
    video_bitrate = max(
        target_bitrate,
        100
    )

    
    # Unique pass log
    

    output_dir = os.path.dirname(
        output_path
    )

    passlog = os.path.join(
        output_dir,
        f"ffmpeg_pass_{uuid.uuid4()}"
    )

    try:

        
        # Pass 1
        

        first_pass = subprocess.run(
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
                "-passlogfile",
                passlog,
                "-an",
                "-f",
                "mp4",
                os.devnull,
            ],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
        )

        if first_pass.returncode != 0:
            raise RuntimeError(
                f"FFmpeg first pass failed:\n"
                f"{first_pass.stderr}"
            )

        
        # Pass 2
        

        second_pass = subprocess.run(
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
                "2",
                "-passlogfile",
                passlog,
                "-c:a",
                "aac",
                "-b:a",
                f"{audio_bitrate}k",
                output_path,
            ],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
        )

        if second_pass.returncode != 0:
            raise RuntimeError(
                f"FFmpeg second pass failed:\n"
                f"{second_pass.stderr}"
            )

    finally:

        
        # Cleanup pass logs
        

        for ext in [
            ".log",
            ".log.mbtree",
        ]:

            logfile = passlog + ext

            if os.path.exists(
                logfile
            ):
                try:
                    os.remove(
                        logfile
                    )
                except:
                    pass

    if not os.path.exists(
        output_path
    ):
        raise RuntimeError(
            "Compression failed. "
            "Output file was not created."
        )

    return output_path
