"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Plus, Search, Trash2, Pencil, RefreshCw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

type Product = {
  id: string;
  productId: string;
  title: string;
  vendor?: string | null;
  price: number;
  currency: "USD" | "EUR" | "GBP";
  isActive: boolean;
  createdAt: string;
};

type ApiList<T> = {
  items: T[];
  total: number;
  limit: number;
};

function formatCurrency(cents: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(cents);
}

export default function ProductsPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [list, setList] = useState<ApiList<Product>>({ items: [], total: 0, limit: 20 });
  const [q, setQ] = useState(sp.get("q") ?? "");
  const [page, setPage] = useState<number>(Number(sp.get("page") ?? 1));
  const limit = 20;

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const qParam = q.trim();

  const totalPages = useMemo(() => Math.max(1, Math.ceil((list?.total ?? 0) / (list?.limit ?? limit))), [list]);

  const fetchProducts = async (opts?: { q?: string; page?: number }) => {
    const qp = new URLSearchParams();
    qp.set("limit", String(limit));
    qp.set("page", String(opts?.page ?? page));
    if (opts?.q || qParam) qp.set("q", (opts?.q ?? qParam));
    try {
      setLoading(true);
      const res = await fetch(`/api/products?${qp.toString()}`, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as ApiList<Product>;
      setList(data);
    } catch {
      setList({ items: [], total: 0, limit });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (qParam) params.set("q", qParam);
    if (page !== 1) params.set("page", String(page));
    router.replace(`/products${params.toString() ? `?${params}` : ""}`);
  }, [qParam, page]);

  const onSearchChange = (v: string) => {
    setQ(v);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1);
      fetchProducts({ q: v, page: 1 });
    }, 350);
  };

  const onRefresh = () => fetchProducts();

  const onDelete = async (id: string) => {
    const run = async () => {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || `Delete failed ${res.status}`);
      }
      toast.success("Product deleted");
      fetchProducts();
    };
    toast.promise(run(), {
      loading: "Deleting…",
      success: "Deleted",
      error: "Failed to delete",
    });
  };

  const onNext = () => {
    const next = Math.min(page + 1, totalPages);
    if (next !== page) {
      setPage(next);
      fetchProducts({ page: next });
    }
  };
  const onPrev = () => {
    const prev = Math.max(1, page - 1);
    if (prev !== page) {
      setPage(prev);
      fetchProducts({ page: prev });
    }
  };

  // Full page skeleton
  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <Skeleton className="h-7 w-32 mb-2" />
            <Skeleton className="h-4 w-48" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-24 rounded-lg" />
            <Skeleton className="h-9 w-32 rounded-lg" />
          </div>
        </div>

        <Card className="rounded-2xl">
          <CardHeader className="pb-3">
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <Skeleton className="h-9 w-80 rounded-lg" />
            </div>

            <div className="overflow-hidden rounded-xl border">
              <Table>
                <TableHeader>
                  <TableRow>
                    {Array.from({ length: 7 }).map((_, i) => (
                      <TableHead key={i}>
                        <Skeleton className="h-4 w-16" />
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 7 }).map((_, j) => (
                        <TableCell key={j}>
                          <Skeleton className="h-4 w-24 rounded" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="mt-4 flex items-center justify-between text-sm">
              <Skeleton className="h-4 w-48" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-16 rounded-lg" />
                <Skeleton className="h-8 w-16 rounded-lg" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Actual UI
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Products</h1>
          <p className="text-sm text-muted-foreground">Manage catalog, options, and variants.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onRefresh}>
            <RefreshCw className="mr-2 size-4" />
            Refresh
          </Button>
          <Button asChild>
            <Link href="/products/new">
              <Plus className="mr-2 size-4" />
              New Product
            </Link>
          </Button>
        </div>
      </div>

      <Card className="rounded-2xl">
        <CardHeader className="pb-3">
          <CardTitle>Catalog</CardTitle>
          <CardDescription>Search & paginate through products</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search by title or productId…"
                className="pl-8 md:w-[360px]"
              />
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[36px]"></TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead className="hidden md:table-cell">Product ID</TableHead>
                  <TableHead className="hidden md:table-cell">Vendor</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[1%]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.items.map((p) => (
                  <TableRow key={p.id} className={p.isActive ? "" : "opacity-70"}>
                    <TableCell className="text-muted-foreground">#</TableCell>
                    <TableCell className="font-medium">
                      <Link href={`/products/${p.id}`} className="hover:underline">
                        {p.title}
                      </Link>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{p.productId}</TableCell>
                    <TableCell className="hidden md:table-cell">{p.vendor ?? "—"}</TableCell>
                    <TableCell>{formatCurrency(p.price, p.currency)}</TableCell>
                    <TableCell>
                      {p.isActive ? (
                        <Badge className="uppercase">Active</Badge>
                      ) : (
                        <Badge variant="secondary" className="uppercase">
                          Draft
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <RowActions id={p.id} onDelete={onDelete} />
                    </TableCell>
                  </TableRow>
                ))}
                {list.items.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="py-8 text-center text-sm text-muted-foreground">
                      No products found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="mt-4 flex items-center justify-between text-sm">
            <div className="text-muted-foreground">
              Page <span className="font-medium text-foreground">{page}</span> of{" "}
              <span className="font-medium text-foreground">{totalPages}</span> ·{" "}
              <span className="font-medium text-foreground">{list.total}</span> total
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={onPrev} disabled={page <= 1 || loading}>
                Prev
              </Button>
              <Button variant="outline" size="sm" onClick={onNext} disabled={page >= totalPages || loading}>
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function RowActions({ id, onDelete }: { id: string; onDelete: (id: string) => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon" variant="ghost" className="size-8">
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem asChild>
          <Link href={`/products/${id}`}>
            <Pencil className="mr-2 size-4" />
            Edit
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-destructive focus:text-destructive cursor-pointer"
          onClick={() => onDelete(id)}
        >
          <Trash2 className="mr-2 size-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
