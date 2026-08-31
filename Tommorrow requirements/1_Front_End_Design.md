# Front-End / GUI Design and Layout

The user interface of the **ResqFood Link Platform** is developed using **React, Vite, and Tailwind CSS**. The platform follows a modern, responsive, and user-friendly design approach with clean typography, micro-animations, and a glassmorphic visual theme.

## 1. Visual Aesthetics and Theming

### Theme Switcher – Dark & Light Mode

The platform provides a fully integrated **Dark and Light Mode**. The selected theme is stored in `localStorage`, while the initial theme is determined based on the user's browser preferences. The application dynamically adds or removes the `dark` class from the root document element to switch between themes.

### Color Palette

The platform uses custom Tailwind CSS colors to maintain consistent branding:

* **Brand Green – `#10b981`**: Used for primary success indicators, maps, timelines, and positive environmental metrics.
* **Brand Orange – `#f97316`**: Used for warnings, pending claims, alerts, and transit-related metrics.

### Glassmorphic Design Panels

The platform uses **glassmorphic panels** to provide a premium and modern appearance. These panels use semi-transparent backgrounds, blur effects, and subtle borders.

* **Light Mode:** `rgba(255, 255, 255, 0.8)`
* **Dark Mode:** `rgba(11, 19, 35, 0.85)`
* **Blur Effect:** Implemented using `backdrop-filter`

This design is applied consistently across dashboard cards, forms, analytics panels, and other important interface components.

---

# 2. Key Interface Screens

## A. Landing Page (`/`)

The Landing Page serves as the entry point to the ResqFood Link Platform. It provides users with a clear overview of the platform and encourages them to get started.

### Main Components

* Hero section with clear headings and platform taglines
* **Register** and **Login** Call-to-Action (CTA) buttons
* Key statistical indicators
* Modern animations and responsive layout
* Introduction to the food redistribution platform

---

## B. User Authentication (`/login` & `/register`)

The authentication section provides secure and user-friendly interfaces for logging into and registering with the platform.

### Main Components

* Clean and responsive login and registration forms
* Custom input validation
* Styled form fields with drop-shadow effects
* Password and user-information fields
* **Role Dropdown Selector** with the following roles:

  * Donor
  * NGO
  * Admin

The selected role is used to perform appropriate **role-based authorization checks** and provide access to the corresponding dashboard.

---

## C. Donor Dashboard (`/donor`)

The Donor Dashboard allows food donors to manage their donations and monitor their contribution to food redistribution.

### Main Components

* **Active Claims** – Displays the number of currently active donation claims.
* **Total Donated (kg)** – Shows the total quantity of food donated.
* **Environmental Impact (CO₂ Saved)** – Displays the estimated environmental impact of the donor's contributions.
* **ML Surplus Prediction Form** – Allows donors to predict potential food surplus using machine-learning functionality.
* **NGO Recommendations** – Displays NGOs ranked according to their compatibility with the donor's available food.

---

## D. NGO Dashboard (`/ngo`)

The NGO Dashboard enables organizations to discover available food donations, manage claims, and coordinate fulfillment.

### Main Components

#### Incoming Claims Inbox

Displays matching donation requests and allows NGOs to filter and review incoming claims.

#### Fulfillment Control Center

Provides tools for managing the complete fulfillment process, including:

* Driver dispatch panels
* Driver assignment and coordination
* Remarks and activity logs
* Workflow stage controls
* Claim status tracking

This helps NGOs efficiently manage the collection and delivery of donated food.

---

## E. Admin Dashboard (`/admin`)

The Admin Dashboard provides administrators with a centralized view of the platform's overall performance and activities.

### Analytics Components

The dashboard uses **Recharts** to display interactive data visualizations, including:

* **Monthly Redistribution Volume** – Bar and line charts showing food redistribution trends.
* **Carbon Offset Analytics** – Displays the environmental impact and estimated carbon savings.
* **NGO Leaderboard** – Ranks NGOs based on their contribution and redistribution activities.

These analytics help administrators monitor platform performance, identify trends, and make data-driven decisions.
