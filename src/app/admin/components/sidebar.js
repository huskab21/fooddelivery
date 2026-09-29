"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { UtensilsCrossed, Truck } from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 min-h-screen p-6 bg-white border-r border-gray-200">
      <div className="mt-9 h-11 relative w-[165px] ml-5">
        <Image
          src="/pictures/Logocontainer.png"
          alt="NomNom"
          className="rounded-xl object-contain"
          priority
          fill
          sizes="165px"
        />
      </div>

      <nav className="space-y-4 mt-10 my-5">
        {[
          ["Food menu", "/admin/categories", UtensilsCrossed],
          ["Orders", "/admin/orders", Truck],
        ].map(([label, href, Icon]) => {
          const isActive = pathname === href;
          return (
            <Link
              key={label}
              href={href}
              className={`flex items-center rounded-full px-4 py-3 text-sm font-medium transition gap-4 ${
                isActive
                  ? "bg-black text-white"
                  : "bg-white text-black border border-gray-300 hover:bg-gray-50"
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
