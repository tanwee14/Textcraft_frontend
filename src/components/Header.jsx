import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Home, Feather, Info, UserPlus, LogIn, User, LogOut,History } from 'lucide-react';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import '../styles/Header.css';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSignOut = () => {
    const auth = getAuth();
    signOut(auth).then(() => setUser(null));
  };

  const navItems = [
    { to: "/", text: "Home", icon: Home },
    { to: "/features", text: "Features", icon: Feather },
    { to: "/about", text: "About", icon: Info },
    !user && { to: "/signup", text: "Sign Up", icon: UserPlus },
    !user && { to: "/login", text: "Login", icon: LogIn },
    user && {to : "/history", text: "History", icon: History}
  ].filter(Boolean);

  return (
    <header className={`header ${scrolled ? 'scrolled' : ''}`}>
      <div className="header-content">
        <Link to="/" className="logo">
          TextCraft
        </Link>
        <nav className={`nav-elements ${isMenuOpen ? 'active' : ''}`}>
          {navItems.map((item, index) => (
            <Link 
              key={item.to} 
              to={item.to} 
              onClick={() => setIsMenuOpen(false)}
              className="nav-item"
            >
              <item.icon className="nav-icon" size={18} />
              <span>{item.text}</span>
            </Link>
          ))}
        </nav>
        {user ? (
          <div className="user-menu">
            <div className="user-info">
              <User size={24} />
              <span>{user.email}</span>
            </div>
            <button className="logout-button" onClick={handleSignOut}>
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        ) : (
          <button className="menu-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        )}
      </div>
    </header>
  );
}