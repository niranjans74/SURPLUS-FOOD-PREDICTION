Functionalities and Workflow

The ResqFood Link Platform** implements a complete end-to-end food donation, claim, fulfillment, and distribution lifecycle. The system provides different functionalities based on user roles and protects role-specific features using route guards and authorization mechanisms.

1. Role-Based Capabilities

 A. Donor Role

The Donor module allows food donors to predict surplus, identify suitable NGOs, and create donation requests.
Surplus Weight Forecasting

The platform uses historical event patterns and attendee counts to predict the expected surplus food quantity in kilograms. This helps donors estimate the amount of food available for redistribution.
 NGO Suitability Scoring

The system evaluates available NGOs and recommends the most suitable organizations based on factors such as location and compatibility with the donation.

 Interactive Maps

Interactive maps are provided using **Leaflet**. The platform uses the **OSRM geometry query service** to generate routing information between the donor's location and recommended NGOs.

 Request Creation

After selecting a suitable NGO, the donor can create and submit a donation request. The request is then made available in the matching NGO's incoming claims inbox.

 B. NGO Role

The NGO module enables organizations to receive donation requests and manage the complete fulfillment process.
Accept Claims

NGOs can view incoming donation requests and accept suitable claims. Once a claim is accepted, it is locked to that NGO and cannot be accepted by another NGO.

 Fulfillment Tracking

NGOs can manage the fulfillment process by:

* Assigning drivers
* Recording driver details
* Adding remarks and comments
* Updating delivery stages
* Tracking the progress of each donation request


C. Admin Role

The Admin module provides centralized monitoring and analytics for the entire platform.

 Global Overview

Administrators can monitor cumulative platform statistics, including:

* Total food saved in kilograms
* Total carbon reduction
* Total meals delivered

 Analytics Charts

Interactive analytics charts allow administrators to monitor:

* Monthly redistribution trends
* Donation distribution
* Overall platform performance
* Food redistribution patterns



2. Claim State Transition Lifecycle Workflow

Every donation request follows a **strict sequential workflow**. The status of a request changes as it moves from creation to final community distribution.

1. `REQUEST CREATED`

The donor creates a donation request containing details such as food category, meal type, quantity, and expiry time. The request becomes visible to matching NGOs.

2. `NGO ACCEPTED`

An eligible NGO accepts the donation request. Once accepted, the claim is locked to that NGO, preventing other NGOs from claiming the same donation.

3. `PICKUP ASSIGNED`

A driver is assigned to collect the food. The system records the driver's name, phone number, and relevant remarks.

 4. `FOOD COLLECTED`

The assigned driver collects the donated food from the donor's location. The claim status is updated to indicate successful collection.

5. `DELIVERED`

The driver delivers the collected food to the assigned NGO. The delivery is recorded and the claim moves to the delivered stage.

 6. `DISTRIBUTION COMPLETED`

The NGO distributes the food to the intended community. Once distribution is completed, the platform updates its global statistics, including total food redistributed, meals delivered, and environmental impact.

 Complete Workflow

Donor → Request Created → NGO Accepted → Pickup Assigned → Food Collected → Delivered → Distribution Completed → Global Statistics Updated**

This workflow ensures that every donation can be tracked from its initial creation through final distribution, providing transparency, accountability, and efficient coordination between donors, NGOs, and administrators.
