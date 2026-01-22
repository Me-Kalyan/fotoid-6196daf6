export interface CountryRequirement {
    code: string;
    name: string;
    flag: string;
    dimensions: string;
    bgColor: string;
    rules: string[];
    tips: string;
}

export const countryRequirements: CountryRequirement[] = [
    {
        code: "US",
        name: "United States",
        flag: "🇺🇸",
        dimensions: "2×2 inches (51×51 mm)",
        bgColor: "Plain white or off-white",
        rules: [
            "Head height: 1-1 3/8 inches",
            "Eyes: 1 1/8-1 3/8 inches from bottom",
            "No glasses allowed",
            "Neutral expression"
        ],
        tips: "Avoid wearing white to stand out from the background."
    },
    {
        code: "UK",
        name: "United Kingdom",
        flag: "🇬🇧",
        dimensions: "35×45 mm",
        bgColor: "Plain cream or light grey",
        rules: [
            "Head height: 29-34 mm",
            "Matte or gloss finish",
            "No glasses (unless medically necessary)",
            "Digital code support available"
        ],
        tips: "Ensure eyes are fully visible and hair does not cover them."
    },
    {
        code: "IN",
        name: "India",
        flag: "🇮🇳",
        dimensions: "2×2 inches (51×51 mm)",
        bgColor: "Plain white",
        rules: [
            "Head fills 70-80% of photo",
            "Full face, front view",
            "Eyes open and looking at camera",
            "No uniforms"
        ],
        tips: "Maintain a clear distance from the wall to avoid shadows."
    },
    {
        code: "CA",
        name: "Canada",
        flag: "🇨🇦",
        dimensions: "50×70 mm",
        bgColor: "Plain white or light-coloured",
        rules: [
            "Maximum head height: 36 mm",
            "Minimum head height: 31 mm",
            "Commercial photographer stamp required (physical only)",
            "Neural expression"
        ],
        tips: "Canadian photos are larger than standard US sizes."
    },
    {
        code: "AU",
        name: "Australia",
        flag: "🇦🇺",
        dimensions: "35×45 mm",
        bgColor: "Uniform light grey or white",
        rules: [
            "Head height: 32-36 mm",
            "Eyes: 32-36 mm from bottom",
            "No head coverings (except religious)",
            "Mouth closed"
        ],
        tips: "Lighting must be even with no shadows on the face."
    },
    {
        code: "DE",
        name: "Germany",
        flag: "🇩🇪",
        dimensions: "35×45 mm",
        bgColor: "Neutral grey",
        rules: [
            "Biometric compliant",
            "Head height: 32-36 mm",
            "Direct eye contact",
            "Neutral expression"
        ],
        tips: "Germany is very strict about biometric compliance."
    },
    {
        code: "JP",
        name: "Japan",
        flag: "🇯🇵",
        dimensions: "35×45 mm",
        bgColor: "Plain background (off-white/blue/light-blue)",
        rules: [
            "Head height: 32-36 mm",
            "No hair ornament",
            "Clear forehead showing",
            "Face centered"
        ],
        tips: "Check specific document type (Passport vs Residence Card)."
    }
];
