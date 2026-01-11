"use client";

import { useEffect } from "react";
import styles from "./Modal.module.scss";

interface ModalProps {
    title: string;
    onClose: () => void;
    children: React.ReactNode;
    footer?: React.ReactNode;
}

export function Modal({ title, onClose, children, footer }: ModalProps) {
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onClose();
            }
        };
        document.addEventListener("keydown", handleEsc);
        return () => document.removeEventListener("keydown", handleEsc);
    }, [onClose]);

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <button className={styles.close} onClick={onClose}>
                    <i className="bi bi-x-lg" />
                </button>
                <h3 className={styles.title}>{title}</h3>
                <div className={styles.content}>{children}</div>
                {footer && <div className={styles.footer}>{footer}</div>}
            </div>
        </div>
    );
}
