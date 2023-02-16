import React from "react";
import "./Header.css";
import logo from "../assets/logo.png";

const Header = () => {
    return (
        <header className="header-container">
            <div className="header-sections">
                <nav className="nav-container">
                    <img src={logo} alt="logo" className="app-logo" />
                    <a href="/" className="header-title">Pay<span>Ments</span></a>
                </nav>
                <ul className="navigation-contact-list">
                    <li><a href="mailto:info@payments.com">info@payments.com</a></li>
                    <li><a href="tel:+380001110011">+38 000 111 00 11</a></li>
                </ul>
            </div>
        </header>
    )
}

export default Header;

