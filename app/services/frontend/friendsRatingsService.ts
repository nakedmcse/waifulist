import type { FriendRating } from "@/types/anime";

export async function fetchFriendsRatings(animeId: number): Promise<FriendRating[]> {
    try {
        const response = await fetch(`/api/anime/${animeId}/friends-ratings`);
        if (!response.ok) {
            return [];
        }
        const data = await response.json();
        return data.friendsRatings || [];
    } catch (error) {
        console.error("Failed to fetch friends ratings:", error);
        return [];
    }
}
