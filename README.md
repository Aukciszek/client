# Aukciszek - Anonymous Reverse Auctions

A modern Next.js web application for conducting anonymous reverse auctions. Built with React 19, TypeScript, and Tailwind CSS for optimal performance and user experience.

## Features

- **Anonymous Reverse Auctions** - Secure bidding system with anonymity
- **Real-time Updates** - Live auction status and notifications
- **Responsive Design** - Optimized for desktop and mobile devices
- **TypeScript Support** - Type-safe development with full IntelliSense
- **Modern UI** - Clean interface with Tailwind CSS and custom fonts
- **Hot Reload Development** - Fast development with Turbopack

## Architecture Overview

### System Architecture

The application follows Next.js App Router architecture with modern React patterns:

```
aukciszek-desktop/
├── app/                        # Next.js App Router
│   ├── components/             # Reusable UI components
│   ├── context/                # React Context providers
│   ├── constants.ts            # Application constants and config
│   ├── globals.css             # Global styles and Tailwind
│   ├── layout.tsx              # Root layout with providers
│   └── page.tsx                # Home page component
├── public/                     # Static assets
├── next.config.ts              # Next.js configuration
├── package.json                # Dependencies and scripts
└── tsconfig.json               # TypeScript configuration
```

### Technology Stack

- **Framework**: Next.js 15.1.2 with App Router
- **Runtime**: Node.js (v18+ recommended)
- **Language**: TypeScript 5
- **UI Library**: React 19
- **Styling**: Tailwind CSS 4.0.15
- **Fonts**: Google Fonts (Roboto, Arvo)
- **Notifications**: React Toastify
- **Icons**: React Icons
- **Development**: Turbopack for fast builds
- **Code Quality**: ESLint + Prettier

## Prerequisites

- **Node.js** (version 18 or higher recommended)
- **Package Manager**: npm, yarn, pnpm, or bun
- **Memory**: Minimum 4GB RAM for development
- **Backend Server**: Auction backend running on configured port

## Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

## Development

Start the development server with Turbopack:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

The application will be available at `http://localhost:3000`

### Code Formatting

Format code using Prettier:

```bash
npm run format
```

### Linting

Run ESLint checks:

```bash
npm run lint
```

## Production

### Build

Create a production build:

```bash
npm run build
# or
yarn build
# or
pnpm build
# or
bun build
```

### Initial parameters

In order for the auction to work properly, user needs to keep constant.ts file up to date with valid initial data.

Some data like *PRIME_NUMBER*, *l* and *k* needs to match between all participants.

*LOGIN_SERVER* should possess data allowing user to connect to rest of the servers

*l* value sets maximum number of bith a bid value may have.

Prime number must be populated according to the following formula: p >= 2^(l+k+1) + 2^(l+1)

Same prime number can be used multiple times

### Start

Start the production server:

```bash
npm run start
# or
yarn start
# or
pnpm start
# or
bun start
```

### Performance

Warning! In case of high *PRIME_NUMBER* values, the auction can take much time to complete (above 1h)

## Component Architecture

### Core Components

- **Navbar**: Main navigation with authentication state
- **HowItWorks**: Explanation of auction process
- **Footer**: Site footer with links and information

### Layout Structure

- **RootLayout**: Provides global styling, fonts, and context providers
- **AuthProvider**: Manages authentication state across the application
- **ToastContainer**: Global notification system

### Styling System

- **Tailwind CSS**: Utility-first CSS framework
- **Custom Fonts**: Roboto (default) and Arvo (headings)
- **Color Scheme**: Primary background with gray-950 text
- **Responsive**: Mobile-first design approach

## Maintenance & Development Guidelines

### Adding New Components

1. Create component in `app/components/`
2. Use TypeScript interfaces for props
3. Follow naming convention (camelCase for files and folders)
4. Import and use in parent components
5. Add to git with proper commit message

### Styling Guidelines

- Use Tailwind utility classes
- Create custom CSS only when necessary

### Code Quality Standards

- All files must be TypeScript (.tsx/.ts)
- Use ESLint configuration for consistency
- Format code with Prettier before commits
- Add proper TypeScript types for all props and functions
- Write descriptive component and function names

## Backend Integration

### API Communication

The application communicates with a backend server for:

- User authentication
- Auction data management
- Real-time auction updates

## Troubleshooting

### Common Issues

**Development Server Won't Start**

- Check Node.js version (18+ required)
- Verify port 3000 is available
- Clear Next.js cache: `rm -rf .next`

**Build Failures**

- Update dependencies: `npm update`
- Check TypeScript errors: `npm run lint`
- Clear node_modules and reinstall

**Backend Connection Issues**

- Verify backend server is running
- Check loginServer URL in constants.ts
- Confirm CORS settings on backend

**Styling Issues**

- Ensure Tailwind CSS is properly configured
- Check for conflicting CSS classes
- Verify font loading in layout.tsx

## Contributing

### For New Developers

1. Read this documentation thoroughly
2. Set up development environment
3. Understand the auction business logic
4. Start with small UI improvements
5. Follow the component architecture patterns

### For Maintainers

1. Review pull requests for code quality
2. Update documentation with new features
3. Monitor application performance
4. Keep dependencies updated
5. Ensure security best practices

### Development Workflow

1. Create feature branch from main
2. Make changes in appropriate directories
3. Test changes thoroughly
4. Run linting and formatting
5. Create pull request with description
6. Update documentation if needed

## License

- This project is licensed under the GNU General Public License v3.0
