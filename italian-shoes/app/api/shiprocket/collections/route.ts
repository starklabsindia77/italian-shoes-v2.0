import { NextResponse } from "next/server";

// Define type
type Collection = {
  id: number;
  title: string;
  description?: string;
  handle?: string;
  imageUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export async function GET(req: Request) {
  try {
    // Mock data for Shiprocket
    const collections: Collection[] = [
      {
        id: 482865238,
        title: "Smart iPods",
        description: "The best selling iPod ever",
        handle: "smart-ipods",
        imageUrl:
          "https://cdn.shopify.com/s/files/1/0005/4838/0009/collections/ipod_nano_8gb.jpg?v=1696353592",
        createdAt: new Date("2017-08-31T20:00:00-04:00"),
        updatedAt: new Date("2023-10-03T13:19:52-04:00"),
      },
      {
        id: 841564295,
        title: "IPods",
        description: "The best selling iPod ever",
        handle: "ipods",
        imageUrl:
          "https://cdn.shopify.com/s/files/1/0005/4838/0009/collections/ipod_nano_8gb.jpg?v=1696353592",
        createdAt: new Date("2017-08-31T20:00:00-04:00"),
        updatedAt: new Date("2023-10-03T13:19:52-04:00"),
      },
    ];

    // Format response in Shiprocket style
    const formatted = collections.map((c, index) => ({
      id: c.id,
      updated_at: c.updatedAt,
      body_html: `<p>${c.description || ""}</p>`,
      handle: c.handle || c.title.toLowerCase().replace(/\s+/g, "-"),
      image: {
        src:
          c.imageUrl ||
          "https://cdn.shopify.com/s/files/1/0005/4838/0009/collections/default.jpg",
      },
      title: c.title,
      created_at: c.createdAt,
    }));

    return NextResponse.json({
      data: {
        total: formatted.length,
        collections: formatted,
      },
    });
  } catch (err) {
    console.error("Shiprocket Collections API Error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
