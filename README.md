# InternMatcher

A modern roommate matching platform for interns and new grads to find like-minded roommates based on career fields, companies, and professional interests.

## 🚀 Features

- **LinkedIn OAuth Authentication** - Secure sign-in with LinkedIn
- **Career-Focused Matching** - Find roommates based on similar fields, companies, and industries
- **Real-Time Messaging** - Chat with potential roommates instantly
- **Beautiful UI** - Modern, responsive design built with React and Tailwind CSS
- **Profile Management** - Complete profile setup with photos, bio, and preferences
- **Search & Filters** - Find matches by location, industry, company, and more

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + Custom Components
- **State Management**: Zustand + TanStack Query
- **Backend**: Supabase (PostgreSQL + Auth + Realtime + Storage)
- **Routing**: React Router v6
- **Forms**: React Hook Form + Zod

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd InternMatch
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Fill in your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your-project-url
   VITE_SUPABASE_ANON_KEY=your-anon-key
   VITE_LINKEDIN_CLIENT_ID=your-client-id
   VITE_LINKEDIN_REDIRECT_URI=http://localhost:5173/auth/callback
   ```

4. **Set up Supabase Database**
   
   - Create a new Supabase project at [supabase.com](https://supabase.com)
   - Run the migration file located at `supabase/migrations/001_initial_schema.sql` in your Supabase SQL Editor
   - This will create all necessary tables, indexes, and RLS policies

5. **Configure LinkedIn OAuth** (Optional for development)
   
   - Go to [LinkedIn Developers](https://www.linkedin.com/developers/)
   - Create a new app
   - Add redirect URI: `http://localhost:5173/auth/callback`
   - Copy Client ID to `.env`
   - In Supabase Dashboard → Authentication → Providers → LinkedIn, enable and configure

6. **Start the development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**
   Navigate to `http://localhost:5173`

## 🗄️ Database Setup

The database schema includes:

- **profiles** - User profile information
- **profile_photos** - User photos
- **conversations** - Chat conversations between users
- **messages** - Individual messages
- **bookmarks** - Saved profiles
- **blocks** - Blocked users
- **reports** - User reports

All tables have Row Level Security (RLS) enabled with appropriate policies.

## 📁 Project Structure

```
src/
├── app/              # App configuration and routing
├── components/        # React components
│   ├── ui/           # Reusable UI components
│   ├── layout/       # Layout components
│   ├── explore/      # Explore page components
│   └── messages/     # Messages components
├── hooks/            # Custom React hooks
├── lib/              # Utility functions and configs
├── pages/            # Page components
│   ├── auth/         # Authentication pages
│   ├── explore/      # Explore pages
│   ├── messages/     # Messages pages
│   └── profile/      # Profile pages
├── stores/           # Zustand stores
├── styles/           # Global styles
└── types/            # TypeScript type definitions
```

## 🎨 Design System

The app uses a custom design system with:
- **Primary Color**: LinkedIn Blue (#3B82F6)
- **Secondary Color**: Purple (#8B5CF6)
- **Typography**: Inter font family
- **Components**: Custom-built with Tailwind CSS

## 🔐 Security

- Row Level Security (RLS) enabled on all tables
- User authentication required for all operations
- Blocked users cannot see or message each other
- Profile visibility controlled by `is_active` flag

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## 🚧 Development Notes

- For development, you can use Supabase's email authentication instead of LinkedIn OAuth
- Real-time features use Supabase Realtime subscriptions
- Photo uploads use Supabase Storage (configure bucket in Supabase dashboard)

## 📄 License

MIT

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

