/* eslint-disable @next/next/no-img-element */
"use client";

import React, {
  useEffect,
  useLayoutEffect,
  useState,
  Suspense,
  useRef,
  SetStateAction,
  useCallback,
  useMemo,
  forwardRef,
  useImperativeHandle,
} from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, useGLTF, Environment, Bounds } from "@react-three/drei";
import * as THREE from "three";

interface TextureConfig {
  colorUrl?: string;
  normalUrl?: string;
  roughnessUrl?: string;
}

export type ShoeAvatarHandle = {
  /**
   * Returns a data URL (e.g. "data:image/png;base64,...") of the current WebGL canvas.
   */
  captureImage: (opts?: {
    mimeType?: "image/png" | "image/jpeg";
    pixelRatio?: number; // e.g. 2 for retina-like screenshot
    width?: number;
    height?: number;
    quality?: number; // only for jpeg
  }) => string | null;
};

interface AvatarProps {
  avatarData: string;
  objectList: THREE.Mesh[];
  setObjectList: React.Dispatch<React.SetStateAction<THREE.Mesh[]>>;
  selectedTextureMap?: Record<string, TextureConfig>;
  setIsTextureLoading?: React.Dispatch<SetStateAction<boolean>>;
}

// Error boundary component
class WebGLErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("WebGL Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center h-full bg-gray-100 rounded-lg">
          <div className="text-center p-4">
            <p className="text-gray-600 mb-2">3D Viewer temporarily unavailable</p>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Retry
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const textureLoader = new THREE.TextureLoader();

// CanvasCaptureBridge
const CanvasCaptureBridge = forwardRef<
  { capture: (opts?: {
      mimeType?: "image/png" | "image/jpeg";
      pixelRatio?: number;
      width?: number;
      height?: number;
      quality?: number;
    }) => string | null },
  {}
>(function CanvasCaptureBridge(_props, ref) {
  const { gl, scene, camera, size } = useThree();

  useImperativeHandle(ref, () => ({
    capture: (o) => {
      const mimeType = o?.mimeType ?? "image/png";
      const quality = o?.quality ?? 0.92;

      const prevPR = gl.getPixelRatio();
      const prevSize = gl.getSize(new THREE.Vector2());
      const prevXREnabled = gl.xr.enabled;

      const targetW = o?.width ?? size.width;
      const targetH = o?.height ?? size.height;
      const pr = o?.pixelRatio ?? prevPR;

      try {
        gl.xr.enabled = false;
        gl.setPixelRatio(pr);
        gl.setSize(targetW, targetH);
        gl.render(scene, camera);

        const dataURL =
          mimeType === "image/jpeg"
            ? gl.domElement.toDataURL(mimeType, quality)
            : gl.domElement.toDataURL(mimeType);

        return dataURL;
      } catch (e) {
        console.error("Screenshot capture failed:", e);
        return null;
      } finally {
        gl.setPixelRatio(prevPR);
        gl.setSize(prevSize.x, prevSize.y);
        gl.xr.enabled = prevXREnabled;
      }
    },
  }));

  return null;
});

// Avatar component
const Avatar: React.FC<AvatarProps> = ({
  avatarData,
  objectList,
  setObjectList,
  selectedTextureMap = {},
  setIsTextureLoading,
}) => {
  const { scene } = useGLTF(avatarData);
  const meshRef = useRef<THREE.Group>(null);
  const prevTextureMapRef = useRef<string>("");
  const isMountedRef = useRef(true);

  const textureCacheRef = useRef<Map<string, THREE.Texture>>(new Map());
  const originalMapRef = useRef<WeakMap<THREE.Material, THREE.Texture | null>>(
    new WeakMap()
  );
  const pendingLoadsRef = useRef(0);

  const setLoading = useCallback(
    (isLoading: boolean) => {
      if (isMountedRef.current) {
        setIsTextureLoading?.(isLoading);
      }
    },
    [setIsTextureLoading]
  );

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      textureCacheRef.current.forEach((texture) => texture.dispose());
      textureCacheRef.current.clear();
    };
  }, []);

  // Center + scale
  useLayoutEffect(() => {
    if (!scene || !meshRef.current || !isMountedRef.current) return;

    meshRef.current.scale.set(27, 28, 31);
    const box = new THREE.Box3().setFromObject(scene);
    const center = box.getCenter(new THREE.Vector3());
    meshRef.current.position.set(-center.x, -center.y, -center.z);
  }, [scene]);

  // Ground Y=0
  useLayoutEffect(() => {
    if (!meshRef.current || !isMountedRef.current) return;

    const scaledBox = new THREE.Box3().setFromObject(meshRef.current);
    meshRef.current.position.y -= scaledBox.min.y;
  }, []);

  // Material enhancements
  useLayoutEffect(() => {
    if (!scene || !isMountedRef.current) return;

    scene.traverse((o: THREE.Object3D) => {
      if (o instanceof THREE.Mesh && o.material) {
        const mat = o.material as THREE.MeshStandardMaterial;

        mat.envMapIntensity = 1.2;
        mat.roughness = 0.45;
        mat.metalness = 0.1;
        mat.needsUpdate = true;

        const texConfig = selectedTextureMap?.[o.name];
        if (texConfig?.normalUrl) {
          const normalMap = textureLoader.load(texConfig.normalUrl);
          normalMap.flipY = false;
          mat.normalMap = normalMap;
        }
        if (texConfig?.roughnessUrl) {
          const roughnessMap = textureLoader.load(texConfig.roughnessUrl);
          roughnessMap.flipY = false;
          mat.roughnessMap = roughnessMap;
        }
      }
    });
  }, [scene, selectedTextureMap]);

  // Collect meshes
  useEffect(() => {
    if (!scene || !isMountedRef.current) return;

    const children: THREE.Mesh[] = [];
    scene.traverse((child: THREE.Object3D) => {
      if (child instanceof THREE.Mesh) children.push(child);
    });

    setObjectList((prev) => {
      const prevNames = prev?.map((o) => o.name).sort().join(",");
      const newNames = children.map((o) => o.name).sort().join(",");
      return prevNames === newNames ? prev : children;
    });
  }, [scene, setObjectList]);

  // Texture helpers
  const beginLoad = useCallback(() => {
    if (isMountedRef.current) {
      pendingLoadsRef.current += 1;
      setLoading(true);
    }
  }, [setLoading]);

  const endLoad = useCallback(() => {
    if (isMountedRef.current) {
      pendingLoadsRef.current = Math.max(0, pendingLoadsRef.current - 1);
      if (pendingLoadsRef.current === 0) setLoading(false);
    }
  }, [setLoading]);

  const getTexture = useCallback(
    (url: string) => {
      const cache = textureCacheRef.current;
      const cached = cache.get(url);
      if (cached) return cached;

      beginLoad();
      const tex = textureLoader.load(
        url,
        () => endLoad(),
        undefined,
        (error) => {
          console.error(`Error loading texture ${url}:`, error);
          endLoad();
        }
      );
      tex.flipY = false;
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      cache.set(url, tex);
      return tex;
    },
    [beginLoad, endLoad]
  );

  // Texture swapping
  useEffect(() => {
    const currentMapStr = JSON.stringify(selectedTextureMap || {});
    if (!scene || currentMapStr === prevTextureMapRef.current || !isMountedRef.current) return;

    scene.traverse((child: THREE.Object3D) => {
      if (!(child instanceof THREE.Mesh)) return;
      const prevMat = child.material as THREE.MeshStandardMaterial;

      if (!originalMapRef.current.has(prevMat)) {
        originalMapRef.current.set(prevMat, prevMat.map ?? null);
      }

      const textureUrl: string | undefined =
        selectedTextureMap?.[child.name]?.colorUrl;

      child.material = prevMat.clone();
      const mat = child.material as THREE.MeshStandardMaterial;

      const prevMap = prevMat.map ?? originalMapRef.current.get(prevMat) ?? null;

      if (!textureUrl) {
        const original = originalMapRef.current.get(prevMat) ?? null;
        if (mat.map !== original) mat.map = original;
        mat.needsUpdate = true;
        return;
      }

      if ((mat.map as any)?.userData?._appliedUrl === textureUrl) return;

      const tex = getTexture(textureUrl);
      if (!tex) return;

      if (prevMap) {
        tex.offset.copy(prevMap.offset);
        tex.repeat.copy(prevMap.repeat);
        tex.center.copy(prevMap.center);
        tex.rotation = prevMap.rotation;
      }

      (tex as any).userData = { ...(tex as any).userData, _appliedUrl: textureUrl };
      mat.map = tex;
      mat.needsUpdate = true;
    });

    prevTextureMapRef.current = currentMapStr;
  }, [selectedTextureMap, scene, getTexture]);

  return (
    <group ref={meshRef}>
      <primitive object={scene} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[5, 5]} />
        <shadowMaterial attach="material" opacity={0.25} />
      </mesh>
    </group>
  );
};

// Main component
const ShoeAvatar = forwardRef<ShoeAvatarHandle, AvatarProps>(function ShoeAvatar(
  { avatarData, objectList, setObjectList, selectedTextureMap },
  ref
) {
  const [canvasSize, setCanvasSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 800,
    height: typeof window !== "undefined" ? window.innerHeight : 600,
  });
  const [hasMounted, setHasMounted] = useState(false);
  const [isTextureLoading, setIsTextureLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  const memoizedCanvasSize = useMemo(
    () => ({
      width: Math.min(canvasSize.width, 800),
      height: Math.min(canvasSize.height * 0.8, 600),
    }),
    [canvasSize.width, canvasSize.height]
  );

  useEffect(() => {
    try {
      useGLTF.preload(avatarData);
    } catch (error) {
      console.error("Error preloading model:", error);
      setHasError(true);
    }
  }, [avatarData]);

  useEffect(() => {
    setHasMounted(true);
    const resize = () => setCanvasSize({ width: window.innerWidth, height: window.innerHeight });
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  // ✅ Corrected ref type
  const bridgeRef = useRef<{ capture: ShoeAvatarHandle["captureImage"] } | null>(null);

  useImperativeHandle(ref, () => ({
    captureImage: (opts) => bridgeRef.current?.capture(opts) ?? null,
  }));

  if (!hasMounted) return null;

  if (hasError) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100 rounded-lg">
        <div className="text-center p-4">
          <p className="text-gray-600 mb-2">Failed to load 3D model</p>
          <button
            onClick={() => setHasError(false)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <WebGLErrorBoundary>
      <div className="relative">
        {isTextureLoading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
            <DomSpinner />
          </div>
        )}

        <Canvas
          shadows
          gl={{
            antialias: true,
            powerPreference: "high-performance",
            failIfMajorPerformanceCaveat: false,
            preserveDrawingBuffer: true,
            alpha: false,
          }}
          style={{
            width: `${memoizedCanvasSize.width}px`,
            height: `${memoizedCanvasSize.height}px`,
            maxWidth: "100%",
            background: "#ffffff",
          }}
          camera={{ position: [2.2, 0.25, 0], fov: 50 }}
          onCreated={({ gl }: { gl: THREE.WebGLRenderer }) => {
            gl.outputColorSpace = THREE.SRGBColorSpace;
            gl.toneMapping = THREE.ACESFilmicToneMapping;
            gl.toneMappingExposure = 1.5;
            gl.shadowMap.enabled = true;
            gl.shadowMap.type = THREE.PCFSoftShadowMap;
          }}
        >
          <CanvasCaptureBridge ref={bridgeRef} />

          <ambientLight intensity={0.2} />
          <directionalLight position={[5, 8, 5]} intensity={1.6} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} />
          <directionalLight position={[-5, 3, 5]} intensity={0.6} />
          <directionalLight position={[0, 5, -6]} intensity={0.8} color={"#fff"} />

          <Environment files="/hdri/studio_small_08_4k.hdr" background={false} />

          <Suspense fallback={<DomSpinner />}>
            <Bounds margin={1.1}>
              <Avatar
                avatarData={avatarData}
                objectList={objectList}
                setObjectList={setObjectList}
                selectedTextureMap={selectedTextureMap}
                setIsTextureLoading={setIsTextureLoading}
              />
            </Bounds>
          </Suspense>

          <OrbitControls enablePan={false} enableZoom minDistance={1.2} maxDistance={5} target={[0, 0.5, 0]} maxPolarAngle={Math.PI} />
        </Canvas>
      </div>
    </WebGLErrorBoundary>
  );
});

// Loading spinner
const DomSpinner: React.FC = () => (
  <div
    aria-label="Loading"
    className="animate-spin rounded-full h-12 w-12 border-4 border-white/70 border-t-transparent"
  />
);

export default ShoeAvatar;
