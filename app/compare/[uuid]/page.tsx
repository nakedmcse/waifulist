import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getUserByPublicId } from "@/lib/db/dao/user";
import { ComparePageClient } from "./ComparePageClient";

interface PageProps {
    params: Promise<{ uuid: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { uuid } = await params;
    const targetUser = getUserByPublicId(uuid);

    if (!targetUser) {
        return {
            title: "User Not Found | WaifuList",
        };
    }

    return {
        title: `Compare with ${targetUser.username} | WaifuList`,
        description: `Compare your anime list with ${targetUser.username}'s collection on WaifuList`,
    };
}

export default async function ComparePage({ params }: PageProps) {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
        redirect("/login");
    }

    const { uuid } = await params;
    const targetUser = getUserByPublicId(uuid);

    if (!targetUser) {
        return (
            <div style={{ padding: "2rem", textAlign: "center" }}>
                <h1>User Not Found</h1>
                <p>The user you&apos;re trying to compare with doesn&apos;t exist.</p>
            </div>
        );
    }

    if (currentUser.id === targetUser.id) {
        return (
            <div style={{ padding: "2rem", textAlign: "center" }}>
                <h1>Cannot Compare</h1>
                <p>You cannot compare your list with yourself.</p>
            </div>
        );
    }

    return <ComparePageClient targetUuid={uuid} />;
}
