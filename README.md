# P-Verse - Social Media Platform

A full-stack social media application built with Spring Boot and Next.js.

---

## 📚 Authentication Documentation

**Last Updated:** November 13, 2025

### 🎯 Quick Links (Start Here!)

| File | Purpose | When to Read? |
|------|---------|---------------|
| **[AUTHENTICATION_STATUS.md](AUTHENTICATION_STATUS.md)** | 📊 Quick overview | **READ THIS FIRST!** |
| **[AUTHENTICATION_QUICK_REFERENCE.md](AUTHENTICATION_QUICK_REFERENCE.md)** | 📖 Quick reference card | Need quick info |
| **[AUTHENTICATION_COMPLETION_CHECKLIST.md](AUTHENTICATION_COMPLETION_CHECKLIST.md)** | 📋 Complete feature list | Want deep understanding |
| **[REFRESH_TOKEN_IMPLEMENTATION_GUIDE.md](REFRESH_TOKEN_IMPLEMENTATION_GUIDE.md)** | 🔄 Step-by-step guide | Ready to implement |
| **[CORS_AND_AUTHENTICATION_FIX.md](CORS_AND_AUTHENTICATION_FIX.md)** | 🔧 CORS troubleshooting | Having CORS issues |

### ✅ Current Authentication Status

**Completion:** 33% (3/9 features)

#### Working Features:
- ✅ Login/Register/Logout
- ✅ JWT Token generation & validation
- ✅ Protected routes with Spring Security
- ✅ CORS configuration (fixed)
- ✅ Password encryption (BCrypt)
- ✅ Frontend Auth Context
- ✅ Axios interceptors

#### Missing Features:
- ❌ Refresh Token (causes sudden logout!)
- ❌ Email Verification
- ❌ Password Reset
- ❌ Role-Based Access Control
- ❌ Account Lockout
- ❌ Rate Limiting

### 🚨 Known Issues

**Issue:** Token expires after 1 hour → User forced to logout

**Solution:** Implement Refresh Token (see [implementation guide](REFRESH_TOKEN_IMPLEMENTATION_GUIDE.md))

### 🎯 Recommended Next Steps

**For Learning Projects:**
- ✅ Current authentication is sufficient
- Continue with other features (posts, messages, etc.)

**For Production/Portfolio:**
- ⚠️ Implement at minimum:
  1. Refresh Token (2-3 days)
  2. Email Verification (2-3 days)
  3. Password Reset (2 days)
- Total: ~1 week to reach 66% completion

**For Professional/Startup:**
- 🎯 Implement all 9 features
- Total: ~3-4 weeks to reach 100%

---

## 🚀 Tech Stack

### Backend
- Spring Boot 3.x
- Spring Security + JWT
- Spring Data JPA
- PostgreSQL/MySQL
- Maven

### Frontend
- Next.js 14
- TypeScript
- Tailwind CSS
- Axios
- React Context API

---

## 🛠️ Setup & Installation

### Prerequisites
- Java 17+
- Node.js 18+
- PostgreSQL/MySQL
- pnpm (or npm)

### Backend Setup
```bash
cd backend
./mvnw spring-boot:run
```

### Frontend Setup
```bash
cd frontend
pnpm install
pnpm dev
```

### Environment Variables

**Backend** (`application.properties`):
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/pverse
spring.datasource.username=your_username
spring.datasource.password=your_password

jwt.secret=your-super-secret-key-minimum-256-bits
jwt.expiration=3600000
```

**Frontend** (`.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

---

## 📖 Additional Documentation

- [Database Design Plan](DATABASE_DESIGN_PLAN.md)
- [Entity & Repository Summary](backend/ENTITY_REPOSITORY_SUMMARY.md)
- [Authentication Quick Start](AUTH_QUICK_START.md)
- [Testing Workflow](TESTING_WORKFLOW.md)
- [Task List](TASK.md)

---

## 🤝 Contributing

This is a personal project for learning purposes.

---

## 📝 License

Private - Not for distribution

---

**Note:** This is the locket desktop version project converted to a social media platform.

