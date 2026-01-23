import { useEffect } from "react";
import { useLocation } from "react-router-dom";

interface SEOHeadProps {
  title?: string;
  description?: string;
  image?: string;
  type?: "website" | "article" | "product";
  noIndex?: boolean;
}

const defaultSEO = {
  siteName: "FotoID",
  title: "FotoID - AI Passport Photos in Seconds",
  description: "Create perfect passport photos in seconds with AI-powered background removal. Works for 100+ countries. Free to try.",
  image: "/og-image.png",
  url: "https://fotoid.lovable.app",
};

export const SEOHead = ({
  title,
  description,
  image,
  type = "website",
  noIndex = false,
}: SEOHeadProps) => {
  const location = useLocation();
  const currentUrl = `${defaultSEO.url}${location.pathname}`;
  
  const pageTitle = title 
    ? `${title} | ${defaultSEO.siteName}` 
    : defaultSEO.title;
  const pageDescription = description || defaultSEO.description;
  const pageImage = image || defaultSEO.image;
  const absoluteImageUrl = pageImage.startsWith("http") 
    ? pageImage 
    : `${defaultSEO.url}${pageImage}`;

  useEffect(() => {
    // Update document title
    document.title = pageTitle;

    // Update meta tags
    const updateMetaTag = (property: string, content: string, isName = false) => {
      const selector = isName ? `meta[name="${property}"]` : `meta[property="${property}"]`;
      let meta = document.querySelector(selector) as HTMLMetaElement;
      if (!meta) {
        meta = document.createElement("meta");
        if (isName) {
          meta.name = property;
        } else {
          meta.setAttribute("property", property);
        }
        document.head.appendChild(meta);
      }
      meta.content = content;
    };

    // Standard meta
    updateMetaTag("description", pageDescription, true);
    
    // Open Graph
    updateMetaTag("og:title", pageTitle);
    updateMetaTag("og:description", pageDescription);
    updateMetaTag("og:image", absoluteImageUrl);
    updateMetaTag("og:url", currentUrl);
    updateMetaTag("og:type", type);
    updateMetaTag("og:site_name", defaultSEO.siteName);

    // Twitter
    updateMetaTag("twitter:title", pageTitle, true);
    updateMetaTag("twitter:description", pageDescription, true);
    updateMetaTag("twitter:image", absoluteImageUrl, true);

    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = currentUrl;

    // Robots
    if (noIndex) {
      updateMetaTag("robots", "noindex, nofollow", true);
    } else {
      const robotsMeta = document.querySelector('meta[name="robots"]');
      if (robotsMeta) {
        robotsMeta.remove();
      }
    }
  }, [pageTitle, pageDescription, absoluteImageUrl, currentUrl, type, noIndex]);

  return null;
};

// JSON-LD structured data component
export const StructuredData = () => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "FotoID",
    "applicationCategory": "PhotographyApplication",
    "operatingSystem": "Web Browser",
    "description": "Create perfect passport photos in seconds with AI-powered background removal. Works for 100+ countries.",
    "url": "https://fotoid.lovable.app",
    "image": "https://fotoid.lovable.app/og-image.png",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "INR",
      "description": "2 free passport photo downloads"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "1250"
    },
    "featureList": [
      "AI-powered background removal",
      "100+ country formats supported",
      "Print-ready layouts",
      "Instant processing"
    ],
    "publisher": {
      "@type": "Organization",
      "name": "FotoID",
      "url": "https://fotoid.lovable.app"
    }
  };

  useEffect(() => {
    const existingScript = document.querySelector('script[type="application/ld+json"]');
    if (existingScript) {
      existingScript.remove();
    }

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.text = JSON.stringify(structuredData);
    document.head.appendChild(script);

    return () => {
      script.remove();
    };
  }, []);

  return null;
};

// FAQ structured data for FAQ page
export const FAQStructuredData = ({ faqs }: { faqs: Array<{ question: string; answer: string }> }) => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  useEffect(() => {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.text = JSON.stringify(structuredData);
    document.head.appendChild(script);

    return () => {
      script.remove();
    };
  }, [faqs]);

  return null;
};
