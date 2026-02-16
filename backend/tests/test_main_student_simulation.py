import importlib.util
import pathlib
import unittest


def _load_main_module():
    repo_root = pathlib.Path(__file__).resolve().parents[2]
    main_path = repo_root / "backend" / "main.py"
    spec = importlib.util.spec_from_file_location("negotiation_main", main_path)
    if spec is None or spec.loader is None:
        raise RuntimeError("Unable to load backend/main.py for tests")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


main = _load_main_module()


class StudentSimulationParsingTests(unittest.TestCase):
    def test_extract_response_fields_for_student_payload(self):
        text = """
INTERNAL_THOUGHT: He is only talking about modules. My real tension is placement after 2023 passing out.
UPDATED_STATE: {"trust_level": 42, "financial_anxiety": 78, "skepticism": 71, "confusion_level": 65}
MESSAGE: Sir, honestly I am from non-IT background. Placement support for fresher is real or not?
EMOTIONAL_STATE: skeptical
STRATEGIC_INTENT: Validate placement credibility before discussing curriculum.
"""
        parsed = main._extract_response_fields(text)
        self.assertIn("placement", parsed["internal_thought"].lower())
        self.assertEqual(parsed["message"], "Sir, honestly I am from non-IT background. Placement support for fresher is real or not?")
        self.assertEqual(parsed["emotional_state"], "skeptical")
        self.assertEqual(parsed["updated_state"]["trust_level"], 42)
        self.assertEqual(parsed["updated_state"]["skepticism"], 71)

    def test_extract_response_fields_for_counsellor_payload(self):
        text = """
MESSAGE: Great question. We support beginners with guided mentoring and weekly mock interviews.
TECHNIQUES_USED: [workload_validation, objection_reframing]
STRATEGIC_INTENT: Reduce anxiety and build trust.
CONFIDENCE_SCORE: 84
"""
        parsed = main._extract_response_fields(text)
        self.assertEqual(parsed["message"], "Great question. We support beginners with guided mentoring and weekly mock interviews.")
        self.assertEqual(parsed["techniques"], ["workload_validation", "objection_reframing"])
        self.assertEqual(parsed["confidence_score"], 84)
        self.assertEqual(parsed["internal_thought"], "")
        self.assertEqual(parsed["updated_state"], {})

    def test_invalid_updated_state_json_is_ignored(self):
        text = """
INTERNAL_THOUGHT: This sounds too salesy.
UPDATED_STATE: not-a-json
MESSAGE: Can you share refund policy once?
EMOTIONAL_STATE: skeptical
"""
        parsed = main._extract_response_fields(text)
        self.assertEqual(parsed["updated_state"], {})
        self.assertEqual(parsed["emotional_state"], "skeptical")

    def test_merge_student_inner_state_clamps_values(self):
        current = {"trust_level": 50, "financial_anxiety": 40, "skepticism": 60, "confusion_level": 30}
        updates = {"trust_level": 130, "financial_anxiety": -15, "skepticism": "88", "confusion_level": "oops"}
        merged = main._merge_student_inner_state(current, updates)
        self.assertEqual(merged["trust_level"], 100)
        self.assertEqual(merged["financial_anxiety"], 0)
        self.assertEqual(merged["skepticism"], 88)
        self.assertEqual(merged["confusion_level"], 30)


if __name__ == "__main__":
    unittest.main()
