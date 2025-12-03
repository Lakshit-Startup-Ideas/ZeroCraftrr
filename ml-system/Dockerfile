FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Default command (can be overridden)
CMD ["uvicorn", "inference.predict:app", "--host", "0.0.0.0", "--port", "5000"]
