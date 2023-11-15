import Link from 'next/link';
import { useUser, useSignOut } from '../hooks/user';
// import { useState, useEffect } from 'react';
// import { fetchJson } from '../lib/api';

function NavBar() {
  const user = useUser();
  const signOut = useSignOut();

  // const [user, setUser] = useState();

  /*
  useEffect(() => {
    async function getUser() {
      try {
        const user = await fetchJson('/api/user');
        setUser(user);
      } catch (err) {
        // not signed in
      }
    }
    getUser();
  }, []);
  */

  /*
  const handleSignOut = async () => {
    await fetch('/api/logout');
    setUser(undefined);
  };
  */

  return (
    <nav className="px-2 py-1">
      <ul className="flex gap-2">
        <li className="text-lg font-extrabold">
          <Link href="/">Next Shop</Link>
        </li>
        <li role="separator" className="flex-1"></li>
        {user ? (
          <>
            <li>
              <Link href="/cart">Cart</Link>
            </li>
            <li>{user.name}</li>
            <li>
              <button onClick={signOut}>Sign Out</button>
            </li>
          </>
        ) : (
          <li>
            <Link href="/sign-in">Sign In</Link>
          </li>
        )}
      </ul>
    </nav>
  );
}

export default NavBar;
