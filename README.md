# StudyMate - Personal Productivity Management System

## Overview
StudyMate is a comprehensive personal productivity management system designed to help students and professionals enhance their study habits and time management skills. Built with modern web technologies, it features a Pomodoro timer, note-taking capabilities, goal tracking, and progress visualization.

## Features

### 🍅 Pomodoro Timer
- Customizable work and break durations
- Audio notifications with "cascade breathe future" track
- Session tracking and statistics
- Auto-start break functionality

### 📝 Notes Management
- Create, edit, and organize study notes
- Categorize notes by subject
- Search and filter functionality

### 🎯 Goal Tracking
- Set and manage study goals
- Deadline tracking
- Progress visualization
- Achievement system

### 📊 Progress Dashboard
- Study session history
- Performance analytics
- Weekly progress charts
- Achievement badges

### 👤 User Profile
- Personal information management
- Study statistics
- Session history
- Customizable themes

### 🗄️ Database Management
- PostgreSQL-like database with SQL commands
- Prisma ORM patterns
- Data export functionality
- Local storage persistence

## Technology Stack

### Frontend
- **Next.js 15.2.4** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/UI** - Reusable component library
- **Lucide React** - Icon library

### Backend & Database
- **Prisma ORM** - Database toolkit
- **PostgreSQL** - Relational database
- **SQL Commands** - Standard database operations
- **REST API** - Communication patterns

### Additional Tools
- **PNPM** - Fast package manager
- **ESLint** - Code linting
- **Prettier** - Code formatting

## Getting Started

### Prerequisites
- Node.js 18+
- PNPM package manager

### Installation
```bash
# Clone the repository
git clone <repository-url>

# Navigate to the project directory
cd study-mate

# Install dependencies
pnpm install
```

### Development
```bash
# Run the development server
pnpm dev

# Visit http://localhost:3000 in your browser
```

### Building for Production
```bash
# Create a production build
pnpm build

# Start the production server
pnpm start
```

## Project Structure
```
study-mate/
├── app/                 # Next.js app router pages
├── components/          # Reusable UI components
├── lib/                 # Utility functions and database
├── public/              # Static assets
├── styles/              # Global styles
├── hooks/               # Custom React hooks
└── ...
```

## Key Features Implementation

### Database System
The application features a PostgreSQL-like database implementation with Prisma ORM patterns:
- SQL commands: SELECT, INSERT, UPDATE, DELETE
- Table management: SHOW TABLES, DESCRIBE
- Data persistence using localStorage
- CRUD operations for all entities

### Timer Functionality
- Pomodoro technique implementation
- Customizable session durations
- Audio notifications with cascade_breathe_future.mp3
- Session tracking and statistics

### User Management
- Profile creation and editing
- Session history tracking
- Data export capabilities
- Privacy controls

## Available Scripts
- `pnpm dev` - Run development server
- `pnpm build` - Create production build
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm format` - Format code with Prettier

## Contributing
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## License
This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments
- Built with ❤️ for students worldwide
- Inspired by productivity techniques and tools
- Audio track: "cascade breathe future" by GarageSoundDesign