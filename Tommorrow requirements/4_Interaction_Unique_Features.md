# User Interaction & Unique Features

This section details how the front-end and back-end interact, along with the unique features that differentiate this project.

## 1. Front-End and Back-End Interaction

### A. API Request & Response Architecture
The frontend React app communicates with the backend FastAPI application asynchronously using **Axios**:
*   **JSON Schema Validation**: Frontend forms serialize inputs matching Pydantic schemas defined on the backend (e.g. `UserLogin`, `PredictionRequest`).
*   **JWT Token Authorization**: Once logged in, the frontend stores the JSON Web Token in `localStorage`. An Axios request interceptor injects the token into the `Authorization: Bearer <TOKEN>` header of all subsequent API calls.
*   **Dynamic CORS Policy**: Enables seamless request handling between the GitHub Pages hosted frontend and the Render hosted backend API.

---

## 2. Unique Features and Design Decisions

### A. Machine Learning Surplus Forecasting
*   Utilizes a linear regression pipeline trained on food category, prepared quantity, event type, and attendance ratios.
*   *Design Decision*: Built with a robust fallback heuristic to handle missing ML pipeline artifacts seamlessly without crashing the application.

### B. Weighted NGO Compatibility Scoring
*   ranks eligible NGOs for a donation request using a multi-criteria scoring algorithm:
    *   **30% Compatibility**: Food category alignment.
    *   **25% Distance**: Proximity using latitudinal/longitudinal coordinates.
    *   **20% Quantity Fit**: Daily capacity matching donation size.
    *   **15% Capacity**: Excess storage capability.
    *   **10% Urgency**: Expiry time and food type perishability.

### C. Live Interactive Route Geometry
*   Instead of static maps, the system uses Leaflet and OpenStreetMap.
*   Queries the OSRM (Open Source Routing Machine) API to fetch exact road geometry, rendering real-time route lines, turn-by-turn distance details, and estimated transit times.
