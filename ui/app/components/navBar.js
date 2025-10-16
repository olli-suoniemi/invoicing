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

  const handleClick = () => {
    const elem = document.activeElement;
    if (elem) {
      elem?.blur();
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
          <div tabIndex={0} role="button" className="btn btn-ghost">Customers ▼</div>
          <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow">
            <li onClick={handleClick}>
              <Link href="/customers">
                All customers
              </Link>
            </li>
            <li onClick={handleClick}>
              <Link href="/customers/new">
                Add new customer
              </Link>
            </li>
          </ul>
        </div>
        
        <div className="dropdown dropdown-hover">
          <div tabIndex={0} role="button" className="btn btn-ghost">Sales ▼</div>
          <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow">
            <li onClick={handleClick}>
              <Link href="/sales">
                All sales
              </Link>
            </li>
            <li onClick={handleClick}>
              <Link href="/sales/new">
                Add new sale
              </Link>
            </li>
          </ul>
        </div>

        <div className="dropdown dropdown-hover">
          <div tabIndex={0} role="button" className="btn btn-ghost">Inventory ▼</div>
          <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow">
            <li onClick={handleClick}>
              <Link href="/inventory">
                All products
              </Link>
            </li>
            <li onClick={handleClick}>
              <Link href="/inventory/new">
                Add new product
              </Link>
            </li>
          </ul>
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