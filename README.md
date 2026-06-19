# BIO112 Master Quiz

A modern, full-stack Biology Quiz Web Application designed for university students studying Biology. Built with React, Node.js, Express, PostgreSQL, and TypeScript.

## Features

✨ **Core Features:**
- 1000+ Biology multiple-choice questions
- Practice and Exam modes
- Real-time scoring and feedback
- 8 question categories (Cell Biology, Genetics, Ecology, Evolution, Physiology, Biochemistry, Molecular Biology, Microbiology)
- Student dashboard with performance analytics
- Leaderboard system
- JWT authentication
- Admin panel for question management
- Gamification (XP points, badges, streaks, levels)
- PWA support for mobile
- Dark mode support

## Tech Stack

**Frontend:**
- React 18+
- TypeScript
- Tailwind CSS
- Axios
- Chart.js for analytics

**Backend:**
- Node.js
- Express.js
- PostgreSQL
- JWT for authentication
- bcrypt for password hashing

**Database:**
- PostgreSQL 12+

## Project Structure

```
bio112-master-quiz/
├── backend/                 # Node.js/Express backend
│   ├── src/
│   │   ├── config/         # Database and config files
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Express middleware
│   │   ├── models/         # Database models
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   ├── utils/          # Utility functions
│   │   ├── database/       # Database migrations
│   │   └── server.ts       # Express server entry point
│   ├── .env.example        # Environment variables template
│   └── package.json
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   ├── hooks/          # Custom React hooks
│   │   ├── utils/          # Utility functions
│   │   ├── styles/         # Global styles
│   │   ├── types/          # TypeScript types
│   │   └── App.tsx         # Main app component
│   ├── public/             # Static files
│   └── package.json
├── seed-data/              # Initial database seed data
│   └── biology-questions.json
└── docker-compose.yml      # Docker configuration
```

## Quick Start

### Prerequisites
- Node.js 16+
- PostgreSQL 12+
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/iznkanji123/bio112-master-quiz.git
cd bio112-master-quiz
```

2. Setup Backend
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database credentials
npm run migrate
npm run seed
npm run dev
```

3. Setup Frontend
```bash
cd ../frontend
npm install
npm start
```

The application will be available at `http://localhost:3000`

## API Documentation

See `/backend/API.md` for complete API documentation.

## Contributing

Contributions are welcome! Please follow the existing code style and create feature branches.

## License

MIT License
