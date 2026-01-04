"use client";

import { useBookmarkStatus } from "@/hooks/useBookmarks";
import { Button } from "@/components/Button/Button";

interface BookmarkButtonProps {
    targetUuid: string;
}

export function BookmarkButton({ targetUuid }: BookmarkButtonProps) {
    const { isBookmarked, toggling, toggle, shouldShow } = useBookmarkStatus(targetUuid);

    if (!shouldShow) {
        return null;
    }

    return (
        <Button variant="secondary" size="sm" onClick={toggle} disabled={toggling}>
            <i className={isBookmarked ? "bi bi-bookmark-fill" : "bi bi-bookmark"} style={{ marginRight: 6 }} />
            {isBookmarked ? "Bookmarked" : "Bookmark"}
        </Button>
    );
}
