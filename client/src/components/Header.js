import React from "react";
import "../components/Header.css";

const Header = () => {
    return (
        <header className="header-container">
            <div className="header-sections">
                <nav className="nav-container">
                    <img src="https://cdn-icons-png.flaticon.com/512/3790/3790699.png" alt="logo" className="app-logo" />
                    <a href="../public/index.html" className="header-title">Pay<span>Ments</span></a>
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

