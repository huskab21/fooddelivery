"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  MapPin,
  ChevronRight,
  ShoppingCart,
  User,
  X,
  Plus,
  Minus,
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { createOrder, getErrorMessage } from "@/app/_api/api";
import { OrderHistory } from "@/components/shared/order-history";
import { EmptyState } from "@/components/shared/empty-state";
import { LocationPickerModal } from "@/components/shared/location-picker-modal";
import {
  useDeliveryLocation,
  saveDeliveryLocation,
  formatLocation,
} from "@/lib/delivery-location";
import {
  rememberCheckoutIntent,
  consumeCheckoutIntent,
} from "@/lib/auth-redirect";

// Cart өөрчлөгдөх бүрд бусад component-д мэдэгдэх custom event
const CART_UPDATED_EVENT = "cart-updated";
const SHIPPING_FEE = 0.99;
const PHONE_REGEX = /^\d{8}$/; // Монгол дугаар 8 оронтой

const LOGIN_PATH = "/login";
const SIGNUP_PATH = "/signup";

export function dispatchCartUpdated() {
  window.dispatchEvent(new Event(CART_UPDATED_EVENT));
}

const isLoggedIn = () => !!localStorage.getItem("token");

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const deliveryLocation = useDeliveryLocation();

  const [showCart, setShowCart] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [activeTab, setActiveTab] = useState("cart");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [showOrderSuccess, setShowOrderSuccess] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const loadCart = () => {
    try {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      setCartItems(cart);
    } catch (err) {
      console.error("Cart уншихад алдаа гарлаа:", err);
      setCartItems([]);
    }
  };

  const loadUser = () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "null");
      if (user?.email) return setUserEmail(user.email);

      const token = localStorage.getItem("token");
      if (token) {
        const base64 = token
          .split(".")[1]
          .replace(/-/g, "+")
          .replace(/_/g, "/");
        const payload = JSON.parse(atob(base64));
        return setUserEmail(payload.email || "");
      }
    } catch (err) {
      console.error("Хэрэглэгч уншихад алдаа гарлаа:", err);
    }
    setUserEmail("");
  };

  const handleSignOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUserEmail("");
    setShowUserMenu(false);
    router.push("/");
    router.refresh();
  };

  useEffect(() => {
    loadCart();
    loadUser();
    // Өмнө оруулсан утасны дугаарыг сэргээнэ
    setPhoneNumber(localStorage.getItem("phoneNumber") || "");

    const handleCartUpdated = () => loadCart();
    const handleStorage = () => {
      loadCart();
      loadUser();
    };
    window.addEventListener(CART_UPDATED_EVENT, handleCartUpdated);
    window.addEventListener("storage", handleStorage); // өөр tab-с өөрчлөгдвөл

    return () => {
      window.removeEventListener(CART_UPDATED_EVENT, handleCartUpdated);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  // Хуудас солигдох бүрд (жишээ нь login-оос буцаж ирэхэд) хэрэглэгчийг дахин уншиж,
  // checkout-аас login руу явсан бол cart-ыг автоматаар дахин нээнэ.
  // Header layout дотор байгаа бол remount болохгүй тул pathname-г dependency болгосон.
  useEffect(() => {
    loadUser();
    loadCart();
    if (!isLoggedIn()) return;

    const intent = consumeCheckoutIntent();
    if (intent?.openCart) {
      setActiveTab("cart");
      setShowUserMenu(false);
      setShowCart(true);
    }
  }, [pathname]);

  const saveCart = (updatedCart) => {
    setCartItems(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    dispatchCartUpdated();
  };

  const increaseQuantity = (foodId) => {
    const updated = cartItems.map((item) =>
      item._id === foodId ? { ...item, quantity: item.quantity + 1 } : item,
    );
    saveCart(updated);
  };

  const decreaseQuantity = (foodId) => {
    const updated = cartItems
      .map((item) =>
        item._id === foodId ? { ...item, quantity: item.quantity - 1 } : item,
      )
      .filter((item) => item.quantity > 0);
    saveCart(updated);
  };

  const removeItem = (foodId) => {
    const updated = cartItems.filter((item) => item._id !== foodId);
    saveCart(updated);
  };

  // Зөвхөн цифр, 8 оронгоос хэтрэхгүй
  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 8);
    setPhoneNumber(value);
    localStorage.setItem("phoneNumber", value);
  };

  const openLocationPicker = () => {
    setShowUserMenu(false);
    setShowLocationPicker(true);
  };

  // Хадгалмагц header болон cart хоёулаа useDeliveryLocation-оор шинэчлэгдэнэ
  const handleLocationConfirm = (location) => {
    saveDeliveryLocation(location);
    setShowLocationPicker(false);
  };

  // Popup-аас Log in / Sign up дарахад: одоогийн хуудсыг санаад auth хуудас руу шилжинэ.
  // Cart localStorage-д байгаа тул алга болохгүй.
  const goToAuth = (authPath) => {
    rememberCheckoutIntent(pathname);
    setShowLoginPrompt(false);
    setShowCart(false);
    router.push(authPath);
  };

  // Backend руу захиалга илгээнэ. Үнийг серверт дахин тооцдог тул зөвхөн id, quantity явуулна
  const handleCheckout = async () => {
    // Нэвтрээгүй бол захиалга илгээхгүй, popup харуулна
    if (!isLoggedIn()) {
      setShowLoginPrompt(true);
      return;
    }

    setPlacingOrder(true);
    try {
      await createOrder({
        foodOrderItems: cartItems.map((item) => ({
          food: item._id,
          quantity: item.quantity,
        })),
        address: formatLocation(deliveryLocation),
        phoneNumber,
        location: { lat: deliveryLocation.lat, lng: deliveryLocation.lng },
      });
      saveCart([]);
      setShowCart(false);
      setShowOrderSuccess(true);
    } catch (err) {
      alert(getErrorMessage(err));
    } finally {
      setPlacingOrder(false);
    }
  };

  const itemsTotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const isCartEmpty = cartItems.length === 0;
  const grandTotal = isCartEmpty ? 0 : itemsTotal + SHIPPING_FEE;
  const isPhoneValid = PHONE_REGEX.test(phoneNumber);
  const canCheckout =
    !isCartEmpty && !!deliveryLocation && isPhoneValid && !placingOrder;

  return (
    <nav className="w-full h-17 bg-[#111111] flex items-center justify-between px-8 relative">
      {/* Лого */}
      <div
        onClick={() => router.push("/")}
        className="h-11 relative w-41.25 cursor-pointer"
      >
        <Image
          src="/pictures/Logocontainerwhite.png"
          alt="NomNom"
          className="rounded-xl object-contain"
          priority
          fill
          sizes="165px"
        />
      </div>

      {/* Товчлуурууд */}
      <div className="flex items-center gap-4">
        {/* Хүргэлтийн хаяг — сонгосон бол хаягийг харуулна */}
        <button
          onClick={() => {
            setShowCart(false);
            openLocationPicker();
          }}
          title={deliveryLocation ? formatLocation(deliveryLocation) : undefined}
          className="flex items-center gap-2 bg-white rounded-full px-5 py-2.5 text-sm cursor-pointer hover:bg-gray-100 transition-colors max-w-md"
        >
          <MapPin className="w-4 h-4 text-red-500 shrink-0" />
          <span className="text-gray-500 shrink-0">Delivery address:</span>
          <span className="font-semibold text-black truncate">
            {deliveryLocation ? formatLocation(deliveryLocation) : "Add Location"}
          </span>
          <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
        </button>

        <div className="relative">
          <button
            onClick={() => {
              setShowUserMenu(false);
              setShowCart((prev) => !prev);
            }}
            className="flex items-center justify-center w-10 h-10 bg-white rounded-full hover:bg-gray-100 transition-colors cursor-pointer relative"
            aria-label="Cart"
          >
            <ShoppingCart className="w-5 h-5 text-black" />
            {cartItems.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-semibold rounded-full w-4.5 h-4.5 flex items-center justify-center">
                {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
            )}
          </button>

          {/* Cart Popup */}
          {showCart && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowCart(false)}
              />

              <div className="absolute right-0 top-full mt-3 w-96 max-w-[90vw] bg-[#404040] rounded-3xl shadow-xl z-50 p-5 max-h-[85vh] overflow-y-auto">
                {/* Header мөр */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-white">
                    <ShoppingCart className="w-5 h-5" />
                    <h3 className="text-lg font-bold">Order detail</h3>
                  </div>
                  <button
                    onClick={() => setShowCart(false)}
                    className="w-8 h-8 rounded-full border border-white/40 flex items-center justify-center text-white hover:bg-white/10"
                    aria-label="Close"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Cart / Order tab */}
                <div className="bg-white rounded-full p-1 flex mb-4">
                  <button
                    onClick={() => setActiveTab("cart")}
                    className={`flex-1 rounded-full py-2 text-sm font-semibold transition-colors ${
                      activeTab === "cart"
                        ? "bg-red-500 text-white"
                        : "text-slate-500"
                    }`}
                  >
                    Cart
                  </button>
                  <button
                    onClick={() => setActiveTab("order")}
                    className={`flex-1 rounded-full py-2 text-sm font-semibold transition-colors ${
                      activeTab === "order"
                        ? "bg-red-500 text-white"
                        : "text-slate-500"
                    }`}
                  >
                    Order
                  </button>
                </div>

                {activeTab === "cart" ? (
                  <>
                    {/* My cart карт */}
                    <div className="bg-white rounded-2xl p-4 mb-4">
                      <p className="text-sm font-medium text-slate-400 mb-3">
                        My cart
                      </p>

                      {cartItems.length === 0 ? (
                        <EmptyState
                          title="Your cart is empty"
                          description="Hungry? 🍔 Add some delicious dishes to your cart and satisfy your cravings!"
                        />
                      ) : (
                        <div className="flex flex-col gap-3">
                          {cartItems.map((item) => (
                            <div
                              key={item._id}
                              className="relative flex gap-3 rounded-xl border border-slate-200 p-3"
                            >
                              <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-slate-100">
                                <Image
                                  src={
                                    item.imageUrl || "/pictures/placeholder.png"
                                  }
                                  alt={item.foodName}
                                  fill
                                  sizes="64px"
                                  className="object-cover"
                                />
                              </div>

                              <div className="flex-1 min-w-0 pr-6">
                                <p className="text-sm font-semibold text-red-500 truncate">
                                  {item.foodName}
                                </p>
                                <p className="text-xs text-slate-400 line-clamp-2 mt-0.5">
                                  {item.description}
                                </p>

                                <div className="flex items-center justify-between mt-2">
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => decreaseQuantity(item._id)}
                                      className="w-6 h-6 rounded-full border border-slate-300 flex items-center justify-center hover:bg-slate-50"
                                      aria-label="Decrease quantity"
                                    >
                                      <Minus className="w-3 h-3" />
                                    </button>
                                    <span className="w-4 text-center text-sm font-semibold">
                                      {item.quantity}
                                    </span>
                                    <button
                                      onClick={() => increaseQuantity(item._id)}
                                      className="w-6 h-6 rounded-full border border-slate-300 flex items-center justify-center hover:bg-slate-50"
                                      aria-label="Increase quantity"
                                    >
                                      <Plus className="w-3 h-3" />
                                    </button>
                                  </div>

                                  <span className="text-sm font-bold text-black">
                                    ${(item.price * item.quantity).toFixed(2)}
                                  </span>
                                </div>
                              </div>

                              <button
                                onClick={() => removeItem(item._id)}
                                className="absolute top-2 right-2 w-6 h-6 rounded-full border border-red-300 flex items-center justify-center text-red-500 hover:bg-red-50"
                                aria-label="Remove"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Хаяг + утас — сагс хоосон үед нуугдана */}
                      {cartItems.length > 0 && (
                        <div className="mt-5 flex flex-col gap-4">
                          <div>
                            <p className="text-sm font-medium text-slate-400 mb-2">
                              Delivery location
                            </p>
                            <button
                              type="button"
                              onClick={openLocationPicker}
                              className="w-full flex items-start gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-left text-sm hover:border-red-500 transition-colors cursor-pointer"
                            >
                              <MapPin className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                              {deliveryLocation ? (
                                <span className="flex-1 text-black line-clamp-2">
                                  {formatLocation(deliveryLocation)}
                                </span>
                              ) : (
                                <span className="flex-1 text-slate-400">
                                  Pick your location on the map
                                </span>
                              )}
                              <span className="text-xs font-semibold text-red-500 shrink-0">
                                {deliveryLocation ? "Change" : "Select"}
                              </span>
                            </button>
                          </div>

                          <div>
                            <label
                              htmlFor="phone-number"
                              className="block text-sm font-medium text-slate-400 mb-2"
                            >
                              Phone number
                            </label>
                            <input
                              id="phone-number"
                              type="tel"
                              inputMode="numeric"
                              autoComplete="tel"
                              value={phoneNumber}
                              onChange={handlePhoneChange}
                              placeholder="99112233"
                              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-red-500 focus:outline-none"
                            />
                            {phoneNumber && !isPhoneValid && (
                              <p className="mt-1 text-xs text-red-500">
                                Phone number must be 8 digits
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Payment info карт — хоосон үед "-" харуулна */}
                    <div className="bg-white rounded-2xl p-4">
                      <p className="text-sm font-medium text-slate-400 mb-3">
                        Payment info
                      </p>

                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-slate-400">Items</span>
                        <span className="font-bold text-black">
                          {isCartEmpty ? "-" : `$${itemsTotal.toFixed(2)}`}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm mb-3">
                        <span className="text-slate-400">Shipping</span>
                        <span className="font-bold text-black">
                          {isCartEmpty ? "-" : `${SHIPPING_FEE.toFixed(2)}$`}
                        </span>
                      </div>

                      <div className="border-t border-dashed border-slate-200 my-2" />

                      <div className="flex items-center justify-between mb-4">
                        <span className="text-slate-500">Total</span>
                        <span className="text-lg font-bold text-black">
                          {isCartEmpty ? "-" : `$${grandTotal.toFixed(2)}`}
                        </span>
                      </div>

                      <button
                        onClick={handleCheckout}
                        disabled={!canCheckout}
                        className="w-full rounded-full bg-red-500 px-4 py-3 text-sm font-semibold text-white hover:bg-red-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {placingOrder ? "Placing order…" : "Checkout"}
                      </button>
                    </div>
                  </>
                ) : (
                  <OrderHistory />
                )}
              </div>
            </>
          )}

          {showOrderSuccess && (
            <div className="bg-white w-166 h-110 fixed inset-0 z-[60] flex flex-col items-center gap-4 mt-6 justify-center rounded-3xl top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <span>Your order has been successfully placed !</span>
              <Image
                src="/pictures/illustration.png"
                alt="Order success illustration"
                width={156}
                height={265}
              />
              <button
                onClick={() => {
                  setShowOrderSuccess(false);
                  router.push("/");
                }}
                className="bg-slate-200 rounded-3xl h-11 w-47 cursor-pointer"
              >
                Back to Home
              </button>
            </div>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => {
              setShowCart(false);
              setShowUserMenu((prev) => !prev);
            }}
            className="flex items-center justify-center w-10 h-10 bg-red-500 rounded-full hover:bg-red-600 transition-colors cursor-pointer"
            aria-label="User menu"
          >
            <User className="w-5 h-5 text-white" />
          </button>

          {showUserMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowUserMenu(false)}
              />
              <div className="absolute right-0 top-full mt-3 z-50 bg-white rounded-xl shadow-xl p-4 flex flex-col items-center gap-2">
                {userEmail ? (
                  <>
                    <p className="text-xl font-semibold text-black whitespace-nowrap">
                      {userEmail}
                    </p>
                    <button
                      onClick={handleSignOut}
                      className="rounded-full bg-slate-100 px-3 py-2 text-sm font-medium text-black hover:bg-slate-200 transition-colors cursor-pointer"
                    >
                      Sign out
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      router.push(LOGIN_PATH);
                    }}
                    className="rounded-full bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600 whitespace-nowrap cursor-pointer"
                  >
                    Log in
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* "You need to log in first" popup — cart-аас дээгүүр гарна (z-70) */}
      {showLoginPrompt && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 px-4"
          onClick={() => setShowLoginPrompt(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="login-prompt-title"
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
          >
            <button
              onClick={() => setShowLoginPrompt(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 cursor-pointer"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>

            <h3
              id="login-prompt-title"
              className="text-center text-xl font-semibold text-black mt-2"
            >
              You need to log in first
            </h3>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                onClick={() => goToAuth(LOGIN_PATH)}
                className="rounded-lg bg-black py-2.5 text-sm font-medium text-white hover:bg-black/85 cursor-pointer"
              >
                Log in
              </button>
              <button
                onClick={() => goToAuth(SIGNUP_PATH)}
                className="rounded-lg border border-slate-200 py-2.5 text-sm font-medium text-black hover:bg-slate-50 cursor-pointer"
              >
                Sign up
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Газрын зургаар хаяг сонгох popup — header товч болон cart хоёулаа үүнийг нээнэ */}
      <LocationPickerModal
        open={showLocationPicker}
        initialLocation={deliveryLocation}
        onClose={() => setShowLocationPicker(false)}
        onConfirm={handleLocationConfirm}
      />
    </nav>
  );
}