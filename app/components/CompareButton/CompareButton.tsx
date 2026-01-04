"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/Button/Button";

interface CompareButtonProps {
    targetUuid: string;
}

export function CompareButton({ targetUuid }: CompareButtonProps) {
    const { user, loading } = useAuth();
    const router = useRouter();

    if (loading || !user || user.publicId === targetUuid) {
        return null;
    }

    return (
        <Button variant="secondary" size="sm" onClick={() => router.push(`/compare/${targetUuid}`)}>
            <i className="bi bi-arrow-left-right" style={{ marginRight: 6 }} />
            Compare
        </Button>
    );
}
