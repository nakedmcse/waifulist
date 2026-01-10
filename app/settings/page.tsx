"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/Button/Button";
import styles from "./page.module.scss";

export default function SettingsPage() {
    const router = useRouter();
    const { user, loading, updateUsername, updatePassword } = useAuth();

    const [newUsername, setNewUsername] = useState("");
    const [usernamePassword, setUsernamePassword] = useState("");
    const [usernameError, setUsernameError] = useState("");
    const [usernameSuccess, setUsernameSuccess] = useState("");
    const [usernameSubmitting, setUsernameSubmitting] = useState(false);

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [passwordSuccess, setPasswordSuccess] = useState("");
    const [passwordSubmitting, setPasswordSubmitting] = useState(false);

    if (loading) {
        return (
            <div className={styles.page}>
                <div className={styles.container}>
                    <div className={styles.card}>
                        <p>Loading...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!user) {
        router.push("/login");
        return null;
    }

    const handleUsernameSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setUsernameError("");
        setUsernameSuccess("");

        const trimmedUsername = newUsername.trim();

        if (!trimmedUsername) {
            setUsernameError("Please enter a new username");
            return;
        }

        if (!usernamePassword) {
            setUsernameError("Please enter your password to confirm");
            return;
        }

        setUsernameSubmitting(true);

        const result = await updateUsername(trimmedUsername, usernamePassword);

        if (result.error) {
            setUsernameError(result.error);
        } else {
            setUsernameSuccess("Username updated successfully");
            setNewUsername("");
            setUsernamePassword("");
        }

        setUsernameSubmitting(false);
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordError("");
        setPasswordSuccess("");

        if (!currentPassword) {
            setPasswordError("Please enter your current password");
            return;
        }

        if (!newPassword) {
            setPasswordError("Please enter a new password");
            return;
        }

        if (newPassword.length < 8) {
            setPasswordError("Password must be at least 8 characters");
            return;
        }

        if (newPassword !== confirmPassword) {
            setPasswordError("Passwords do not match");
            return;
        }

        setPasswordSubmitting(true);

        const result = await updatePassword(currentPassword, newPassword);

        if (result.error) {
            setPasswordError(result.error);
        } else {
            setPasswordSuccess("Password updated successfully");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        }

        setPasswordSubmitting(false);
    };

    return (
        <div className={styles.page}>
            <div className={styles.container}>
                <h1>Settings</h1>
                <p className={styles.subtitle}>Manage your account settings</p>

                <div className={styles.cards}>
                    <div className={styles.card}>
                        <form onSubmit={handleUsernameSubmit} className={styles.form}>
                            <h2>Change Username</h2>

                            {usernameError && <div className={styles.error}>{usernameError}</div>}
                            {usernameSuccess && <div className={styles.success}>{usernameSuccess}</div>}

                            <div className={styles.field}>
                                <label htmlFor="currentUsername">Current Username</label>
                                <input id="currentUsername" type="text" value={user.username} disabled />
                            </div>

                            <div className={styles.field}>
                                <label htmlFor="newUsername">New Username</label>
                                <input
                                    id="newUsername"
                                    type="text"
                                    value={newUsername}
                                    onChange={e => setNewUsername(e.target.value)}
                                    placeholder="Enter new username"
                                    autoComplete="username"
                                />
                            </div>

                            <div className={styles.field}>
                                <label htmlFor="usernamePassword">Password</label>
                                <input
                                    id="usernamePassword"
                                    type="password"
                                    value={usernamePassword}
                                    onChange={e => setUsernamePassword(e.target.value)}
                                    placeholder="Enter your password to confirm"
                                    autoComplete="current-password"
                                />
                            </div>

                            <Button type="submit" disabled={usernameSubmitting} className={styles.submitButton}>
                                {usernameSubmitting ? "Updating..." : "Update Username"}
                            </Button>
                        </form>
                    </div>

                    <div className={styles.card}>
                        <form onSubmit={handlePasswordSubmit} className={styles.form}>
                            <h2>Change Password</h2>

                            {passwordError && <div className={styles.error}>{passwordError}</div>}
                            {passwordSuccess && <div className={styles.success}>{passwordSuccess}</div>}

                            <div className={styles.field}>
                                <label htmlFor="currentPassword">Current Password</label>
                                <input
                                    id="currentPassword"
                                    type="password"
                                    value={currentPassword}
                                    onChange={e => setCurrentPassword(e.target.value)}
                                    placeholder="Enter your current password"
                                    autoComplete="current-password"
                                />
                            </div>

                            <div className={styles.field}>
                                <label htmlFor="newPassword">New Password</label>
                                <input
                                    id="newPassword"
                                    type="password"
                                    value={newPassword}
                                    onChange={e => setNewPassword(e.target.value)}
                                    placeholder="Enter new password (min 8 characters)"
                                    autoComplete="new-password"
                                />
                            </div>

                            <div className={styles.field}>
                                <label htmlFor="confirmPassword">Confirm New Password</label>
                                <input
                                    id="confirmPassword"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={e => setConfirmPassword(e.target.value)}
                                    placeholder="Confirm new password"
                                    autoComplete="new-password"
                                />
                            </div>

                            <Button type="submit" disabled={passwordSubmitting} className={styles.submitButton}>
                                {passwordSubmitting ? "Updating..." : "Update Password"}
                            </Button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
