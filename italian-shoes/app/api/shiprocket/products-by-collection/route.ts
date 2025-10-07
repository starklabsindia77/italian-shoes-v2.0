import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

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
  collectionId?: number;
};

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const collectionId = Number(url.searchParams.get("collection_id") || 0);
    const page = Number(url.searchParams.get("page") || 1);
    const limit = Number(url.searchParams.get("limit") || 100);
    const skip = (page - 1) * limit;

    // Mock data for now (replace with Prisma query if you have DB)
    let products: Product[] = [
      {
        productId: 632910392,
        title: "IPod Nano - 8GB",
        description:
          "It's the small iPod with one very big idea: Video. Now the world's most popular music player, available in 4GB and 8GB models, lets you enjoy TV shows, movies, video podcasts, and more. The larger, brighter display means amazing picture quality. In six eye-catching colors, iPod nano is stunning all around. And with models starting at just $149, little speaks volumes.",
        vendor: "Apple",
        metaTitle: "Cult Products",
        metaKeywords: "Emotive, Flash Memory, MP3, Music",
        isActive: true,
        price: 199,
        compareAtPrice: 299,
        assets: [
          "https://cdn.shopify.com/s/files/1/0005/4838/0009/products/ipod-nano.png?v=1699368612",
        ],
        createdAt: new Date("2023-11-07T09:50:12-05:00"),
        updatedAt: new Date("2023-11-07T09:50:12-05:00"),
        variants: [
          {
            id: 808950810,
            name: "Pink",
            price: 199,
            compareAtPrice: 299,
            sku: "IPOD2008PINK",
            quantity: 42,
            createdAt: new Date("2023-11-07T09:50:12-05:00"),
            updatedAt: new Date("2023-11-07T09:50:12-05:00"),
            grams: 567,
            imageUrl:
              "https://cdn.shopify.com/s/files/1/0005/4838/0009/products/ipod-nano.png?v=1699368612",
            optionValues: { Color: "Blue", Size: "32" },
            weight: 1.25,
            weightUnit: "lb",
          },
        ],
        collectionId: 1234,
      },
    ];

    // Filter by collectionId
    const filtered = products.filter((p) => p.collectionId === collectionId);
    const paginated = filtered.slice(skip, skip + limit);

    // Format response
    const formatted = paginated.map((p, index) => ({
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
        p.variants?.map((v, vIndex) => ({
          id: Number(v.id) || Math.floor(Math.random() * 1_000_000_000) + vIndex,
          title: v.name || p.title,
          price: v.price?.toString(),
          compare_at_price: v.compareAtPrice?.toString() || null,
          sku: v.sku || `SKU-${v.id}`,
          quantity: v.quantity || 0,
          created_at: v.createdAt,
          updated_at: v.updatedAt,
          taxable: true,
          option_values: v.optionValues || { Color: "Blue", Size: "32" },
          grams: v.grams || 567,
          image: { src: v.imageUrl || p.assets?.[0] || "" },
          weight: v.weight || 1.25,
          weight_unit: v.weightUnit || "lb",
        })) || [],
      image: { src: p.assets?.[0] || "" },
      options: [
        { name: "Color", values: ["Blue", "Red"] },
        { name: "Size", values: ["30", "32", "34"] },
      ],
    }));

    return NextResponse.json({
      data: {
        total: filtered.length,
        products: formatted,
      },
    });
  } catch (err) {
    console.error("Shiprocket Products by Collection API Error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
