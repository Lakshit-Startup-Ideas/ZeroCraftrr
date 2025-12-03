import mlflow
import mlflow.sklearn
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, r2_score
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def generate_synthetic_data(n_samples=1000):
    """Generate synthetic telemetry data for training."""
    np.random.seed(42)
    # Features: hour of day, day of week, previous temp, previous pressure
    hours = np.random.randint(0, 24, n_samples)
    days = np.random.randint(0, 7, n_samples)
    prev_temp = np.random.normal(25, 5, n_samples)
    prev_pressure = np.random.normal(1013, 10, n_samples)
    
    X = pd.DataFrame({
        'hour': hours,
        'day': days,
        'prev_temp': prev_temp,
        'prev_pressure': prev_pressure
    })
    
    # Target: Next hour temperature (simple linear relation + noise)
    y = 0.5 * prev_temp + 0.1 * hours + np.random.normal(0, 1, n_samples)
    
    return X, y

def train():
    mlflow.set_tracking_uri("http://localhost:5000")
    mlflow.set_experiment("zerocraftr-forecasting")
    
    logger.info("Generating synthetic data...")
    X, y = generate_synthetic_data()
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    with mlflow.start_run():
        params = {"n_estimators": 100, "max_depth": 10}
        mlflow.log_params(params)
        
        logger.info("Training model...")
        model = RandomForestRegressor(**params)
        model.fit(X_train, y_train)
        
        predictions = model.predict(X_test)
        mse = mean_squared_error(y_test, predictions)
        r2 = r2_score(y_test, predictions)
        
        logger.info(f"Model Metrics - MSE: {mse:.4f}, R2: {r2:.4f}")
        mlflow.log_metrics({"mse": mse, "r2": r2})
        
        mlflow.sklearn.log_model(model, "model")
        logger.info("Model saved to MLflow.")

if __name__ == "__main__":
    train()
