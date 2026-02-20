# Attendance Tracker

A full-stack Attendance Tracker Web Application built with Next.js (App Router) and Supabase.

## Features

- **User Authentication**: Secure login and registration using Supabase Auth
- **Dashboard**: Clean, modern interface to manage subject attendance
- **Subject Management**: Add, edit, and delete subjects
- **Attendance Tracking**: Mark lectures as attended or missed
- **Real-time Calculations**: Automatic attendance percentage calculation
- **Predictions**: Predict future attendance based on attending/missing next N lectures
- **Progress Visualization**: Beautiful progress bars and color-coded attendance status
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Toast Notifications**: User-friendly feedback for all actions

## Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Supabase (Database & Auth)
- **Icons**: Lucide React
- **Notifications**: React Hot Toast

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
git clone <your-repo-url>
cd attendance-tracker
npm install
```

### 2. Set up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Navigate to Settings > API and copy your:
   - Project URL
   - anon public key
   - service_role key
3. Run the following SQL in your Supabase SQL Editor (found in `supabase/schema.sql`):

```sql
-- Create subjects table
CREATE TABLE IF NOT EXISTS subjects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_name TEXT NOT NULL,
  total_lectures INTEGER NOT NULL DEFAULT 0,
  attended_lectures INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to see their own subjects
CREATE POLICY "Users can view their own subjects" ON subjects
  FOR SELECT USING (auth.uid() = user_id);

-- Create policy to allow users to insert their own subjects
CREATE POLICY "Users can insert their own subjects" ON subjects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to update their own subjects
CREATE POLICY "Users can update their own subjects" ON subjects
  FOR UPDATE USING (auth.uid() = user_id);

-- Create policy to allow users to delete their own subjects
CREATE POLICY "Users can delete their own subjects" ON subjects
  FOR DELETE USING (auth.uid() = user_id);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_subjects_user_id ON subjects(user_id);
CREATE INDEX IF NOT EXISTS idx_subjects_created_at ON subjects(created_at);
```

### 3. Environment Variables

Create a `.env.local` file in the root directory and add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Project Structure

```
attendance-tracker/
├── app/
│   ├── auth/
│   │   ├── login/
│   │   └── register/
│   ├── dashboard/
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── SubjectCard.tsx
│   └── AddSubjectModal.tsx
├── lib/
│   └── supabase.ts
├── supabase/
│   └── schema.sql
├── middleware.ts
└── .env.local
```

## Features in Detail

### Authentication
- User registration with email verification
- Secure login with password
- Protected routes using middleware
- Automatic redirect based on authentication status

### Dashboard
- Overview of all subjects with attendance cards
- Overall attendance percentage display
- Add new subjects with initial lecture counts
- Edit subject names inline
- Delete subjects with confirmation

### Subject Cards
- Visual attendance progress bars
- Color-coded attendance status (green/yellow/red)
- Quick actions to mark lectures as attended/missed
- Attendance prediction calculator
- Edit and delete functionality

### Attendance Calculations
- **Formula**: `attendance = (attended_lectures / total_lectures) * 100`
- **Prediction Logic**:
  - If attend N: `new_attended = attended + N`, `new_total = total + N`
  - If miss N: `new_attended = attended`, `new_total = total + N`

## Deployment

### Vercel Deployment

1. Push your code to GitHub
2. Connect your GitHub repository to Vercel
3. Add environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Deploy!

The application is ready for Vercel deployment with proper environment variable configuration.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).
