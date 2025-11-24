from __future__ import annotations

import math
import statistics
from dataclasses import dataclass
from typing import Callable, Dict, List, Optional

import numpy as np
import optuna
from optuna.samplers import TPESampler
from prometheus_client import Counter, Summary

optimizer_latency = Summary("optimizer_latency_seconds", "Latency of optimization runs")
optimizer_suggestions = Counter("optimizer_suggestions_total", "Total optimization suggestions generated")


@dataclass
class EquipmentConfig:
    name: str
    load_pct: float
    runtime_hours: float
    idle_hours: float


@dataclass
class OptimizationResult:
    objective: float
    energy_kwh: float
    co2_kg: float
    recommended: List[EquipmentConfig]
    baseline_objective: float
    savings_pct: float


class OptimizationEngine:
    """
    Bayesian optimization wrapper that tunes equipment parameters to reduce energy & emissions.
    The objective function delegates to a user-provided callable that returns (energy_kwh, co2_kg).
    """

    def __init__(
        self,
        evaluator: Callable[[List[EquipmentConfig]], Dict[str, float]],
        lambda_weight: float = 0.5,
        n_trials: int = 40,
        random_state: Optional[int] = 42,
    ) -> None:
        self.evaluator = evaluator
        self.lambda_weight = lambda_weight
        self.n_trials = n_trials
        self.random_state = random_state

    def _objective(self, trial: optuna.trial.Trial, baseline: List[EquipmentConfig]):
        configs: List[EquipmentConfig] = []
        for eq in baseline:
            load = trial.suggest_float(f"load_{eq.name}", 0.5 * eq.load_pct, 1.05 * eq.load_pct)
            runtime = trial.suggest_float(f"runtime_{eq.name}", max(0.5 * eq.runtime_hours, 1.0), 1.1 * eq.runtime_hours)
            idle = trial.suggest_float(f"idle_{eq.name}", 0.1, max(eq.idle_hours, 1.0))
            configs.append(EquipmentConfig(eq.name, load, runtime, idle))

        metrics = self.evaluator(configs)
        energy = metrics["energy_kwh"]
        co2 = metrics["co2_kg"]
        objective = energy + self.lambda_weight * co2
        return objective

    @optimizer_latency.time()
    def optimize(self, baseline: List[EquipmentConfig]) -> OptimizationResult:
        baseline_metrics = self.evaluator(baseline)
        baseline_objective = baseline_metrics["energy_kwh"] + self.lambda_weight * baseline_metrics["co2_kg"]

        study = optuna.create_study(
            sampler=TPESampler(seed=self.random_state),
            direction="minimize",
        )
        study.optimize(lambda trial: self._objective(trial, baseline), n_trials=self.n_trials, show_progress_bar=False)
        best_trial = study.best_trial

        recommended: List[EquipmentConfig] = []
        for eq in baseline:
            recommended.append(
                EquipmentConfig(
                    name=eq.name,
                    load_pct=float(best_trial.params[f"load_{eq.name}"]),
                    runtime_hours=float(best_trial.params[f"runtime_{eq.name}"]),
                    idle_hours=float(best_trial.params[f"idle_{eq.name}"]),
                )
            )

        best_metrics = self.evaluator(recommended)
        best_objective = best_metrics["energy_kwh"] + self.lambda_weight * best_metrics["co2_kg"]
        savings_pct = (baseline_objective - best_objective) / baseline_objective * 100.0
        optimizer_suggestions.inc()

        return OptimizationResult(
            objective=float(best_objective),
            energy_kwh=float(best_metrics["energy_kwh"]),
            co2_kg=float(best_metrics["co2_kg"]),
            recommended=recommended,
            baseline_objective=float(baseline_objective),
            savings_pct=float(savings_pct),
        )


def sample_evaluator(configs: List[EquipmentConfig]) -> Dict[str, float]:
    """
    Simple evaluator used in tests. Models energy as quadratic in load/runtime and emissions proportional to energy.
    """
    energy = 0.0
    co2 = 0.0
    for cfg in configs:
        load_factor = cfg.load_pct / 100.0
        efficiency = 0.9 - 0.2 * abs(load_factor - 0.85)
        runtime_effect = cfg.runtime_hours + 0.1 * cfg.idle_hours
        machine_energy = runtime_effect * load_factor / max(efficiency, 0.1) * 10
        energy += machine_energy
        co2 += machine_energy * 0.82
    return {"energy_kwh": energy, "co2_kg": co2}
