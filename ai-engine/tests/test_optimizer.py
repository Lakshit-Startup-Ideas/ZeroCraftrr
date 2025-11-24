import json
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parents[1]))

from models.optimizer import EquipmentConfig, OptimizationEngine, sample_evaluator  # type: ignore  # noqa: E402


def test_optimizer_generates_improvement():
    baseline = [
        EquipmentConfig(name="machine_1", load_pct=90, runtime_hours=16, idle_hours=4),
        EquipmentConfig(name="machine_2", load_pct=80, runtime_hours=12, idle_hours=6),
    ]
    engine = OptimizationEngine(sample_evaluator, lambda_weight=0.6, n_trials=20, random_state=7)

    result = engine.optimize(baseline)

    assert result.objective < result.baseline_objective
    assert result.savings_pct > 0
    assert all(cfg.load_pct > 0 for cfg in result.recommended)
    serialized = json.dumps([cfg.__dict__ for cfg in result.recommended])
    assert isinstance(json.loads(serialized), list)
