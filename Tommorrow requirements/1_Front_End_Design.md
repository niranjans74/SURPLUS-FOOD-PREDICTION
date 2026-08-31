# Front-End / GUI Design and Layout

The user interface of the **ResqFood Link Platform** is built using **React**, **Vite**, and **Tailwind CSS**. It is designed with clean typography (Outfit/Inter fonts), micro-animations, and a modern glassmorphic theme.

## 1. Visual Aesthetics and Theming
*   **Theme Switcher (Dark & Light Mode)**: Fully integrated into the global state. The system inspects user preferences in `localStorage` or defaults to browser preferences on startup, adding/removing the `dark` class from the root document node.
*   **Color Palette**: Custom tailwind-defined green and orange accent tones:
    *   **Brand Green**: `#10b981` (primary success metrics, maps, timelines)
    *   **Brand Orange**: `#f97316` (warnings, pending claims, transit metrics)
*   **Glassmorphic Design Panels**: Utilizing semi-transparent backdrops (`rgba(255, 255, 255, 0.8)` for light and `rgba(11, 19, 35, 0.85)` for dark) with blur effects (`backdrop-filter`) and borders to create premium container cards.

## 2. Key Interface Screens

### A. Landing Page (`/`)
*   Hero section with clean headers, taglines, CTA (Call-to-Action) buttons directing users to Register or Login, and statistical metric indicators.

### B. User Authentication (`/login` & `/register`)
*   Forms styled with custom validation rules, clean drop-shadow fields, and a critical **Role Dropdown Selector** (Donor, NGO, Admin) which ensures role authorization checks.

### C. Donor Dashboard (`/donor`)
*   Overview cards with metrics: Active Claims, Total Donated (kg), and Environmental Impact (CO₂ saved).
*   Interactive ML Surplus Prediction form.
*   NGO recommendations ranked by compatibility.

### D. NGO Dashboard (`/ngo`)
*   **Incoming Claims Inbox**: Filtered matching requests available to claim.
*   **Fulfillment Control Center**: Drivers dispatch panels, remarks logs, and workflow stage controls.

### E. Admin Dashboard (`/admin`)
*   Analytics panels with Recharts bar and line graphs showing monthly redistribution volumes, carbon offsets, and NGO leaderboards.
