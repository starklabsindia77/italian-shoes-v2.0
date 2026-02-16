# Italian Shoes v2.0 - Advanced Architecture Analysis & Modernization Strategy

**Document Version:** 2.0
**Date:** February 16, 2026
**Prepared By:** Lead Architecture Review
**Classification:** Technical Architecture Document
**Status:** Production Readiness Assessment

---

## Executive Summary

### Project Assessment Matrix

| Dimension | Current State | Target State | Gap Severity |
|-----------|---------------|--------------|--------------|
| **Security Posture** | 3/10 (Critical vulnerabilities) | 9/10 | 🚨 Critical |
| **Scalability** | 4/10 (Single region, no caching) | 8/10 | 🔴 High |
| **Code Quality** | 6/10 (Functional but needs hardening) | 8/10 | 🟡 Medium |
| **DevOps Maturity** | 2/10 (Manual deployments) | 8/10 | 🔴 High |
| **Performance** | 5/10 (No optimization) | 9/10 | 🔴 High |
| **Observability** | 1/10 (Console logs only) | 9/10 | 🚨 Critical |
| **Data Architecture** | 6/10 (Good schema, poor indexing) | 8/10 | 🟡 Medium |
| **API Design** | 5/10 (RESTful but inconsistent) | 8/10 | 🟡 Medium |

### Critical Findings
- **Security Risk Level:** HIGH - Production credentials exposed in version control
- **Scalability Ceiling:** ~50 concurrent users before connection pool exhaustion
- **Reliability SLA:** Unable to meet 99.9% uptime without observability
- **Technical Debt:** Estimated 140.5 hours to achieve production readiness

---

## Table of Contents

1. [System Architecture Analysis](#1-system-architecture-analysis)
2. [Security Architecture Deep Dive](#2-security-architecture-deep-dive)
3. [Database Architecture & Optimization](#3-database-architecture--optimization)
4. [API Design Patterns & Standards](#4-api-design-patterns--standards)
5. [Performance Engineering](#5-performance-engineering)
6. [Scalability Architecture](#6-scalability-architecture)
7. [Advanced Caching Strategies](#7-advanced-caching-strategies)
8. [Event-Driven Architecture Migration](#8-event-driven-architecture-migration)
9. [Observability & SRE Practices](#9-observability--sre-practices)
10. [Infrastructure as Code](#10-infrastructure-as-code)
11. [Advanced Deployment Strategies](#11-advanced-deployment-strategies)
12. [Data Migration & Versioning](#12-data-migration--versioning)
13. [API Gateway & BFF Pattern](#13-api-gateway--bff-pattern)
14. [Microservices Decomposition Strategy](#14-microservices-decomposition-strategy)
15. [Cost Optimization at Scale](#15-cost-optimization-at-scale)
16. [Compliance & Governance](#16-compliance--governance)
17. [Disaster Recovery & Business Continuity](#17-disaster-recovery--business-continuity)
18. [Implementation Roadmap](#18-implementation-roadmap)

---

## 1. System Architecture Analysis

### 1.1 Current Architecture Assessment

#### Technology Stack Deep Dive

```typescript
// Package Analysis
{
  "runtime": {
    "platform": "Node.js 20.x",
    "framework": "Next.js 15.5.3 (App Router)",
    "runtime_mode": "Edge + Serverless hybrid"
  },
  "frontend": {
    "ui_framework": "React 19.1.0",
    "state_management": "Zustand 5.0.8 (client-side only)",
    "styling": "Tailwind CSS 4 + shadcn/ui",
    "3d_rendering": "Three.js (@react-three/fiber 8.18.6)",
    "forms": "React Hook Form 7.62.0 + Zod 4.1.8"
  },
  "backend": {
    "api_layer": "Next.js API Routes (serverless)",
    "orm": "Prisma 6.16.1",
    "database": "PostgreSQL 14+",
    "auth": "NextAuth.js 4.24.11 (JWT sessions)"
  },
  "infrastructure": {
    "hosting": "Vercel (serverless)",
    "database": "Self-managed EC2 (13.232.130.45)",
    "cdn": "None (assets in /public)",
    "caching": "None",
    "queue_system": "None"
  }
}
```

#### Architecture Layers

```
┌─────────────────────────────────────────────────────────────┐
│                     PRESENTATION LAYER                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Public Web  │  │    Admin     │  │   Mobile     │      │
│  │  (Next.js)   │  │  Dashboard   │  │   (Future)   │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
└─────────┼──────────────────┼──────────────────┼─────────────┘
          │                  │                  │
          └──────────────────┼──────────────────┘
                             │
┌─────────────────────────────┼───────────────────────────────┐
│                      API GATEWAY LAYER                       │
│                    (Currently Missing)                       │
│  ┌───────────────────────────────────────────────────────┐  │
│  │   Rate Limiting │ Auth │ Validation │ Transformation  │  │
│  └───────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
                             │
┌─────────────────────────────┼───────────────────────────────┐
│                     APPLICATION LAYER                        │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              Next.js API Routes (27 files)             │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐            │ │
│  │  │ Products │  │  Orders  │  │Materials │   ...      │ │
│  │  └────┬─────┘  └────┬─────┘  └────┬─────┘            │ │
│  └───────┼─────────────┼─────────────┼───────────────────┘ │
└──────────┼─────────────┼─────────────┼─────────────────────┘
           │             │             │
           │             │             │ (Direct Prisma calls)
           │             │             │ (No service layer)
           │             │             │
┌──────────┼─────────────┼─────────────┼─────────────────────┐
│                     DATA ACCESS LAYER                        │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                   Prisma Client                        │  │
│  │    (No repository pattern, scattered queries)          │  │
│  └────────────────────────┬──────────────────────────────┘  │
└───────────────────────────┼─────────────────────────────────┘
                            │
┌───────────────────────────┼─────────────────────────────────┐
│                    PERSISTENCE LAYER                         │
│  ┌────────────────────────────────────────────────────────┐ │
│  │            PostgreSQL 14 (Self-managed)                │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐            │ │
│  │  │   User   │  │  Product │  │  Order   │   ...      │ │
│  │  │  (Auth)  │  │(Catalog) │  │(Commerce)│            │ │
│  │  └──────────┘  └──────────┘  └──────────┘            │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

### 1.2 Architectural Anti-Patterns Identified

#### ❌ Anti-Pattern #1: God Object API Routes

**Problem:**
```typescript
// app/api/orders/route.ts (Currently 120+ lines)
export async function POST(req: Request) {
  // 1. Auth check
  // 2. Input validation
  // 3. Business logic
  // 4. Multiple database operations
  // 5. External API calls (Shiprocket)
  // 6. Response formatting
  // All in one function!
}
```

**Impact:** Violates Single Responsibility Principle, hard to test, tightly coupled

**Solution:** Implement layered architecture with service layer

```typescript
// lib/services/order-service.ts
export class OrderService {
  constructor(
    private prisma: PrismaClient,
    private paymentService: PaymentService,
    private inventoryService: InventoryService,
    private shippingService: ShippingService
  ) {}

  async createOrder(data: CreateOrderDTO): Promise<Order> {
    return await this.prisma.$transaction(async (tx) => {
      // 1. Validate inventory
      await this.inventoryService.reserveItems(data.items, tx);

      // 2. Create order
      const order = await tx.order.create({ data: this.mapToEntity(data) });

      // 3. Process payment
      const payment = await this.paymentService.authorize(order);

      // 4. Schedule fulfillment
      await this.shippingService.schedulePickup(order);

      return order;
    });
  }
}

// app/api/orders/route.ts (Now clean)
export async function POST(req: Request) {
  const user = await requireAuth();
  const data = CreateOrderSchema.parse(await req.json());

  const order = await orderService.createOrder(data);

  return ok(order, 201);
}
```

---

#### ❌ Anti-Pattern #2: No Repository Pattern

**Problem:** Direct Prisma calls scattered across codebase

```typescript
// Found in multiple files:
await prisma.product.findMany({ ... })
await prisma.order.create({ ... })
```

**Solution:** Implement repository pattern for data access abstraction

```typescript
// lib/repositories/product-repository.ts
export class ProductRepository {
  constructor(private prisma: PrismaClient) {}

  async findActive(filters: ProductFilters): Promise<Product[]> {
    return this.prisma.product.findMany({
      where: {
        isActive: true,
        ...this.buildWhereClause(filters)
      },
      include: this.defaultIncludes,
      orderBy: filters.sortBy
    });
  }

  async findByIdWithRelations(id: string): Promise<Product | null> {
    return this.cache.wrap(`product:${id}`, () =>
      this.prisma.product.findUnique({
        where: { id },
        include: {
          materials: { where: { isActive: true } },
          styles: true,
          soles: true
        }
      })
    );
  }

  private buildWhereClause(filters: ProductFilters): Prisma.ProductWhereInput {
    // Centralized query building logic
  }
}
```

---

#### ❌ Anti-Pattern #3: Missing Domain Models

**Problem:** Using Prisma models directly in business logic

```typescript
// This couples business logic to database schema
const order = await prisma.order.create({ ... });
return ok(order); // Exposes database structure to API
```

**Solution:** Implement domain models with business logic

```typescript
// lib/domain/order.ts
export class Order {
  constructor(
    public readonly id: string,
    public readonly items: OrderItem[],
    public readonly status: OrderStatus,
    private readonly events: DomainEvent[] = []
  ) {}

  // Business logic methods
  confirm(): void {
    if (this.status !== OrderStatus.PENDING) {
      throw new OrderAlreadyProcessedError();
    }

    this.status = OrderStatus.CONFIRMED;
    this.events.push(new OrderConfirmedEvent(this.id));
  }

  cancel(reason: string): void {
    if (!this.canBeCancelled()) {
      throw new OrderCannotBeCancelledError();
    }

    this.status = OrderStatus.CANCELLED;
    this.events.push(new OrderCancelledEvent(this.id, reason));
  }

  calculateTotal(): Money {
    return this.items.reduce(
      (sum, item) => sum.add(item.subtotal()),
      Money.zero('INR')
    );
  }

  private canBeCancelled(): boolean {
    return ![
      OrderStatus.SHIPPED,
      OrderStatus.DELIVERED,
      OrderStatus.CANCELLED
    ].includes(this.status);
  }

  // DTOs for API responses
  toDTO(): OrderDTO {
    return {
      id: this.id,
      items: this.items.map(i => i.toDTO()),
      status: this.status,
      total: this.calculateTotal().toJSON()
    };
  }
}
```

---

#### ❌ Anti-Pattern #4: Client-Side Cart Persistence

**Problem:** Cart stored in Zustand (lost on page refresh)

```typescript
// lib/stores/cart-store.ts
export const useCartStore = create<CartState>((set) => ({
  items: [], // Lost on refresh!
  addItem: (item) => set((state) => ({ items: [...state.items, item] }))
}));
```

**Solution:** Hybrid approach with server-side persistence

```typescript
// lib/services/cart-service.ts
export class CartService {
  async getOrCreateCart(userId?: string): Promise<Cart> {
    if (userId) {
      // Authenticated user: use database
      return this.cartRepository.findByUserId(userId)
        ?? this.cartRepository.create(userId);
    } else {
      // Guest user: use Redis with session token
      const sessionId = await this.sessionService.getOrCreate();
      return this.redis.get(`cart:${sessionId}`)
        ?? this.createGuestCart(sessionId);
    }
  }

  async addItem(cartId: string, item: CartItem): Promise<Cart> {
    const cart = await this.getCart(cartId);
    cart.addItem(item);

    // Persist to database + cache
    await Promise.all([
      this.cartRepository.save(cart),
      this.redis.set(`cart:${cartId}`, cart, { ex: 86400 })
    ]);

    return cart;
  }
}

// Client-side store becomes cache layer
export const useCartStore = create<CartState>((set, get) => ({
  items: [],

  // Sync with server on mount
  async hydrate(userId?: string) {
    const cart = await fetch('/api/cart').then(r => r.json());
    set({ items: cart.items });
  },

  // Optimistic update + server sync
  async addItem(item: CartItem) {
    set((state) => ({ items: [...state.items, item] }));

    try {
      await fetch('/api/cart/items', {
        method: 'POST',
        body: JSON.stringify(item)
      });
    } catch (error) {
      // Rollback on failure
      set((state) => ({
        items: state.items.filter(i => i.id !== item.id)
      }));
      throw error;
    }
  }
}));
```

---

## 2. Security Architecture Deep Dive

### 2.1 Threat Modeling Analysis

#### Attack Surface Mapping

```
┌─────────────────────────────────────────────────────────────┐
│                      ATTACK SURFACE                          │
├─────────────────────────────────────────────────────────────┤
│ [1] Public API Endpoints                                     │
│     ├─ /api/products (search enumeration)                   │
│     ├─ /api/materials (data leakage)                        │
│     ├─ /api/orders (order injection)                        │
│     └─ /api/auth/* (credential stuffing)                    │
│                                                              │
│ [2] Admin Dashboard                                          │
│     ├─ Horizontal privilege escalation                      │
│     ├─ IDOR vulnerabilities                                 │
│     └─ XSS in product descriptions                          │
│                                                              │
│ [3] Database Layer                                           │
│     ├─ Exposed credentials (.env in git)                    │
│     ├─ No connection encryption                             │
│     └─ Over-privileged database user                        │
│                                                              │
│ [4] Third-party Integrations                                 │
│     ├─ Shiprocket API key exposure                          │
│     └─ No webhook signature verification                    │
│                                                              │
│ [5] File Upload (Future)                                     │
│     └─ No current implementation (future risk)              │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 STRIDE Threat Analysis

| Threat Type | Vulnerability | Severity | Mitigation |
|-------------|---------------|----------|------------|
| **Spoofing** | Weak JWT secret allows token forgery | Critical | Generate 256-bit secret, rotate quarterly |
| **Tampering** | No input validation on POST endpoints | High | Zod schemas on all inputs |
| **Repudiation** | No audit logging of admin actions | Medium | Implement audit trail |
| **Information Disclosure** | Database credentials in git | Critical | Secrets management (Vault, AWS Secrets) |
| **Denial of Service** | No rate limiting | High | Implement per-IP rate limits |
| **Elevation of Privilege** | Missing authorization checks | High | Enforce RBAC on all routes |

### 2.3 Security Implementation - Zero Trust Architecture

```typescript
// lib/security/zero-trust-middleware.ts
export async function zeroTrustMiddleware(req: NextRequest) {
  // 1. Identity Verification
  const identity = await verifyIdentity(req);

  // 2. Device Trust
  const device = await assessDeviceTrust(req);
  if (device.riskScore > 0.7) {
    return challengeMFA(req);
  }

  // 3. Context-aware Authorization
  const authorization = await evaluatePolicy({
    user: identity,
    resource: req.nextUrl.pathname,
    action: req.method,
    context: {
      ip: req.ip,
      userAgent: req.headers.get('user-agent'),
      time: new Date(),
      location: await geolocate(req.ip)
    }
  });

  if (!authorization.allowed) {
    return forbiddenResponse(authorization.reason);
  }

  // 4. Continuous Monitoring
  await logSecurityEvent({
    type: 'access_granted',
    user: identity.id,
    resource: req.nextUrl.pathname,
    riskScore: device.riskScore
  });

  return NextResponse.next({
    request: {
      headers: new Headers({
        ...req.headers,
        'x-user-id': identity.id,
        'x-risk-score': device.riskScore.toString()
      })
    }
  });
}
```

### 2.4 Secrets Management Architecture

```typescript
// lib/security/secrets-manager.ts
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

export class SecretsManager {
  private client: SecretsManagerClient;
  private cache: Map<string, { value: string; expiresAt: number }>;

  constructor() {
    this.client = new SecretsManagerClient({ region: process.env.AWS_REGION });
    this.cache = new Map();
  }

  async getSecret(secretName: string): Promise<string> {
    // Check cache first (5-minute TTL)
    const cached = this.cache.get(secretName);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.value;
    }

    // Fetch from AWS Secrets Manager
    const command = new GetSecretValueCommand({ SecretId: secretName });
    const response = await this.client.send(command);
    const secret = response.SecretString!;

    // Cache with TTL
    this.cache.set(secretName, {
      value: secret,
      expiresAt: Date.now() + 300000 // 5 minutes
    });

    return secret;
  }

  async getDatabaseUrl(): Promise<string> {
    const credentials = await this.getSecret('italian-shoes/prod/database');
    const parsed = JSON.parse(credentials);

    return `postgresql://${parsed.username}:${parsed.password}@${parsed.host}:${parsed.port}/${parsed.database}?sslmode=require`;
  }
}

// Usage in Prisma
// lib/prisma.ts
import { SecretsManager } from './security/secrets-manager';

const secretsManager = new SecretsManager();

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  datasources: {
    db: {
      url: await secretsManager.getDatabaseUrl()
    }
  }
});
```

### 2.5 Content Security Policy

```typescript
// middleware.ts
export function middleware(req: NextRequest) {
  const response = NextResponse.next();

  // Strict CSP
  response.headers.set('Content-Security-Policy', [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.vercel-insights.com",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https: blob:",
    "font-src 'self' data:",
    "connect-src 'self' https://api.italianshoes.com wss:",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "upgrade-insecure-requests"
  ].join('; '));

  // Security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');

  return response;
}
```

---

## 3. Database Architecture & Optimization

### 3.1 Current Schema Analysis

**Database: PostgreSQL 14**
**Tables: 15**
**Total Schema Lines: 443**

#### Schema Quality Assessment

| Aspect | Score | Notes |
|--------|-------|-------|
| Normalization | 8/10 | Good 3NF compliance |
| Indexing | 4/10 | Missing critical indexes |
| Relationships | 9/10 | Proper foreign keys with cascades |
| Data Types | 7/10 | Some inefficient types (TEXT for fixed-length) |
| Constraints | 6/10 | Missing check constraints |
| Partitioning | 0/10 | No partitioning strategy |

### 3.2 Advanced Indexing Strategy

```prisma
// prisma/schema.prisma - Optimized indexes

model Order {
  id                String   @id @default(cuid())
  extId             String   @unique
  customerEmail     String
  status            OrderStatus @default(PENDING)
  paymentStatus     PaymentStatus @default(PENDING)
  fulfillmentStatus FulfillmentStatus @default(UNFULFILLED)
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  // Existing indexes
  @@index([customerEmail])
  @@index([status, createdAt])

  // NEW: Composite index for admin dashboard queries
  @@index([status, paymentStatus, fulfillmentStatus, createdAt],
    name: "idx_order_dashboard")

  // NEW: Partial index for pending orders (most queried)
  @@index([status, createdAt],
    where: "status = 'PENDING'",
    name: "idx_pending_orders")

  // NEW: Covering index for order listing (includes commonly selected fields)
  @@index([createdAt(sort: Desc), status, customerEmail, extId],
    name: "idx_order_list_covering")
}

model Product {
  id          String   @id @default(cuid())
  productId   String   @unique
  title       String
  price       Int
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())

  // Existing
  @@index([title])
  @@index([productId])

  // NEW: Filtered index for active products (90% of queries)
  @@index([isActive, createdAt],
    where: "isActive = true",
    name: "idx_active_products")

  // NEW: Composite for product search
  @@index([title(ops: GinTextSearchOps), isActive],
    type: Gin,
    name: "idx_product_search")

  // NEW: Price range queries
  @@index([price, isActive, createdAt],
    name: "idx_product_price_range")
}

model Material {
  id       String   @id @default(cuid())
  extId    String   @unique
  name     String
  category MaterialCategory
  isActive Boolean  @default(true)

  // NEW: All indexes (currently none!)
  @@index([category, isActive], name: "idx_material_category")
  @@index([name(ops: GinTextSearchOps)], type: Gin, name: "idx_material_name_search")
  @@index([isActive, category, name], name: "idx_material_active_list")
}

model MaterialColor {
  id         String @id @default(cuid())
  materialId String
  name       String
  hexCode    String
  family     ColorFamily

  // NEW: Family-based filtering
  @@index([family, materialId], name: "idx_color_family")
  @@index([materialId, family, name], name: "idx_color_selector")
}
```

### 3.3 Query Optimization Patterns

#### Pattern 1: N+1 Query Elimination

**Before (N+1 problem):**
```typescript
// Executes 1 + N queries
const orders = await prisma.order.findMany();
for (const order of orders) {
  const items = await prisma.orderItem.findMany({
    where: { orderId: order.id }
  });
}
```

**After (Single query with JOIN):**
```typescript
const orders = await prisma.order.findMany({
  include: {
    items: {
      include: {
        product: true,
        style: true,
        sole: true,
        material: {
          include: {
            color: true
          }
        }
      }
    }
  }
});
```

#### Pattern 2: Pagination with Cursor

**Before (OFFSET pagination - slow on large datasets):**
```typescript
const products = await prisma.product.findMany({
  skip: (page - 1) * limit,
  take: limit
});
// Problem: OFFSET 10000 scans and discards 10,000 rows!
```

**After (Cursor-based pagination):**
```typescript
interface PaginationCursor {
  id: string;
  createdAt: Date;
}

async function getProducts(
  cursor?: PaginationCursor,
  limit = 20
): Promise<{ items: Product[]; nextCursor?: PaginationCursor }> {
  const items = await prisma.product.findMany({
    take: limit + 1,
    cursor: cursor ? { id: cursor.id } : undefined,
    orderBy: { createdAt: 'desc' },
    where: {
      createdAt: cursor ? { lt: cursor.createdAt } : undefined
    }
  });

  const hasMore = items.length > limit;
  const results = hasMore ? items.slice(0, -1) : items;

  return {
    items: results,
    nextCursor: hasMore
      ? { id: results[results.length - 1].id, createdAt: results[results.length - 1].createdAt }
      : undefined
  };
}
```

#### Pattern 3: Aggregate Queries with Materialized Views

```sql
-- Create materialized view for dashboard stats
CREATE MATERIALIZED VIEW order_statistics AS
SELECT
  DATE(created_at) as order_date,
  status,
  payment_status,
  COUNT(*) as order_count,
  SUM(total) as total_revenue,
  AVG(total) as avg_order_value
FROM "Order"
GROUP BY DATE(created_at), status, payment_status;

CREATE INDEX ON order_statistics (order_date, status);

-- Refresh every hour via cron job
REFRESH MATERIALIZED VIEW CONCURRENTLY order_statistics;
```

```typescript
// lib/repositories/analytics-repository.ts
export class AnalyticsRepository {
  async getDashboardStats(dateRange: DateRange): Promise<DashboardStats> {
    // Query materialized view instead of raw orders table
    const stats = await prisma.$queryRaw<OrderStatistic[]>`
      SELECT
        order_date,
        status,
        order_count,
        total_revenue,
        avg_order_value
      FROM order_statistics
      WHERE order_date BETWEEN ${dateRange.start} AND ${dateRange.end}
      ORDER BY order_date DESC
    `;

    return this.transformToDTO(stats);
  }
}
```

### 3.4 Database Connection Pool Optimization

```typescript
// lib/prisma.ts - Production-ready configuration
import { PrismaClient } from '@prisma/client';
import { SecretsManager } from './security/secrets-manager';

const secretsManager = new SecretsManager();

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  // Logging configuration
  log: process.env.NODE_ENV === 'development'
    ? ['query', 'error', 'warn']
    : ['error'],

  // Connection pool settings
  datasources: {
    db: {
      url: await secretsManager.getDatabaseUrl()
    }
  },

  // Optimized for serverless
  __internal: {
    engine: {
      // Reduce connection pool size in serverless
      connection_limit: 5,

      // Faster connection timeout
      connect_timeout: 10,

      // Pool timeout
      pool_timeout: 10,

      // Socket timeout
      socket_timeout: 10
    }
  }
});

// Graceful shutdown
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

// Connection middleware with retry logic
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (attempt === maxRetries) throw error;

      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }

  throw new Error('Max retries exceeded');
}
```

### 3.5 Database Partitioning Strategy

```sql
-- Partition orders table by date (for high-volume scenarios)
-- Improves query performance and enables efficient archiving

-- 1. Create partitioned table
CREATE TABLE "Order_partitioned" (
  id TEXT NOT NULL,
  ext_id TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL,
  -- ... other fields
  PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);

-- 2. Create monthly partitions
CREATE TABLE "Order_2026_02" PARTITION OF "Order_partitioned"
  FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');

CREATE TABLE "Order_2026_03" PARTITION OF "Order_partitioned"
  FOR VALUES FROM ('2026-03-01') TO ('2026-04-01');

-- 3. Automated partition creation via cron
CREATE OR REPLACE FUNCTION create_monthly_order_partition()
RETURNS void AS $$
DECLARE
  partition_date DATE;
  partition_name TEXT;
  start_date DATE;
  end_date DATE;
BEGIN
  partition_date := DATE_TRUNC('month', CURRENT_DATE + INTERVAL '1 month');
  partition_name := 'Order_' || TO_CHAR(partition_date, 'YYYY_MM');
  start_date := partition_date;
  end_date := partition_date + INTERVAL '1 month';

  EXECUTE format(
    'CREATE TABLE IF NOT EXISTS %I PARTITION OF "Order_partitioned" FOR VALUES FROM (%L) TO (%L)',
    partition_name, start_date, end_date
  );
END;
$$ LANGUAGE plpgsql;

-- 4. Schedule monthly execution
SELECT cron.schedule('create-order-partition', '0 0 1 * *', 'SELECT create_monthly_order_partition()');
```

---

## 4. API Design Patterns & Standards

### 4.1 RESTful API Maturity Model

**Current Level:** Level 2 (HTTP Verbs)
**Target Level:** Level 3 (HATEOAS + Hypermedia)

#### API Versioning Strategy

```typescript
// app/api/v1/products/route.ts
export const runtime = 'edge';
export const dynamic = 'force-dynamic';

/**
 * @swagger
 * /api/v1/products:
 *   get:
 *     summary: List products with pagination
 *     tags: [Products]
 *     parameters:
 *       - in: header
 *         name: Accept-Version
 *         schema:
 *           type: string
 *           enum: [v1, v2]
 *         description: API version (defaults to latest)
 */
export async function GET(req: Request) {
  const version = req.headers.get('Accept-Version') || 'v1';

  // Version-specific logic
  if (version === 'v2') {
    return handleV2Request(req);
  }

  // V1 logic
  const { skip, limit } = pagination(req);
  const products = await productService.listProducts({ skip, limit });

  return ok({
    data: products.map(p => p.toDTO()),
    meta: {
      total: products.length,
      page: Math.floor(skip / limit) + 1,
      limit
    },
    links: {
      self: `/api/v1/products?page=${Math.floor(skip / limit) + 1}`,
      next: products.length === limit
        ? `/api/v1/products?page=${Math.floor(skip / limit) + 2}`
        : null
    }
  });
}
```

### 4.2 API Response Envelope Pattern

```typescript
// lib/api/response-envelope.ts
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: ResponseMetadata;
  links?: HATEOASLinks;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  trace_id?: string;
}

export interface ResponseMetadata {
  timestamp: string;
  request_id: string;
  version: string;
  took_ms: number;
  pagination?: PaginationMeta;
}

export interface HATEOASLinks {
  self: string;
  next?: string;
  prev?: string;
  related?: Record<string, string>;
}

// Response builder
export class ApiResponseBuilder<T> {
  private response: Partial<ApiResponse<T>> = { success: true };

  withData(data: T): this {
    this.response.data = data;
    return this;
  }

  withPagination(pagination: PaginationMeta): this {
    this.response.meta = {
      ...this.response.meta,
      pagination
    };
    return this;
  }

  withLinks(links: HATEOASLinks): this {
    this.response.links = links;
    return this;
  }

  build(req: Request, startTime: number): Response {
    const meta: ResponseMetadata = {
      timestamp: new Date().toISOString(),
      request_id: req.headers.get('x-request-id') || crypto.randomUUID(),
      version: 'v1',
      took_ms: Date.now() - startTime,
      ...this.response.meta
    };

    return Response.json({
      ...this.response,
      meta
    });
  }
}

// Usage
export async function GET(req: Request) {
  const startTime = Date.now();

  const products = await productService.listProducts();

  return new ApiResponseBuilder<Product[]>()
    .withData(products)
    .withPagination({ total: 100, page: 1, limit: 20 })
    .withLinks({
      self: '/api/v1/products?page=1',
      next: '/api/v1/products?page=2'
    })
    .build(req, startTime);
}
```

### 4.3 Error Handling & Problem Details (RFC 7807)

```typescript
// lib/api/problem-details.ts
export class ProblemDetails extends Error {
  constructor(
    public readonly type: string,
    public readonly title: string,
    public readonly status: number,
    public readonly detail?: string,
    public readonly instance?: string,
    public readonly extensions?: Record<string, any>
  ) {
    super(title);
  }

  toJSON() {
    return {
      type: `https://api.italianshoes.com/problems/${this.type}`,
      title: this.title,
      status: this.status,
      detail: this.detail,
      instance: this.instance,
      ...this.extensions
    };
  }

  toResponse(): Response {
    return new Response(JSON.stringify(this.toJSON()), {
      status: this.status,
      headers: { 'Content-Type': 'application/problem+json' }
    });
  }
}

// Predefined problem types
export class ValidationError extends ProblemDetails {
  constructor(errors: Record<string, string[]>) {
    super(
      'validation-error',
      'Request validation failed',
      400,
      'One or more fields failed validation',
      undefined,
      { errors }
    );
  }
}

export class UnauthorizedError extends ProblemDetails {
  constructor() {
    super(
      'unauthorized',
      'Authentication required',
      401,
      'You must be authenticated to access this resource'
    );
  }
}

export class ForbiddenError extends ProblemDetails {
  constructor(resource: string) {
    super(
      'forbidden',
      'Access denied',
      403,
      `You don't have permission to access ${resource}`
    );
  }
}

export class ResourceNotFoundError extends ProblemDetails {
  constructor(resource: string, id: string) {
    super(
      'resource-not-found',
      'Resource not found',
      404,
      `${resource} with ID ${id} was not found`
    );
  }
}

export class ConflictError extends ProblemDetails {
  constructor(message: string) {
    super(
      'conflict',
      'Resource conflict',
      409,
      message
    );
  }
}

export class RateLimitError extends ProblemDetails {
  constructor(retryAfter: number) {
    super(
      'rate-limit-exceeded',
      'Too many requests',
      429,
      'Rate limit exceeded. Please slow down.',
      undefined,
      {
        retry_after: retryAfter,
        limit: 100,
        window: '1m'
      }
    );
  }
}

// Global error handler
export function handleApiError(error: unknown): Response {
  // Structured logging
  logger.error('API Error', { error });

  // Sentry tracking
  Sentry.captureException(error);

  // Return appropriate problem details
  if (error instanceof ProblemDetails) {
    return error.toResponse();
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2025') {
      return new ResourceNotFoundError('Resource', 'unknown').toResponse();
    }
    if (error.code === 'P2002') {
      return new ConflictError('A resource with this identifier already exists').toResponse();
    }
  }

  // Generic server error
  return new ProblemDetails(
    'internal-server-error',
    'Internal server error',
    500,
    process.env.NODE_ENV === 'development'
      ? (error as Error).message
      : 'An unexpected error occurred'
  ).toResponse();
}
```

### 4.4 Request/Response DTOs with Validation

```typescript
// lib/dto/product.dto.ts
import { z } from 'zod';

// Input DTO
export const CreateProductDTO = z.object({
  productId: z.string().min(3).max(50).regex(/^[a-z0-9-]+$/),
  title: z.string().min(5).max(200),
  description: z.string().max(2000).optional(),
  price: z.number().int().positive().max(10000000), // Max ₹1,00,000
  currency: z.literal('INR'),
  isActive: z.boolean().default(true),
  materials: z.array(z.string().cuid()).min(1),
  styles: z.array(z.string().cuid()).min(1),
  soles: z.array(z.string().cuid()).min(1)
});

export type CreateProductDTO = z.infer<typeof CreateProductDTO>;

// Output DTO
export class ProductDTO {
  id: string;
  productId: string;
  title: string;
  description?: string;
  price: MoneyDTO;
  isActive: boolean;
  materials: MaterialSummaryDTO[];
  styles: StyleSummaryDTO[];
  soles: SoleSummaryDTO[];
  createdAt: string;
  updatedAt: string;
  _links: {
    self: string;
    materials: string;
    styles: string;
    soles: string;
  };

  static fromDomain(product: Product): ProductDTO {
    return {
      id: product.id,
      productId: product.productId,
      title: product.title,
      description: product.description,
      price: {
        amount: product.price,
        currency: 'INR',
        formatted: `₹${(product.price / 100).toLocaleString('en-IN')}`
      },
      isActive: product.isActive,
      materials: product.materials.map(MaterialSummaryDTO.fromDomain),
      styles: product.styles.map(StyleSummaryDTO.fromDomain),
      soles: product.soles.map(SoleSummaryDTO.fromDomain),
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
      _links: {
        self: `/api/v1/products/${product.id}`,
        materials: `/api/v1/products/${product.id}/materials`,
        styles: `/api/v1/products/${product.id}/styles`,
        soles: `/api/v1/products/${product.id}/soles`
      }
    };
  }
}
```

---

## 5. Performance Engineering

### 5.1 Performance Budget

| Metric | Budget | Current | Status |
|--------|--------|---------|--------|
| **First Contentful Paint** | <1.8s | ~2.5s | ❌ Over budget |
| **Largest Contentful Paint** | <2.5s | ~4.5s | ❌ Over budget |
| **Total Blocking Time** | <300ms | ~600ms | ❌ Over budget |
| **Cumulative Layout Shift** | <0.1 | ~0.15 | ❌ Over budget |
| **Time to Interactive** | <3.5s | ~6s | ❌ Over budget |
| **API Response Time (p50)** | <200ms | ~300ms | ❌ Over budget |
| **API Response Time (p95)** | <500ms | ~800ms | ❌ Over budget |
| **API Response Time (p99)** | <1000ms | ~1500ms | ❌ Over budget |
| **JavaScript Bundle** | <300KB | ~450KB | ❌ Over budget |
| **Total Page Weight** | <2MB | ~8MB | ❌ Over budget |

### 5.2 Bundle Size Optimization

```typescript
// next.config.ts - Advanced optimization
import type { NextConfig } from 'next';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';

const config: NextConfig = {
  // Compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
    reactRemoveProperties: process.env.NODE_ENV === 'production'
      ? { properties: ['^data-test'] }
      : false
  },

  // Experimental features
  experimental: {
    optimizePackageImports: [
      '@react-three/fiber',
      '@react-three/drei',
      'lucide-react',
      'date-fns'
    ],
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js'
        }
      }
    }
  },

  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000, // 1 year
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.italianshoes.com'
      }
    ]
  },

  // Webpack customization
  webpack: (config, { isServer, dev }) => {
    // Bundle analyzer (dev only)
    if (dev && !isServer) {
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          openAnalyzer: false
        })
      );
    }

    // Three.js optimization
    config.externals = config.externals || [];
    config.externals.push({
      canvas: 'commonjs canvas'
    });

    // Tree shaking
    config.optimization.usedExports = true;
    config.optimization.sideEffects = false;

    return config;
  },

  // Output configuration
  output: 'standalone', // For Docker
  compress: true,
  poweredByHeader: false,

  // Headers for caching
  async headers() {
    return [
      {
        source: '/assets/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      }
    ];
  }
};

export default config;
```

### 5.3 Code Splitting Strategy

```typescript
// Dynamic imports for heavy components
import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// 3D viewer (largest bundle)
const ShoeCustomizer = dynamic(
  () => import('@/components/shoe-customizer'),
  {
    loading: () => <ShoeCustomizerSkeleton />,
    ssr: false // Client-only rendering
  }
);

// Admin components
const ProductEditor = dynamic(
  () => import('@/components/admin/product-editor'),
  { ssr: false }
);

const OrderDashboard = dynamic(
  () => import('@/components/admin/order-dashboard'),
  { ssr: false }
);

// Usage with Suspense
export default function ProductPage() {
  return (
    <Suspense fallback={<ShoeCustomizerSkeleton />}>
      <ShoeCustomizer productId="abc123" />
    </Suspense>
  );
}
```

### 5.4 Image Optimization Pipeline

```typescript
// lib/image-optimizer.ts
import sharp from 'sharp';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

export class ImageOptimizer {
  private s3: S3Client;

  constructor() {
    this.s3 = new S3Client({ region: 'us-east-1' });
  }

  async optimizeAndUpload(
    imagePath: string,
    targetKey: string
  ): Promise<string[]> {
    const uploadedUrls: string[] = [];

    // Generate multiple formats and sizes
    const variants = [
      { format: 'avif', quality: 80, suffix: 'avif' },
      { format: 'webp', quality: 85, suffix: 'webp' },
      { format: 'jpeg', quality: 90, suffix: 'jpg' }
    ];

    const sizes = [640, 828, 1200, 1920];

    for (const variant of variants) {
      for (const width of sizes) {
        const buffer = await sharp(imagePath)
          .resize(width, null, { withoutEnlargement: true })
          .toFormat(variant.format as any, { quality: variant.quality })
          .toBuffer();

        const key = `${targetKey}-${width}w.${variant.suffix}`;

        await this.s3.send(new PutObjectCommand({
          Bucket: 'italian-shoes-assets',
          Key: key,
          Body: buffer,
          ContentType: `image/${variant.format}`,
          CacheControl: 'public, max-age=31536000, immutable'
        }));

        uploadedUrls.push(`https://cdn.italianshoes.com/${key}`);
      }
    }

    return uploadedUrls;
  }
}

// Usage in admin upload
export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get('image') as File;

  const optimizer = new ImageOptimizer();
  const urls = await optimizer.optimizeAndUpload(
    await file.arrayBuffer(),
    `products/${crypto.randomUUID()}`
  );

  return ok({ urls });
}
```

### 5.5 3D Model Optimization

```typescript
// scripts/optimize-glb.ts
import { MeshoptDecoder, MeshoptEncoder } from 'meshoptimizer';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';

export async function optimizeGLB(inputPath: string, outputPath: string) {
  const loader = new GLTFLoader();

  // Enable Draco compression
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath('/draco/');
  loader.setDRACOLoader(dracoLoader);

  const gltf = await loader.loadAsync(inputPath);

  // Apply optimizations
  gltf.scene.traverse((object) => {
    if (object.isMesh) {
      // Simplify geometry
      if (object.geometry.index) {
        const indexCount = object.geometry.index.count;
        const targetIndexCount = Math.floor(indexCount * 0.7); // 30% reduction

        const simplified = MeshoptEncoder.simplify(
          object.geometry.index.array,
          object.geometry.attributes.position.array,
          targetIndexCount
        );

        object.geometry.setIndex(Array.from(simplified));
      }

      // Quantize attributes
      object.geometry.attributes.position = MeshoptEncoder.quantize(
        object.geometry.attributes.position.array,
        16 // bits
      );

      // Compress textures
      if (object.material.map) {
        object.material.map.minFilter = THREE.LinearMipmapLinearFilter;
        object.material.map.magFilter = THREE.LinearFilter;
        object.material.map.generateMipmaps = true;
      }
    }
  });

  // Export with Draco compression
  const exporter = new GLTFExporter();
  const options = {
    binary: true,
    dracoOptions: {
      compressionLevel: 10,
      quantizationBits: {
        POSITION: 14,
        NORMAL: 10,
        COLOR: 8,
        TEX_COORD: 12,
        GENERIC: 12
      }
    }
  };

  const arrayBuffer = await exporter.parseAsync(gltf.scene, options);
  await fs.promises.writeFile(outputPath, Buffer.from(arrayBuffer));

  console.log(`Optimized: ${inputPath} -> ${outputPath}`);
  console.log(`Size reduction: ${getFileSizeReduction(inputPath, outputPath)}%`);
}
```

---

## 6. Scalability Architecture

### 6.1 Horizontal Scaling Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                    LOAD BALANCER                             │
│                  (Vercel Edge Network)                       │
└────────────┬───────────────────────────────┬────────────────┘
             │                               │
             │                               │
   ┌─────────▼─────────┐          ┌─────────▼─────────┐
   │   Edge Function   │          │   Edge Function   │
   │   (US-East-1)     │          │   (EU-Central-1)  │
   └─────────┬─────────┘          └─────────┬─────────┘
             │                               │
             │        ┌──────────────┐       │
             └───────▶│  Redis Cache │◀──────┘
                      │  (Multi-AZ)  │
                      └──────┬───────┘
                             │
                ┌────────────┼────────────┐
                │            │            │
      ┌─────────▼────┐  ┌───▼────┐  ┌───▼─────┐
      │  Primary DB  │  │ Replica│  │ Replica │
      │ (RW - Master)│  │(RO-1)  │  │(RO-2)   │
      └──────────────┘  └────────┘  └─────────┘
```

### 6.2 Database Read Replica Strategy

```typescript
// lib/prisma-read-replicas.ts
import { PrismaClient } from '@prisma/client';

export class PrismaClientManager {
  private primaryClient: PrismaClient;
  private replicaClients: PrismaClient[];
  private currentReplicaIndex = 0;

  constructor() {
    // Primary (write) connection
    this.primaryClient = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL_PRIMARY
        }
      }
    });

    // Read replicas
    this.replicaClients = [
      process.env.DATABASE_URL_REPLICA_1,
      process.env.DATABASE_URL_REPLICA_2
    ].filter(Boolean).map(url =>
      new PrismaClient({
        datasources: { db: { url } }
      })
    );
  }

  // Get primary for writes
  get primary(): PrismaClient {
    return this.primaryClient;
  }

  // Round-robin replica selection for reads
  get replica(): PrismaClient {
    if (this.replicaClients.length === 0) {
      return this.primaryClient; // Fallback to primary
    }

    const client = this.replicaClients[this.currentReplicaIndex];
    this.currentReplicaIndex = (this.currentReplicaIndex + 1) % this.replicaClients.length;

    return client;
  }
}

export const db = new PrismaClientManager();

// Usage in services
export class ProductService {
  async getProduct(id: string): Promise<Product> {
    // Read from replica
    return db.replica.product.findUnique({ where: { id } });
  }

  async createProduct(data: CreateProductDTO): Promise<Product> {
    // Write to primary
    return db.primary.product.create({ data });
  }

  async updateProduct(id: string, data: UpdateProductDTO): Promise<Product> {
    // Write to primary
    return db.primary.product.update({ where: { id }, data });
  }
}
```

### 6.3 Auto-Scaling Configuration

```yaml
# infrastructure/kubernetes/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: italian-shoes-api
spec:
  replicas: 3 # Minimum replicas
  selector:
    matchLabels:
      app: italian-shoes-api
  template:
    metadata:
      labels:
        app: italian-shoes-api
    spec:
      containers:
      - name: api
        image: italian-shoes/api:latest
        ports:
        - containerPort: 3000
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: db-credentials
              key: url
        readinessProbe:
          httpGet:
            path: /api/health
            port: 3000
          initialDelaySeconds: 10
          periodSeconds: 5
        livenessProbe:
          httpGet:
            path: /api/health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10

---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: italian-shoes-api-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: italian-shoes-api
  minReplicas: 3
  maxReplicas: 20
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
  - type: Pods
    pods:
      metric:
        name: http_requests_per_second
      target:
        type: AverageValue
        averageValue: "1000"
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
      - type: Percent
        value: 50
        periodSeconds: 60
    scaleUp:
      stabilizationWindowSeconds: 60
      policies:
      - type: Percent
        value: 100
        periodSeconds: 30
```

---

## 7. Advanced Caching Strategies

### 7.1 Multi-Layer Caching Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      CLIENT (Browser)                        │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  L1: Browser Cache (HTTP Cache-Control)               │ │
│  │  - Static assets: 1 year                               │ │
│  │  - API responses: 5 minutes (stale-while-revalidate)  │ │
│  └────────────────────────────────────────────────────────┘ │
└────────────────────────┬───────────────────────────────────┘
                         │
┌────────────────────────▼───────────────────────────────────┐
│                    EDGE CDN (Vercel Edge)                   │
│  ┌────────────────────────────────────────────────────────┐│
│  │  L2: Edge Cache (Globally Distributed)                ││
│  │  - Static pages: 1 hour                               ││
│  │  - API responses: 1 minute (with edge-side revalidation)││
│  └────────────────────────────────────────────────────────┘│
└────────────────────────┬───────────────────────────────────┘
                         │
┌────────────────────────▼───────────────────────────────────┐
│                  APPLICATION SERVER                         │
│  ┌────────────────────────────────────────────────────────┐│
│  │  L3: In-Memory Cache (Node.js Process)                ││
│  │  - Hot data: 30 seconds                               ││
│  │  - Session data: 15 minutes                           ││
│  └────────────────────────────────────────────────────────┘│
└────────────────────────┬───────────────────────────────────┘
                         │
┌────────────────────────▼───────────────────────────────────┐
│              DISTRIBUTED CACHE (Redis)                      │
│  ┌────────────────────────────────────────────────────────┐│
│  │  L4: Redis Cache (Shared Across Instances)            ││
│  │  - Catalog data: 1 hour                               ││
│  │  - User sessions: 24 hours                            ││
│  │  - Cart data: 7 days                                  ││
│  └────────────────────────────────────────────────────────┘│
└────────────────────────┬───────────────────────────────────┘
                         │
┌────────────────────────▼───────────────────────────────────┐
│                     DATABASE                                │
│  ┌────────────────────────────────────────────────────────┐│
│  │  L5: Database Query Cache (PostgreSQL)                ││
│  │  - Shared buffers: 256MB                              ││
│  │  - Effective cache: 1GB                               ││
│  └────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

### 7.2 Intelligent Cache Invalidation

```typescript
// lib/cache/cache-manager.ts
import { Redis } from '@upstash/redis';
import { EventEmitter } from 'events';

export class CacheManager extends EventEmitter {
  private redis: Redis;
  private localCache: Map<string, { value: any; expiresAt: number }>;

  constructor() {
    super();
    this.redis = Redis.fromEnv();
    this.localCache = new Map();

    // Subscribe to invalidation events
    this.on('invalidate', this.handleInvalidation.bind(this));
  }

  // Hierarchical cache keys
  private buildKey(namespace: string, ...parts: string[]): string {
    return `${namespace}:${parts.join(':')}`;
  }

  // L3 + L4 caching with automatic fallback
  async get<T>(key: string): Promise<T | null> {
    // Try L3 (in-memory) first
    const local = this.localCache.get(key);
    if (local && local.expiresAt > Date.now()) {
      return local.value as T;
    }

    // Try L4 (Redis)
    const remote = await this.redis.get<T>(key);
    if (remote) {
      // Backfill L3
      this.localCache.set(key, {
        value: remote,
        expiresAt: Date.now() + 30000 // 30 seconds
      });
      return remote;
    }

    return null;
  }

  async set(key: string, value: any, ttl: number): Promise<void> {
    // Write to both layers
    this.localCache.set(key, {
      value,
      expiresAt: Date.now() + Math.min(ttl, 30000)
    });

    await this.redis.set(key, value, { ex: ttl });
  }

  // Pattern-based invalidation
  async invalidate(pattern: string): Promise<void> {
    // Invalidate local cache
    for (const key of this.localCache.keys()) {
      if (this.matchPattern(key, pattern)) {
        this.localCache.delete(key);
      }
    }

    // Invalidate Redis cache
    const keys = await this.redis.keys(pattern);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }

    // Emit invalidation event for distributed systems
    this.emit('invalidate', pattern);
  }

  // Tag-based invalidation
  async invalidateByTags(tags: string[]): Promise<void> {
    for (const tag of tags) {
      const keys = await this.redis.smembers(`tag:${tag}`);
      if (keys.length > 0) {
        await this.redis.del(...keys);
        await this.redis.del(`tag:${tag}`);
      }
    }
  }

  async setWithTags(
    key: string,
    value: any,
    ttl: number,
    tags: string[]
  ): Promise<void> {
    await this.set(key, value, ttl);

    // Associate tags
    for (const tag of tags) {
      await this.redis.sadd(`tag:${tag}`, key);
    }
  }

  private matchPattern(key: string, pattern: string): boolean {
    const regex = new RegExp(
      '^' + pattern.replace(/\*/g, '.*').replace(/\?/g, '.') + '$'
    );
    return regex.test(key);
  }

  private handleInvalidation(pattern: string): void {
    // Handle distributed cache invalidation
    // (e.g., publish to Redis pub/sub for other instances)
  }
}

// Usage in services
export class ProductService {
  constructor(
    private cache: CacheManager,
    private repository: ProductRepository
  ) {}

  async getProduct(id: string): Promise<Product> {
    const cacheKey = `product:${id}`;

    // Try cache first
    const cached = await this.cache.get<Product>(cacheKey);
    if (cached) return cached;

    // Query database
    const product = await this.repository.findById(id);

    // Cache with tags
    if (product) {
      await this.cache.setWithTags(
        cacheKey,
        product,
        3600, // 1 hour
        ['products', `category:${product.category}`, `brand:${product.brand}`]
      );
    }

    return product;
  }

  async updateProduct(id: string, data: UpdateProductDTO): Promise<Product> {
    const product = await this.repository.update(id, data);

    // Invalidate related caches
    await this.cache.invalidate(`product:${id}*`);
    await this.cache.invalidate('products:list:*');
    await this.cache.invalidateByTags([
      'products',
      `category:${product.category}`,
      `brand:${product.brand}`
    ]);

    return product;
  }
}
```

### 7.3 HTTP Caching Headers

```typescript
// lib/api/cache-control.ts
export class CacheControlBuilder {
  private directives: string[] = [];

  public(): this {
    this.directives.push('public');
    return this;
  }

  private(): this {
    this.directives.push('private');
    return this;
  }

  maxAge(seconds: number): this {
    this.directives.push(`max-age=${seconds}`);
    return this;
  }

  sMaxAge(seconds: number): this {
    this.directives.push(`s-maxage=${seconds}`);
    return this;
  }

  staleWhileRevalidate(seconds: number): this {
    this.directives.push(`stale-while-revalidate=${seconds}`);
    return this;
  }

  staleIfError(seconds: number): this {
    this.directives.push(`stale-if-error=${seconds}`);
    return this;
  }

  noCache(): this {
    this.directives.push('no-cache');
    return this;
  }

  noStore(): this {
    this.directives.push('no-store');
    return this;
  }

  mustRevalidate(): this {
    this.directives.push('must-revalidate');
    return this;
  }

  build(): string {
    return this.directives.join(', ');
  }
}

// Preset cache policies
export const CachePolicies = {
  // Static assets (immutable)
  static: () => new CacheControlBuilder()
    .public()
    .maxAge(31536000) // 1 year
    .build(),

  // Product catalog (semi-static)
  catalog: () => new CacheControlBuilder()
    .public()
    .maxAge(300) // 5 minutes
    .sMaxAge(3600) // 1 hour on CDN
    .staleWhileRevalidate(86400) // 24 hours stale
    .build(),

  // User-specific data
  private: () => new CacheControlBuilder()
    .private()
    .maxAge(0)
    .mustRevalidate()
    .build(),

  // No caching
  none: () => new CacheControlBuilder()
    .noStore()
    .build()
};

// Usage in API routes
export async function GET(req: Request) {
  const products = await productService.listProducts();

  return new Response(JSON.stringify(products), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': CachePolicies.catalog(),
      'ETag': generateETag(products),
      'Last-Modified': products[0].updatedAt.toUTCString()
    }
  });
}
```

---

## 8. Event-Driven Architecture Migration

### 8.1 Domain Events Pattern

```typescript
// lib/domain-events/event.ts
export abstract class DomainEvent {
  public readonly occurredAt: Date;
  public readonly aggregateId: string;

  constructor(aggregateId: string) {
    this.aggregateId = aggregateId;
    this.occurredAt = new Date();
  }

  abstract get eventType(): string;
}

// Order domain events
export class OrderCreatedEvent extends DomainEvent {
  get eventType() { return 'order.created'; }

  constructor(
    orderId: string,
    public readonly customerEmail: string,
    public readonly total: number,
    public readonly items: OrderItem[]
  ) {
    super(orderId);
  }
}

export class OrderConfirmedEvent extends DomainEvent {
  get eventType() { return 'order.confirmed'; }

  constructor(
    orderId: string,
    public readonly confirmedAt: Date
  ) {
    super(orderId);
  }
}

export class OrderShippedEvent extends DomainEvent {
  get eventType() { return 'order.shipped'; }

  constructor(
    orderId: string,
    public readonly trackingNumber: string,
    public readonly carrier: string
  ) {
    super(orderId);
  }
}

// Event bus
export class EventBus {
  private handlers: Map<string, Array<(event: DomainEvent) => Promise<void>>>;

  constructor() {
    this.handlers = new Map();
  }

  subscribe(eventType: string, handler: (event: DomainEvent) => Promise<void>): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    this.handlers.get(eventType)!.push(handler);
  }

  async publish(event: DomainEvent): Promise<void> {
    const handlers = this.handlers.get(event.eventType) || [];

    // Execute handlers in parallel
    await Promise.all(
      handlers.map(handler =>
        handler(event).catch(error => {
          console.error(`Error handling ${event.eventType}:`, error);
          // Don't let one handler failure break others
        })
      )
    );

    // Persist event for event sourcing
    await this.persistEvent(event);
  }

  private async persistEvent(event: DomainEvent): Promise<void> {
    await prisma.domainEvent.create({
      data: {
        eventType: event.eventType,
        aggregateId: event.aggregateId,
        payload: JSON.stringify(event),
        occurredAt: event.occurredAt
      }
    });
  }
}

// Global event bus instance
export const eventBus = new EventBus();
```

### 8.2 Event Handlers (Saga Pattern)

```typescript
// lib/event-handlers/order-saga.ts
import { eventBus } from '../domain-events/event';
import { OrderCreatedEvent, OrderConfirmedEvent } from '../domain-events/order-events';

// Handler: Send confirmation email
eventBus.subscribe('order.created', async (event: OrderCreatedEvent) => {
  const emailService = new EmailService();

  await emailService.sendOrderConfirmation({
    to: event.customerEmail,
    orderId: event.aggregateId,
    total: event.total,
    items: event.items
  });
});

// Handler: Reserve inventory
eventBus.subscribe('order.created', async (event: OrderCreatedEvent) => {
  const inventoryService = new InventoryService();

  for (const item of event.items) {
    await inventoryService.reserve({
      productId: item.productId,
      quantity: item.quantity,
      orderId: event.aggregateId
    });
  }
});

// Handler: Schedule shipment
eventBus.subscribe('order.confirmed', async (event: OrderConfirmedEvent) => {
  const shippingService = new ShippingService();

  await shippingService.schedulePickup({
    orderId: event.aggregateId
  });
});

// Handler: Update analytics
eventBus.subscribe('order.created', async (event: OrderCreatedEvent) => {
  const analyticsService = new AnalyticsService();

  await analyticsService.trackOrderCreated({
    orderId: event.aggregateId,
    revenue: event.total,
    items: event.items.length,
    customer: event.customerEmail
  });
});
```

### 8.3 Outbox Pattern (Transactional Event Publishing)

```typescript
// lib/outbox/outbox-pattern.ts
export class OutboxPublisher {
  async publishWithTransaction<T>(
    operation: (tx: PrismaTransaction) => Promise<T>,
    events: DomainEvent[]
  ): Promise<T> {
    // Execute operation and store events in same transaction
    const result = await prisma.$transaction(async (tx) => {
      // Execute business operation
      const operationResult = await operation(tx);

      // Store events in outbox table
      for (const event of events) {
        await tx.outboxEvent.create({
          data: {
            eventType: event.eventType,
            aggregateId: event.aggregateId,
            payload: JSON.stringify(event),
            occurredAt: event.occurredAt,
            published: false
          }
        });
      }

      return operationResult;
    });

    // Trigger async event publishing
    this.scheduleEventPublishing();

    return result;
  }

  private scheduleEventPublishing(): void {
    // Process outbox in background
    setTimeout(() => this.processOutbox(), 0);
  }

  private async processOutbox(): Promise<void> {
    // Get unpublished events
    const events = await prisma.outboxEvent.findMany({
      where: { published: false },
      orderBy: { occurredAt: 'asc' },
      take: 100
    });

    for (const event of events) {
      try {
        // Publish to event bus
        const domainEvent = JSON.parse(event.payload);
        await eventBus.publish(domainEvent);

        // Mark as published
        await prisma.outboxEvent.update({
          where: { id: event.id },
          data: { published: true, publishedAt: new Date() }
        });
      } catch (error) {
        console.error(`Failed to publish event ${event.id}:`, error);

        // Implement retry logic with exponential backoff
        await prisma.outboxEvent.update({
          where: { id: event.id },
          data: {
            retries: { increment: 1 },
            lastError: error.message
          }
        });
      }
    }
  }
}

// Usage in service
export class OrderService {
  private outbox: OutboxPublisher;

  async createOrder(data: CreateOrderDTO): Promise<Order> {
    const events: DomainEvent[] = [];

    const order = await this.outbox.publishWithTransaction(
      async (tx) => {
        // Create order
        const order = await tx.order.create({ data });

        // Collect events
        events.push(new OrderCreatedEvent(
          order.id,
          order.customerEmail,
          order.total,
          order.items
        ));

        return order;
      },
      events
    );

    return order;
  }
}
```

---

## 9. Observability & SRE Practices

### 9.1 Structured Logging with Correlation IDs

```typescript
// lib/observability/logger.ts
import pino from 'pino';
import { AsyncLocalStorage } from 'async_hooks';

// Request context storage
export const requestContext = new AsyncLocalStorage<RequestContext>();

interface RequestContext {
  requestId: string;
  userId?: string;
  sessionId?: string;
  startTime: number;
}

// Logger instance
export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level: (label) => ({ level: label }),
    bindings: (bindings) => ({
      pid: bindings.pid,
      hostname: bindings.hostname
    })
  },
  serializers: {
    req: (req) => ({
      id: req.id,
      method: req.method,
      url: req.url,
      headers: {
        'user-agent': req.headers['user-agent'],
        'referer': req.headers['referer']
      }
    }),
    res: (res) => ({
      statusCode: res.statusCode
    }),
    err: pino.stdSerializers.err
  },
  mixin: () => {
    const context = requestContext.getStore();
    return context
      ? {
          requestId: context.requestId,
          userId: context.userId,
          sessionId: context.sessionId
        }
      : {};
  },
  ...(process.env.NODE_ENV === 'development' && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname'
      }
    }
  })
});

// Middleware to set up request context
export function loggingMiddleware(req: NextRequest) {
  const requestId = req.headers.get('x-request-id') || crypto.randomUUID();
  const userId = req.headers.get('x-user-id');
  const sessionId = req.headers.get('x-session-id');

  const context: RequestContext = {
    requestId,
    userId: userId || undefined,
    sessionId: sessionId || undefined,
    startTime: Date.now()
  };

  return requestContext.run(context, () => {
    logger.info({
      msg: 'Incoming request',
      method: req.method,
      url: req.nextUrl.pathname,
      query: Object.fromEntries(req.nextUrl.searchParams)
    });

    return NextResponse.next({
      request: {
        headers: new Headers({
          ...req.headers,
          'x-request-id': requestId
        })
      }
    });
  });
}
```

### 9.2 Distributed Tracing

```typescript
// lib/observability/tracing.ts
import { trace, context, SpanStatusCode } from '@opentelemetry/api';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';

// Initialize OpenTelemetry
const sdk = new NodeSDK({
  traceExporter: new OTLPTraceExporter({
    url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318/v1/traces'
  }),
  instrumentations: [
    getNodeAutoInstrumentations({
      '@opentelemetry/instrumentation-fs': { enabled: false }
    })
  ]
});

sdk.start();

// Tracer instance
const tracer = trace.getTracer('italian-shoes-api', '1.0.0');

// Decorator for automatic tracing
export function Traced(operationName?: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const span = tracer.startSpan(operationName || `${target.constructor.name}.${propertyKey}`);

      try {
        const result = await originalMethod.apply(this, args);
        span.setStatus({ code: SpanStatusCode.OK });
        return result;
      } catch (error) {
        span.setStatus({
          code: SpanStatusCode.ERROR,
          message: error.message
        });
        span.recordException(error);
        throw error;
      } finally {
        span.end();
      }
    };

    return descriptor;
  };
}

// Manual span creation
export async function withSpan<T>(
  operationName: string,
  fn: () => Promise<T>,
  attributes?: Record<string, any>
): Promise<T> {
  const span = tracer.startSpan(operationName);

  if (attributes) {
    span.setAttributes(attributes);
  }

  try {
    const result = await fn();
    span.setStatus({ code: SpanStatusCode.OK });
    return result;
  } catch (error) {
    span.setStatus({
      code: SpanStatusCode.ERROR,
      message: error.message
    });
    span.recordException(error);
    throw error;
  } finally {
    span.end();
  }
}

// Usage in services
export class OrderService {
  @Traced('OrderService.createOrder')
  async createOrder(data: CreateOrderDTO): Promise<Order> {
    // Automatic tracing
    return await withSpan('database.create_order', async () => {
      return prisma.order.create({ data });
    }, {
      'order.customer_email': data.customerEmail,
      'order.total': data.total
    });
  }
}
```

### 9.3 Metrics & Monitoring

```typescript
// lib/observability/metrics.ts
import { Counter, Histogram, Registry, collectDefaultMetrics } from 'prom-client';

// Metrics registry
export const register = new Registry();

// Collect default Node.js metrics
collectDefaultMetrics({ register });

// Custom metrics
export const metrics = {
  // HTTP metrics
  httpRequestDuration: new Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'status_code'],
    buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5],
    registers: [register]
  }),

  httpRequestTotal: new Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status_code'],
    registers: [register]
  }),

  // Business metrics
  orderCreated: new Counter({
    name: 'orders_created_total',
    help: 'Total number of orders created',
    labelNames: ['status'],
    registers: [register]
  }),

  orderValue: new Histogram({
    name: 'order_value_inr',
    help: 'Order value in INR',
    buckets: [1000, 5000, 10000, 20000, 50000, 100000],
    registers: [register]
  }),

  // Database metrics
  databaseQueryDuration: new Histogram({
    name: 'database_query_duration_seconds',
    help: 'Duration of database queries in seconds',
    labelNames: ['operation', 'model'],
    buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1],
    registers: [register]
  }),

  // Cache metrics
  cacheHit: new Counter({
    name: 'cache_hits_total',
    help: 'Total number of cache hits',
    labelNames: ['cache_type'],
    registers: [register]
  }),

  cacheMiss: new Counter({
    name: 'cache_misses_total',
    help: 'Total number of cache misses',
    labelNames: ['cache_type'],
    registers: [register]
  })
};

// Middleware to collect HTTP metrics
export async function metricsMiddleware(req: NextRequest, handler: () => Promise<Response>) {
  const startTime = Date.now();

  const response = await handler();

  const duration = (Date.now() - startTime) / 1000;
  const route = req.nextUrl.pathname;
  const method = req.method;
  const statusCode = response.status.toString();

  metrics.httpRequestDuration.observe({ method, route, status_code: statusCode }, duration);
  metrics.httpRequestTotal.inc({ method, route, status_code: statusCode });

  return response;
}

// Metrics endpoint
export async function GET() {
  return new Response(await register.metrics(), {
    headers: { 'Content-Type': register.contentType }
  });
}
```

### 9.4 Alerting Rules

```yaml
# infrastructure/prometheus/alerts.yaml
groups:
  - name: italian_shoes_alerts
    interval: 30s
    rules:
      # High error rate
      - alert: HighErrorRate
        expr: |
          sum(rate(http_requests_total{status_code=~"5.."}[5m])) by (route)
          /
          sum(rate(http_requests_total[5m])) by (route)
          > 0.05
        for: 5m
        labels:
          severity: critical
          team: backend
        annotations:
          summary: "High error rate on {{ $labels.route }}"
          description: "Error rate is {{ $value | humanizePercentage }} on {{ $labels.route }}"

      # Slow response time
      - alert: SlowResponseTime
        expr: |
          histogram_quantile(0.95,
            sum(rate(http_request_duration_seconds_bucket[5m])) by (route, le)
          ) > 1
        for: 10m
        labels:
          severity: warning
          team: backend
        annotations:
          summary: "Slow response time on {{ $labels.route }}"
          description: "P95 response time is {{ $value }}s on {{ $labels.route }}"

      # Database connection pool exhaustion
      - alert: DatabaseConnectionPoolExhausted
        expr: |
          (prisma_pool_connections_active / prisma_pool_connections_max) > 0.8
        for: 5m
        labels:
          severity: critical
          team: backend
        annotations:
          summary: "Database connection pool nearly exhausted"
          description: "Connection pool utilization is {{ $value | humanizePercentage }}"

      # High cache miss rate
      - alert: HighCacheMissRate
        expr: |
          sum(rate(cache_misses_total[5m]))
          /
          (sum(rate(cache_hits_total[5m])) + sum(rate(cache_misses_total[5m])))
          > 0.5
        for: 15m
        labels:
          severity: warning
          team: backend
        annotations:
          summary: "High cache miss rate"
          description: "Cache miss rate is {{ $value | humanizePercentage }}"

      # Order processing failures
      - alert: OrderProcessingFailures
        expr: |
          sum(rate(orders_created_total{status="failed"}[10m])) > 5
        for: 5m
        labels:
          severity: critical
          team: backend
          page: true
        annotations:
          summary: "High rate of order processing failures"
          description: "{{ $value }} orders per second are failing"
```

---

## 10. Infrastructure as Code

### 10.1 Terraform Configuration

```hcl
# infrastructure/terraform/main.tf
terraform {
  required_version = ">= 1.5"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "s3" {
    bucket = "italian-shoes-terraform-state"
    key    = "prod/terraform.tfstate"
    region = "us-east-1"
    encrypt = true
    dynamodb_table = "terraform-locks"
  }
}

provider "aws" {
  region = var.aws_region
}

# VPC
module "vpc" {
  source = "terraform-aws-modules/vpc/aws"

  name = "italian-shoes-vpc"
  cidr = "10.0.0.0/16"

  azs             = ["us-east-1a", "us-east-1b", "us-east-1c"]
  private_subnets = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
  public_subnets  = ["10.0.101.0/24", "10.0.102.0/24", "10.0.103.0/24"]

  enable_nat_gateway = true
  enable_vpn_gateway = false
  enable_dns_hostnames = true

  tags = {
    Environment = "production"
    Project     = "italian-shoes"
  }
}

# RDS PostgreSQL
module "rds" {
  source = "terraform-aws-modules/rds/aws"

  identifier = "italian-shoes-db"

  engine               = "postgres"
  engine_version       = "16.1"
  family               = "postgres16"
  major_engine_version = "16"
  instance_class       = "db.t3.medium"

  allocated_storage     = 100
  max_allocated_storage = 500
  storage_encrypted     = true

  db_name  = "italianshoedb"
  username = "adminuser"
  port     = 5432

  multi_az               = true
  db_subnet_group_name   = module.vpc.database_subnet_group
  vpc_security_group_ids = [aws_security_group.rds.id]

  backup_retention_period = 30
  backup_window          = "03:00-04:00"
  maintenance_window     = "Mon:04:00-Mon:05:00"

  enabled_cloudwatch_logs_exports = ["postgresql", "upgrade"]

  deletion_protection = true
  skip_final_snapshot = false
  final_snapshot_identifier = "italian-shoes-db-final-snapshot"

  parameters = [
    {
      name  = "shared_preload_libraries"
      value = "pg_stat_statements"
    },
    {
      name  = "log_min_duration_statement"
      value = "100"
    },
    {
      name  = "log_connections"
      value = "1"
    },
    {
      name  = "log_disconnections"
      value = "1"
    }
  ]

  tags = {
    Environment = "production"
  }
}

# Read replicas
resource "aws_db_instance" "replica" {
  count = 2

  identifier = "italian-shoes-db-replica-${count.index + 1}"
  replicate_source_db = module.rds.db_instance_id

  instance_class = "db.t3.medium"

  auto_minor_version_upgrade = true
  publicly_accessible        = false

  tags = {
    Environment = "production"
    Role        = "read-replica"
  }
}

# ElastiCache Redis
resource "aws_elasticache_replication_group" "redis" {
  replication_group_id       = "italian-shoes-redis"
  replication_group_description = "Redis cluster for Italian Shoes"

  engine               = "redis"
  engine_version       = "7.0"
  node_type           = "cache.t3.medium"
  port                = 6379
  parameter_group_name = "default.redis7"

  num_cache_clusters         = 3
  automatic_failover_enabled = true
  multi_az_enabled          = true

  subnet_group_name = aws_elasticache_subnet_group.redis.name
  security_group_ids = [aws_security_group.redis.id]

  at_rest_encryption_enabled = true
  transit_encryption_enabled = true
  auth_token                 = var.redis_auth_token

  snapshot_retention_limit = 5
  snapshot_window         = "03:00-05:00"

  tags = {
    Environment = "production"
  }
}

# S3 for assets
resource "aws_s3_bucket" "assets" {
  bucket = "italian-shoes-assets"

  tags = {
    Environment = "production"
  }
}

resource "aws_s3_bucket_versioning" "assets" {
  bucket = aws_s3_bucket.assets.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "assets" {
  bucket = aws_s3_bucket.assets.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# CloudFront CDN
resource "aws_cloudfront_distribution" "cdn" {
  enabled             = true
  is_ipv6_enabled     = true
  http_version        = "http2and3"
  price_class         = "PriceClass_All"

  origin {
    domain_name = aws_s3_bucket.assets.bucket_regional_domain_name
    origin_id   = "S3-italian-shoes-assets"

    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.cdn.cloudfront_access_identity_path
    }
  }

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3-italian-shoes-assets"

    forwarded_values {
      query_string = false

      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400
    compress               = true
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn      = var.acm_certificate_arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }

  tags = {
    Environment = "production"
  }
}

# Secrets Manager
resource "aws_secretsmanager_secret" "database" {
  name = "italian-shoes/prod/database"

  recovery_window_in_days = 30
}

resource "aws_secretsmanager_secret_version" "database" {
  secret_id = aws_secretsmanager_secret.database.id
  secret_string = jsonencode({
    username = module.rds.db_instance_username
    password = var.db_password
    host     = module.rds.db_instance_address
    port     = module.rds.db_instance_port
    database = module.rds.db_instance_name
  })
}
```

---

## 18. Implementation Roadmap

### Phase 1: Security & Foundation (Week 1 - 24.5 hours)

**Priority:** 🚨 CRITICAL - Blocking production deployment

| Task | Hours | Owner | Dependencies | Success Criteria |
|------|-------|-------|--------------|------------------|
| 1.1 Rotate all production credentials | 1 | DevOps | None | New credentials in AWS Secrets Manager |
| 1.2 Remove .env from git history | 2 | DevOps | 1.1 | BFG Repo Cleaner executed, history clean |
| 1.3 Implement AWS Secrets Manager | 4 | Backend | 1.1 | All secrets loaded from Secrets Manager |
| 1.4 Fix NextAuth secret to 256-bit | 0.5 | Backend | 1.3 | New secret generated and deployed |
| 1.5 Add Zod validation to all API routes | 8 | Backend | None | 100% of POST/PUT/PATCH routes validated |
| 1.6 Configure Prisma connection pooling | 3 | Backend | None | Connection pool set to 5, tested under load |
| 1.7 Add requireAdmin() to sensitive routes | 6 | Backend | None | Authorization enforced on 27 admin routes |

**Deliverables:**
- [ ] Zero secrets in git repository
- [ ] All production credentials rotated
- [ ] Input validation on 100% of mutating endpoints
- [ ] Database connection pool optimized for serverless
- [ ] Authorization enforced on all admin routes

**Validation:**
```bash
# Security audit
npm audit
semgrep --config=auto
git secrets --scan-history

# Load test
artillery quick --count 100 --num 1000 https://api.italianshoes.com/api/products
```

---

### Phase 2: Performance & Scalability (Weeks 2-4 - 52 hours)

**Priority:** 🔴 HIGH - Required before traffic scaling

| Task | Hours | Owner | Dependencies | Success Criteria |
|------|-------|-------|--------------|------------------|
| 2.1 Set up Redis on Upstash | 2 | DevOps | None | Redis cluster provisioned, connection tested |
| 2.2 Implement CacheManager class | 4 | Backend | 2.1 | Multi-layer caching with L3+L4 |
| 2.3 Add caching to product/material APIs | 6 | Backend | 2.2 | 90% cache hit rate on catalog queries |
| 2.4 Integrate Inngest for background jobs | 8 | Backend | None | Job queue operational, order emails async |
| 2.5 Migrate order processing to async | 8 | Backend | 2.4 | Order API response < 200ms |
| 2.6 Move assets to CloudFront CDN | 8 | DevOps | None | All static assets served from CDN |
| 2.7 Optimize 3D models (GLB compression) | 6 | Frontend | 2.6 | GLB files reduced by 60% |
| 2.8 Add database indexes (15 new indexes) | 4 | Backend | None | Query performance improved 50% |
| 2.9 Implement database backup automation | 4 | DevOps | None | Daily backups, 30-day retention |
| 2.10 Add Swagger API documentation | 2 | Backend | None | Swagger UI accessible at /api-docs |

**Deliverables:**
- [ ] Redis caching operational with 80%+ hit rate
- [ ] Background job system processing emails/notifications
- [ ] Static assets on CDN (197 MB moved)
- [ ] 3D models optimized (< 10 MB per file)
- [ ] Database queries optimized with indexes
- [ ] Automated daily backups

**Validation:**
```bash
# Performance benchmarks
npm run benchmark

# Expected results:
# - API response time p95: < 500ms
# - Cache hit rate: > 80%
# - Page load time: < 3s
# - GLB file size: < 10 MB
```

---

### Phase 3: Polish & Growth (Week 5+ - 64 hours)

**Priority:** 🟡 MEDIUM - Quality of life improvements

| Task | Hours | Owner | Dependencies | Success Criteria |
|------|-------|-------|--------------|------------------|
| 3.1 Accessibility audit (WCAG 2.1 AA) | 12 | Frontend | None | Lighthouse accessibility score > 90 |
| 3.2 Add ARIA labels and keyboard nav | 8 | Frontend | 3.1 | Screen reader compatible |
| 3.3 Integrate Resend for emails | 8 | Backend | Phase 2 | Order confirmation emails sent |
| 3.4 Add transactional email templates | 8 | Backend | 3.3 | 5 email templates (order, shipping, etc.) |
| 3.5 Integrate PostHog analytics | 4 | Frontend | None | Event tracking operational |
| 3.6 Add SEO meta tags and structured data | 6 | Frontend | None | Google Rich Results eligible |
| 3.7 Generate sitemap.xml | 2 | Backend | None | Sitemap submitted to Google |
| 3.8 Implement customer support chat | 8 | Frontend | None | Chatwoot integrated |
| 3.9 Add product reviews system | 8 | Full-stack | None | Customers can leave reviews |

**Deliverables:**
- [ ] WCAG 2.1 AA compliance
- [ ] Email notification system operational
- [ ] Analytics tracking user behavior
- [ ] SEO optimized for search engines
- [ ] Customer support tooling

---

## Cost-Benefit Analysis

### Investment Required

| Phase | Time Investment | Estimated Cost | Risk Mitigation Value |
|-------|----------------|----------------|----------------------|
| Phase 1: Security | 24.5 hours | $0 (developer time only) | Prevents data breach ($50K+ incident cost) |
| Phase 2: Performance | 52 hours | $50/month (Redis + CDN) | Supports 10x traffic growth |
| Phase 3: Polish | 64 hours | $30/month (email + analytics) | Improves conversion rate 15-20% |
| **Total** | **140.5 hours** | **$80/month** | **$100K+ risk mitigation** |

### Return on Investment

**Security Hardening:**
- **Risk:** Data breach costs $50K-$500K (legal, compliance, reputation)
- **Investment:** 24.5 hours
- **ROI:** Infinite (prevents catastrophic loss)

**Performance Optimization:**
- **Benefit:** Supports 10x traffic growth without infrastructure scaling
- **Investment:** 52 hours + $50/month
- **ROI:** 5x (can handle 10x users at 2x cost)

**Growth Features:**
- **Benefit:** 15-20% conversion rate improvement
- **Investment:** 64 hours + $30/month
- **ROI:** 3-5x (increased revenue)

---

## Appendix A: Technology Alternatives Considered

| Component | Current | Alternative 1 | Alternative 2 | Recommendation |
|-----------|---------|---------------|---------------|----------------|
| **Backend Framework** | Next.js API Routes | tRPC | Express.js | Keep Next.js (low migration cost) |
| **Database** | PostgreSQL | MongoDB | PlanetScale MySQL | Keep PostgreSQL (ACID compliance) |
| **ORM** | Prisma | Drizzle | TypeORM | Keep Prisma (excellent DX) |
| **Caching** | None → Redis | Memcached | In-memory only | Redis (persistence + pub/sub) |
| **Job Queue** | None → Inngest | BullMQ | AWS SQS | Inngest (serverless-friendly) |
| **Auth** | NextAuth v4 | Auth.js v5 | Clerk | Migrate to Auth.js v5 (long-term) |
| **Error Tracking** | Console logs → Sentry | Rollbar | Bugsnag | Sentry (best free tier) |
| **CDN** | None → CloudFront | Cloudflare | Fastly | Cloudflare R2 (no egress fees) |
| **Email** | None → Resend | SendGrid | AWS SES | Resend (best DX, generous free tier) |

---

## Appendix B: Performance Benchmarks

### Current State (No Optimization)

```
API Response Times (p95):
├─ GET  /api/products ........... 842ms
├─ GET  /api/products/:id ....... 324ms
├─ POST /api/orders ............. 1,842ms
├─ GET  /api/materials .......... 256ms
└─ GET  /api/orders ............. 1,124ms

Page Load Times (Mobile 3G):
├─ Homepage ..................... 8.2s
├─ Product Page ................. 12.4s (includes 3D model)
└─ Checkout ..................... 6.8s

Database Query Times (p95):
├─ Product list with relations .. 456ms
├─ Order creation transaction ... 892ms
└─ Order list with items ........ 678ms
```

### Target State (After Optimization)

```
API Response Times (p95):
├─ GET  /api/products ........... 124ms (↓ 85%)
├─ GET  /api/products/:id ....... 45ms  (↓ 86%)
├─ POST /api/orders ............. 186ms (↓ 90%)
├─ GET  /api/materials .......... 32ms  (↓ 87%)
└─ GET  /api/orders ............. 234ms (↓ 79%)

Page Load Times (Mobile 3G):
├─ Homepage ..................... 2.8s  (↓ 66%)
├─ Product Page ................. 4.2s  (↓ 66%)
└─ Checkout ..................... 2.4s  (↓ 65%)

Database Query Times (p95):
├─ Product list with relations .. 89ms  (↓ 80%)
├─ Order creation transaction ... 124ms (↓ 86%)
└─ Order list with items ........ 156ms (↓ 77%)
```

---

## Conclusion

The Italian Shoes v2.0 application demonstrates **strong architectural foundations** with modern technologies (Next.js, Prisma, TypeScript). However, it requires **significant hardening across security, performance, and scalability** dimensions before production deployment.

### Critical Success Factors

1. **Security First:** Phase 1 must be completed before any production traffic
2. **Performance Baseline:** Achieve < 500ms API response times before scaling
3. **Observability:** Cannot operate production systems without monitoring
4. **Incremental Migration:** Implement changes incrementally to minimize risk

### Key Metrics to Track

| Metric | Current | Target | Timeline |
|--------|---------|--------|----------|
| Security Vulnerabilities | 5 critical | 0 critical | Week 1 |
| API Response Time (p95) | 800ms | < 500ms | Week 4 |
| Page Load Time | 8s | < 3s | Week 4 |
| Cache Hit Rate | 0% | > 80% | Week 3 |
| Error Rate | Unknown | < 0.1% | Week 2 |
| Uptime SLA | Unknown | 99.9% | Week 2 |

### Investment Summary

- **Total Effort:** 140.5 hours (18 working days)
- **Monthly Operating Cost:** $80
- **Risk Mitigation Value:** $100K+
- **Expected Outcome:** Production-ready e-commerce platform capable of handling 10K+ daily users

**Recommended Next Steps:**

1. **Week 1:** Execute Phase 1 (Security Hardening)
2. **Week 2-4:** Execute Phase 2 (Performance & Scalability)
3. **Week 5+:** Execute Phase 3 (Polish & Growth)
4. **Ongoing:** Monitor metrics and iterate

---

**Document End**

*For questions or clarifications, please contact the architecture team.*
