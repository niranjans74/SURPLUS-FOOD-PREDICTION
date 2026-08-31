# Back-End / Database Design

The server-side application is built using **FastAPI (Python)**, applying modular router separation, schema validation with Pydantic, and database mapping using SQLAlchemy.

## 1. Database Architecture
The platform is designed to run with a dual database configuration:
*   **Production**: MySQL or PostgreSQL database connection (configured via `DATABASE_URL` env variable).
*   **Local & Ephemeral Fallback**: SQLite database (`food_redistribution.db`) initialized automatically if MySQL/PostgreSQL is unavailable.

## 2. Table Structures & Relationships

### A. Users Table (`users`)
*   Manages authentication credentials and baseline roles.
*   *Columns*: `id` (PK), `email` (Unique), `password_hash`, `role` (donor/ngo/admin), `name`, `phone`.

### B. Donor Profiles Table (`donors`)
*   Stores details about commercial food donors.
*   *Columns*: `id` (PK), `user_id` (FK -> users.id), `company_name`, `donor_type`, `address`, `latitude`, `longitude`, `approval_status`.

### C. NGO Profiles Table (`ngos`)
*   Stores details about regional food redistribution organizations.
*   *Columns*: `id` (PK), `user_id` (FK -> users.id), `organization_name`, `registration_number`, `address`, `latitude`, `longitude`, `approval_status`.

### D. Donation Requests Table (`donation_requests`)
*   Manages excess food claims created by Donors.
*   *Columns*: `id` (PK), `donor_id` (FK -> donors.id), `food_category`, `meal_type`, `quantity_kg`, `created_at`, `expiry_time`, `status`.

### E. Fulfillment Logs Table (`fulfillment_logs`)
*   Chronological audit log for claims tracking.
*   *Columns*: `id` (PK), `donation_request_id` (FK -> donation_requests.id), `status_from`, `status_to`, `logged_at`, `driver_name`, `driver_phone`, `remarks`.

## 3. Relationships and Constraints
*   **User to Profile**: One-to-One (`users.id` matches with `donors.user_id` or `ngos.user_id`).
*   **Donor to Claims**: One-to-Many (`donors.id` FK in `donation_requests`).
*   **Claims to Logs**: One-to-Many (`donation_requests.id` FK in `fulfillment_logs`).
