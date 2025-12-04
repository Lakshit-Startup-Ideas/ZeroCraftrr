import mlflow
import mlflow.sklearn
import mlflow.lightgbm
import pandas as pd
import numpy as np
import lightgbm as lgb
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, r2_score
import logging
import psycopg2
import os

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Database Connection (Should match .env)
DB_URI = os.getenv("SQLALCHEMY_DATABASE_URI", "postgresql://postgres:password@localhost:5432/zerocraftr")

def fetch_data_from_db():
    """Fetch aggregated telemetry data from TimescaleDB."""
    try:
        conn = psycopg2.connect(DB_URI)
        query = """
            SELECT 
                bucket as time,
                device_id,
                avg_temp as temperature,
                avg_pressure as pressure,
                total_power as power_usage
            FROM telemetry_1h
            ORDER BY time DESC
            LIMIT 10000;
        """
        df = pd.read_sql(query, conn)
        conn.close()
        
        if df.empty:
            logger.warning("No data found in DB. Returning empty DataFrame.")
            return df

        # Feature Engineering
        df['time'] = pd.to_datetime(df['time'])
        df['hour'] = df['time'].dt.hour
        df['day'] = df['time'].dt.dayofweek
        
        # Lag features (simplified for batch processing)
        df['prev_temp'] = df.groupby('device_id')['temperature'].shift(1)
        df['prev_pressure'] = df.groupby('device_id')['pressure'].shift(1)
        
        # Drop NaNs created by shifting
        df = df.dropna()
        
        return df
    except Exception as e:
        logger.error(f"Database connection failed: {e}")
        return pd.DataFrame()

def train():
    mlflow_uri = os.getenv("MLFLOW_TRACKING_URI", "http://localhost:5000")
    mlflow.set_tracking_uri(mlflow_uri)
    mlflow.set_experiment("zerocraftr-forecasting-real")
    
    logger.info("Fetching data from database...")
    df = fetch_data_from_db()
    
    if df.empty or len(df) < 50:
        logger.error("Not enough data to train. Please seed more data or wait for ingestion.")
        return

    # Prepare Features and Target
    X = df[['hour', 'day', 'prev_temp', 'prev_pressure']]
    y = df['temperature']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    with mlflow.start_run():
        params = {
            "objective": "regression",
            "metric": "rmse",
            "num_leaves": 31,
            "learning_rate": 0.05,
            "feature_fraction": 0.9
        }
        mlflow.log_params(params)
        
        logger.info("Training LightGBM model...")
        train_data = lgb.Dataset(X_train, label=y_train)
        test_data = lgb.Dataset(X_test, label=y_test, reference=train_data)
        
        model = lgb.train(
            params,
            train_data,
            num_boost_round=100,
            valid_sets=[test_data],
            callbacks=[lgb.early_stopping(stopping_rounds=10)]
        )
        
        predictions = model.predict(X_test, num_iteration=model.best_iteration)
        mse = mean_squared_error(y_test, predictions)
        r2 = r2_score(y_test, predictions)
        
        logger.info(f"Model Metrics - MSE: {mse:.4f}, R2: {r2:.4f}")
        mlflow.log_metrics({"mse": mse, "r2": r2})
        
        mlflow.lightgbm.log_model(model, "model")
        logger.info("Model saved to MLflow.")

if __name__ == "__main__":
    train()
