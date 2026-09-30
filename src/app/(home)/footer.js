"use client"

import React from "react";
import Image from "next/image";
import { FaFacebookF, FaInstagram } from "react-icons/fa";
import { useRouter } from "next/navigation";

export default function Footer() {
  const router = useRouter();
  return (
    <footer className="bg-[#121214] text-gray-300 w-full pt-12 pb-8 sm:pt-16">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 flex flex-wrap justify-between gap-x-10 gap-y-10">
        {/* Лого & Текст */}
        <div className="flex flex-col gap-3 flex-none">
          <div className="flex items-center gap-2">
            <div
              onClick={() => router.push("/")}
              className="h-9 relative w-35 cursor-pointer
            "
            >
              <Image
                src="/pictures/LogoContainerwhite.png"
                alt="NomNom"
                className="object-contain"
                fill
                sizes="140px"
              />
            </div>
          </div>
        </div>

        {/* NOMNOM цэс */}
        <div className="flex-none min-w-[140px]">
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
            NOMNOM
          </h4>
          <ul className="space-y-3 text-sm">
            <li>
              <a href="#" className="hover:text-white transition">
                Home
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-white transition">
                Contact us
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-white transition">
                Delivery zone
              </a>
            </li>
          </ul>
        </div>

        {/* MENU цэс */}
        <div className="flex-none min-w-[260px]">
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
            MENU
          </h4>
          <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <a href="#" className="hover:text-white transition">
              Appetizers
            </a>
            <a href="#" className="hover:text-white transition">
              Side dish
            </a>
            <a href="#" className="hover:text-white transition">
              Salads
            </a>
            <a href="#" className="hover:text-white transition">
              Brunch
            </a>
            <a href="#" className="hover:text-white transition">
              Pizzas
            </a>
            <a href="#" className="hover:text-white transition">
              Desserts
            </a>
            <a href="#" className="hover:text-white transition">
              Main dishes
            </a>
            <a href="#" className="hover:text-white transition">
              Beverages
            </a>
            <a href="#" className="hover:text-white transition">
              Fish & Sea foods
            </a>
          </div>
        </div>

        {/* FOLLOW US */}
        <div className="flex-none">
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
            FOLLOW US
          </h4>
          <div className="flex gap-4">
            <a
              href="#"
              className="p-2.5 bg-gray-800 hover:bg-gray-700 rounded-full text-white transition flex items-center justify-center"
            >
              <FaFacebookF className="w-5 h-5 text-white" />
            </a>
            <a
              href="#"
              className="p-2.5 bg-gray-800 hover:bg-gray-700 rounded-full text-white transition flex items-center justify-center"
            >
              <FaInstagram className="w-5 h-5 text-white" />
            </a>
          </div>
        </div>
      </div>

      {/* Доод талын Copyright */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 mt-12 sm:mt-16">
        <div className="border-t border-gray-800 pt-6 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500 gap-4">
          <p>Copyright 2024 © NomNom LLC</p>
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
            <a href="#" className="hover:text-gray-300">
              Privacy policy
            </a>
            <a href="#" className="hover:text-gray-300">
              Terms and condition
            </a>
            <a href="#" className="hover:text-gray-300">
              Cookie policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
