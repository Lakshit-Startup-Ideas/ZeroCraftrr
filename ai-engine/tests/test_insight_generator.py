import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parents[1]))

from llm.insight_generator import InsightGenerator  # type: ignore  # noqa: E402


def test_insight_generator_returns_confident_response():
    generator = InsightGenerator()
    context = {
        "energy_summary": "Energy peaked at 420 kWh yesterday.",
        "forecast_summary": "Expected 5% rise during afternoon shift.",
        "optimization_summary": "Reducing press #3 load by 8% saves 12 kWh.",
    }
    response = generator.generate(context, seed=123)

    assert "insight" in response and response["insight"]
    assert response["confidence"] >= 0.75
