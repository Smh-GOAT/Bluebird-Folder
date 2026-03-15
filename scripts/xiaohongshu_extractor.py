import json
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
        "download": bool(payload.get("download", False)),
    }


def normalize_publish_at(timestamp):
    if not timestamp:
        return ""
    try:
        return int(timestamp)
    except Exception:
        return ""


def build_meta(info, fallback_url):
    return {
        "videoId": str(info.get("id") or "").strip(),
        "title": str(info.get("title") or "小红书视频").strip(),
        "author": str(
            info.get("uploader")
            or info.get("uploader_id")
            or info.get("channel")
            or "小红书作者"
        ).strip(),
        "duration": int(info.get("duration") or 0),
        "timestamp": normalize_publish_at(info.get("timestamp")),
        "webpageUrl": str(info.get("webpage_url") or fallback_url).strip(),
    }


def extract(payload):
    work_dir = Path(tempfile.mkdtemp(prefix="xhs_dl_"))
    output_template = str(work_dir / "input.%(ext)s")

    headers = {
        "Referer": "https://www.xiaohongshu.com/",
        "User-Agent": payload["userAgent"],
    }
    if payload["cookie"]:
        headers["Cookie"] = payload["cookie"]

    ydl_opts = {
        "quiet": True,
        "noprogress": True,
        "noplaylist": True,
        "http_headers": headers,
        "outtmpl": output_template,
        "format": "bv*+ba/b",
        "merge_output_format": "mp4",
        "skip_download": not payload["download"],
    }

    with YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(payload["url"], download=payload["download"])
        meta = build_meta(info, payload["url"])
        if not payload["download"]:
            return {
                "meta": meta,
                "workDir": str(work_dir),
            }

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
        "meta": meta,
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

    result = extract(payload)
    print(json.dumps(result))


if __name__ == "__main__":
    try:
        main()
    except Exception as err:
        print(str(err), file=sys.stderr)
        sys.exit(1)
