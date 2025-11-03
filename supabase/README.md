
# Supabase Database Setup

To make the application functional, you need to set up the database tables in your Supabase project. Follow these two steps:

1.  **Create Tables and Policies:**
    *   Go to your Supabase project dashboard.
    *   Navigate to the **SQL Editor** from the left-hand menu.
    *   Click on **+ New query**.
    *   Copy the entire content of the `supabase/schema.sql` file and paste it into the editor.
    *   Click **RUN**. This will create the necessary tables (`users`, `forms`, `sections`, `responses`) and set up the security policies required for the app to access data.

2.  **Add Initial Data (Optional but Recommended):**
    *   In the SQL Editor, create another **+ New query**.
    *   Copy the entire content of the `supabase/seed.sql` file and paste it into the editor.
    *   Click **RUN**. This will populate the tables with the initial sample data, so you can start using the app immediately.

After running both scripts, refresh the application in your browser. The errors should be gone and you should see the login screen with the sample users.
