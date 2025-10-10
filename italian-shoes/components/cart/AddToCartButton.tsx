"use client";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Plus } from "lucide-react";
import { useCartStore } from "@/lib/stores";
import { useToast } from "@/components/hooks/use-toast";
import { useState } from "react";

interface AddToCartButtonProps {
  productId: string;
  title: string;
  price: number;
  originalPrice?: number;
  image?: string;         // fallback (used if screenshot not available)
  variant?: string;
  quantity?: number;
  size?: any;
  material?: {
    id: string;
    name: string;
    color?: {
      id: string;
      name: string;
      hexCode?: string;
    };
  };
  style?: {
    id: string;
    name: string;
  };
  sole?: {
    id: string;
    name: string;
  };
  buttonVariant?: "default" | "ghost" | "outline";
  buttonSize?: "default" | "sm" | "lg";
  className?: string;
  showIcon?: boolean;
  notes?: string;
  config?: any;

  /**
   * Called right before adding to cart.
   * Return a data URL (PNG/JPEG) of the 3D canvas, or null if not available.
   */
  onBeforeAdd?: () => Promise<string | null> | string | null;
}

export const AddToCartButton = ({
  productId,
  title,
  price,
  originalPrice,
  image,
  variant = "Default",
  quantity = 1,
  size,
  material,
  style,
  sole,
  buttonVariant = "default",
  buttonSize = "default",
  className = "bg-red-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-red-700 transition-colors",
  showIcon = false,
  notes,
  config,
  onBeforeAdd,
}: AddToCartButtonProps) => {
  const { addItem, isItemInCart } = useCartStore();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const isInCart = isItemInCart(productId, variant);

  const handleAddToCart = async () => {
    if (isInCart) return; // respects your existing "In Cart" disable state
    setIsLoading(true);

    try {
      // 1) Ask for a screenshot if provided
      let screenshotDataUrl: string | null = null;
      if (onBeforeAdd) {
        try {
          const maybeDataUrl = await onBeforeAdd();
          if (typeof maybeDataUrl === "string" && maybeDataUrl.startsWith("data:image/")) {
            screenshotDataUrl = maybeDataUrl;
          }
        } catch (e) {
          // Non-fatal: fall back to provided image
          console.warn("onBeforeAdd failed, falling back to image:", e);
        }
      }

      // 2) Add to cart using screenshot as primary visual (fallback to 'image')
      addItem({
        productId,
        title,
        variant,
        price,
        originalPrice,
        quantity,
        image: screenshotDataUrl ?? image,     // main product image in cart
        // If your store model supports a separate thumb, pass it too:
        // thumbnail: screenshotDataUrl ?? image,
        size,
        material,
        style,
        sole,
        notes,
        config,
      });

      toast({
        title: "Added to cart",
        description: `${title} has been added to your cart.`,
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={buttonVariant}
      size={buttonSize}
      onClick={handleAddToCart}
      disabled={isLoading || isInCart}
      className={className}
    >
      {showIcon && (isInCart ? <ShoppingCart className="h-4 w-4" /> : <Plus className="h-4 w-4" />)}
      <span className={showIcon ? "ml-2" : ""}>
        {isLoading ? "Adding..." : isInCart ? "In Cart" : "Add to Cart"}
      </span>
    </Button>
  );
};
