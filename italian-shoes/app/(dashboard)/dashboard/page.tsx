// app/(dashboard)/page.tsx
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Package,
  ShoppingCart,
  Factory,
  DollarSign,
  Plus,
  Truck,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

/* ---------- types ---------- */
type Kpi = {
  label: string;
  value: string;
  icon: LucideIcon;
  sub: string;
};

type Order = {
  id: string;
  number: string;
  customer: string;
  total: number;
  currency: string;
  status: string;
};

type Board = {
  DESIGN_RECEIVED: number;
  IN_PRODUCTION: number;
  QUALITY_CHECK: number;
  READY_TO_SHIP: number;
  SHIPPED: number;
};

type DashboardData = {
  kpis: Kpi[];
  recent: Order[];
  board: Board;
};

/* ---------- helpers ---------- */
function formatCurrency(cents: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

function RowStat({
  label,
  value,
  icon,
}: {
  label: string;
  value: number | string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border p-3">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-sm">{label}</span>
      </div>
      <span className="text-sm font-semibold">{value}</span>
    </div>
  );
}

function OrderBadge({ status }: { status: string }) {
  const map: Record<
    string,
    { variant: "default" | "secondary" | "destructive" | "outline"; label: string }
  > = {
    DESIGN_RECEIVED: { variant: "secondary", label: "Design received" },
    IN_PRODUCTION: { variant: "default", label: "In production" },
    QUALITY_CHECK: { variant: "outline", label: "Quality check" },
    READY_TO_SHIP: { variant: "default", label: "Ready to ship" },
    SHIPPED: { variant: "secondary", label: "Shipped" },
    DELIVERED: { variant: "secondary", label: "Delivered" },
    CANCELLED: { variant: "destructive", label: "Cancelled" },
  };
  const cfg = map[status] || { variant: "outline", label: status };
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
}

/* ---------- main page ---------- */
export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardData>({
    kpis: [],
    recent: [],
    board: {
      DESIGN_RECEIVED: 0,
      IN_PRODUCTION: 0,
      QUALITY_CHECK: 0,
      READY_TO_SHIP: 0,
      SHIPPED: 0,
    },
  });

  useEffect(() => {
    setTimeout(() => {
      setData({
        kpis: [
          {
            label: "Gross Sales (30d)",
            value: formatCurrency(238400),
            icon: DollarSign,
            sub: "+12% vs prev.",
          },
          {
            label: "Orders (30d)",
            value: "184",
            icon: ShoppingCart,
            sub: "+8 new today",
          },
          {
            label: "In Production",
            value: "23",
            icon: Factory,
            sub: "7 in QC",
          },
          {
            label: "Low Stock Variants",
            value: "9",
            icon: Package,
            sub: "Reorder soon",
          },
        ],
        recent: [
          {
            id: "ord_10234",
            number: "MTO-10234",
            customer: "A. Romano",
            total: 18999,
            currency: "USD",
            status: "IN_PRODUCTION",
          },
          {
            id: "ord_10233",
            number: "MTO-10233",
            customer: "S. Marino",
            total: 14999,
            currency: "USD",
            status: "QUALITY_CHECK",
          },
          {
            id: "ord_10232",
            number: "MTO-10232",
            customer: "P. Bianchi",
            total: 21999,
            currency: "USD",
            status: "READY_TO_SHIP",
          },
          {
            id: "ord_10231",
            number: "MTO-10231",
            customer: "M. Conti",
            total: 16999,
            currency: "USD",
            status: "DESIGN_RECEIVED",
          },
        ],
        board: {
          DESIGN_RECEIVED: 6,
          IN_PRODUCTION: 23,
          QUALITY_CHECK: 7,
          READY_TO_SHIP: 5,
          SHIPPED: 41,
        },
      });
      setLoading(false);
    }, 1500);
  }, []);

  if (loading) {
    /* skeleton UI unchanged */
    return (
      <div className="space-y-6 animate-pulse">
        {/* Header skeleton */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-72" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-28 rounded-lg" />
            <Skeleton className="h-9 w-36 rounded-lg" />
          </div>
        </div>

        {/* KPI cards skeleton */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="rounded-2xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-5 w-5" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-24 mb-1" />
                <Skeleton className="h-3 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Orders Skeleton */}
        <div className="grid gap-4 lg:grid-cols-4">
          <Card className="lg:col-span-3 rounded-2xl">
            <CardHeader className="pb-3">
              <Skeleton className="h-5 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent>
              <div className="rounded-xl border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <TableHead key={i}>
                          <Skeleton className="h-4 w-24" />
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        {Array.from({ length: 5 }).map((_, j) => (
                          <TableCell key={j}>
                            <Skeleton className="h-4 w-20" />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="mt-3 flex justify-end">
                <Skeleton className="h-8 w-32 rounded-lg" />
              </div>
            </CardContent>
          </Card>

          {/* Production Queue Skeleton */}
          <Card className="rounded-2xl">
            <CardHeader className="pb-3">
              <Skeleton className="h-5 w-40 mb-2" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-full rounded-lg" />
              ))}
              <div className="pt-1">
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions Skeleton */}
        <Card className="rounded-2xl">
          <CardHeader className="pb-3">
            <Skeleton className="h-5 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-36 rounded-lg" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  /* actual dashboard */
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Overview of sales, orders, and production pipeline.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline">
            <Link href="/orders">View Orders</Link>
          </Button>
          <Button asChild>
            <Link href="/products/new">
              <Plus className="mr-2 size-4" />
              New Product
            </Link>
          </Button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {data.kpis.map(({ label, value, icon: Icon, sub }) => (
          <Card key={label} className="rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{label}</CardTitle>
              <Icon className="size-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{value}</div>
              <p className="mt-1 text-xs text-muted-foreground">{sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Production snapshot */}
      <div className="grid gap-4 lg:grid-cols-4">
        <Card className="lg:col-span-3 rounded-2xl">
          <CardHeader className="pb-3">
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Last 24–48 hours of activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-xl border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead className="hidden md:table-cell">Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-0"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.recent.map((o) => (
                    <TableRow key={o.id}>
                      <TableCell className="font-medium">{o.number}</TableCell>
                      <TableCell>{o.customer}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        {formatCurrency(o.total, o.currency)}
                      </TableCell>
                      <TableCell>
                        <OrderBadge status={o.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/orders/${o.id}`}>View</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="mt-3 flex justify-end">
              <Button asChild variant="ghost" size="sm">
                <Link href="/orders">See all orders →</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader className="pb-3">
            <CardTitle>Production Queue</CardTitle>
            <CardDescription>Live snapshot</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <RowStat label="Design received" value={data.board.DESIGN_RECEIVED} />
            <RowStat label="In production" value={data.board.IN_PRODUCTION} />
            <RowStat label="Quality check" value={data.board.QUALITY_CHECK} />
            <RowStat label="Ready to ship" value={data.board.READY_TO_SHIP} />
            <RowStat
              label="Shipped (7d)"
              value={data.board.SHIPPED}
              icon={<Truck className="size-4" />}
            />
            <div className="pt-1">
              <Button asChild className="w-full">
                <Link href="/production">Open board</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick links */}
      <Card className="rounded-2xl">
        <CardHeader className="pb-3">
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Frequently used admin tasks</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button asChild variant="secondary">
            <Link href="/products">Manage products</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/materials">Materials</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/sizes">Sizes</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/panels">Panels</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/shipments">Shipments</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/settings">Settings</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
