import json
import os
import sys
import tempfile
from pathlib import Path

from moviepy import VideoFileClip
from yt_dlp import YoutubeDL


def read_payload():
    raw = sys.stdin.read()
    if not raw:
        raise ValueError("missing input payload")
    payload = json.loads(raw)
    return {
        "url": payload.get("url", "").strip(),
        "userAgent": payload.get("userAgent", "").strip(),
        "cookie": payload.get("cookie", "").strip(),
    }


def download_video(url, user_agent, cookie):
    work_dir = Path(tempfile.mkdtemp(prefix="bili_dl_"))
    output_template = str(work_dir / "input.%(ext)s")

    ydl_opts = {
        "outtmpl": output_template,
        "format": "bv*+ba/b",
        "merge_output_format": "mp4",
        "quiet": True,
        "noplaylist": True,
        "http_headers": {
            "Referer": "https://www.bilibili.com/",
            "User-Agent": user_agent,
        },
    }
    if cookie:
        ydl_opts["http_headers"]["Cookie"] = cookie

    with YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(url, download=True)
        file_path = ydl.prepare_filename(info)

    merged_path = Path(file_path)
    if merged_path.suffix.lower() != ".mp4":
        fallback = merged_path.with_suffix(".mp4")
        if fallback.exists():
            merged_path = fallback

    if not merged_path.exists():
        for item in work_dir.iterdir():
            if item.suffix.lower() == ".mp4":
                merged_path = item
                break

    if not merged_path.exists():
        raise RuntimeError("merged mp4 not found")

    audio_path = work_dir / "audio.mp3"
    clip = VideoFileClip(str(merged_path))
    clip.audio.write_audiofile(str(audio_path), logger=None)
    clip.close()

    return {
        "mergedVideoPath": str(merged_path),
        "audioPath": str(audio_path),
        "workDir": str(work_dir),
    }


def main():
    payload = read_payload()
    if not payload["url"]:
        raise ValueError("url is required")
    if not payload["userAgent"]:
        payload["userAgent"] = (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36"
        )

    result = download_video(payload["url"], payload["userAgent"], payload["cookie"])
    print(json.dumps(result))


if __name__ == "__main__":
    try:
        main()
    except Exception as err:
        print(str(err), file=sys.stderr)
        sys.exit(1)
