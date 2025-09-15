"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from "@/components/ui/tabs";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft, Check, CircleOff, Factory, Plus, RefreshCw, Save, Sparkles, Trash2,
} from "lucide-react";

/* ---------------- types ---------------- */
type Currency = "USD" | "EUR" | "GBP";
type OptionType = "SIZE" | "WIDTH" | "STYLE" | "SOLE" | "COLOR" | "MATERIAL" | "CUSTOM";

type Product = {
  id: string;
  productId: string;
  title: string;
  vendor?: string | null;
  description: string;
  price: number;
  currency: Currency;
  compareAtPrice?: number | null;
  isActive: boolean;
  assets?: any;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  metaImage: string;
  metaImageWidth?: number | null;
  metaImageHeight?: number | null;
  metaImageAlt?: string | null;
  metaImageTitle?: string | null;
  metaImageDescription?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

type ProductOptionValue = {
  id: string;
  value: string;
  label: string;
  position: number;
  isActive: boolean;
};

type ProductOption = {
  id: string;
  code: string;
  name: string;
  type: OptionType;
  position: number;
  isActive: boolean;
  values: ProductOptionValue[];
};

type Variant = {
  id: string;
  sku: string;
  price: number;
  isActive: boolean;
};

type Size = { id: string; sizeId: string; name: string; region: "US" | "EU" | "UK"; value: number };
type ProductSize = { id: string; sizeId: string; width: "STANDARD" | "WIDE" | "EXTRA_WIDE" | "NARROW" };

type Panel = { id: string; panelId: string; name: string; group?: string | null };
type ProductPanel = { id: string; panelId: string; panel?: Panel; isCustomizable: boolean };

/* ---------------- fallback (if API fails) ---------------- */
const FALLBACK_PRODUCT: Product = {
  id: "fake_oxford",
  productId: "oxford-001",
  title: "Premium Oxford Shoes",
  vendor: "Italian Shoes Company",
  description: "<p>Full-grain leather, Goodyear welt…</p>",
  price: 12999,
  currency: "USD",
  compareAtPrice: null,
  isActive: true,
  assets: { glb: { url: "/ShoeSoleFixed.glb", lighting: "directional", environment: "studio" } },
  metaTitle: "Premium Oxford Shoes",
  metaDescription: "Premium Oxford Shoes, Full-grain leather, Goodyear welt…",
  metaKeywords: "Oxford Shoes, Premium Oxford, Full-grain leather",
  metaImage: "/images/products/oxford-001.png",
  metaImageWidth: 1000,
  metaImageHeight: 1000,
  metaImageAlt: "Premium Oxford Shoes",
  metaImageTitle: "Premium Oxford Shoes",
  metaImageDescription: "Premium Oxford Shoes social",
};

export default function ProductEditPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);

  const [product, setProduct] = React.useState<Product | null>(null);

  // Options/variants/sizes/panels
  const [options, setOptions] = React.useState<ProductOption[]>([]);
  const [variants, setVariants] = React.useState<Variant[]>([]);
  const [sizes, setSizes] = React.useState<Size[]>([]);
  const [productSizes, setProductSizes] = React.useState<ProductSize[]>([]);
  const [masterPanels, setMasterPanels] = React.useState<Panel[]>([]);
  const [productPanels, setProductPanels] = React.useState<ProductPanel[]>([]);

  /* ------------ load everything ------------ */
  const refreshAll = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/products/${id}?include=all`, { cache: "no-store" });
      if (!res.ok) throw new Error("product");
      const data = (await res.json()) as Product;
      setProduct(data);
    } catch {
      setProduct(FALLBACK_PRODUCT);
    }

    // options
    try {
      const r = await fetch(`/api/products/${id}/options`, { cache: "no-store" });
      const data = (await r.json()) as { items?: ProductOption[] } | ProductOption[];
      setOptions(Array.isArray(data) ? data : data.items ?? []);
    } catch {
      setOptions([]);
    }

    // variants
    try {
      const r = await fetch(`/api/products/${id}/variants`, { cache: "no-store" });
      if (!r.ok) throw new Error();
      const data = (await r.json()) as Variant[];
      setVariants(data ?? []);
    } catch {
      setVariants([{ id: "fake_v1", sku: "SKU-AB12CD34", price: FALLBACK_PRODUCT.price, isActive: true }]);
    }

    // sizes (master + product)
    try {
      const r = await fetch(`/api/sizes?limit=200`);
      const d = (await r.json()) as { items?: Size[] } | Size[];
      setSizes(Array.isArray(d) ? d : d.items ?? []);
    } catch {
      setSizes([
        { id: "size_us8", sizeId: "us-8", name: "US 8", region: "US", value: 8 },
        { id: "size_us9", sizeId: "us-9", name: "US 9", region: "US", value: 9 },
      ]);
    }
    try {
      const r = await fetch(`/api/products/${id}/sizes`);
      const d = (await r.json()) as ProductSize[];
      setProductSizes(d ?? []);
    } catch {
      setProductSizes([{ id: "ps1", sizeId: "us-8", width: "STANDARD" }]);
    }

    // panels (master + product)
    try {
      const r = await fetch(`/api/panels?limit=200`);
      const d = (await r.json()) as { items?: Panel[] } | Panel[];
      setMasterPanels(Array.isArray(d) ? d : d.items ?? []);
    } catch {
      setMasterPanels([
        { id: "p_toe", panelId: "toe-cap", name: "Toe Cap" },
        { id: "p_upper", panelId: "upper", name: "Upper" },
      ]);
    }
    try {
      const r = await fetch(`/api/products/${id}/panels`);
      const d = (await r.json()) as ProductPanel[];
      setProductPanels(d ?? []);
    } catch {
      setProductPanels([
        { id: "pp1", panelId: "toe-cap", panel: { id: "p_toe", panelId: "toe-cap", name: "Toe Cap" }, isCustomizable: true },
      ]);
    }

    setLoading(false);
  };

  React.useEffect(() => {
    if (id) refreshAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  /* ------------ save overview/seo/assets ------------ */
  const saveOverview = async () => {
    if (!product) return;
    setSaving(true);
    const run = async () => {
      const res = await fetch(`/api/products/${product.id}`, {
        method: "PUT",
        body: JSON.stringify({
          title: product.title,
          vendor: product.vendor,
          description: product.description,
          price: product.price,
          currency: product.currency,
          compareAtPrice: product.compareAtPrice,
          isActive: product.isActive,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    };
    const p = run();
    toast.promise(p, { loading: "Saving…", success: "Saved", error: "Failed to save" });
    await p;
    setSaving(false);
  };

  const saveSEO = async () => {
    if (!product) return;
    const run = async () => {
      const res = await fetch(`/api/products/${product.id}`, {
        method: "PUT",
        body: JSON.stringify({
          metaTitle: product.metaTitle,
          metaDescription: product.metaDescription,
          metaKeywords: product.metaKeywords,
          metaImage: product.metaImage,
          metaImageWidth: product.metaImageWidth,
          metaImageHeight: product.metaImageHeight,
          metaImageAlt: product.metaImageAlt,
          metaImageTitle: product.metaImageTitle,
          metaImageDescription: product.metaImageDescription,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    };
    const p = run();
    toast.promise(p, { loading: "Saving…", success: "Saved", error: "Failed to save" });
    await p;
  };

  const saveAssets = async () => {
    if (!product) return;
    const run = async () => {
      const res = await fetch(`/api/products/${product.id}`, {
        method: "PUT",
        body: JSON.stringify({ assets: product.assets ?? {} }),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    };
    const p = run();
    toast.promise(p, { loading: "Saving…", success: "Saved", error: "Failed to save" });
    await p;
  };

  /* ------------ options ------------ */
  const createOption = async (payload: { code: string; name: string; type: OptionType }) => {
    const run = async (): Promise<ProductOption> => {
      const res = await fetch(`/api/products/${id}/options`, { method: "POST", body: JSON.stringify(payload) });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    };
    const p = run();
    toast.promise(p, { loading: "Adding option…", success: "Option added", error: "Failed" });
    const created: ProductOption = await p;
    setOptions((prev) => [...prev, { ...created, values: created.values ?? [] }]);
  };

  const addOptionValue = async (optionId: string, payload: { value: string; label: string }) => {
    const run = async (): Promise<ProductOptionValue> => {
      const res = await fetch(`/api/products/${id}/options/${optionId}/values`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    };
    const p = run();
    toast.promise(p, { loading: "Adding value…", success: "Value added", error: "Failed" });
    const created: ProductOptionValue = await p;
    setOptions((prev) =>
      prev.map((o) => (o.id === optionId ? { ...o, values: [...(o.values ?? []), created] } : o))
    );
  };

  /* ------------ variants ------------ */
  const generateVariants = async (payload: { optionCodes: string[]; skuPrefix?: string; priceOverride?: number }) => {
    const run = async () => {
      const res = await fetch(`/api/products/${id}/variants`, { method: "POST", body: JSON.stringify(payload) });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    };
    const p = run();
    toast.promise(p, { loading: "Generating…", success: "Variants generated", error: "Failed" });
    await p;
    // refresh variants list
    try {
      const r = await fetch(`/api/products/${id}/variants`, { cache: "no-store" });
      const d = (await r.json()) as Variant[];
      setVariants(d ?? []);
    } catch {}
  };

  /* ------------ sizes ------------ */
  const toggleSize = async (size: Size, enabled: boolean) => {
    if (enabled) {
      const runCreate = async (): Promise<ProductSize> => {
        const res = await fetch(`/api/products/${id}/sizes`, {
          method: "POST",
          body: JSON.stringify({ sizeId: size.id, width: "STANDARD" }),
        });
        if (!res.ok) throw new Error(await res.text());
        return res.json();
      };
      const p = runCreate();
      toast.promise(p, { loading: "Adding size…", success: "Size added", error: "Failed" });
      const created: ProductSize = await p;
      setProductSizes((s) => [...s, created]);
    } else {
      const found = productSizes.find((ps) => ps.sizeId === size.id);
      if (!found) return; // Prevent running if not found

      const runDelete = async (): Promise<{ deleted?: number } | { ok?: boolean }> => {
        const res = await fetch(`/api/products/${id}/sizes`, {
          method: "DELETE",
          body: JSON.stringify({ sizeId: size.id, width: "STANDARD", id: found.id }),
        });
        if (!res.ok) throw new Error(await res.text());
        return res.json();
      };
      const p = runDelete();
      toast.promise(p, { loading: "Removing…", success: "Removed", error: "Failed" });
      await p;
      setProductSizes((s) => s.filter((ps) => ps.sizeId !== size.id));
    }
  };

  /* ------------ panels ------------ */
  const addPanel = async (panelId: string) => {
    const run = async (): Promise<ProductPanel> => {
      const res = await fetch(`/api/products/${id}/panels`, {
        method: "POST",
        body: JSON.stringify({ panelId, isCustomizable: true }),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    };
    const p = run();
    toast.promise(p, { loading: "Adding panel…", success: "Panel added", error: "Failed" });
    const created: ProductPanel = await p;
    setProductPanels((prev) => [...prev, created]);
  };

  const togglePanelCustom = async (pp: ProductPanel, next: boolean) => {
    // optimistic UI
    setProductPanels((list) => list.map((x) => (x.id === pp.id ? { ...x, isCustomizable: next } : x)));
    try {
      await fetch(`/api/products/${id}/panels`, {
        method: "PUT",
        body: JSON.stringify({ id: pp.id, isCustomizable: next }),
      });
    } catch {
      toast.error("Failed to update panel");
    }
  };

  if (!product) {
    return (
      <div className="space-y-4 p-6">
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link href="/products"><ArrowLeft className="mr-2 size-4" />Back</Link>
          </Button>
          <span className="text-sm text-muted-foreground">Loading product…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="sm">
            <Link href="/products"><ArrowLeft className="mr-2 size-4" />Back</Link>
          </Button>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{product.title}</h1>
            <p className="text-sm text-muted-foreground">ID: {product.productId}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={refreshAll}><RefreshCw className="mr-2 size-4" />Refresh</Button>
          <Button onClick={saveOverview} disabled={saving}><Save className="mr-2 size-4" />Save</Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="flex-wrap">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="images">Images</TabsTrigger>
          <TabsTrigger value="options">Options</TabsTrigger>
          <TabsTrigger value="variants">Variants</TabsTrigger>
          <TabsTrigger value="panels">Panels</TabsTrigger>
          <TabsTrigger value="sizes">Sizes</TabsTrigger>
          <TabsTrigger value="assets">3D Assets</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
        </TabsList>

        {/* OVERVIEW */}
        <TabsContent value="overview" className="mt-4">
          <Card className="rounded-2xl">
            <CardHeader className="pb-3">
              <CardTitle>Basic Info</CardTitle>
              <CardDescription>Title, vendor, description, price.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2 grid gap-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Title">
                    <Input value={product.title} onChange={(e) => setProduct({ ...product, title: e.target.value })} />
                  </Field>
                  <Field label="Vendor">
                    <Input value={product.vendor || ""} onChange={(e) => setProduct({ ...product, vendor: e.target.value })} />
                  </Field>
                </div>
                <Field label="Description">
                  <Textarea rows={8} value={product.description} onChange={(e) => setProduct({ ...product, description: e.target.value })} />
                </Field>
              </div>
              <div className="space-y-4">
                <Field label="Price (cents)">
                  <Input
                    type="number"
                    value={product.price}
                    onChange={(e) => setProduct({ ...product, price: Number(e.target.value || 0) })}
                  />
                </Field>
                <Field label="Compare at (cents)">
                  <Input
                    type="number"
                    value={product.compareAtPrice ?? ""}
                    onChange={(e) =>
                      setProduct({ ...product, compareAtPrice: e.target.value === "" ? null : Number(e.target.value) })
                    }
                  />
                </Field>
                <Field label="Currency">
                  <Select value={product.currency} onValueChange={(v: Currency) => setProduct({ ...product, currency: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div className="space-y-1">
                    <div className="text-sm font-medium">Active</div>
                    <div className="text-xs text-muted-foreground">Visible on storefront</div>
                  </div>
                  <Switch checked={product.isActive} onCheckedChange={(v) => setProduct({ ...product, isActive: v })} />
                </div>
                <Button onClick={saveOverview}><Save className="mr-2 size-4" />Save Overview</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* IMAGES (static UI placeholder unless you add /api/products/[id]/images) */}
        <TabsContent value="images" className="mt-4">
          <Card className="rounded-2xl">
            <CardHeader className="pb-3">
              <CardTitle>Images</CardTitle>
              <CardDescription>Add product images (UI only stub)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-xl border p-4 text-sm text-muted-foreground">
                This demo uses static UI. Wire to <code>/api/products/[id]/images</code> for full CRUD.
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                <div className="rounded-xl border p-3 text-sm">/images/products/oxford-001.png</div>
                <div className="rounded-xl border p-3 text-sm opacity-60">/images/products/oxford-001-2.png</div>
                <div className="rounded-xl border p-3 text-sm opacity-60">/images/products/oxford-001-3.png</div>
              </div>
              <div className="flex gap-2">
                <Input placeholder="https://…" />
                <Button><Plus className="mr-2 size-4" />Add</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* OPTIONS */}
        <TabsContent value="options" className="mt-4">
          <OptionsTab
            options={options}
            onCreate={createOption}
            onAddValue={addOptionValue}
          />
        </TabsContent>

        {/* VARIANTS */}
        <TabsContent value="variants" className="mt-4">
          <VariantsTab
            options={options}
            variants={variants}
            onGenerate={generateVariants}
          />
        </TabsContent>

        {/* PANELS */}
        <TabsContent value="panels" className="mt-4">
          <PanelsTab
            master={masterPanels}
            list={productPanels}
            onAddPanel={addPanel}
            onToggleCustom={togglePanelCustom}
          />
        </TabsContent>

        {/* SIZES */}
        <TabsContent value="sizes" className="mt-4">
          <SizesTab
            sizes={sizes}
            productSizes={productSizes}
            onToggle={toggleSize}
          />
        </TabsContent>

        {/* 3D ASSETS */}
        <TabsContent value="assets" className="mt-4">
          <Card className="rounded-2xl">
            <CardHeader className="pb-3">
              <CardTitle>3D Assets</CardTitle>
              <CardDescription>GLB & rendering hints</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
              <Field label="GLB URL">
                <Input
                  value={product.assets?.glb?.url ?? ""}
                  onChange={(e) =>
                    setProduct({
                      ...product,
                      assets: { ...(product.assets ?? {}), glb: { ...(product.assets?.glb ?? {}), url: e.target.value } },
                    })
                  }
                />
              </Field>
              <Field label="Lighting">
                <Input
                  value={product.assets?.glb?.lighting ?? ""}
                  onChange={(e) =>
                    setProduct({
                      ...product,
                      assets: {
                        ...(product.assets ?? {}),
                        glb: { ...(product.assets?.glb ?? {}), lighting: e.target.value },
                      },
                    })
                  }
                />
              </Field>
              <Field label="Environment">
                <Input
                  value={product.assets?.glb?.environment ?? ""}
                  onChange={(e) =>
                    setProduct({
                      ...product,
                      assets: {
                        ...(product.assets ?? {}),
                        glb: { ...(product.assets?.glb ?? {}), environment: e.target.value },
                      },
                    })
                  }
                />
              </Field>
              <div className="md:col-span-3 flex gap-2">
                <Button onClick={saveAssets}><Save className="mr-2 size-4" />Save Assets</Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    toast.info("Assets JSON in console");
                    console.log("assets", product.assets);
                  }}
                >
                  <Sparkles className="mr-2 size-4" /> Preview JSON
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SEO */}
        <TabsContent value="seo" className="mt-4">
          <Card className="rounded-2xl">
            <CardHeader className="pb-3">
              <CardTitle>SEO</CardTitle>
              <CardDescription>Meta for social & search</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Meta Title">
                  <Input value={product.metaTitle} onChange={(e) => setProduct({ ...product, metaTitle: e.target.value })} />
                </Field>
                <Field label="Meta Keywords">
                  <Input value={product.metaKeywords} onChange={(e) => setProduct({ ...product, metaKeywords: e.target.value })} />
                </Field>
              </div>
              <Field label="Meta Description">
                <Textarea rows={3} value={product.metaDescription} onChange={(e) => setProduct({ ...product, metaDescription: e.target.value })} />
              </Field>
              <Separator />
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Meta Image URL">
                  <Input value={product.metaImage} onChange={(e) => setProduct({ ...product, metaImage: e.target.value })} />
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Width">
                    <Input
                      type="number"
                      value={product.metaImageWidth ?? ""}
                      onChange={(e) =>
                        setProduct({ ...product, metaImageWidth: e.target.value === "" ? null : Number(e.target.value) })
                      }
                    />
                  </Field>
                  <Field label="Height">
                    <Input
                      type="number"
                      value={product.metaImageHeight ?? ""}
                      onChange={(e) =>
                        setProduct({ ...product, metaImageHeight: e.target.value === "" ? null : Number(e.target.value) })
                      }
                    />
                  </Field>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <Field label="Alt">
                  <Input value={product.metaImageAlt ?? ""} onChange={(e) => setProduct({ ...product, metaImageAlt: e.target.value })} />
                </Field>
                <Field label="Image Title">
                  <Input value={product.metaImageTitle ?? ""} onChange={(e) => setProduct({ ...product, metaImageTitle: e.target.value })} />
                </Field>
                <Field label="Image Description">
                  <Input
                    value={product.metaImageDescription ?? ""}
                    onChange={(e) => setProduct({ ...product, metaImageDescription: e.target.value })}
                  />
                </Field>
              </div>
              <Button onClick={saveSEO}><Save className="mr-2 size-4" />Save SEO</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

/* ---------------- tabs subcomponents ---------------- */

function OptionsTab({
  options,
  onCreate,
  onAddValue,
}: {
  options: ProductOption[];
  onCreate: (p: { code: string; name: string; type: OptionType }) => Promise<void>;
  onAddValue: (optionId: string, p: { value: string; label: string }) => Promise<void>;
}) {
  const [code, setCode] = React.useState("");
  const [name, setName] = React.useState("");
  const [type, setType] = React.useState<OptionType>("CUSTOM");

  return (
    <Card className="rounded-2xl">
      <CardHeader className="pb-3">
        <CardTitle>Options</CardTitle>
        <CardDescription>Attributes used to generate variants (e.g., Size, Style).</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* create option */}
        <div className="grid gap-3 md:grid-cols-3">
          <Field label="Code (slug)">
            <Input placeholder="size" value={code} onChange={(e) => setCode(e.target.value)} />
          </Field>
          <Field label="Name">
            <Input placeholder="Size" value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <Field label="Type">
            <Select value={type} onValueChange={(v: OptionType) => setType(v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {["SIZE", "WIDTH", "STYLE", "SOLE", "COLOR", "MATERIAL", "CUSTOM"].map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>
        <Button
          onClick={() => {
            if (!code.trim() || !name.trim()) return toast.error("Provide code & name");
            onCreate({ code: code.trim(), name: name.trim(), type });
            setCode(""); setName(""); setType("CUSTOM");
          }}
        >
          <Plus className="mr-2 size-4" /> Add Option
        </Button>

        <Separator />

        {/* list options */}
        <div className="grid gap-4">
          {options.length === 0 && (
            <div className="rounded-xl border p-4 text-sm text-muted-foreground">
              No options yet. Create Size/Style/Sole to start generating variants.
            </div>
          )}
          {options.map((opt) => (
            <div key={opt.id} className="rounded-xl border p-4">
              <div className="mb-3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="uppercase">{opt.code}</Badge>
                  <div className="font-medium">{opt.name}</div>
                </div>
                <div className="text-xs text-muted-foreground">Type: {opt.type}</div>
              </div>
              <div className="overflow-hidden rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Label</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead className="w-0"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {opt.values.map((v) => (
                      <TableRow key={v.id}>
                        <TableCell>{v.label}</TableCell>
                        <TableCell className="text-muted-foreground">{v.value}</TableCell>
                        <TableCell className="text-right"><CircleOff className="size-4 opacity-30" /></TableCell>
                      </TableRow>
                    ))}
                    {opt.values.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={3} className="py-6 text-center text-sm text-muted-foreground">
                          No values yet
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              <AddValueRow onAdd={(payload) => onAddValue(opt.id, payload)} />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function AddValueRow({ onAdd }: { onAdd: (p: { label: string; value: string }) => void }) {
  const [label, setLabel] = React.useState("");
  const [value, setValue] = React.useState("");
  return (
    <div className="mt-3 flex gap-2">
      <Input placeholder="Label (e.g., US 8 or Cap Toe)" value={label} onChange={(e) => setLabel(e.target.value)} />
      <Input placeholder="Value (e.g., us-8 or cap-toe)" value={value} onChange={(e) => setValue(e.target.value)} />
      <Button
        variant="secondary"
        onClick={() => {
          if (!label.trim() || !value.trim()) return toast.error("Provide label & value");
          onAdd({ label: label.trim(), value: value.trim() });
          setLabel(""); setValue("");
        }}
      >
        <Plus className="mr-2 size-4" /> Add
      </Button>
    </div>
  );
}

function VariantsTab({
  options,
  variants,
  onGenerate,
}: {
  options: ProductOption[];
  variants: Variant[];
  onGenerate: (p: { optionCodes: string[]; skuPrefix?: string; priceOverride?: number }) => Promise<void>;
}) {
  const [selectedCodes, setSelectedCodes] = React.useState<string[]>([]);
  const [skuPrefix, setSkuPrefix] = React.useState("SKU");
  const [priceOverride, setPriceOverride] = React.useState<string>("");

  return (
    <Card className="rounded-2xl">
      <CardHeader className="pb-3">
        <CardTitle>Variants</CardTitle>
        <CardDescription>Generate all combinations from selected options.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-3 md:grid-cols-3">
          <Field label="Select options">
            <div className="flex flex-wrap gap-2">
              {options.map((o) => {
                const active = selectedCodes.includes(o.code);
                return (
                  <Button
                    key={o.id}
                    variant={active ? "default" : "outline"}
                    size="sm"
                    onClick={() =>
                      setSelectedCodes((prev) =>
                        prev.includes(o.code) ? prev.filter((c) => c !== o.code) : [...prev, o.code]
                      )
                    }
                  >
                    {active ? <Check className="mr-1 size-4" /> : null}
                    {o.name}
                  </Button>
                );
              })}
            </div>
          </Field>
          <Field label="SKU prefix">
            <Input value={skuPrefix} onChange={(e) => setSkuPrefix(e.target.value)} />
          </Field>
          <Field label="Price override (cents)">
            <Input
              type="number"
              placeholder="Leave blank to use product price"
              value={priceOverride}
              onChange={(e) => setPriceOverride(e.target.value)}
            />
          </Field>
        </div>
        <Button
          onClick={() => {
            if (selectedCodes.length === 0) return toast.error("Choose at least one option");
            onGenerate({
              optionCodes: selectedCodes,
              skuPrefix: skuPrefix || "SKU",
              priceOverride: priceOverride ? Number(priceOverride) : undefined,
            });
          }}
        >
          <Factory className="mr-2 size-4" />
          Generate Variants
        </Button>

        <Separator />

        <div className="overflow-hidden rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {variants.map((v) => (
                <TableRow key={v.id}>
                  <TableCell className="font-medium">{v.sku}</TableCell>
                  <TableCell>{formatCurrency(v.price)}</TableCell>
                  <TableCell>{v.isActive ? <Badge>Active</Badge> : <Badge variant="secondary">Disabled</Badge>}</TableCell>
                </TableRow>
              ))}
              {variants.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="py-6 text-center text-sm text-muted-foreground">
                    No variants yet. Generate from options above.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

function PanelsTab({
  master,
  list,
  onAddPanel,
  onToggleCustom,
}: {
  master: Panel[];
  list: ProductPanel[];
  onAddPanel: (panelId: string) => Promise<void>;
  onToggleCustom: (pp: ProductPanel, next: boolean) => Promise<void>;
}) {
  const [panelId, setPanelId] = React.useState<string>("");

  return (
    <Card className="rounded-2xl">
      <CardHeader className="pb-3">
        <CardTitle>Panels</CardTitle>
        <CardDescription>Attach customizable panels to this product.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-3 md:grid-cols-[1fr_auto]">
          <Field label="Select panel">
            <Select value={panelId} onValueChange={setPanelId}>
              <SelectTrigger><SelectValue placeholder="Choose panel…" /></SelectTrigger>
              <SelectContent>
                {master.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <div className="flex items-end">
            <Button
              onClick={() => {
                if (!panelId) return toast.error("Choose a panel");
                onAddPanel(panelId);
                setPanelId("");
              }}
            >
              <Plus className="mr-2 size-4" /> Add Panel
            </Button>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Panel</TableHead>
                <TableHead>Customizable</TableHead>
                <TableHead>Allowed Colors</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.map((pp) => (
                <TableRow key={pp.id}>
                  <TableCell className="font-medium">{pp.panel?.name ?? pp.panelId}</TableCell>
                  <TableCell>
                    <Switch checked={pp.isCustomizable} onCheckedChange={(v) => onToggleCustom(pp, v)} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    (manage via PUT /api/products/[id]/panels — UI pending)
                  </TableCell>
                </TableRow>
              ))}
              {list.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="py-6 text-center text-sm text-muted-foreground">
                    No panels yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

function SizesTab({
  sizes,
  productSizes,
  onToggle,
}: {
  sizes: Size[];
  productSizes: ProductSize[];
  onToggle: (size: Size, enabled: boolean) => Promise<void>;
}) {
  const enabledMap = React.useMemo(() => new Set(productSizes.map((ps) => ps.sizeId)), [productSizes]);

  return (
    <Card className="rounded-2xl">
      <CardHeader className="pb-3">
        <CardTitle>Sizes</CardTitle>
        <CardDescription>Enable sizes for this product (STANDARD width).</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="overflow-hidden rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Region</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Value</TableHead>
                <TableHead className="w-0"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sizes.map((s) => {
                const enabled = enabledMap.has(s.id);
                return (
                  <TableRow key={s.id} className={enabled ? "" : "opacity-70"}>
                    <TableCell>{s.region}</TableCell>
                    <TableCell className="font-medium">{s.name}</TableCell>
                    <TableCell className="text-muted-foreground">{s.value}</TableCell>
                    <TableCell className="text-right">
                      {enabled ? (
                        <Button size="sm" variant="outline" onClick={() => onToggle(s, false)}>
                          <Trash2 className="mr-2 size-4" /> Disable
                        </Button>
                      ) : (
                        <Button size="sm" onClick={() => onToggle(s, true)}>
                          <Plus className="mr-2 size-4" /> Enable
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
              {sizes.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="py-6 text-center text-sm text-muted-foreground">
                    No sizes found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

/* ---------------- small helpers ---------------- */

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-2">
      <Label className="text-sm">{label}</Label>
      {children}
    </div>
  );
}

function formatCurrency(cents: number, currency: Currency = "USD") {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format((cents ?? 0) / 100);
  } catch {
    return `$${(cents ?? 0) / 100}`;
  }
}
