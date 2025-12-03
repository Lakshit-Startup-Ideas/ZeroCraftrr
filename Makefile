.PHONY: setup run-backend run-frontend test clean

setup:
	@echo "Setting up project..."
	cd backend && python -m venv venv && . venv/bin/activate && pip install -r requirements.txt
	cd frontend && npm install

run-backend:
	@echo "Starting backend..."
	cd backend && uvicorn app.main:app --reload

run-frontend:
	@echo "Starting frontend..."
	cd frontend && npm run dev

test:
	@echo "Running tests..."
	cd backend && pytest

clean:
	@echo "Cleaning up..."
	find . -type d -name "__pycache__" -exec rm -rf {} +
	find . -type f -name "*.pyc" -delete
