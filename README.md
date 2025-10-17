# 📱 Subscription Tracker

A comprehensive subscription management application with WhatsApp reminders, web notifications, and detailed cost analysis for Pakistan.

---

## 📚 **Complete Documentation**

**👉 See [DOCUMENTATION.md](./DOCUMENTATION.md) for full setup guide, features, and troubleshooting.**

---

## 🌟 Features

### Core Functionality
- **Subscription Management**: Add, edit, and organize all your subscriptions in one place
- **Smart Dashboard**: Get a clear overview of your spending with interactive charts and analytics
- **Category Organization**: Organize subscriptions by category for better visibility and control
- **Cost Analysis**: Track your spending patterns and identify opportunities to save money
- **Payment Reminders**: Never miss a payment with customizable reminders

### Authentication & Security
- **Secure Authentication**: Email/password authentication with Supabase Auth
- **Data Privacy**: Your data is encrypted and secure with industry-standard security measures
- **Responsive Design**: Access your subscriptions from anywhere with our responsive web app

### Notification System
- **Multi-channel Notifications**: Receive reminders via email and in-app notifications

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── auth/              # Authentication pages
│   ├── dashboard/          # Main app interface
│   ├── globals.css         # Global styles
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Landing page
├── components/             # Reusable UI components
├── hooks/                  # Custom React hooks
├── lib/                    # Configuration and utilities
│   └── supabase.ts         # Supabase client
├── types/                  # TypeScript type definitions
│   ├── database.ts         # Database types
│   └── index.ts            # General types
└── utils/                  # Helper functions
    └── index.ts            # Utility functions
```

## 🗄️ Database Schema

### Core Tables

- **users** - Extended user profiles
- **categories** - Subscription categories for organization
- **subscriptions** - User subscriptions with billing info
- **banks** - Bank information for subscription payments
- **notifications** - In-app notifications for payment reminders

### Key Features

- ✅ Row Level Security (RLS) enabled
- ✅ Automatic profile creation on signup
- ✅ Default categories for new users
- ✅ Real-time updates
- ✅ Optimized queries with indexes

## 🔐 Environment Variables

```bash
# Required
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional
NEXT_PUBLIC_APP_URL=http://localhost:3000
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## 🚀 Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your Supabase project and database using `supabase-schema.sql`
4. Configure environment variables in `.env.local`
5. Run the development server:
   ```bash
   npm run dev
   ```

## 🧪 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run test` - Run tests (when implemented)

## 📱 User Guide

### Adding Subscriptions
1. Navigate to the Dashboard
2. Click "Add Subscription"
3. Fill in the service details, cost, and billing cycle
4. Set the next payment date

### Managing Categories
1. Go to Settings > Profile
2. Add or edit categories to organize your subscriptions

## 🛠️ Technical Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Supabase (Database, Auth, Realtime)
- **Database**: PostgreSQL with Row Level Security
- **State Management**: React Context API
- **Charts**: Recharts for data visualization

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, please open an issue on GitHub or contact the maintainers.