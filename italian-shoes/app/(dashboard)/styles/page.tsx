"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  RefreshCcw,
  Plus,
  Edit3,
  ToggleLeft,
  ToggleRight,
  Trash2,
} from "lucide-react";

/* ------------------- shimmer utility ------------------- */
function Shimmer({ className }: { className: string }) {
  return (
    <div
      className={`relative overflow-hidden rounded-md bg-muted ${className}`}
    >
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent" />
    </div>
  );
}

/* ------------------- skeleton component ------------------- */
function StylesListSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <Shimmer className="h-6 w-32 mb-2" />
          <Shimmer className="h-4 w-48" />
        </div>
        <div className="flex gap-2">
          <Shimmer className="h-9 w-28" />
          <Shimmer className="h-9 w-24" />
        </div>
      </div>

      <Card className="rounded-2xl">
        <CardHeader className="pb-3">
          <Shimmer className="h-5 w-32 mb-2" />
          <Shimmer className="h-4 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="flex gap-2">
            <Shimmer className="h-9 flex-1" />
            <Shimmer className="h-9 w-20" />
          </div>

          <Separator />

          {/* Table */}
          <div className="overflow-hidden rounded-xl border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>GLB</TableHead>
                  <TableHead>Products</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Shimmer className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Shimmer className="h-4 w-20" />
                    </TableCell>
                    <TableCell>
                      <Shimmer className="h-4 w-12" />
                    </TableCell>
                    <TableCell>
                      <Shimmer className="h-4 w-16" />
                    </TableCell>
                    <TableCell>
                      <Shimmer className="h-6 w-20 rounded-full" />
                    </TableCell>
                    <TableCell className="flex justify-end gap-2">
                      <Shimmer className="h-8 w-20" />
                      <Shimmer className="h-8 w-16" />
                      <Shimmer className="h-8 w-20" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ------------------- main component ------------------- */
type StyleModelConfig = {
  glbUrl?: string | null;
  lighting?: string | null;
  environment?: string | null;
};

type StyleItem = {
  id: string;
  styleId?: string | null;
  name: string;
  description?: string | null;
  category: string;
  isActive: boolean;
  modelConfig?: StyleModelConfig | null;
  createdAt?: string;
  updatedAt?: string;
  _productsCount?: number;
};

const FALLBACK: StyleItem[] = [
  {
    id: "st_captoe",
    styleId: "cap-toe",
    name: "Cap Toe",
    category: "oxford",
    isActive: true,
    description: "Classic cap toe oxford",
    modelConfig: {
      glbUrl: "/glb/styles/captoe.glb",
      lighting: "directional",
      environment: "studio",
    },
    _productsCount: 3,
  },
];

export default function StylesListPage() {
  const [items, setItems] = React.useState<StyleItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [query, setQuery] = React.useState("");

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/styles?limit=100${
          query ? `&q=${encodeURIComponent(query)}` : ""
        }`,
        { cache: "no-store" }
      );
      const data = await res.json();
      setItems(data.items ?? data ?? []);
    } catch {
      setItems(FALLBACK);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    load(); /* eslint-disable-next-line */
  }, []);

  const toggleActive = async (s: StyleItem) => {
    setItems((prev) =>
      prev.map((x) => (x.id === s.id ? { ...x, isActive: !x.isActive } : x))
    );
    try {
      const run = async () => {
        const res = await fetch(`/api/styles/${s.id}`, {
          method: "PUT",
          body: JSON.stringify({ isActive: !s.isActive }),
        });
        if (!res.ok) throw new Error(await res.text());
        return res.json();
      };
      const p = run();
      toast.promise(p, {
        loading: "Updating…",
        success: "Updated",
        error: "Failed to update",
      });
      await p;
    } catch {
      setItems((prev) =>
        prev.map((x) => (x.id === s.id ? { ...x, isActive: s.isActive } : x))
      );
    }
  };

  const deleteStyle = async (s: StyleItem) => {
    setItems((prev) => prev.filter((x) => x.id !== s.id));
    try {
      const res = await fetch(`/api/styles/${s.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(await res.text());
      toast.success("Style deleted successfully");
    } catch {
      toast.error("Failed to delete style");
      setItems((prev) => [...prev, s]);
    }
  };

  /* ------------------- return ------------------- */
  if (loading) {
    return <StylesListSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* --- original UI --- */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Styles</h1>
          <p className="text-sm text-muted-foreground">
            Manage shoe styles and their 3D configs.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={load} disabled={loading}>
            <RefreshCcw
              className={`mr-2 size-4 ${loading ? "animate-spin" : ""}`}
            />
            {loading ? "Refreshing…" : "Refresh"}
          </Button>
          <Button asChild>
            <Link href="/styles/new">
              <Plus className="mr-2 size-4" />
              New Style
            </Link>
          </Button>
        </div>
      </div>

      <Card className="rounded-2xl">
        <CardHeader className="pb-3">
          <CardTitle>All Styles</CardTitle>
          <CardDescription>
            Search, toggle status, edit, or delete.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Search styles…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") load();
              }}
            />
            <Button onClick={load}>Search</Button>
          </div>

          <Separator />

          <div className="overflow-hidden rounded-xl border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>GLB</TableHead>
                  <TableHead>Products</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {s.category}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {s.modelConfig?.glbUrl ? "Yes" : "—"}
                    </TableCell>
                    <TableCell>
                      {typeof s._productsCount === "number"
                        ? s._productsCount
                        : "—"}
                    </TableCell>
                    <TableCell>
                      {s.isActive ? (
                        <Badge>Active</Badge>
                      ) : (
                        <Badge variant="secondary">Disabled</Badge>
                      )}
                    </TableCell>
                    <TableCell className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleActive(s)}
                      >
                        {s.isActive ? (
                          <ToggleLeft className="mr-2 size-4" />
                        ) : (
                          <ToggleRight className="mr-2 size-4" />
                        )}
                        {s.isActive ? "Disable" : "Enable"}
                      </Button>
                      <Button size="sm" asChild>
                        <Link href={`/styles/${s.id}`}>
                          <Edit3 className="mr-2 size-4" />
                          Edit
                        </Link>
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteStyle(s)}
                        className="cursor-pointer text-white"
                      >
                        <Trash2 className="mr-2 size-4" />
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {items.length === 0 && !loading && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="py-6 text-center text-sm text-muted-foreground"
                    >
                      No styles found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ------------------- shimmer keyframes ------------------- */
/* Add this in globals.css or tailwind config:
@keyframes shimmer {
  100% {
    transform: translateX(100%);
  }
}
*/
