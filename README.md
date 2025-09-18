# Open Payments API with Node.js + PostgreSQL

This project implements an API with **Node.js**, **Express**, **PostgreSQL**, and **@interledger/open-payments** that allows:

- Processing payments using the **Open Payments** standard
- Managing products from a PostgreSQL database
- Registering and authenticating users with **JWT**
- Securely uploading private keys with **Multer**

---

## 📦 Technologies Used

- [Node.js](https://nodejs.org/)
- [Express](https://expressjs.com/)
- [PostgreSQL](https://www.postgresql.org/)
- [@interledger/open-payments](https://www.npmjs.com/package/@interledger/open-payments)
- [Multer](https://www.npmjs.com/package/multer)
- [bcrypt](https://www.npmjs.com/package/bcrypt)
- [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken)
- [dotenv](https://www.npmjs.com/package/dotenv)
- [cors](https://www.npmjs.com/package/cors)

---

## ⚙️ Installation

1. Clone the repository

```bash
git clone
cd open-payments-api


2. Install dependencies
npm install

3. Configure environment variables in .env

PORT_API=3000
IP_SERVER=0.0.0.0
CONNECTION_BD=postgresql://user:password@localhost:port/database_name
JWT_SECRET=supersecret

4. Configure package.json to run the program and refresh on changes

{
  "type": "module",
  "scripts": {
    "start": "node src/index.js",
    "dev": "node --env-file .env --watch src/index.js"
  }
}

5. Run the server
npm run dev

6. Project structure
open-payments-api
┣ config
┃ ┗ config.db.js # PostgreSQL connection
┣ controllers
┃ ┣ payments.controller.js
┃ ┣ products.controller.js
┃ ┗ users.controller.js
┣ routes
┃ ┣ payment.route.js
┃ ┣ product.route.js
┃ ┗ users.route.js
┣ uploads # Temporary private keys
┣  index.js # Entry point
┣ package.json
┗ README.md


7. Main endpoints

Authentication

POST /api/register → Register user

POST /api/login → Log in and receive JWT

Products

GET /api/products → List products
GET /api/products/:id → Get product by ID
Payments (Open Payments)
POST /api/process-payment → Start a payment (requires privateKeyFile)
POST /api/finalize-payment → Finalize payment

```
