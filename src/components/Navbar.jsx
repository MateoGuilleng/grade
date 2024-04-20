import React from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
function Navbar() {
  return (
    <div className="w-full h-16 backdrop-filter backdrop-blur-xl bg-opacity-20 border-b flex items-center justify-center sticky  top-0 z-10 bg-fuchsia-950">
      <div className="max-w-7xl w-full flex items-center justify-between p-4 backdrop-filter ">
        <Link
          className="hover:text-fuchsia-500 transition-colors text-xs sm:text-base"
          href="/"
        >
          Insightful
        </Link>
        <ul className="flex gap-8">
          <li>
            <Link
              className="hover:text-fuchsia-500 transition-colors text-xs sm:text-base"
              href="home"
            >
              Search proyects
            </Link>
          </li>
          <li>
            <Link
              className="hover:text-fuchsia-500 transition-colors text-xs sm:text-base"
              href="/dashboard"
            >
              dashboard
            </Link>
          </li>
          <li>
            <button
              onClick={() => signOut()}
              className="hover:text-fuchsia-500 transition-colors text-xs sm:text-base"
            >
              Sign Out
            </button>
          </li>
          <li>
            <Link
              className="hover:text-fuchsia-500 hover:border-fuchsia-500 transition-colors text-xs sm:text-base border-2 px-3 py-1 rounded"
              href="proyects"
            >
              proyects
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default Navbar;
