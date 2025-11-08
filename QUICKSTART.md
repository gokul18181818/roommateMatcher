# Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Go to **SQL Editor** → **New Query**
4. Copy and paste the contents of `supabase/migrations/001_initial_schema.sql`
5. Click **Run** to execute the migration

### 3. Get Your Supabase Credentials

1. In Supabase Dashboard, go to **Settings** → **API**
2. Copy your **Project URL** and **anon/public key**
3. Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. (Optional) Set Up LinkedIn OAuth

For development, you can skip this and use Supabase's email auth instead.

1. Go to [LinkedIn Developers](https://www.linkedin.com/developers/)
2. Create a new app
3. Add redirect URI: `http://localhost:5173/auth/callback`
4. In Supabase Dashboard → **Authentication** → **Providers** → **LinkedIn**
5. Enable LinkedIn and add your Client ID and Secret

### 5. Start the App

```bash
npm run dev
```

Visit `http://localhost:5173` and you're ready to go! 🎉

## 🧪 Testing Without LinkedIn OAuth

For quick testing, you can use Supabase's email authentication:

1. In Supabase Dashboard → **Authentication** → **Users**
2. Click **Add User** → **Create new user**
3. Use email/password to sign in
4. The app will redirect you to onboarding

## 📝 Next Steps

- Complete your profile in the onboarding flow
- Explore other users in the Explore tab
- Start conversations in the Messages tab
- Customize your profile in the Profile tab

## 🎨 UI Features

The app includes:
- ✨ Beautiful gradient backgrounds
- 🎯 Smooth animations and transitions
- 📱 Fully responsive design
- 🌙 Modern card-based layouts
- 💫 Real-time messaging
- 🔍 Advanced search and filtering

Enjoy building! 🚀

