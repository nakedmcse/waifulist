import nextConfig from "eslint-config-next/core-web-vitals";
import nextTypescriptConfig from "eslint-config-next/typescript";

const eslintConfig = [
    ...nextConfig,
    ...nextTypescriptConfig,
    {
        ignores: ["node_modules/**", ".next/**", "out/**", "build/**", "next-env.d.ts"],
    },
    {
        rules: {
            curly: ["error", "all"],
        },
    },
    {
        files: ["**/opengraph-image.tsx"],
        rules: {
            "@next/next/no-img-element": "off",
        },
    },
];

export default eslintConfig;
