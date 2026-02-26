"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckoutProgress } from "@/components/checkout/CheckoutProgressProps";
import { OrderSummary } from "@/components/checkout/OrderSummary";
import { ShippingForm } from "@/components/checkout/ShippingForm";
import { ContactForm } from "@/components/checkout/ContactForm";
import { Shield, Lock, ShoppingCart } from "lucide-react";
import { useCartStore } from "@/lib/stores/cart-store";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";

const Checkout = () => {
  const [settings, setSettings] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [selectedShipping, setSelectedShipping] = useState<{ name: string; price: number }>({ name: "Standard", price: 15 });

  const { items, getTotalPrice } = useCartStore();

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => setSettings(data))
      .catch((err) => console.error("Failed to load settings", err));
  }, []);

  const subtotal = getTotalPrice();
  const tax = subtotal * 0.08;
  const total = subtotal + selectedShipping.price + tax;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center p-8">
          <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingCart className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">You need to add some items to your cart before checking out.</p>
          <Button asChild className="w-full">
            <Link href="/collections">
              Continue Shopping
            </Link>
          </Button>
        </Card>
      </div>
    );
  }

  const handleShippingSelect = (method: { name: string; price: number }) => setSelectedShipping(method);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Checkout</h1>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
            <Shield className="w-4 h-4" />
            <span>Secure SSL encrypted checkout</span>
          </div>

          <div className="flex flex-col items-center gap-4 mt-6">
            {settings?.integrations?.shiprocketFasterCheckoutEnabled && (
              <div className="bg-[#f3f0ff] border border-[#d8ccff] p-4 rounded-xl max-w-md w-full shadow-sm">
                <p className="text-[#4b1dbd] text-sm font-medium mb-3">Skip the forms and checkout in 1-click!</p>
                <button
                  id="fastrr-checkout-button"
                  className="w-full bg-[#6328ff] text-white py-2.5 rounded-lg font-bold shadow-md hover:bg-[#5219e6] transition-colors flex items-center justify-center gap-2"
                >
                  🚀 Faster Checkout
                </button>
              </div>
            )}

          </div>
        </div>

        {/* Progress */}
        <CheckoutProgress currentStep={currentStep} />

        <div className="grid lg:grid-cols-2 gap-8 mt-8">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Contact Info */}
            <Card className="bg-white border shadow-sm">
              <CardHeader className="pb-4 flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">Contact Information</CardTitle>
                <Badge variant="secondary" className="text-xs">Step 1</Badge>
              </CardHeader>
              <CardContent>
                <ContactForm />
              </CardContent>
            </Card>

            {/* Shipping Form */}
            <Card className="bg-white border shadow-sm">
              <CardHeader className="pb-4 flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">Shipping Address</CardTitle>
                <Badge variant="secondary" className="text-xs">Step 2</Badge>
              </CardHeader>
              <CardContent>
                <ShippingForm />
              </CardContent>
            </Card>

            {/* Shipping Method */}
            <Card className="bg-white border shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold">Shipping Method</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div
                  onClick={() => handleShippingSelect({ name: "Standard", price: 15 })}
                  className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition ${selectedShipping.name === "Standard" ? "border-blue-600 bg-blue-50" : "hover:border-gray-400"
                    }`}
                >
                  <div>
                    <div className="font-medium text-gray-900">Standard Shipping</div>
                    <div className="text-sm text-gray-600">5-7 business days</div>
                  </div>
                  <div className="font-semibold text-gray-900">{formatCurrency(15)}</div>
                </div>

                <div
                  onClick={() => handleShippingSelect({ name: "Express", price: 25 })}
                  className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition ${selectedShipping.name === "Express" ? "border-blue-600 bg-blue-50" : "hover:border-gray-400"
                    }`}
                >
                  <div>
                    <div className="font-medium text-gray-900">Express Shipping</div>
                    <div className="text-sm text-gray-600">2-3 business days</div>
                  </div>
                  <div className="font-semibold text-gray-900">{formatCurrency(25)}</div>
                </div>
              </CardContent>
            </Card>

            {/* Complete Order Button */}
            <div className="pt-4">
              <Button
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-4 lg:py-6 text-base lg:text-lg"
                size="lg"
              >
                <Shield className="w-4 h-4 lg:w-5 lg:h-5 mr-2" />
                Complete Order
              </Button>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:sticky lg:top-8 lg:self-start space-y-4">
            <OrderSummary items={items} subtotal={subtotal} shipping={selectedShipping.price} tax={tax} total={total} />

            {/* Trust Signals */}
            <div className="p-4 bg-white border rounded-lg flex items-center gap-2 text-sm text-gray-600">
              <Lock className="w-4 h-4" />
              <span>Your information is secure and encrypted</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
