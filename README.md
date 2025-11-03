
# Choices Collaborative Form App - Local Setup & Deployment Guide

This guide provides step-by-step instructions to set up, run, and deploy your application from your local Windows 11 machine.

## Prerequisites

Before you begin, make sure you have the following installed:

1.  **Node.js and npm:** This is the runtime for your application. [Download it here](https://nodejs.org/en/download/). (LTS version is recommended).
2.  **Git:** This is for version control and deploying via GitHub. [Download it here](https://git-scm.com/download/win).
3.  **A Code Editor:** We recommend [Visual Studio Code](https://code.visualstudio.com/download), which is free and very powerful.

You can check if you have Node.js and npm installed by opening a Terminal (or Command Prompt) and running:
`node -v`
`npm -v`

---

## Step 1: Set Up Your Project Locally

Follow these instructions to get the application running on your computer.

1.  **Create a Project Folder:** Create a new folder on your computer where you want to store the project (e.g., on your Desktop, name it `choices-collab-app`).

2.  **Place Files:** Download all the files from this response and place them inside your new `choices-collab-app` folder, maintaining the folder structure (e.g., the `App.tsx` file should be inside a folder named `src`).

3.  **Open in VS Code:** Open the `choices-collab-app` folder in Visual Studio Code.

4.  **Open a Terminal:** In VS Code, go to the top menu and click `Terminal` > `New Terminal`. This will open a terminal window at the bottom of the editor, already in your project's directory.

5.  **Create Your Environment File:**
    *   In the file explorer on the left, right-click on an empty area and select "New File".
    *   Name the file `.env`.
    *   Copy the contents from `.env.example` and paste them into your new `.env` file.
    *   Fill in your actual Supabase URL and Anon Key. **It's very important to keep this file private and never commit it to Git.**

    Your `.env` file should look like this:
    ```
    VITE_SUPABASE_URL="https://uvgcvasoiqhmwblvpvcd.supabase.co"
    VITE_SUPABASE_ANON_KEY="your-real-supabase-anon-key-here"
    ```

6.  **Install Dependencies:** In the terminal, run the following command. This will read your `package.json` file and download all the necessary libraries (like React and Supabase).
    ```bash
    npm install
    ```

7.  **Run the Application:** Once the installation is complete, start the local development server:
    ```bash
    npm run dev
    ```

8.  **View Your App:** The terminal will show you a local URL, usually `http://localhost:5173`. Open this URL in your web browser. You should see your application running!

---

## Step 2: Push Your Project to GitHub

To deploy your site, you first need to put your code in a GitHub repository.

1.  **Create a GitHub Account:** If you don't have one, sign up at [github.com](https://github.com).

2.  **Create a New Repository:** On your GitHub dashboard, click "New" to create a repository. Name it `choices-collab-app`. Make it "Public" and do **not** initialize it with a README or other files.

3.  **Link and Push Your Code:** In your VS Code terminal, run these commands one by one. Replace `YOUR_GITHUB_USERNAME` with your actual username.
    ```bash
    git init
    git add .
    git commit -m "Initial commit"
    git branch -M main
    git remote add origin https://github.com/YOUR_GITHUB_USERNAME/choices-collab-app.git
    git push -u origin main
    ```
    Your code is now on GitHub!

---

## Step 3: Deploy to Vercel (Free Hosting)

Vercel is a fantastic, free hosting platform that connects directly to your GitHub account.

1.  **Sign Up for Vercel:** Go to [vercel.com](https://vercel.com) and sign up with your GitHub account.

2.  **Import Your Project:**
    *   On your Vercel dashboard, click "Add New..." -> "Project".
    *   Find your `choices-collab-app` repository and click "Import".

3.  **Configure the Project:**
    *   Vercel will automatically detect that it's a Vite project, so you don't need to change any build settings.
    *   **This is the most important part:** Expand the "Environment Variables" section. You must add your Supabase keys here so Vercel can use them securely.
        *   Add the first variable:
            *   Name: `VITE_SUPABASE_URL`
            *   Value: `https://uvgcvasoiqhmwblvpvcd.supabase.co`
        *   Click "Add" and add the second variable:
            *   Name: `VITE_SUPABASE_ANON_KEY`
            *   Value: `your-real-supabase-anon-key-here`

4.  **Click "Deploy"**: That's it! Vercel will build your project and deploy it. After a minute or two, it will give you a public URL (e.g., `choices-collab-app.vercel.app`) where your live application can be accessed by anyone.
