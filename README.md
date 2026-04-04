# ProjectHub

A modern, React-based project management and portfolio dashboard. Built with Vite, Firebase, and React Bootstrap.

## Features

-   **User Authentication**: Sign up and login securely via Firebase Auth.
-   **Automation & Integration**: 
    -   **GitHub Integration**: Fetch project name, description, and primary languages directly from a GitHub URL.
    -   **Auto-Screenshot**: Automatically capture and save a screenshot of your live project URL using Microlink API.
-   **User Experience & Interactivity**:
    -   **Drag-and-Drop Reordering**: Manually reorder your projects with a simple drag-and-drop interface (powered by `@dnd-kit`).
    -   **Project Analytics**: Track the number of times your project "Preview" button has been clicked.
    -   **Batch Actions**: Select multiple projects to delete or pin them simultaneously.
    -   **Deployment Status**: Real-time "Online/Offline" indicator for your live project URLs.
-   **PWA Support**: Install ProjectHub as a Progressive Web App for an app-like experience and offline access.
-   **Dashboard**: View all your projects with filtering (Category, Tech Stack) and sorting (Newest, Oldest, Name A-Z, Manual).
-   **Project Management**: Add, Edit, and Delete projects.
-   **Visual Portfolio**: Upload project screenshots and use Markdown for descriptions.
-   **Responsive Design**: Fully responsive UI with a glassmorphism aesthetic and Dark Mode support.

## Prerequisites

-   Node.js (v18+ recommended)
-   npm or yarn

## Setup

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd projectHub
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Environment Variables:**
    Create a `.env` file in the root directory and add your Firebase configuration keys:
    ```env
    VITE_FIREBASE_API_KEY=your_api_key
    VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
    VITE_FIREBASE_PROJECT_ID=your_project_id
    VITE_FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app
    VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
    VITE_FIREBASE_APP_ID=your_app_id
    VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```

## Build

To create a production build:

```bash
npm run build
```

## Deployment

To deploy to GitHub Pages:

```bash
npm run deploy
```

## Technologies

-   [React](https://reactjs.org/)
-   [Vite](https://vitejs.dev/)
-   [Firebase](https://firebase.google.com/) (Auth, Firestore, Storage)
-   [React Bootstrap](https://react-bootstrap.github.io/)
-   [React Router](https://reactrouter.com/)