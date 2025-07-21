# FinRasyo - Financial Ratio Analysis Platform

A comprehensive financial analysis platform specializing in Turkish market insights, providing comprehensive data processing and intelligent financial intelligence for BIST (Borsa Istanbul) companies.

## 🎯 Features

- **Advanced Financial Analysis**: Calculate and analyze financial ratios for BIST companies
- **Multi-format Reports**: Generate reports in PDF, Excel, and CSV formats
- **Subscription System**: Credit-based payment system with Stripe integration
- **Real-time Data**: Dynamic company data fetching and processing
- **Responsive Design**: Modern UI with Tailwind CSS and Radix UI components

## 🛠️ Tech Stack

**Frontend:**
- React 18 with TypeScript
- Tailwind CSS for styling
- Radix UI components
- React Query for state management
- React Hook Form with Zod validation
- Wouter for routing

**Backend:**
- Express.js with TypeScript
- PostgreSQL with Drizzle ORM
- Passport.js authentication
- Stripe payment processing
- PDF generation with jsPDF
- Excel generation with ExcelJS

**Deployment:**
- Vercel hosting platform
- PostgreSQL database
- Custom domain support

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Stripe account for payments

### Installation

1. Clone the repository:
```bash
git clone https://github.com/YOUR_USERNAME/finrasyo.git
cd finrasyo
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Fill in your environment variables
```

4. Initialize database:
```bash
npm run db:push
```

5. Start development server:
```bash
npm run dev
```

## 📁 Project Structure

```
finrasyo/
├── client/          # React frontend
├── server/          # Express backend
├── shared/          # Shared types and schemas
├── public/          # Static assets
└── scripts/         # Utility scripts
```

## 🔧 Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:push` - Push database schema changes

## 🌐 Live Demo

Visit: [www.finrasyo.com](https://www.finrasyo.com)

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📞 Support

For support and questions, please open an issue on GitHub.

---

**FinRasyo** - Empowering financial analysis for Turkish markets 🇹🇷