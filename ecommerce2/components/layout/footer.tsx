import React from 'react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-gray-50/50 text-gray-600">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Slogan */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight bg-linear-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                Green Market
              </span>
              <span>🥬</span>
            </div>
            <p className="text-sm max-w-xs text-gray-500">
              Your community-driven Cash-on-Delivery agricultural marketplace, bringing farm-fresh harvests straight to your doorstep.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-4">Market</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/" className="hover:text-emerald-600 transition-colors">
                  All Harvests
                </Link>
              </li>
              <li>
                <Link href="/?category=fruits" className="hover:text-emerald-600 transition-colors">
                  Fruits
                </Link>
              </li>
              <li>
                <Link href="/?category=vegetables" className="hover:text-emerald-600 transition-colors">
                  Vegetables
                </Link>
              </li>
            </ul>
          </div>

          {/* Terms & Policies */}
          <div>
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-4">Platform</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <span className="text-gray-500">COD Guarantee</span>
              </li>
              <li>
                <span className="text-gray-500">₱100 Universal Shipping</span>
              </li>
              <li>
                <span className="text-gray-400">Version 2.0 AI-Optimized</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <p>© {new Date().getFullYear()} Green Market. All rights reserved.</p>
          <div className="flex gap-4">
            <span>Bacolod City, Negros Occidental, Philippines</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
