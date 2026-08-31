# Back-End / Database Design

The server-side application of the **ResqFood Link Platform** is developed using **FastAPI (Python)**. The backend follows a modular architecture with separate routers, **Pydantic** for schema validation, and **SQLAlchemy** for database mapping and ORM operations.

## 1. Database Architecture

The platform supports a dual-database configuration to provide both production reliability and local development flexibility.

### Production Database

The production environment supports:

* **MySQL**
* **PostgreSQL**

The database connection is configured using the `DATABASE_URL` environment variable.

### Local and Ephemeral Fallback

If a MySQL or PostgreSQL connection is unavailable, the application automatically uses an **SQLite** database named:

`food_redistribution.db`

This fallback allows the platform to continue operating during local development and testing without requiring an external database server.

---

# 2. Table Structures and Relationships

## A. Users Table (`users`)

The `users` table manages user authentication credentials and basic role information.

### Columns

* `id` – Primary Key (PK)
* `email` – Unique user email address
* `password_hash` – Encrypted/hashed password
* `role` – User role (`donor`, `ngo`, or `admin`)
* `name` – User's name
* `phone` – Contact number

This table acts as the central user table for authentication and role-based access control.

---

## B. Donor Profiles Table (`donors`)

The `donors` table stores information about commercial organizations or individuals that donate surplus food.

### Columns

* `id` – Primary Key (PK)
* `user_id` – Foreign Key (FK) referencing `users.id`
* `company_name` – Name of the donor company
* `donor_type` – Type/category of donor
* `address` – Donor location
* `latitude` – Geographic latitude
* `longitude` – Geographic longitude
* `approval_status` – Donor verification/approval status

---

## C. NGO Profiles Table (`ngos`)

The `ngos` table stores information about organizations responsible for receiving and redistributing surplus food.

### Columns

* `id` – Primary Key (PK)
* `user_id` – Foreign Key (FK) referencing `users.id`
* `organization_name` – Name of the NGO
* `registration_number` – Official NGO registration number
* `address` – NGO location
* `latitude` – Geographic latitude
* `longitude` – Geographic longitude
* `approval_status` – NGO verification/approval status

---

## D. Donation Requests Table (`donation_requests`)

The `donation_requests` table manages surplus food donations created by donors and tracks their current status.

### Columns

* `id` – Primary Key (PK)
* `donor_id` – Foreign Key (FK) referencing `donors.id`
* `food_category` – Category of donated food
* `meal_type` – Type of meal or food
* `quantity_kg` – Quantity of food in kilograms
* `created_at` – Date and time when the donation was created
* `expiry_time` – Expiry time of the available food
* `status` – Current donation/claim status

---

## E. Fulfillment Logs Table (`fulfillment_logs`)

The `fulfillment_logs` table maintains a chronological audit trail of donation claims and their fulfillment process.

### Columns

* `id` – Primary Key (PK)
* `donation_request_id` – Foreign Key (FK) referencing `donation_requests.id`
* `status_from` – Previous status
* `status_to` – New status
* `logged_at` – Date and time of the status change
* `driver_name` – Assigned driver's name
* `driver_phone` – Driver's contact number
* `remarks` – Additional notes or comments

The fulfillment log provides a complete history of status changes and delivery-related activities for each donation request.

---

# 3. Relationships and Constraints

The database uses foreign keys and relational constraints to maintain data consistency.

### User → Profile

**One-to-One Relationship**

A user can have a corresponding donor or NGO profile.

`users.id → donors.user_id`

`users.id → ngos.user_id`

---

### Donor → Donation Requests

**One-to-Many Relationship**

A single donor can create multiple donation requests.

`donors.id → donation_requests.donor_id`

---

### Donation Requests → Fulfillment Logs

**One-to-Many Relationship**

A single donation request can have multiple fulfillment log entries as its status changes throughout the process.

`donation_requests.id → fulfillment_logs.donation_request_id`

### Overall Relationship Flow

**Users → Donor/NGO Profiles → Donation Requests → Fulfillment Logs**

This relational structure provides organized data management, maintains referential integrity, and enables efficient tracking of food donations from creation through final fulfillment.
