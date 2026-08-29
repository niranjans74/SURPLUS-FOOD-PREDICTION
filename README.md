# ResqFood Link Platform

An eco-friendly commercial surplus food forecasting, smart routing, and transit fulfillment tracking web application built with a FastAPI backend and React (Vite) frontend.

## Key Features

1. **Surplus Forecasting (ML)**: Uses a regression model to estimate surplus weight based on prepared quantities, event details, and attendee analytics.
2. **Smart Routing**: Identifies suitable regional NGOs using a weighted compatibility scoring model (30% Compatibility, 25% Distance, 20% Quantity Fit, 15% Capacity, 10% Urgency) and renders real-time transit routing using Leaflet and the OSRM geometry query service.
3. **Fulfillment & Lifecycle Logs**: Enforces sequential workflow states (`REQUEST CREATED` &rarr; `NGO ACCEPTED` &rarr; `PICKUP ASSIGNED` &rarr; `FOOD COLLECTED` &rarr; `DELIVERED` &rarr; `DISTRIBUTION COMPLETED`) and saves detailed, chronological audit logs.
4. **Data-Driven Impact Dashboards**: Visualizes ecological metric breakdowns (CO₂ saved, meals portioned) and distribution leaderboards utilizing Recharts graphs.

---

## Tech Stack

*   **Backend**: Python, FastAPI, SQLAlchemy, Uvicorn
*   **Database**: SQLite (`food_redistribution.db`) for local lightweight execution
*   **Frontend**: React, Vite, Tailwind CSS, Lucide icons, Recharts, Leaflet (OpenStreetMap)

---

## Development Setup

### 1. Backend Setup
1. Open a PowerShell/Terminal window in the project root:
   ```bash
   # Initialize virtual environment (if not loaded)
   .venv\Scripts\activate
   
   # Re-run fresh database migrations and seed default credentials
   python -m backend.seed
   ```
2. Start the Uvicorn development server:
   ```bash
   python -m uvicorn backend.main:app --reload --port 8000
   ```
   *   The API documentation will be available at: [http://localhost:8000/docs](http://localhost:8000/docs)

### 2. Frontend Setup
1. Open a second Terminal window in the `frontend/` directory:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
2. Open the application landing page at: **[http://localhost:5173](http://localhost:5173)**

---

## End-to-End Demo Simulation Script

You can walk through the full platform lifecycle using the following test credentials:

### Phase 1: Donor surplus forecasting & claim request
1. Open **[http://localhost:5173/login](http://localhost:5173/login)**
2. Enter Donor Credentials:
   *   **Email**: `greenfields@donor.org`
   *   **Password**: `donor123`
   *   **Role**: Select `donor` from dropdown
   *   Click **Sign In**
3. Navigate to **Surplus Prediction** in the sidebar.
4. Fill in the forecast form parameters:
   *   **Food Category**: Cooked Meals / Buffet
   *   **Meal Type**: Lunch
   *   **Day of Week**: Monday
   *   **Event**: Standard Day (No Event)
   *   **Prepared Qty**: `150 kg`
   *   **Expected Attendees**: `200`
   *   **Actual Attendees**: `140`
5. Click **Calculate Predicted Surplus**. The ML engine calculates a surplus of **`44.12 kg`**.
6. On the results card, click **Find Suitable NGOs**.
7. Under the recommendations list, notice the top matched NGO: **Food For All Foundation [Simulated]** (Match Score: **`85.8%`**).
8. Click **Explain Match Breakdown** to view the weighted parameter diagnostics.
9. Click **Select & View Route** to view the physical Leaflet map and transit estimates.
10. Click **Confirm Donation Request** and select **Go to Dashboard** in the popup.
11. Track the active listing on the Donor Dashboard &rarr; click **Track** next to the item to confirm the timeline is active. Log out.

### Phase 2: NGO pickup coordination & delivery fulfillment
1. Go back to the login screen and enter NGO Credentials:
   *   **Email**: `foodforall@ngo.org`
   *   **Password**: `ngo123`
   *   **Role**: Select `ngo` from dropdown
   *   Click **Sign In**
2. On the NGO Dashboard under **Incoming Donation Claims Inbox**, locate the listing and click **Accept Claim**.
3. Scroll down to **Fulfillment Controls** and locate the accepted claim:
   *   Enter Driver Name: `Alex C.`
   *   Enter Driver Phone: `+1-555-1111`
   *   Enter Remarks: `Driver dispatched to donor depot.`
   *   Click **Dispatch Pickup Driver**.
4. Confirm step progress:
   *   Click **Confirm Food Collection** (remarks: `Collected at supermarket dock.`)
   *   Click **Confirm Delivery** (remarks: `Arrived at NGO kitchen bays.`)
   *   Click **Log Receipt & Complete Distribution** (remarks: `Served to local community visitors.`)
5. Verify the listing disappears from active and increments the **Surplus Rescued** metric. Log out.

### Phase 3: Administrator metrics audit
1. Enter Admin Credentials:
   *   **Email**: `admin@platform.org`
   *   **Password**: `admin123`
   *   **Role**: Select `admin`
   *   Click **Sign In**
2. In the Admin Control Panel, verify that **Total Rescued** and **Meals Provided** counters have incremented by the completed donation volume.
3. Click the **Redistribution Analytics Charts** tab to review the Recharts data visualizations.
