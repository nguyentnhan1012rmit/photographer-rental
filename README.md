# LensLocker 📸

LensLocker is a premium platform connecting professional photographers with clients who need them. It features a modern, high-performance interface with social networking capabilities, portfolio browsing, and secure booking management.

## ✨ Features

- **Modern SaaS UI**: A clean, fullscreen, borderless design influenced by top-tier modern web applications.
- **Social Feed**: A community space for users to post requests and photographers to interact (Like, Comment, Reply).
- **Pro Discovery**: Browse verified photographer portfolios with rich visuals.
- **Authentication**: Secure role-based access (Customer/Photographer) powered by Supabase Auth.
- **Dark Mode**: A dedicated, professionally curated dark theme using deep indigo and violet tones.

## 🛠 Tech Stack

- **Frontend**: [React](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [DaisyUI](https://daisyui.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Backend & Auth**: [Supabase](https://supabase.com/)
- **State/Query**: [TanStack Query](https://tanstack.com/query/latest)
- **Routing**: [React Router](https://reactrouter.com/)

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- A Supabase project

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/yourusername/lenslocker.git
    cd lenslocker
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Environment Setup:**
    Create a `.env` file in the root directory and add your Supabase credentials:
    ```env
    VITE_SUPABASE_URL=your_supabase_project_url
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

4.  **Database Setup:**
    Run the SQL scripts provided in the root directory in your Supabase SQL Editor in this order:
    1.  `database/supabase_schema.sql` (Base tables, Profiles, RLS)
    2.  `database/social_features.sql` (Posts, Comments, Likes)
    3.  `database/fix_relationships.sql` (Fixes for foreign key joins)
    4.  `database/reviews.sql` (Reviews & Ratings)
    5.  `database/chat.sql` (Real-time Messaging)
    6.  `database/admin.sql` (Admin Roles & Permissions)
    7.  `database/availability.sql` (Availability System)

5.  **Run the application:**
    ```bash
    npm run dev
    ```

### 🛡️ Super Admin Access

To enable the Super Admin dashboard:
1.  Sign up a new user (or use an existing one).
2.  Run the following SQL in your Supabase SQL Editor to promote them:
    ```sql
    update profiles set role = 'admin' where id = 'USER_UUID_HERE';
    ```
    *(You can find the UUID in the Authentication tab).*
3.  Refresh the page, and you will see the **Admin Panel** link in the profile dropdown (red text).

## 📂 Project Structure

- `src/pages`: Main application views (Home, Feed, Login, etc.)
- `src/components`: Reusable UI components (PostCard, Navbar, CreatePost)
- `src/lib`: Database and utility clients
- `src/contexts`: Global state providers (AuthContext)

## 🎨 Design System

The project uses a custom Tailwind theme configuration defined in `tailwind.config.js`, focusing on a primary `indigo-500` and secondary `violet-500` palette against a dark base.

---
Built with ❤️ using React & Supabase.
