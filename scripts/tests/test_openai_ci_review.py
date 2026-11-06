import importlib.util
import json
from pathlib import Path
import unittest
from unittest.mock import MagicMock, patch
from urllib.error import HTTPError

spec = importlib.util.spec_from_file_location("openai_review", Path(__file__).resolve().parents[1] / "openai_ci_review.py")
review = importlib.util.module_from_spec(spec)
spec.loader.exec_module(review)


class OpenAIReviewTest(unittest.TestCase):
    def response(self, **changes):
        value = {"status": "completed", "output": [{"type": "reasoning"}, {
            "type": "message", "content": [{"type": "output_text", "text": "Revisar a validacao."}]}]}
        value.update(changes)
        return value

    def test_request_has_fixed_destination_and_bounded_permissions(self):
        request = review.build_request("diff", "fixture-key")
        payload = json.loads(request.data)
        self.assertEqual(request.full_url, "https://api.openai.com/v1/responses")
        self.assertFalse(payload["store"])
        self.assertEqual(payload["tools"], [])
        self.assertEqual(payload["max_output_tokens"], 2000)
        self.assertEqual(payload["model"], "gpt-6-luna")
        self.assertEqual(payload["input"], "diff")

    def test_missing_key_fails(self):
        with self.assertRaises(ValueError):
            review.build_request("diff", "")

    def test_malformed_key_fails_without_repeating_value(self):
        for key in ("fixture-key\n", "fixture\rkey", "fixture\tkey", "fixture key", "fixture-á"):
            with self.subTest(key=repr(key)):
                with self.assertRaises(ValueError) as caught:
                    review.build_request("diff", key)
                self.assertNotIn("fixture", str(caught.exception))

    @patch.object(review, "build_opener")
    def test_transport_value_error_is_sanitized(self, opener):
        opener.return_value.open.side_effect = ValueError("Invalid header value fixture-key")
        with self.assertRaisesRegex(RuntimeError, "Falha na requisicao") as caught:
            review.request_review("diff", "fixture-key")
        self.assertNotIn("fixture-key", str(caught.exception))

    def test_empty_and_oversized_utf8_input_fail(self):
        for value in ("", " ", "á" * 12001):
            with self.subTest(value_length=len(value)), self.assertRaises(ValueError):
                review.build_request(value, "fixture-key")

    def test_extracts_text_after_reasoning(self):
        self.assertEqual(review.extract_text(self.response()), "Revisar a validacao.")

    def test_incomplete_refusal_tool_calls_and_empty_outputs_fail(self):
        for response in (self.response(status="incomplete"), self.response(output=[]),
                         self.response(output=[{"type": "function_call"}]),
                         self.response(output=[{"type": "message", "content": [{"type": "refusal"}]}])):
            with self.subTest(response=response), self.assertRaises(ValueError):
                review.extract_text(response)

    def test_redirect_is_rejected(self):
        with self.assertRaises(HTTPError):
            review.NoRedirect().redirect_request(None, None, 302, "redirect", {}, "https://example.invalid")

    @patch.object(review, "build_opener")
    def test_one_call_with_timeout_and_no_error_body_exposure(self, opener):
        opener.return_value.open.side_effect = HTTPError("url", 401, "fixture-sensitive-body", {}, None)
        with self.assertRaisesRegex(RuntimeError, "HTTP 401") as caught:
            review.request_review("diff", "fixture-key")
        self.assertNotIn("fixture-sensitive", str(caught.exception))
        self.assertNotIn("fixture-key", str(caught.exception))
        opener.return_value.open.assert_called_once()
        self.assertEqual(opener.return_value.open.call_args.kwargs["timeout"], 120)

    @patch.object(review, "build_opener")
    def test_reads_bounded_response(self, opener):
        response = MagicMock()
        response.read.return_value = json.dumps(self.response()).encode()
        opener.return_value.open.return_value.__enter__.return_value = response
        self.assertEqual(review.request_review("diff", "fixture-key"), "Revisar a validacao.")
        response.read.assert_called_once_with(262145)


if __name__ == "__main__":
    unittest.main()
