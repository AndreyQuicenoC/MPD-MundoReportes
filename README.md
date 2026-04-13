# Mundo Reporte

![Version](https://img.shields.io/badge/version-1.2.2-blue.svg)
![Python](https://img.shields.io/badge/Python-3.10%2B-green.svg)
![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)
![React](https://img.shields.io/badge/React-18%2B-61dafb.svg)
![Django](https://img.shields.io/badge/Django-5.0%2B-092e20.svg)

Daily sales and expense reporting system for paint warehouse management.

## 📋 Description

Mundo Reporte is a web system designed to replace manual Excel spreadsheets for recording and analyzing daily sales and expenses in a paint warehouse. The system enables:

- ✅ Daily registration of opening balance, sales, expenses, deliveries and closing balance
- ✅ Quantity tracking of products sold
- ✅ Expense classification by reusable categories
- ✅ **Automatic predefined expenses for quick insertion**
- ✅ **Marking categories as deductible (transfer/savings/income)**
- ✅ Generation of reliable statistics by periods
- ✅ **Report filtering by month or custom date range**
- ✅ **Pagination in all main tables**
- ✅ **PDF export for reports and statistics**
- ✅ Secure access through authentication

## 🎯 Target User

System specially designed for elderly adults and non-technical users, prioritizing:

- Clarity and simplicity in the interface
- Ease of use
- Intuitive forms
- Immediate feedback

## 🛠️ Technologies

### Backend

- **Django 5.0+**: Main web framework
- **Django REST Framework**: REST API
- **PostgreSQL**: Database
- **Gunicorn**: WSGI server for production

### Frontend

- **React 18+**: User interface library
- **JavaScript/TypeScript**: Programming language
- **Axios**: HTTP client
- **Chart.js**: Charts and visualizations

### Quality Tools

- **Black**: Python code formatter
- **Flake8**: Python linter
- **ESLint**: JavaScript/TypeScript linter
- **Prettier**: Frontend code formatter
- **Pytest**: Backend testing
- **Jest**: Frontend testing

## 🏗️ Architecture

The project follows a decoupled client-server architecture:

```
┌─────────────────┐         HTTP/JSON          ┌──────────────────┐
│                 │ ◄────────────────────────► │                  │
│  React Frontend │                            │  Django Backend  │
│                 │                            │                  │
└─────────────────┘                            └────────┬─────────┘
                                                        │
                                                        ▼
                                                 ┌──────────────┐
                                                 │  PostgreSQL  │
                                                 └──────────────┘
```

### Backend Layers

1. **Presentation Layer**: Django REST Framework (API)
2. **Application Layer**: Use case orchestration
3. **Domain Layer**: Services with business logic
4. **Persistence Layer**: Django models and database

## 📁 Project Structure

```
MPD-MundoReportes/
├── backend/                    # Django application
│   ├── config/                 # Project configuration
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   ├── apps/                   # Django applications
│   │   ├── usuarios/           # User management
│   │   ├── reportes/           # Daily reports
│   │   ├── gastos/             # Expenses and categories
│   │   ├── productos/          # Product catalog
│   │   └── estadisticas/       # Metrics and analysis
│   ├── requirements.txt        # Python dependencies
│   └── manage.py
├── frontend/                   # React application
│   ├── public/
│   ├── src/
│   │   ├── components/         # Reusable components
│   │   ├── pages/              # Main views
│   │   │   ├── common/         # Public pages (Login, Profile)
│   │   │   ├── operator/       # Operator pages
│   │   │   └── admin/          # Admin pages
│   │   ├── services/           # API services
│   │   ├── hooks/              # Custom hooks
│   │   └── styles/             # Global styles
│   ├── package.json
│   └── README.md
├── docs/                       # Documentation
├── .github/                    # GitHub Actions (CI/CD)
│   └── workflows/
├── .gitignore
├── README.md
└── CHANGELOG.md
```

## 🚀 Installation and Usage

### Prerequisites

- Python 3.10+
- Node.js 18+
- PostgreSQL 14+
- Git

### Backend (Django)

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# Edit .env with your settings

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Run development server
python manage.py runserver
```

Backend will be available at `http://localhost:8000`

### Frontend (React)

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with backend URL

# Run development server with Vite
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

Frontend will be available at `http://localhost:5173` (development) or `http://localhost:4173` (preview)

## 🧪 Testing

### Backend

```bash
cd backend
pytest
pytest --cov=apps  # With coverage
```

### Frontend

```bash
cd frontend
npm test
npm test -- --coverage  # With coverage
```

## 🔍 Code Quality

### Backend

```bash
# Format code
black .

# Verify linting
flake8
```

### Frontend

```bash
# Format code
npm run format

# Verify linting
npm run lint
```

## 🎨 Visual Identity

### Primary Color

- **Olive Green**: `#9B933B`
- Usage: Navbar, primary buttons, identity elements

### Complementary Colors

- White: `#FFFFFF`
- Light gray: `#F5F5F5`
- Dark gray: `#333333`
- Dark green: `#6F6A2A` (hover)
- Soft red: `#C94A4A` (errors)
- Soft yellow: `#E0C65A` (warnings)

## 📊 Main Models

### DailyReport

- Daily sales and expense registration
- Automatic calculation of next day balance
- Relationship with expenses and sold products

### Expense

- Description, amount and optional category
- Associated with daily report

### Product

- Product catalog with unit price
- Active/inactive status

### SoldProduct

- Quantity sold per product
- Associated with daily report

### ExpenseCategory

- Reusable categories to classify expenses
- Active/inactive status

### AutomaticExpense

- Predefined expenses configurable by administrator
- Can be quickly inserted in daily reports
- Includes description, amount and optional category

### DeductibleExpense

- Special marking of categories as deductible
- Types: transfer, savings, income
- Allows separate analysis of deductible expenses

## ✨ Main Features (v1.2.2+)

### Smart Pagination

- All tables (Reports, Products, Categories, Users) use 10-item pagination
- Navigation buttons with disabled state at limits
- Automatic reset when loading new data

### Advanced Report Filtering

- **Current month filter**: Shows only reports from current month
- **Range filter**: Select custom start and end dates
- **No filter**: Shows all reports
- Applicable on both client and server side

### Automatic Expenses

- Administration panel to create reusable expenses
- Quick buttons in report form to insert predefined expenses
- Automatic propagation of description, amount and category

### PDF Export

- **Reports**: Export complete report details in invoice format (A4 portrait)
- **Statistics**: Export charts and metrics in horizontal format (A4 landscape)
- Automatic support for multiple pages

### Statistics Improvements

- Expanded color palette (8 varied colors vs single olive)
- Charts with better contrast and readability
- Filters by date range

### Enhanced Security

- Preventive validation of duplicate reports with clear messaging
- Admin fields protected against user editing
- Improved role-based access control

## 🔒 Security

- ✅ JWT authentication
- ✅ Backend input validation
- ✅ CSRF protection
- ✅ CORS properly configured
- ✅ Sensitive variables in environment
- ✅ HTTPS mandatory in production

## 📈 Metrics and Statistics

The system automatically generates metrics about:

- Total sales (daily, monthly, annual)
- Total expenses by period
- Expenses by category
- Most sold products
- Basic profitability (sales - expenses)

## 🚢 Deployment

### Recommendations

**Backend**: Railway or Render

- Simple configuration
- Automatic HTTPS
- Managed PostgreSQL

**Frontend**: Vercel or Netlify

- Automatic deploy from Git
- Included CDN
- Free for small projects

### Required Environment Variables

**Backend**:

- `SECRET_KEY`: Django secret key
- `DATABASE_URL`: PostgreSQL connection URL
- `DEBUG`: False in production
- `ALLOWED_HOSTS`: Allowed domains

**Frontend**:

- `REACT_APP_API_URL`: Backend URL

## 📝 Commit Conventions

Commits follow the format:

```
type(scope): brief description

Detailed description if necessary
```

**Types**:

- `feat`: New functionality
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Format, no code changes
- `refactor`: Refactoring
- `test`: Add or modify tests
- `chore`: Maintenance tasks

**Example**:

```
feat(reports): add automatic calculation of next day balance

Implements the business logic to automatically calculate
the next day balance using the formula:
next_balance = opening_balance + sales - expenses - delivery
```

## 👥 User Roles

### Administrator

- Manages users
- Creates and edits expense categories
- Creates and edits products with price
- Views global statistics

### Operational User

- Registers daily reports
- Consults historical reports
- Exports information

## 📖 Additional Documentation

- [Project Guidelines](docs/)
- [Installation Guide](docs/INSTRUCCIONES_INICIO.md)
- [Deployment Solutions](docs/SOLUCION_DESPLIEGUE.md)
- [Supabase Setup](docs/SUPABASE_SETUP.md)

## 📄 License

This project is private and exclusively for use by the paint warehouse.

## 👨‍💻 Development

The project is developed following agile methodologies with feature branches:

- `main`: Main branch (production)
- `feature/name`: New features
- `fix/name`: Bug fixes

Each branch should have professional and descriptive commits in English.

---

**Mundo Reporte** - Daily management system for paint warehouses
