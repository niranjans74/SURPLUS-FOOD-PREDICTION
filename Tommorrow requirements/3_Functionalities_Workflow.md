# Functionalities and Workflow

The platform implements a complete end-to-end claim and tracking lifecycle, separated by user roles and secured via route guards.

## 1. Role-Based Capabilities

### A. Donor Role
*   **Surplus Weight Forecasting**: Uses historical event patterns and attendee counts to predict surplus weights.
*   **NGO Suitability Scoring**: Suggests top matching local NGOs for the donation.
*   **Interactive Maps**: Renders routing geometry between the donor and recommended NGOs using Leaflet and the OSRM geometry query service.
*   **Request Creation**: Submits the claim to the matching inbox.

### B. NGO Role
*   **Accept Claims**: Accesses incoming claims and accepts matches.
*   **Fulfillment Tracking**: Dispatches drivers, logs real-time comments, and updates delivery stages.

### C. Admin Role
*   **Global Overview**: Audits cumulative statistics (total kg saved, carbon reduction, total meals delivered).
*   **Analytics Charts**: Monitors monthly trends and donation distributions.

---

## 2. Claim State Transition Lifecycle Workflow
All donations progress through strict, sequential states:

1.  **`REQUEST CREATED`**: Added by a donor; visible to matching NGOs.
2.  **`NGO ACCEPTED`**: Claim accepted by an NGO; locked from other NGOs.
3.  **`PICKUP ASSIGNED`**: Driver details (name, phone, remarks) logged.
4.  **`FOOD COLLECTED`**: Driver collects food at donor's location.
5.  **`DELIVERED`**: Driver arrives at the NGO and completes delivery.
6.  **`DISTRIBUTION COMPLETED`**: NGO distributes food to the community; the stats increment globally.
