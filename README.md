# Social Media API

A RESTful API for a social blogging platform where users can **sign up, create posts, send/accept friend requests, manage friends, and interact with posts**.  
Built with **Node.js**, **Express**, and **MongoDB**.

---

## 🚀 Installation & Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/rawaneldkrory/social-media-api.git
   ```

2. Navigate into the project directory:
   ```bash
   cd social-media-api
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Create an `images` folder in the root directory (for uploaded files).

5. Create a `.env` file in the root directory and add:

   ```env
   MONGODB_URI="your_mongodb_connection_string_here"
   JWT_SECRET="your_jwt_secret_here"
   PORT=8080
   ```

6. Run the server:
   ```bash
   npm start
   ```
   The API will run on: **http://localhost:8080**

---

## 📌 API Endpoints

### 🔑 Authentication
- `POST /auth/signup` → Create new user  
- `POST /auth/login` → Log in user  
- `POST /auth/forget-password` → Send reset password email  
- `POST /auth/reset-password` → Reset user password  
- `PUT /auth/update-user/:userId` → Update user profile  
- `PATCH /auth/change-password` → Change password  
- `GET /auth/logout` → Logout user  
- `DELETE /auth/delete-account/:userId` → Delete account  

---

### 👥 Friend Requests
- `POST /requests/send-request/:toUserId` → Send friend request  
- `POST /requests/accept-request/:requestId` → Accept friend request  
- `POST /requests/reject-request/:requestId` → Reject friend request  
- `DELETE /requests/cancel-request/:requestId` → Cancel friend request  
- `GET /requests/incoming` → Get incoming friend requests  
- `GET /requests/outgoing` → Get outgoing friend requests  
- `GET /requests/user-status/:targetUserId` → Get user’s relationship status  

---

### 👫 Friends
- `GET /get-friends` → Get friends list  
- `DELETE /delete-friend/:friendId` → Delete friend  
- `POST /block/:targetUserId` → Block user  
- `POST /unblock/:targetUserId` → Unblock user  
- `GET /blockedUsers` → Get blocked users  

---

### 📝 Posts
- `POST /posts/create-post` → Create new post  
- `DELETE /posts/delete-post/:postId` → Delete post  
- `PATCH /posts/update-post/:postId` → Update post  
- `POST /posts/like/:postId` → Like post  
- `POST /posts/add-comment/:postId` → Add comment  
- `PUT /posts/update-comment/:postId/:commentId` → Update comment  
- `DELETE /posts/delete-comment/:postId/:commentId` → Delete comment  
- `GET /posts/user-posts/:userId` → Get posts by user  
- `GET /posts/single-post/:postId` → Get single post  
- `POST /posts/share-post/:postId` → Share post  
- `GET /posts/feed` → Get feed  

---

## ⚙️ Technologies Used
- Node.js  
- Express.js  
- MongoDB & Mongoose  
- Multer (file uploads)  
- Express-validator  
