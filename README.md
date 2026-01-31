# Maktab Shop

**A free, serverless, GitHub Pages-based e-commerce platform for Islamic books.**

This project provides a simple yet powerful solution for managing and displaying a catalog of Islamic books online, with full CRUD (Create, Read, Update, Delete) functionality, image uploads, and an admin panel, all hosted for free on GitHub Pages.

## Features

- **Book Catalog:** Displays a categorized list of books with titles, authors, prices, and cover images.
- **Admin Panel:** A user-friendly interface (`admin.html`) to add, edit, and delete book entries.
- **Image Uploads:** Supports adding cover images for books.
- **Secure Admin Access:** Admin actions are protected by a password stored securely in GitHub Secrets.
- **Serverless Architecture:** Leverages Cloudflare Workers and GitHub Actions for backend logic, ensuring zero hosting costs.
- **WhatsApp/Email Ordering:** Allows customers to place orders directly via WhatsApp or email.
- **Responsive Design:** A clean and simple UI that adapts to different screen sizes.

## Architecture

The application follows a serverless architecture:

1.  **Frontend (`index.html` & `admin.html`):** Hosted on GitHub Pages, these HTML files provide the user interface.
2.  **Books Data (`books.json`):** A JSON file in the repository serves as the database for book information.
3.  **Cloudflare Worker (`worker.js`):** Acts as a secure intermediary. When an admin submits a form from `admin.html`, the worker receives the request and dispatches a GitHub Actions workflow.
4.  **GitHub Actions Workflow (`.github/workflows/update-books.yml`):** This workflow is triggered by the Cloudflare Worker. It verifies the admin password (stored in GitHub Secrets), updates `books.json` based on the requested action (add, edit, or delete), and commits the changes back to the repository. GitHub Pages then automatically updates with the new data.

## Setup Instructions

To get your Maktab Shop up and running, follow these steps:

### 1. GitHub Repository Setup

1.  **Fork this repository** or create a new one with the project files.
2.  **Enable GitHub Pages:** Go to your repository's `Settings` -> `Pages`. Set the source to `Deploy from a branch` and select `main` as the branch. Save the changes.
3.  **Create a GitHub Secret:**
    *   Go to your repository's `Settings` -> `Secrets and variables` -> `Actions`.
    *   Click `New repository secret`.
    *   Name the secret `ADMIN_PASSWORD`.
    *   Set a strong password as its value. This password will be used to authenticate admin actions.

### 2. Cloudflare Worker Setup

1.  **Create a Cloudflare Account:** If you don't have one, sign up for a free Cloudflare account.
2.  **Create a Worker:**
    *   In your Cloudflare dashboard, navigate to `Workers & Pages`.
    *   Click `Create application` -> `Create Worker`.
    *   Choose a name for your worker (e.g., `maktab-shop-worker`) and deploy it.
3.  **Deploy `worker.js`:**
    *   Copy the content of your `worker.js` file into the Cloudflare Worker editor.
    *   Make sure the `githubRes` fetch URL in `worker.js` points to your repository's workflow dispatch endpoint:
        `https://api.github.com/repos/YOUR_USERNAME/YOUR_REPO_NAME/actions/workflows/update-books.yml/dispatches`
        Replace `YOUR_USERNAME` and `YOUR_REPO_NAME` with your actual GitHub username and repository name.
4.  **Configure Worker URL:** Once deployed, note down your Cloudflare Worker's URL (e.g., `https://your-worker-name.your-username.workers.dev`). You'll need this for `admin.html`.

### 3. Update `admin.html`

1.  Open `admin.html` in your repository.
2.  Update the `workerURL` variable in the JavaScript section to your Cloudflare Worker's URL:
    ```javascript
    const workerURL = "https://your-worker-name.your-username.workers.dev/"; // Your Cloudflare Worker URL
    ```

### 4. Placeholder Image

- Ensure you have a placeholder image at `assets/images/placeholder.jpg` or update the `imageUrl` in `books.json` and the `admin.html` form to reflect your desired default image path.

## Using the Admin Panel

1.  Navigate to your `admin.html` page (e.g., `https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/admin.html`).
2.  Enter the **Admin Password** you set in GitHub Secrets.
3.  Fill in the book details (Title, Author, Price, Image URL).
4.  Click `Add Book` to add a new book.
5.  To edit or delete an existing book, use the `Edit` and `Delete` buttons next to each book entry.

## Customization

- **Styling:** Modify `assets/style.css` to change the look and feel of your shop.
- **Categories:** Update `books.json` to add or modify book categories.
- **Contact Information:** Change the WhatsApp and email links in `index.html` to your desired contact details.

## Contributing

Feel free to fork the project, open issues, or submit pull requests.
