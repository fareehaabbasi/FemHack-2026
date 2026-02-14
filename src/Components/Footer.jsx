import React from 'react'
import { FaFacebook } from "react-icons/fa6";
import { FaInstagram } from "react-icons/fa";
import { FaLinkedinIn } from "react-icons/fa6";
import { IoLocationOutline } from "react-icons/io5";
import { FiPhone } from "react-icons/fi";
import { MdOutlineEmail } from "react-icons/md";

const Footer = () => {
    return (
        <footer className='bg-blue-400 py-4'>
            <div className='max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-3 py-12 gap-10'>
                <div>
                    <h2 className='text-lg font-bold mb-4 text-white'>
                        About Us
                    </h2>
                    <p className='text-gray-300 text-sm leading-relaxed md:text-base max-w-sm'>Delivering the freshest seafood straight from the ocean — sustainably sourced, hygienically handled, and full of natural flavor.</p>
                    <ul className='flex space-x-4 mt-6'>
                        <li>
                            <FaFacebook className='text-blue-600 w-7 h-7'/>
                            <a href="" className='hover:underline text-gray-300 text-sm'>Facebook</a></li>
                        <li>
                            <FaInstagram className='text-pink-700 w-7 h-7'/>
                            <a href="" className='hover:underline text-gray-300 text-sm'>Instagram</a></li>
                        <li>
                            <FaLinkedinIn className='text-blue-500 w-7 h-7'/>
                            <a href="" className='hover:underline text-gray-300 text-sm'>Linkedin</a></li>                   
                    </ul>
                </div>
                <div className=''>
                    <h2 className='text-lg font-bold mb-4 text-white'>
                        Quick Links
                    </h2>
                    <div>
                        <ul className='grid grid-cols-2 gap-y-3'>
                        <li className='text-sm'><a href="/" className='hover:underline hover:text-white text-gray-400 uppercase block'>Home</a></li>
                        <li className='text-sm'><a href="/about" className='hover:underline hover:text-white text-gray-400 uppercase block'>About</a></li>
                        <li className='text-sm'><a href="/products" className='hover:underline hover:text-white text-gray-400 uppercase block'>Products</a></li>   
                        <li className='text-sm'><a href="/contact-us" className='hover:underline hover:text-white text-gray-400 uppercase block'>Contact</a></li>
                        <li className='text-sm'><a href="/explore" className='hover:underline hover:text-white text-gray-400 uppercase block'>Explore</a></li>
                        <li className='text-sm'><a href="/faq" className='hover:underline hover:text-white text-gray-400 uppercase block'>Faq</a></li>                 
                    </ul>
                    </div>
                </div>
                <div>
                    <h2 className='text-lg font-bold mb-4 text-white'>
                        Contact
                    </h2>
                    <ul className='text-white space-y-4'>
                        <li className='text-sm flex items-center gap-3 text-gray-300'><IoLocationOutline className='font-bold text-lg'/> Fishrie Keamari, Karachi</li>
                        <li className='text-sm flex items-center gap-3 text-gray-300'><FiPhone className='font-bold text-lg'/> +92 315 0299595</li>
                        <li className='text-sm flex items-center gap-3 text-gray-300'><MdOutlineEmail className='font-bold text-lg'/> meltemseafood@gmail.com</li>
                    </ul>
                </div>
            </div>
            <div className='border-t border-gray-700 text-gray-500 text-center mt-6 pt-4'>
                <p>© 2025 Meltem Sea Food All rights reserved.</p>
            </div>
        </footer>
    )
}

export default Footer
