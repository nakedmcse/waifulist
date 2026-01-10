"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import styles from "./UserDropdown.module.scss";

export function UserDropdown() {
    const { user, logout } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);

    if (!user) {
        return null;
    }

    const handleLogout = () => {
        setIsOpen(false);
        void logout();
    };

    return (
        <div className={styles.dropdown} ref={dropdownRef}>
            <button className={styles.trigger} onClick={() => setIsOpen(!isOpen)}>
                <i className="bi bi-person-circle" />
                <span className={styles.username}>{user.username}</span>
                <i className={`bi bi-chevron-${isOpen ? "up" : "down"} ${styles.chevron}`} />
            </button>

            {isOpen && (
                <div className={styles.menu}>
                    <Link href="/my-list" className={styles.menuItem} onClick={() => setIsOpen(false)}>
                        <i className="bi bi-bookmark" />
                        <span>My List</span>
                    </Link>
                    <Link href="/tierlist" className={styles.menuItem} onClick={() => setIsOpen(false)}>
                        <i className="bi bi-list-ol" />
                        <span>My Tier Lists</span>
                    </Link>
                    <Link href="/profile" className={styles.menuItem} onClick={() => setIsOpen(false)}>
                        <i className="bi bi-person" />
                        <span>Profile</span>
                    </Link>
                    <Link href="/settings" className={styles.menuItem} onClick={() => setIsOpen(false)}>
                        <i className="bi bi-gear" />
                        <span>Settings</span>
                    </Link>
                    <div className={styles.divider} />
                    <button className={styles.menuItem} onClick={handleLogout}>
                        <i className="bi bi-box-arrow-right" />
                        <span>Sign Out</span>
                    </button>
                </div>
            )}
        </div>
    );
}
