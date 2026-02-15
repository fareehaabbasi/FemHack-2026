import React from "react";
import { NavbarMenu } from "../data/NavData";
import { FaShoppingCart } from "react-icons/fa";
import { GiHamburgerMenu } from "react-icons/gi";
import ResponsiveMenu from "./ResponsiveNavenu";
import client from "../Config/config";
import { useNavigate } from "react-router-dom";

import { Link, useLocation } from "react-router-dom";

export default function Navbar() {
  const [open, setOpen] = React.useState(false);

  // React me current path lene ka tarika
  const location = useLocation();
  const pathname = location.pathname;

  const navigate = useNavigate();

  const handleLogout = async () => {
    await client.auth.signOut();
    navigate("/login");
  };

  return (
    <>
      <nav>
        <div className="container max-w-full">
          <div className="flex items-center max-w-6xl mx-auto px-4 justify-between py-2">
            {/* logo section */}
            <div className="flex items-center justify-between space-x-2">
              <div className="md:block hidden">
                <img src="../assets/Images/logo.png" alt="logo" className="h-12 w-auto" />
              </div>

              <div className="md:hidden sm:block min-[640px]:hidden max-[400px]:hidden">
                <h2 className="sm:text-xl" style={{ fontFamily: "LostFish" }}>
                  WebDev
                </h2>
              </div>
            </div>

            {/* Menu section */}
            <div className="hidden md:flex items-center gap-7">
              <ul className="flex items-center gap-3 font-medium">
                {NavbarMenu.map((item) => {
                  const active = pathname === item.link;

                  return (
                    <li key={item.id}>
                      <Link
                        to={item.link}
                        className={`
                          inline-block text-base py-2 px-3 cursor-pointer
                          ${
                            active
                              ? "text-primaryBlue font-semibold border-b-2 border-primaryBlue"
                              : "text-darkNavy"
                          }
                        `}
                      >
                        {item.title}
                      </Link>
                    </li>
                  );
                })}
              </ul>

              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded"
              >
                Logout
              </button>
            </div>

            {/* Mobile menu */}
            <div
              className="md:hidden flex items-center gap-4"
              onClick={() => setOpen(!open)}
            >
              <button className="text-2xl hover:bg-sky-800 hover:text-white rounded-full p-3 duration-200">
                <FaShoppingCart size={26} />
              </button>

              <GiHamburgerMenu className="text-3xl cursor-pointer" />
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile sidebar */}
      <ResponsiveMenu open={open} setOpen={setOpen} />
    </>
  );
}
