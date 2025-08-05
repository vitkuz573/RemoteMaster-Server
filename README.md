# RemoteMaster Server UI

A modern React application built with Next.js 15 and shadcn UI, featuring enterprise-grade authentication, organizational management, and host monitoring capabilities.

## 🚀 Features

- **Modern UI/UX** - Built with shadcn UI components for consistent design
- **Enterprise Authentication** - SSO and credential-based login systems
- **Organizational Management** - Multi-tenant architecture with organizational units
- **Host Monitoring** - Real-time status monitoring and management
- **Responsive Design** - Works seamlessly across all devices
- **Dark Mode Support** - Built-in theme switching
- **Accessibility** - WCAG compliant with proper ARIA attributes

## 🛠 Tech Stack

- **Framework**: Next.js 15 with App Router
- **UI Components**: shadcn UI (built on Radix UI primitives)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **State Management**: React Hooks
- **Type Safety**: TypeScript
- **Authentication**: Custom SSO implementation

## 📦 Architecture

### Core Components
- `LoadingSpinner` - Consistent loading states across the application
- `StatusIndicator` - Status badges with icons for host monitoring
- `NotificationPanel` - Notification system using shadcn Popover
- `ModeToggle` - Toggle component for mode switching

### Key Features
- **Portal-free Popovers** - Using shadcn Popover instead of manual portals
- **Consistent Loading States** - Reusable LoadingSpinner component
- **Status Management** - Proper status indicators with badges and icons
- **Form Handling** - Ready for react-hook-form integration
- **Error Boundaries** - Proper error handling throughout the app

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd remotemaster-server
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📁 Project Structure

```
remotemaster-server/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Main dashboard
│   ├── login/             # Authentication pages
│   ├── admin/             # Admin panel
│   └── layout.tsx         # Root layout
├── components/
│   └── ui/                # shadcn UI components
│       ├── button.tsx
│       ├── dialog.tsx
│       ├── popover.tsx
│       ├── loading-spinner.tsx
│       ├── status-indicator.tsx
│       ├── notification-panel.tsx
│       └── mode-toggle.tsx
├── hooks/                 # Custom React hooks
├── lib/                   # Utility functions and configurations
├── contexts/              # React contexts
└── public/                # Static assets
```

## 🎨 Design System

This project uses shadcn UI as the foundation for all UI components, ensuring:

- **Consistency** - Unified design language across all components
- **Accessibility** - Built-in ARIA attributes and keyboard navigation
- **Customization** - Easy theming with Tailwind CSS
- **Performance** - Optimized bundle size and rendering

### Component Usage

```typescript
// Loading states
import { LoadingSpinner } from '@/components/ui/loading-spinner';
<LoadingSpinner size="lg" text="Loading data..." />

// Status indicators
import { StatusIndicator } from '@/components/ui/status-indicator';
<StatusIndicator status="online" showText size="md" />

// Notifications
import { NotificationPanel } from '@/components/ui/notification-panel';
<NotificationPanel notifications={notifications} enabled={true} count={3} />

// Mode toggles
import { ModeToggle } from '@/components/ui/mode-toggle';
<ModeToggle modes={modes} value={value} onValueChange={handleChange} />
```

## 🔧 Development

### API Mocking with MSW

This project uses [Mock Service Worker (MSW)](https://mswjs.io/) for API mocking in development:

- **Automatic in Development**: MSW automatically runs when `NODE_ENV === 'development'`
- **Real HTTP Requests**: Intercepts real `fetch()` requests at the network level
- **No Code Changes**: Your API service code works the same with real and mock data
- **Realistic Responses**: Returns realistic mock data with proper delays

### Available Scripts

- `npm run dev` - Start development server (with MSW enabled)
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Code Quality

- **TypeScript** - Full type safety
- **ESLint** - Code linting and formatting
- **shadcn UI** - Consistent component patterns
- **React Best Practices** - Modern React patterns and hooks

## 🚀 Deployment

### Build for Production

```bash
npm run build
npm start
```

### Environment Variables

Create a `.env.local` file with:

```env
# API Configuration
NEXT_PUBLIC_API_URL=your-api-url
```

**Note:** MSW (Mock Service Worker) automatically runs in development mode for API mocking.

## 🤝 Contributing

1. Follow the existing code patterns
2. Use shadcn UI components for new features
3. Maintain TypeScript type safety
4. Add proper error handling
5. Test accessibility features

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions, please refer to:
- [shadcn UI Documentation](https://ui.shadcn.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
