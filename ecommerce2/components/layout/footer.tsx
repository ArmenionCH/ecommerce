'use client';

import React from 'react';
import Link from 'next/link';
import { BRAND_EMOJI, BRAND_NAME, BRAND_TAGLINE } from '@/lib/branding';
import { useUserSession } from '@/features/auth/hooks/useUserSession';
import { canBrowseMarketplace } from '@/lib/roleRoutes';

export function Footer() {
  const { user } = useUserSession();
  const showMarketplace = canBrowseMarketplace(user?.role);

  return (
    <footer className="border-t border-gray-100 bg-gray-50/50 text-gray-600">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight bg-linear-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                {BRAND_NAME}
              </span>
              <span>{BRAND_EMOJI}</span>
            </div>
            <p className="text-sm max-w-xs text-gray-500">{BRAND_TAGLINE}</p>
          </div>

          {showMarketplace ? (
            <div>
              <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-4">Shop</h4>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <Link href="/" className="hover:text-emerald-600 transition-colors">
                    All products
                  </Link>
                </li>
                <li>
                  <Link href="/?category=electronics" className="hover:text-emerald-600 transition-colors">
                    Electronics
                  </Link>
                </li>
                <li>
                  <Link href="/?category=fashion" className="hover:text-emerald-600 transition-colors">
                    Fashion
                  </Link>
                </li>
              </ul>
            </div>
          ) : (
            <div>
              <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-4">Workspace</h4>
              <ul className="space-y-2.5 text-sm">
                {user?.role === 'seller' && (
                  <>
                    <li>
                      <Link href="/seller" className="hover:text-emerald-600 transition-colors">
                        Seller dashboard
                      </Link>
                    </li>
                    <li>
                      <Link href="/seller/inventory" className="hover:text-emerald-600 transition-colors">
                        My products
                      </Link>
                    </li>
                  </>
                )}
                {user?.role === 'admin' && (
                  <>
                    <li>
                      <Link href="/admin" className="hover:text-emerald-600 transition-colors">
                        Admin dashboard
                      </Link>
                    </li>
                    <li>
                      <Link href="/admin/verifications" className="hover:text-emerald-600 transition-colors">
                        Seller verifications
                      </Link>
                    </li>
                  </>
                )}
              </ul>
            </div>
          )}

          <div>
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-4">Platform</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <span className="text-gray-500">COD checkout</span>
              </li>
              <li>
                <span className="text-gray-500">₱100 flat shipping</span>
              </li>
              <li>
                <span className="text-gray-400">Multi-vendor marketplace</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <p>
            © {new Date().getFullYear()} {BRAND_NAME}. All rights reserved.
          </p>
          <div className="flex gap-4">
            <span>Philippines</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
