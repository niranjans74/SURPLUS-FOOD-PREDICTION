# User Interaction & Unique Features

This section describes how the front-end and back-end components of the **ResqFood Link Platform** communicate with each other and highlights the unique features and design decisions that distinguish the platform.

## 1. Front-End and Back-End Interaction

### A. API Request and Response Architecture

The React-based frontend communicates asynchronously with the **FastAPI backend** using **Axios**. This architecture enables secure and efficient data exchange between the user interface and server-side services.

### JSON Schema Validation

Frontend forms collect user inputs and serialize them into JSON structures that match the **Pydantic schemas** defined by the backend.

Examples include:

* `UserLogin` – Validates user login information.
* `PredictionRequest` – Handles inputs required for surplus food prediction.

This ensures that data sent from the frontend follows the expected backend structure.

### JWT Token Authorization

After successful authentication, the backend generates a **JSON Web Token (JWT)**.

The frontend stores the token in `localStorage`. An Axios request interceptor automatically attaches the token to subsequent API requests using the following authorization format:

`Authorization: Bearer <TOKEN>`

This mechanism allows the backend to authenticate users and enforce role-based access to protected resources.

### Dynamic CORS Policy

The backend uses a dynamic **Cross-Origin Resource Sharing (CORS)** configuration to allow communication between the deployed frontend and backend.

This enables the **GitHub Pages-hosted frontend** to securely communicate with the **Render-hosted FastAPI backend API**.

---

# 2. Unique Features and Design Decisions

## A. Machine Learning Surplus Forecasting

The platform incorporates a **Machine Learning-based surplus forecasting system** to estimate the quantity of excess food that may be available for redistribution.

The prediction pipeline considers factors such as:

* Food category
* Prepared food quantity
* Event type
* Attendance ratio
* Historical event patterns

A **Linear Regression** model is used to generate the surplus prediction.

### Fallback Mechanism

A robust fallback heuristic is implemented alongside the ML pipeline. If the trained ML model or required pipeline artifacts are unavailable, the system can use the fallback mechanism instead of crashing.

This improves the reliability and availability of the application.

---

## B. Weighted NGO Compatibility Scoring

The platform uses a **multi-criteria scoring algorithm** to rank eligible NGOs and identify the most suitable organization for a particular donation.

The scoring system considers the following factors:

| Criteria      | Weight | Purpose                                                           |
| ------------- | -----: | ----------------------------------------------------------------- |
| Compatibility |    30% | Measures alignment between the food category and NGO requirements |
| Distance      |    25% | Evaluates the proximity between donor and NGO                     |
| Quantity Fit  |    20% | Determines whether the NGO can handle the donation quantity       |
| Capacity      |    15% | Considers the NGO's available storage capacity                    |
| Urgency       |    10% | Considers expiry time and food perishability                      |

The final ranking helps donors identify NGOs that are most appropriate for receiving their available surplus food.

---

## C. Live Interactive Route Geometry

Instead of displaying only static map locations, the platform provides **interactive route visualization**.

The system uses:

* **Leaflet** for interactive map rendering
* **OpenStreetMap** for map data
* **OSRM (Open Source Routing Machine)** for route calculation and geometry

The OSRM service is queried to obtain road-based routing information between the donor and recommended NGO.

The resulting route is displayed as an interactive line on the map and can provide information such as:

* Actual road route
* Travel distance
* Estimated transit time
* Route geometry

This feature allows donors and NGOs to better understand the logistics involved in collecting and transporting surplus food.
