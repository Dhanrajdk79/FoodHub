# FoodHub – Full-Stack Food Ordering & Management Application

FoodHub is a full-stack food ordering and administration application built with React, Node.js, Express, and SQLite. It was deployed to an AWS EC2 instance running Amazon Linux 2023.

**Frontend:** React + Vite  
**Backend:** Node.js + Express.js  
**Database:** SQLite (`better-sqlite3`)  
**Deployment:** AWS EC2

## Overview

FoodHub demonstrates how a React frontend communicates with a REST API and database to support food-ordering and administration workflows.

The frontend uses Axios to send HTTP requests to the Express backend. The backend processes requests through routes, middleware, controllers, services, and models, then reads or writes data in SQLite.

## Features

### Customer
- User registration and login
- Browse food items and categories
- Manage cart items
- Place and view orders

### Admin
- Protected admin dashboard
- Manage food items and availability
- View and manage orders
- View customer information
- View sales and payment analytics
- View notifications, mark them as read, and clear read notifications

Feature availability may depend on the current application configuration and database contents.

## Technology Stack

| Area | Technologies |
|---|---|
| Frontend | React, JavaScript, HTML, CSS |
| Frontend tooling | Vite |
| HTTP client | Axios |
| Backend | Node.js, Express.js |
| Database | SQLite, better-sqlite3 |
| Authentication | JSON Web Tokens (JWT) |
| Password security | bcrypt |
| HTTP security headers | Helmet |
| Cross-origin requests | CORS |
| Version control | Git, GitHub |
| Cloud hosting | AWS EC2, Amazon Linux 2023 |

## Architecture

```text
Browser
  |
  v
React + Vite frontend
  |
  | Axios / HTTP / JSON
  v
Node.js + Express REST API
  |
  v
Routes -> Middleware -> Controllers
  |
  v
Services and Models
  |
  v
SQLite database

Hosted on AWS EC2
```

### Backend request lifecycle

1. **Routes** match the requested API endpoint and HTTP method.
2. **Middleware** performs authentication, authorization, and request checks.
3. **Controllers** handle requests and coordinate application operations.
4. **Services** contain reusable business logic or event-driven functionality when needed.
5. **Models** execute database queries.
6. **SQLite** stores or retrieves application data.
7. The backend returns a JSON response to the frontend.

Not every request needs a separate service; simple controllers may call models directly.

## Important application flows

### Login

1. The user submits login details through React.
2. Axios sends the request to the Express API.
3. The backend verifies the user and compares the password using bcrypt.
4. After successful authentication, the backend creates a JWT.
5. The frontend receives and stores the token in local storage.
6. An Axios request interceptor attaches the token to protected requests.
7. Backend middleware verifies the token and checks the user's role where required.

### Food data

```text
React page -> Axios -> Express route -> Controller
           -> Model -> SQLite -> JSON response -> React
```

### Admin notifications

FoodHub uses Node.js EventEmitter through a shared event bus for order-created notifications.

```text
Order created
    |
    v
"order:created" event emitted
    |
    v
Notification service listens
    |
    v
Insert notification into admin_notifications
    |
    v
Admin dashboard requests notifications
    |
    v
Notification appears in the UI
```

The notification table stores the notification type, related order details, customer name, order amount, read status, and creation time.

## Backend structure

```text
backend/
├── database/
│   └── foodhub.db
├── src/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   └── eventBus.js
├── app.js
├── server.js
├── package.json
└── .env
```

| File or folder | Responsibility |
|---|---|
| `config/` | Configuration such as the database connection |
| `routes/` | API endpoint definitions |
| `middleware/` | Authentication, authorization, and request checks |
| `controllers/` | Request handling and responses |
| `models/` | Database operations |
| `services/` | Reusable business logic and event listeners |
| `eventBus.js` | Shared EventEmitter instance |
| `app.js` | Express configuration and route registration |
| `server.js` | Starts the HTTP server |

## Database

FoodHub uses SQLite through `better-sqlite3`. Application data includes areas such as users, foods, categories, cart and order information, payments, invoices, and admin notifications.

The `admin_notifications` table includes:

| Column | Purpose |
|---|---|
| `id` | Unique notification ID |
| `type` | Notification type |
| `order_id` | Related order ID |
| `order_number` | Related order number |
| `customer_name` | Customer associated with the order |
| `total_amount` | Order amount |
| `is_read` | Whether the notification has been read |
| `created_at` | Notification creation timestamp |

Do not commit production database files or personal customer information to a public repository.

## Authentication and security

The backend uses JWT authentication, `protect` middleware to verify bearer tokens, `adminOnly` middleware to restrict admin routes, bcrypt for password hashing, Helmet for HTTP security headers, and CORS for cross-origin request configuration.

**Production note:** This learning deployment stores the JWT in browser local storage. Before production use, review token storage, cookie-based authentication options, HTTPS, CORS origins, rate limiting, input validation, and secret rotation.

Never commit `.env`, private keys, credentials, JWT secrets, or production database files to GitHub.

## Run locally

### Prerequisites

- Node.js and npm
- Git

### 1. Clone the repository

```bash
git clone https://github.com/Dhanrajdk79/FoodHub.git
cd FoodHub
```

### 2. Install backend dependencies

```bash
cd backend
npm install
```

Create a backend `.env` file using the variables expected by your backend code. For example:

```env
PORT=5000
JWT_SECRET=replace_with_a_long_random_secret
```

Use a strong, private secret in your own environment. Check the source code for any additional required environment variables.

### 3. Start the backend

The deployed project uses the `start` script. Run:

```bash
npm start
```

The backend uses port `5000` by default unless `PORT` is set differently.

### 4. Install frontend dependencies

Open another terminal:

```bash
cd frontend
npm install
```

### 5. Configure the frontend API URL

Update the Axios base URL in the frontend API service (for example, `src/services/api.js`) to point to your backend. For local development, it may look like:

```javascript
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json"
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;
```

Keep the export style and import identifier consistent with the rest of your frontend code.

### 6. Start the frontend

```bash
npm run dev
```

Vite normally serves the development frontend at:

```text
http://localhost:5173
```

## Environment variables

| Variable | Purpose |
|---|---|
| `PORT` | Backend listening port |
| `JWT_SECRET` | Secret used to sign and verify JWTs |

Check the backend source for the complete set of variables required by your version. Keep `.env` out of version control and use a separate secret for each environment.

## API overview

The backend exposes REST API groups under `/api`.

| API group | Example route | Purpose |
|---|---|---|
| Foods | `GET /api/foods` | Retrieve food items |
| Categories | `/api/categories` | Category operations |
| Authentication | `/api/auth` | Registration and login |
| Cart | `/api/cart` | Cart operations |
| Orders | `/api/orders` | Order operations |
| Admin | `/api/admin` | Protected admin operations |
| Admin notifications | `GET /api/admin/notifications` | Retrieve notifications |
| Unread count | `GET /api/admin/notifications/unread-count` | Retrieve unread count |

Admin endpoints require authentication and admin-role authorization. Refer to the route files for the complete endpoint list, HTTP methods, request bodies, and response formats.

## AWS EC2 deployment

The application was deployed to an AWS EC2 instance running Amazon Linux 2023. Deployment work included:

1. Launching an EC2 instance and connecting with SSH and a PEM key.
2. Installing Node.js and npm on Amazon Linux.
3. Transferring the project and installing dependencies on EC2.
4. Configuring the SQLite database on the server.
5. Updating the frontend API base URL to reach the EC2 backend.
6. Configuring EC2 Security Group inbound rules for testing.
7. Starting the frontend and backend processes and verifying the application in a browser.

### Development deployment versus production

The EC2 learning deployment used Vite's development server for the frontend and a Node.js process for the backend. This is useful for learning and testing, but it is not the recommended permanent production setup.

For production, consider:

- Build the frontend with `npm run build`.
- Serve the built frontend using Nginx or another production web server.
- Run the backend with PM2 or a systemd service.
- Configure a domain name and HTTPS.
- Restrict Security Group inbound rules to only the ports that must be public.
- Keep SQLite on persistent storage and schedule backups.
- Configure production CORS origins and secure environment variables.
- Monitor application logs and server health.

Do not expose development ports such as Vite's `5173` publicly for a permanent production deployment.

## Troubleshooting

### API returns 401
- Confirm the user is logged in.
- Confirm the frontend sends `Authorization: Bearer <token>`.
- Check that the token is valid and has not expired.
- Confirm the backend has the correct `JWT_SECRET`.

### Admin API returns 403
- Confirm the authenticated user's token contains the expected admin role.
- Check the `adminOnly` middleware and user role data.

### Notifications return an internal server error
- Check backend logs for the underlying SQLite error.
- Confirm `admin_notifications` exists in the database file used by the running backend.
- Confirm the table columns match the notification model and service queries.

### Frontend cannot reach the backend
- Verify the Axios base URL.
- Confirm the backend is running on the expected port.
- Check EC2 Security Group rules and server firewall settings.
- Inspect the browser Network tab and backend logs.

## Future improvements

- Production frontend hosting with Nginx
- HTTPS and custom domain configuration
- PM2 or systemd process management
- Automated API and integration tests
- Improved request validation and centralized error handling
- Database migrations and automated backups
- CI/CD pipeline
- Production monitoring and logging

## Learning outcomes

Working on FoodHub provided practical experience with:

- Building a React frontend
- Creating REST APIs using Node.js and Express
- Organizing backend code into routes, middleware, controllers, services, and models
- Connecting an application to SQLite
- Implementing JWT authentication and role-based access checks
- Using an event bus for order-created notifications
- Debugging frontend, backend, and database integration issues
- Deploying a full-stack application to AWS EC2 using Linux and SSH

## Repository

[GitHub – Dhanrajdk79/FoodHub](https://github.com/Dhanrajdk79/FoodHub)

---

FoodHub is a hands-on full-stack learning project. Suggestions and feedback are welcome.
