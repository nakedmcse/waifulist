"use client";

import React from "react";
import { Button } from "@/components/Button/Button";
import styles from "./Pagination.module.scss";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
    if (totalPages <= 1) {
        return null;
    }

    return (
        <div className={styles.pagination}>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
            >
                <i className="bi bi-chevron-left" /> Previous
            </Button>
            <span className={styles.pageInfo}>
                Page {currentPage} of {totalPages}
            </span>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
            >
                Next <i className="bi bi-chevron-right" />
            </Button>
        </div>
    );
}
