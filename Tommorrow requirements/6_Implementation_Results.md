# Implementation & Results

The system has been successfully verified, hosted, and deployed online.

## 1. Automated Build Verification
*   **Frontend**: Built and verified using `npm run build` in the `frontend` workspace:
    *   No compilation or JSX syntax errors.
    *   Correct routing index files generated.
*   **Backend**: Verified via Python syntax compilation and database seeding tests.

---

## 2. Live Hosting URL Locations

### A. Frontend GUI (GitHub Pages)
The web application user interface is hosted live on GitHub Pages:
👉 **[https://niranjans74.github.io/SURPLUS-FOOD-PREDICTION/](https://niranjans74.github.io/SURPLUS-FOOD-PREDICTION/)**

### B. Backend API Service (Render)
The FastAPI backend server database is hosted live on Render:
👉 **`https://surplus-food-prediction.onrender.com`**

---

## 3. How to Run Locally

### A. Start the Backend:
1. Navigate to the project root.
2. Initialize virtual environment and seed:
   ```bash
   .venv\Scripts\activate
   python -m backend.seed
   ```
3. Start the server:
   ```bash
   python -m uvicorn backend.main:app --reload --port 8000
   ```

### B. Start the Frontend:
1. Navigate to the `frontend/` directory.
2. Install and run Vite:
   ```bash
   npm install
   npm run dev
   ```
3. Open `http://localhost:5173`.
