"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";

import { ProductCreateSchema as ServerProductCreateSchema } from "@/lib/validators";
import { ArrowLeft, Save, Sparkles } from "lucide-react";
import Link from "next/link";
import { MaterialSelection, Material, SelectedMaterial } from "@/components/material-selection";
import { StyleSoleSelection, Style, Sole, SelectedItem } from "@/components/style-sole-selection";

/** -------- Local UI schema (compatible with server) -------- */
const ProductCreateSchema = ServerProductCreateSchema.extend({
  // UI-only fields for easier entry of GLB
  glbUrl: z.string().optional(),
  glbLighting: z.string().optional(),
  glbEnvironment: z.string().optional(),
});

type FormValues = z.infer<typeof ProductCreateSchema>;

const DEFAULTS: Partial<FormValues> = {
  productId: "",
  title: "",
  vendor: "",
  description: "",
  metaTitle: "",
  metaDescription: "",
  metaKeywords: "",
  metaImage: "",
  metaImageAlt: "",
  metaImageTitle: "",
  metaImageDescription: "",
  metaImageWidth: 1000,
  metaImageHeight: 1000,
  price: 0, // cents
  currency: "USD",
  compareAtPrice: undefined,
  isActive: true,
  // UI helpers
  glbUrl: "/ShoeSoleFixed.glb",
  glbLighting: "directional",
  glbEnvironment: "studio",
  selectedMaterials: [],
};

export default function ProductNewPage() {
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(ProductCreateSchema) as any, // Type workaround for zodResolver typing issue
    defaultValues: DEFAULTS as FormValues, // Ensure all required fields are present
    mode: "onChange",
  });

  const watchTitle = form.watch("title");
  const watchProductId = form.watch("productId");

  // Material selection state
  const [materials, setMaterials] = React.useState<Material[]>([]);
  const [materialsLoading, setMaterialsLoading] = React.useState(true);
  const [selectedMaterials, setSelectedMaterials] = React.useState<SelectedMaterial[]>([]);

  // Style selection state
  const [styles, setStyles] = React.useState<Style[]>([]);
  const [stylesLoading, setStylesLoading] = React.useState(true);
  const [selectedStyles, setSelectedStyles] = React.useState<SelectedItem[]>([]);

  // Sole selection state
  const [soles, setSoles] = React.useState<Sole[]>([]);
  const [solesLoading, setSolesLoading] = React.useState(true);
  const [selectedSoles, setSelectedSoles] = React.useState<SelectedItem[]>([]);

  // Auto-generate productId from title if empty
  React.useEffect(() => {
    if (!watchProductId && watchTitle) {
      form.setValue("productId", slugify(watchTitle), { shouldDirty: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchTitle]);

  // Load materials
  React.useEffect(() => {
    const loadMaterials = async () => {
      try {
        const response = await fetch("/api/materials/with-colors");
        if (response.ok) {
          const data = await response.json();
          setMaterials(data.materials || []);
        }
      } catch (error) {
        console.error("Failed to load materials:", error);
      } finally {
        setMaterialsLoading(false);
      }
    };

    loadMaterials();
  }, []);

  // Load styles
  React.useEffect(() => {
    const loadStyles = async () => {
      try {
        const response = await fetch("/api/styles/active");
        if (response.ok) {
          const data = await response.json();
          setStyles(data.styles || []);
        }
      } catch (error) {
        console.error("Failed to load styles:", error);
      } finally {
        setStylesLoading(false);
      }
    };

    loadStyles();
  }, []);

  // Load soles
  React.useEffect(() => {
    const loadSoles = async () => {
      try {
        const response = await fetch("/api/soles/active");
        if (response.ok) {
          const data = await response.json();
          setSoles(data.soles || []);
        }
      } catch (error) {
        console.error("Failed to load soles:", error);
      } finally {
        setSolesLoading(false);
      }
    };

    loadSoles();
  }, []);

  // Update form when selections change
  React.useEffect(() => {
    form.setValue("selectedMaterials", selectedMaterials);
  }, [selectedMaterials, form]);

  React.useEffect(() => {
    form.setValue("selectedStyles", selectedStyles);
  }, [selectedStyles, form]);

  React.useEffect(() => {
    form.setValue("selectedSoles", selectedSoles);
  }, [selectedSoles, form]);

  const onSubmit = async (values: FormValues) => {
    const payload = {
      productId: values.productId.trim(),
      title: values.title.trim(),
      vendor: values.vendor?.trim() || undefined,
      description: values.description, // HTML ok or plain text
      metaTitle: values.metaTitle.trim(),
      metaDescription: values.metaDescription.trim(),
      metaKeywords: values.metaKeywords.trim(),
      metaImage: values.metaImage.trim(),
      metaImageWidth: values.metaImageWidth ?? null,
      metaImageHeight: values.metaImageHeight ?? null,
      metaImageAlt: values.metaImageAlt || null,
      metaImageTitle: values.metaImageTitle || null,
      metaImageDescription: values.metaImageDescription || null,
      price: Number(values.price) || 0, // cents
      currency: values.currency,
      compareAtPrice: values.compareAtPrice ? Number(values.compareAtPrice) : null,
      isActive: values.isActive ?? true,
      assets: buildAssets(values),
      selectedMaterials: selectedMaterials,
      selectedStyles: selectedStyles,
      selectedSoles: selectedSoles,
    };

    const run = async () => {
      const res = await fetch("/api/products", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        let msg = "Failed to create product";
        try {
          const j = await res.json();
          if (j?.error) msg = j.error;
        } catch {}
        throw new Error(msg);
      }
      const created = await res.json(); // expects { id, ... }
      return created;
    };

    try {
      const created = await toast.promise(run(), {
        loading: "Creating product…",
        success: "Product created",
        error: (e) => (typeof e === "object" && e && "message" in e ? (e as any).message : String(e)) || "Failed to create",
      });
      // Support both { id } object and string/number id response
      const id = typeof created === "object" && created !== null && "id" in created
        ? (created as any).id
        : created;
      router.push(`/products/${id}`);
    } catch {
      // keep on page
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="sm">
            <Link href="/products">
              <ArrowLeft className="mr-2 size-4" />
              Back
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">New Product</h1>
            <p className="text-sm text-muted-foreground">Create a product and configure options later.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={form.handleSubmit(onSubmit)}>
            <Save className="mr-2 size-4" />
            Save
          </Button>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6 lg:grid-cols-3">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="rounded-2xl">
              <CardHeader className="pb-3">
                <CardTitle>Basic Info</CardTitle>
                <CardDescription>Title, vendor, and description.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <FormField
                  control={form.control as any}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl><Input placeholder="Premium Oxford Shoes" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control as any}
                    name="productId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product ID (slug)</FormLabel>
                        <FormControl><Input placeholder="oxford-001" {...field} /></FormControl>
                        <FormDescription>URL/key (unique)</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control as any}
                    name="vendor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vendor</FormLabel>
                        <FormControl><Input placeholder="Italian Shoes Company" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control as any}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (HTML allowed)</FormLabel>
                      <FormControl><Textarea rows={6} placeholder="<p>Full-grain leather, Goodyear welt…</p>" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card className="rounded-2xl">
              <CardHeader className="pb-3">
                <CardTitle>SEO</CardTitle>
                <CardDescription>Meta tags for social & search.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control as any}
                    name="metaTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Meta Title</FormLabel>
                        <FormControl><Input placeholder="Premium Oxford Shoes" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control as any}
                    name="metaKeywords"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Meta Keywords</FormLabel>
                        <FormControl><Input placeholder="Oxford Shoes, Full-grain leather…" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control as any}
                  name="metaDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Meta Description</FormLabel>
                      <FormControl><Textarea rows={3} placeholder="Premium Oxford Shoes, Full-grain leather…" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Separator />
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control as any}
                    name="metaImage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Meta Image URL</FormLabel>
                        <FormControl><Input placeholder="/images/products/oxford-001.png" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control as any}
                      name="metaImageWidth"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Width</FormLabel>
                          <FormControl><Input type="number" min={0} {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control as any}
                      name="metaImageHeight"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Height</FormLabel>
                          <FormControl><Input type="number" min={0} {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  <FormField
                    control={form.control as any}
                    name="metaImageAlt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Alt</FormLabel>
                        <FormControl><Input placeholder="Premium Oxford Shoes" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control as any}
                    name="metaImageTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Image Title</FormLabel>
                        <FormControl><Input placeholder="Premium Oxford Shoes" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control as any}
                    name="metaImageDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Image Description</FormLabel>
                        <FormControl><Input placeholder="Full-grain leather, Goodyear welt…" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            <Card className="rounded-2xl">
              <CardHeader className="pb-3">
                <CardTitle>Pricing</CardTitle>
                <CardDescription>Amounts are in <strong>cents</strong>.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control as any}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price (cents)</FormLabel>
                        <FormControl><Input type="number" min={0} step={1} {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control as any}
                    name="compareAtPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Compare at (cents)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            step={1}
                            value={field.value ?? ""}
                            onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control as any}
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Currency</FormLabel>
                      <FormControl>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger><SelectValue placeholder="Select currency" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="USD">USD</SelectItem>
                            <SelectItem value="EUR">EUR</SelectItem>
                            <SelectItem value="GBP">GBP</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div className="space-y-1">
                    <div className="text-sm font-medium">Active</div>
                    <div className="text-xs text-muted-foreground">Visible on storefront</div>
                  </div>
                  <FormField
                    control={form.control as any}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl">
              <CardHeader className="pb-3">
                <CardTitle>3D Assets</CardTitle>
                <CardDescription>GLB + rendering hints.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <FormField
                  control={form.control as any}
                  name="glbUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>GLB URL</FormLabel>
                      <FormControl><Input placeholder="/ShoeSoleFixed.glb" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control as any}
                    name="glbLighting"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Lighting</FormLabel>
                        <FormControl><Input placeholder="directional" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control as any}
                    name="glbEnvironment"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Environment</FormLabel>
                        <FormControl><Input placeholder="studio" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    const { glbUrl, glbLighting, glbEnvironment } = form.getValues();
                    const assets = buildAssets({ glbUrl, glbLighting, glbEnvironment } as FormValues);
                    toast.info("Assets preview (console)");
                    console.log("assets", assets);
                  }}
                >
                  <Sparkles className="mr-2 size-4" />
                  Preview assets JSON (console)
                </Button>
              </CardContent>
            </Card>

            {/* Material Selection */}
            <MaterialSelection
              materials={materials}
              selectedMaterials={selectedMaterials}
              onSelectionChange={setSelectedMaterials}
              loading={materialsLoading}
            />

            {/* Style Selection */}
            <StyleSoleSelection
              items={styles}
              selectedItems={selectedStyles}
              onSelectionChange={setSelectedStyles}
              loading={stylesLoading}
              title="Style Selection"
              description="Select available styles for this product."
              emptyMessage="No styles available. Create styles first in the Styles section."
            />

            {/* Sole Selection */}
            <StyleSoleSelection
              items={soles}
              selectedItems={selectedSoles}
              onSelectionChange={setSelectedSoles}
              loading={solesLoading}
              title="Sole Selection"
              description="Select available soles for this product."
              emptyMessage="No soles available. Create soles first in the Soles section."
            />

            <div className="flex gap-2">
              <Button className="flex-1" onClick={form.handleSubmit(onSubmit)}>
                <Save className="mr-2 size-4" />
                Save Product
              </Button>
              <Button asChild variant="outline" className="flex-1">
                <Link href="/products">Cancel</Link>
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}

/* ---------------- helpers ---------------- */

function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function buildAssets(values: Partial<FormValues>) {
  const glbUrl = values.glbUrl?.trim();
  if (!glbUrl) return {};
  return {
    glb: {
      url: glbUrl,
      lighting: values.glbLighting || "directional",
      environment: values.glbEnvironment || "studio",
    },
  };
}
