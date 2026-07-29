import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-8 py-4">

        <Link
          to="/"
          className="text-2xl font-bold text-indigo-600"
        >
          ResumeAI
        </Link>

        <div className="hidden md:flex gap-8 text-gray-700">

          <a href="#features">Features</a>

          <a href="#how">How it Works</a>

          <a href="#faq">FAQ</a>

        </div>

        <div className="hidden md:flex gap-4">

          <Link to="/login">

            <button className="px-5 py-2 rounded-lg hover:bg-gray-100">

              Login

            </button>

          </Link>

          <Link to="/register">

            <button className="bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700">

              Get Started

            </button>

          </Link>

        </div>

        <button
          className="md:hidden"
          onClick={() => setOpen(!open)}
        >
          {open ? <X /> : <Menu />}
        </button>

      </div>

      {open && (
        <div className="md:hidden bg-white border-t p-5 flex flex-col gap-5">

          <a href="#features">Features</a>

          <a href="#how">How it Works</a>

          <a href="#faq">FAQ</a>

          <Link to="/login">Login</Link>

          <Link to="/register">Register</Link>

        </div>
      )}
    </nav>
  );
}

export default Navbar;