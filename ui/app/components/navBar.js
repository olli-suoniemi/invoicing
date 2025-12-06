'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const NavBar = () => {
  const router = useRouter();

  const handleLogout = async () => {
    // Send a request to the logout API to clear the cookie
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });

      if (response.ok) {
        // Redirect to the login page after successful logout
        router.push('/login');
      } else {
        // Handle error (optional)
        console.error('Logout failed');
      }
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <div className="navbar bg-neutral-content py-6 shadow-md">
      <div className="navbar-start">
        <Link className="btn btn-ghost text-xl" href="/">
          WigCRM
        </Link>
      </div>
      <div className="navbar-center hidden md:flex">

        <div className="dropdown dropdown-hover">
          <div>
            <Link className="btn btn-ghost" href="/customers">
              Customers
            </Link>
          </div>
        </div>

        <div className="dropdown dropdown-hover">
          <div>
            <Link className="btn btn-ghost" href="/orders">
              Orders
            </Link>
          </div>
        </div>

        <div className="dropdown dropdown-hover">
          <div>
            <Link className="btn btn-ghost" href="/invoices">
              Invoices
            </Link>
          </div>
        </div>

        <div className="dropdown dropdown-hover">
          <div>
            <Link className="btn btn-ghost" href="/inventory">
              Inventory
            </Link>
          </div>
        </div>

      </div>
      <div className="navbar-end gap-4">
        <div>
          <Link className="btn btn-ghost" href="/settings">
            Settings
          </Link>
        </div>
        <div onClick={handleLogout}>
          <a className="btn btn-ghost">Logout</a>
        </div>
      </div>
    </div>
  );
};

export default NavBar;