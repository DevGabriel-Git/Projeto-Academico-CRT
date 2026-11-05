"""Digest only aggregate timings/counts; never copy payloads, tokens or user identifiers."""
import json
from pathlib import Path
import sys

def digest(path):
    data=json.loads(Path(path).read_text(encoding="utf-8"))
    metrics=data["metrics"]
    duration=metrics["http_req_duration"]
    values=duration.get("values",duration)
    failed=metrics["http_req_failed"]
    failures=failed.get("values",failed)
    error_rate=failures.get("rate",failures.get("value"))
    if error_rate is None: raise ValueError("Taxa de erro ausente no resumo")
    return {"p95Ms":values["p(95)"],"errorRate":error_rate,"source":"k6 summary"}
if __name__=="__main__": print(json.dumps(digest(sys.argv[1]),indent=2))
