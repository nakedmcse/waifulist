import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { ProfilePageClient } from "./ProfilePageClient";
import { createMetadata } from "@/lib/metadata";

export const metadata: Metadata = createMetadata(
    "My Profile | WaifuList",
    "View your anime watching statistics and profile",
);

export default async function ProfilePage() {
    const user = await getCurrentUser();
    if (!user) {
        redirect("/login");
    }

    return <ProfilePageClient />;
}
