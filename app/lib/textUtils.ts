export interface FormattedParagraph {
    text: string;
    isAttribution: boolean;
}

export function formatLongText(text: string): FormattedParagraph[] {
    const paragraphs = text.split(/\n\n+/).filter(p => p.trim());

    if (paragraphs.length === 1 && text.length > 400) {
        const result: FormattedParagraph[] = [];
        let remaining = text;

        const attributionMatch = remaining.match(/\s*\[([^\]]+)]\s*$/);
        let attribution = "";
        if (attributionMatch) {
            attribution = `[${attributionMatch[1]}]`;
            remaining = remaining.slice(0, attributionMatch.index).trim();
        }

        const sentences = remaining.split(/(?<=[.!?])\s+(?=[A-Z])/);
        let currentParagraph = "";

        for (const sentence of sentences) {
            if (currentParagraph.length + sentence.length > 350 && currentParagraph.length > 200) {
                result.push({ text: currentParagraph.trim(), isAttribution: false });
                currentParagraph = sentence;
            } else {
                currentParagraph += (currentParagraph ? " " : "") + sentence;
            }
        }

        if (currentParagraph.trim()) {
            result.push({ text: currentParagraph.trim(), isAttribution: false });
        }

        if (attribution) {
            result.push({ text: attribution, isAttribution: true });
        }

        return result;
    }

    return paragraphs.map((p, i) => ({
        text: p,
        isAttribution: i === paragraphs.length - 1 && p.startsWith("["),
    }));
}
