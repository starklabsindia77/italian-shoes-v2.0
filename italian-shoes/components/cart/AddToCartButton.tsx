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
  image?: string;
  variant?: string;
  quantity?: number;
  size?: {
    id: string;
    name: string;
    region: string;
  };
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
}: AddToCartButtonProps) => {
  const { addItem, isItemInCart } = useCartStore();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const isInCart = isItemInCart(productId, variant);

  const handleAddToCart = async () => {
    setIsLoading(true);
    
    try {
      addItem({
        productId,
        title,
        variant,
        price,
        originalPrice,
        quantity,
        image,
        size,
        material,
        style,
        sole,
      });
      
      toast({
        title: "Added to cart",
        description: `${title} has been added to your cart.`,
      });
    } catch (error) {
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
      {showIcon && (
        isInCart ? (
          <ShoppingCart className="h-4 w-4" />
        ) : (
          <Plus className="h-4 w-4" />
        )
      )}
      <span className={showIcon ? "ml-2" : ""}>
        {isLoading ? "Adding..." : isInCart ? "In Cart" : "Add to Cart"}
      </span>
    </Button>
  );
};
