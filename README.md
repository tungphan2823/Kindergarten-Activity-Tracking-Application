

## 🌟 **Overview**
This project focuses on developing a **Kindergarten Activity Tracking Web Application** using the **MERN stack** (MongoDB, Express.js, React.js, Node.js). The project aims to enhance the management of kindergarten activities by providing a secure and user-friendly platform for **managers**, **caretakers**, and **parents**. The application streamlines attendance tracking, communication, and administrative tasks while offering role-based access control for user groups.


## ✨ **Key Features**
- **Role-Based Dashboards**:
  - **Managers**: Manage children’s records, assign caretakers, and organize groups.
  - **Caretakers**: Track attendance and add daily comments on children’s activities.
  - **Parents**: View their child’s attendance history and caretaker feedback.

- **Secure Authentication**:
  - JWT-based authentication with access and refresh tokens.
  - Role-based authorization to ensure data security.

- **Responsive Design**:
  - Built with React.js and Tailwind CSS for a modern, mobile-friendly interface.

- **Efficient Data Management**:
  - MongoDB Atlas for scalable NoSQL database storage.
  - Well-defined relationships between users, children, groups, attendance records, and comments.

---

## 🛠️ **Technologies Used**
### Frontend
- React.js (with TypeScript)
- Tailwind CSS
- Redux Toolkit (state management)
- Axios (API requests)
- React Router DOM (routing)

### Backend
- Node.js (with TypeScript)
- Express.js
- JSON Web Tokens (JWT) for authentication
- Mongoose (MongoDB integration)

### Database
- MongoDB Atlas (NoSQL database)

---

## 🚀 **Getting Started**
Follow these steps to set up the project locally:

### Prerequisites
1. Install [Node.js](https://nodejs.org/) (v16+).
2. Set up a [MongoDB Atlas](https://www.mongodb.com/atlas/database) cluster or install MongoDB locally.
3. Install Git for version control.

---
### Setup

1. Clone the repository:
   ```bash
   git clone [<repo-url>](https://github.com/tungphan2823/Kindergarten-Activity-Tracking-Application)
   ```
### Backend Setup

2. Install dependencies:
   ```bash
   cd backend
   npm install
   ```
3. Create a `.env` file in the root directory with the following variables:
   ```
   MONGODB_URL=<your-mongodb-url>
   ACCESS_TOKEN_SECRET=<your-access-token-secret>
   REFRESH_TOKEN_SECRET=<your-refresh-token-secret>
   ```
4. Start the backend server:
   ```bash
   npm run dev
   ```
5. The server will run on `http://localhost:3000`.

---

### Frontend Setup

2. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. The client will run on `http://localhost:5173`.

---

## 📂 **Project Structure**

### Backend (`/backend`)
- `src/controllers`: Handles API business logic.
- `src/models`: Defines MongoDB schemas (Users, Children, Groups, etc.).
- `src/routes`: Manages API endpoints.
- `src/middleware`: Includes authentication and authorization logic.

### Frontend (`/frontend`)
- `src/pages`: Contains main views (e.g., dashboards for managers, caretakers, parents).
- `src/components`: Reusable UI components.
- `src/stores`: Manages global state using Redux Toolkit.

---
## **Overview Image**
![image](https://github.com/user-attachments/assets/7fa232ef-cb02-4936-9ffa-80e45d4edca1)

![image](https://github.com/user-attachments/assets/c90a579e-b3c7-4c21-a990-4c497386bb44)

![image](https://github.com/user-attachments/assets/f89514d4-b356-47e3-a355-8450009d87e1)



## 🧪 **Testing**
The system includes test cases for core functionalities such as:
- Authentication and token validation.
- CRUD operations on users, children, and groups.
Testing is conducted using tools like Jest or Mocha to ensure reliability.

---

## 📈 **Future Enhancements**
1. Implement real-time notifications for parents.
2. Add detailed reporting features for attendance trends.
3. Introduce multi-language support to cater to diverse users.

---

## 🙏 **Acknowledgments**
This project was developed as part of a thesis at **Vaasan Ammattikorkeakoulu University of Applied Sciences**, under the guidance of **Dr. Ghodrat Moghadampour**. Special thanks to my family and friends for their unwavering support throughout this journey.

--- 


