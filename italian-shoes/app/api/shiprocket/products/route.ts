import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// Define local types for clarity
type Variant = {
  id: number | string;
  name?: string;
  price?: number;
  compareAtPrice?: number;
  sku?: string;
  quantity?: number;
  createdAt?: Date;
  updatedAt?: Date;
  grams?: number;
  weight?: number;
  weightUnit?: string;
  imageUrl?: string;
  optionValues?: Record<string, string>;
};

type Product = {
  productId: string | number;
  title: string;
  description?: string;
  vendor?: string;
  metaTitle?: string;
  metaKeywords?: string;
  isActive?: boolean;
  price?: number;
  compareAtPrice?: number;
  assets?: string[];
  createdAt: Date;
  updatedAt: Date;
  variants?: Variant[];
};

export async function GET(req: Request) {
  try {
    const products: Product[] = await prisma.product.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
    });

    const formatted = products.map((p: Product, index: number) => ({
      // ✅ FIXED — ensure product always has a valid long-type ID
      id: Number(p.productId) || Date.now() + index,
      title: p.title,
      body_html: p.description || "",
      vendor: p.vendor || "",
      product_type: p.metaTitle || "Default Type",
      created_at: p.createdAt,
      handle: p.title?.toLowerCase().replace(/\s+/g, "-"),
      updated_at: p.updatedAt,
      tags: p.metaKeywords || "",
      status: p.isActive ? "active" : "inactive",

      variants:
        p.variants?.map((v: Variant, vIndex: number) => ({
          // ✅ FIXED — ensure variant always has a valid unique ID
          id: Number(v.id) || Math.floor(Math.random() * 1_000_000_000) + vIndex,
          title: v.name || p.title,
          price: v.price?.toString() || p.price?.toString() || "0.00",
          compare_at_price: v.compareAtPrice?.toString() || p.compareAtPrice?.toString() || null,
          sku: v.sku || `SKU-${p.productId}-${vIndex}`,
          quantity: v.quantity || 10,
          created_at: v.createdAt || p.createdAt,
          updated_at: v.updatedAt || p.updatedAt,
          taxable: true,
          option_values: v.optionValues || { Color: "Blue", Size: "32" },
          grams: v.grams || 567,
          image: { src: v.imageUrl || p.assets?.[0] || "" },
          weight: v.weight || 1.25,
          weight_unit: v.weightUnit || "lb",
        })) || [
          {
            // ✅ fallback variant ID generation
            id: Number(p.productId) * 10 || Date.now() + index,
            title: p.title,
            price: p.price?.toString() || "0.00",
            compare_at_price: p.compareAtPrice?.toString() || null,
            sku: `SKU-${p.productId}`,
            quantity: 10,
            created_at: p.createdAt,
            updated_at: p.updatedAt,
            taxable: true,
            option_values: { Color: "Blue", Size: "32" },
            grams: 567,
            image: { src: p.assets?.[0] || "" },
            weight: 1.25,
            weight_unit: "lb",
          },
        ],

      image: { src: p.assets?.[0] || "" },
      options: [
        { name: "Color", values: ["Blue", "Red"] },
        { name: "Size", values: ["30", "32", "34"] },
      ],
    }));

    return NextResponse.json({
      data: {
        total: formatted.length,
        products: formatted,
      },
    });
  } catch (err) {
    console.error("Shiprocket Products API Error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
