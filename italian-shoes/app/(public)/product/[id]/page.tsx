/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useMemo, useState } from "react";

/* ----------------------
   Types & Product Config
   ---------------------- */
type Panel = { id: string; name: string; meshName?: string; thumbnail?: string };
type Material = { id: string; name: string; thumbnail?: string; description?: string; textures?: string[] };
type Style = { id: string; name: string; thumbnail?: string; glb?: string };
type Sole = { id: string; name: string; thumbnail?: string; height?: string };
type Color = { id: string; name: string; textureUrl: string };

const product = {
  id: "derby-classics",
  title: "Derby Classics",
  vendor: "Girotti (mock)",
  price: 279,
  compareAtPrice: 449,
  images: ["/placeholder/shoe-1.jpg", "/placeholder/shoe-2.jpg", "/placeholder/shoe-3.jpg"],
  panels: [
    { id: "upper", name: "Upper", meshName: "Upper_Mesh", thumbnail: "/placeholder/panel-upper.jpg" },
    { id: "toe", name: "Toe", meshName: "Toe_Mesh", thumbnail: "/placeholder/panel-toe.jpg" },
    { id: "quarter", name: "Quarter", meshName: "Quarter_Mesh", thumbnail: "/placeholder/panel-quarter.jpg" },
    { id: "heel", name: "Heel", meshName: "Heel_Mesh", thumbnail: "/placeholder/panel-heel.jpg" },
  ] as Panel[],
  materials: [
    { id: "calf", name: "Calf Leather", thumbnail: "/placeholder/material-calf.jpg", description: "Premium Italian calf." },
    { id: "suede", name: "Suede", thumbnail: "/placeholder/material-suede.jpg", description: "Soft brushed finish." },
    { id: "patent", name: "Patent", thumbnail: "/placeholder/material-patent.jpg", description: "High shine finish." },
  ] as Material[],
  styles: [
    { id: "derby", name: "Derby", thumbnail: "/placeholder/style-derby.jpg", glb: "/glb/derby.glb" },
    { id: "oxford", name: "Oxford", thumbnail: "/placeholder/style-oxford.jpg", glb: "/glb/oxford.glb" },
  ] as Style[],
  soles: [
    { id: "leather", name: "Leather Sole", thumbnail: "/placeholder/sole-leather.jpg", height: "2.0 cm" },
    { id: "rubber", name: "Rubber Sole", thumbnail: "/placeholder/sole-rubber.jpg", height: "2.5 cm" },
  ] as Sole[],
  colors: [
    { id: "black", name: "Black", textureUrl: "/leather/black.jpg" },
    { id: "brown", name: "Brown", textureUrl: "/leather/brown.jpg" },
    { id: "dark-red", name: "Dark Red", textureUrl: "/leather/dark-red.png" },
    { id: "grey", name: "Grey", textureUrl: "/leather/grey.png" },
  ] as Color[],
  sizes: [
    { id: "42", label: "EU 42 / UK 8 / US 9" },
    { id: "43", label: "EU 43 / UK 9 / US 10" },
    { id: "44", label: "EU 44 / UK 9.5 / US 10.5" },
  ],
};

/* ----------------------
   Small Presentational Components
   ---------------------- */

const Badge: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">{children}</span>
);

const Toolbar: React.FC<{ onClear: () => void }> = ({ onClear }) => (
  <div className="absolute top-3 left-3 flex gap-2 z-20">
    <button className="bg-white p-2 rounded-md shadow-sm text-sm">Undo</button>
    <button className="bg-white p-2 rounded-md shadow-sm text-sm">Redo</button>
    <button onClick={onClear} className="bg-white p-2 rounded-md shadow-sm text-sm text-red-600">Clear</button>
  </div>
);

const ViewerPlaceholder: React.FC<{
  src: string;
  panels: Panel[];
  activePanel?: string | null;
  appliedTextures: Record<string, string | null>;
}> = ({ src, panels, activePanel, appliedTextures }) => (
  <div className="relative bg-white border rounded-lg overflow-hidden h-[540px] flex items-center justify-center">
    <div className="absolute top-3 right-3 z-10 text-xs text-gray-500 bg-white p-2 rounded-md">Double tap to zoom</div>
    <img src={src} alt="shoe" className="object-contain max-h-full max-w-full" />
    
  </div>
);

/* ----------------------
   Main Builder Component
   ---------------------- */

export default function DerbyBuilderClean() {
  const cfg = product;

  // UI-only state
  const [imageIndex, setImageIndex] = useState(0);
  const [activePanel, setActivePanel] = useState<string | null>(cfg.panels[0].id);
  const [activeTab, setActiveTab] = useState<"Materials" | "Style" | "Soles" | "Colors" | "Inscription">("Materials");
  const [selectedMaterial, setSelectedMaterial] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<string>(cfg.styles[0].id);
  const [selectedSole, setSelectedSole] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [appliedTextures, setAppliedTextures] = useState<Record<string, string | null>>(
    () => Object.fromEntries(cfg.panels.map((p) => [p.id, null]))
  );
  const [inscription, setInscription] = useState({ toe: "", tongue: "" });
  const [selectedSize, setSelectedSize] = useState<string>(cfg.sizes[0].id);

  const actionsCount = useMemo(
    () => [selectedMaterial, selectedStyle, selectedSole, selectedColor, ...Object.values(appliedTextures)].filter(Boolean).length,
    [selectedMaterial, selectedStyle, selectedSole, selectedColor, appliedTextures]
  );

  const applyTexture = (textureUrl: string) => {
    if (!activePanel) return;
    setAppliedTextures((prev) => ({ ...prev, [activePanel]: textureUrl }));
    setSelectedColor(textureUrl);
  };

  const clearAll = () => {
    setActivePanel(cfg.panels[0].id);
    setSelectedMaterial(null);
    setSelectedSole(null);
    setSelectedColor(null);
    setAppliedTextures(Object.fromEntries(cfg.panels.map((p) => [p.id, null])));
    setInscription({ toe: "", tongue: "" });
    setSelectedSize(cfg.sizes[0].id);
  };

  return (
    <div className="min-h-screen bg-white text-gray-800">
      {/* Breadcrumb header */}
      <header className="border-b">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="text-sm text-gray-600">Home / Create Design / Men's Shoe / Derby Classics</div>
          <div className="text-sm text-gray-600">Support: +91 12345 67890</div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-[55%_45%] gap-8">
          {/* Left: Viewer */}
          <div className="space-y-4">
            <div className="relative">
              <Toolbar onClear={clearAll} />
              <ViewerPlaceholder src={cfg.images[imageIndex]} panels={cfg.panels} activePanel={activePanel} appliedTextures={appliedTextures} />
            </div>

            <div className="flex gap-3">
              {cfg.images.map((src, i) => (
                <button
                  key={src}
                  onClick={() => setImageIndex(i)}
                  className={`w-20 h-20 rounded-md overflow-hidden border ${imageIndex === i ? "ring-2 ring-red-500" : "border-gray-200"}`}
                >
                  <img src={src} alt={`thumb-${i}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Right: Controls */}
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-semibold">{cfg.title}</h1>
              <p className="text-sm text-gray-600">By {cfg.vendor}</p>
              <div className="flex items-baseline gap-3 mt-3">
                <div className="text-2xl font-bold text-red-600">₹{cfg.price}</div>
                <div className="text-sm text-gray-500 line-through">₹{cfg.compareAtPrice}</div>
                <Badge>Free Delivery & Returns</Badge>
              </div>
            </div>

            {/* Panel selector */}
            <section className="bg-white border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-sm font-medium">Edit Panel</div>
                  <div className="text-xs text-gray-500">Choose the shoe panel to customize</div>
                </div>
                <div className="text-xs text-gray-500">Actions: {actionsCount}</div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {cfg.panels.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setActivePanel(p.id)}
                    className={`flex items-center gap-3 p-2 rounded-md border transition ${activePanel === p.id ? "ring-2 ring-red-400 border-transparent" : "border-gray-200"}`}
                  >
                    <div className="w-12 h-12 rounded overflow-hidden bg-gray-50 flex items-center justify-center">
                      <img src={p.thumbnail || "/placeholder/panel-default.jpg"} alt={p.name} className="object-cover w-full h-full" />
                    </div>
                    <div className="text-sm">
                      <div className="font-medium">{p.name}</div>
                      <div className="text-xs text-gray-500">panel</div>
                    </div>
                  </button>
                ))}
              </div>
            </section>

            {/* Editor tabs */}
            <section className="bg-white border rounded-lg p-4">
              <div className="flex gap-2 mb-4">
                {(["Materials", "Style", "Soles", "Colors", "Inscription"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setActiveTab(t)}
                    className={`px-3 py-2 text-sm rounded-md ${activeTab === t ? "bg-white text-gray-900 shadow" : "bg-gray-100 text-gray-600"}`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {/* Materials */}
              {activeTab === "Materials" && (
                <div>
                  <h3 className="font-medium mb-2">Materials</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {cfg.materials.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => setSelectedMaterial(m.id)}
                        className={`p-3 rounded-md border text-left transition ${selectedMaterial === m.id ? "border-red-500 ring-1 ring-red-100" : "border-gray-200"}`}
                      >
                        <div className="w-full h-24 rounded-md overflow-hidden bg-gray-50 mb-2 flex items-center justify-center">
                          <img src={m.thumbnail || "/placeholder/material-default.jpg"} alt={m.name} className="object-cover w-full h-full" />
                        </div>
                        <div className="text-sm font-medium">{m.name}</div>
                        <div className="text-xs text-gray-500">{m.description}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Style */}
              {activeTab === "Style" && (
                <div>
                  <h3 className="font-medium mb-2">Style</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {cfg.styles.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => setSelectedStyle(s.id)}
                        className={`p-2 rounded-md border transition ${selectedStyle === s.id ? "border-red-500 ring-1 ring-red-100" : "border-gray-200"}`}
                      >
                        <div className="w-full h-20 rounded-md overflow-hidden bg-gray-50 mb-1 flex items-center justify-center">
                          <img src={s.thumbnail} alt={s.name} className="object-contain w-full h-full" />
                        </div>
                        <div className="text-sm text-center">{s.name}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Soles */}
              {activeTab === "Soles" && (
                <div>
                  <h3 className="font-medium mb-2">Soles</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {cfg.soles.map((so) => (
                      <button
                        key={so.name}
                        onClick={() => setSelectedSole(so.name)}
                        className={`p-2 rounded-md border transition ${selectedSole === so.name ? "border-red-500 ring-1 ring-red-100" : "border-gray-200"}`}
                      >
                        <div className="w-full h-20 rounded-md overflow-hidden bg-gray-50 mb-2 flex items-center justify-center">
                          <img src={so.thumbnail} alt={so.name} className="object-contain w-full h-full" />
                        </div>
                        <div className="text-sm font-medium">{so.name}</div>
                        <div className="text-xs text-gray-500">{so.height}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Colors */}
              {activeTab === "Colors" && (
                <div>
                  <h3 className="font-medium mb-2">Colors & Textures</h3>
                  <div className="grid grid-cols-4 gap-2">
                    {cfg.colors.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => applyTexture(c.textureUrl)}
                        title={c.name}
                        className={`rounded-md overflow-hidden w-full h-20 border transition ${selectedColor === c.textureUrl ? "ring-2 ring-red-400 border-transparent" : "border-gray-200"}`}
                      >
                        <img src={c.textureUrl} alt={c.name} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Inscription */}
              {activeTab === "Inscription" && (
                <div>
                  <h3 className="font-medium mb-2">Inscription / Monogram</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-600">Toe (2 chars)</label>
                      <input
                        maxLength={2}
                        value={inscription.toe}
                        onChange={(e) => setInscription((p) => ({ ...p, toe: e.target.value.toUpperCase() }))}
                        className="w-full border rounded-md px-2 py-2 mt-1"
                        placeholder="AB"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600">Tongue (optional)</label>
                      <input
                        maxLength={12}
                        value={inscription.tongue}
                        onChange={(e) => setInscription((p) => ({ ...p, tongue: e.target.value }))}
                        className="w-full border rounded-md px-2 py-2 mt-1"
                        placeholder="Name"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Preview will render on the 3D model (in the real viewer).</p>
                </div>
              )}
            </section>

            {/* Size & Add to Cart */}
            <section className="bg-white border rounded-lg p-4">
              <div className="mb-3">
                <label className="block text-sm font-medium mb-2">Size</label>
                <select value={selectedSize} onChange={(e) => setSelectedSize(e.target.value)} className="border rounded-md px-3 py-2">
                  {cfg.sizes.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3">
                <button className="flex-1 bg-red-600 text-white px-4 py-3 rounded-md font-medium hover:bg-red-700 transition">Add to Cart</button>
                <button className="w-12 h-12 rounded-md border flex items-center justify-center">♡</button>
              </div>

              <div className="mt-3 text-xs text-gray-500 space-y-1">
                <div>Style: <span className="font-medium">{cfg.styles.find((s) => s.id === selectedStyle)?.name}</span></div>
                <div>Material: <span className="font-medium">{selectedMaterial ?? "—"}</span></div>
                <div>Sole: <span className="font-medium">{selectedSole ?? "—"}</span></div>
                <div>Panel textures: <span className="font-medium">{Object.values(appliedTextures).filter(Boolean).length}</span></div>
                <div>Inscription: <span className="font-medium">{inscription.toe || inscription.tongue ? `${inscription.toe} ${inscription.tongue}` : "—"}</span></div>
              </div>
            </section>
          </div>
        </div>

        {/* Tabs / details */}
        <div className="mt-10">
          <div className="bg-white border rounded-md">
            <nav className="flex space-x-2 p-3 border-b">
              <button className="px-4 py-2 text-sm rounded-md bg-gray-100">Details</button>
              <button className="px-4 py-2 text-sm rounded-md hover:bg-gray-50">How to measure</button>
              <button className="px-4 py-2 text-sm rounded-md hover:bg-gray-50">Reviews (0)</button>
            </nav>
            <div className="p-6 text-sm text-gray-700">
              <p>Classic derby model handcrafted in premium materials. This is a UI-only mock based on the Girotti builder — replace placeholders with real assets and wire the viewer/API to make it interactive.</p>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t mt-12">
        <div className="max-w-6xl mx-auto px-4 py-6 text-sm text-gray-500">© {new Date().getFullYear()} — Derby Builder (UI)</div>
      </footer>
    </div>
  );
}
