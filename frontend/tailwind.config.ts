import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

const config: Config = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      typography: {
        DEFAULT: {
          css: {
            maxWidth: "none", // Remove prose max width restrictions
            color: "var(--foreground)",
            a: {
              color: "var(--primary)",
              textDecoration: "underline",
              fontWeight: "500",
              "&:hover": {
                color: "var(--primary-600)",
              },
            },
            h1: {
              color: "var(--foreground)",
              fontWeight: "800",
              fontSize: "2.25rem",
              lineHeight: "2.5rem",
              marginTop: "0",
              marginBottom: "1rem",
            },
            h2: {
              color: "var(--foreground)",
              fontWeight: "700",
              fontSize: "1.875rem",
              lineHeight: "2.25rem",
              marginTop: "2rem",
              marginBottom: "1rem",
            },
            h3: {
              color: "var(--foreground)",
              fontWeight: "600",
              fontSize: "1.5rem",
              lineHeight: "2rem",
              marginTop: "1.5rem",
              marginBottom: "0.75rem",
            },
            h4: {
              color: "var(--foreground)",
              fontWeight: "600",
              fontSize: "1.25rem",
              lineHeight: "1.75rem",
              marginTop: "1.25rem",
              marginBottom: "0.5rem",
            },
            p: {
              marginTop: "1rem",
              marginBottom: "1rem",
              lineHeight: "1.75",
            },
            ul: {
              paddingLeft: "1.5rem",
              marginTop: "1rem",
              marginBottom: "1rem",
            },
            ol: {
              paddingLeft: "1.5rem",
              marginTop: "1rem",
              marginBottom: "1rem",
            },
            li: {
              marginTop: "0.5rem",
              marginBottom: "0.5rem",
            },
            blockquote: {
              borderLeftWidth: "4px",
              borderLeftColor: "var(--primary)",
              paddingLeft: "1rem",
              fontStyle: "italic",
              marginTop: "1.5rem",
              marginBottom: "1.5rem",
              color: "var(--muted-foreground)",
            },
            code: {
              backgroundColor: "var(--muted)",
              color: "var(--foreground)",
              padding: "0.125rem 0.25rem",
              borderRadius: "0.25rem",
              fontSize: "0.875rem",
              fontWeight: "500",
            },
            pre: {
              backgroundColor: "var(--muted)",
              color: "var(--foreground)",
              padding: "1rem",
              borderRadius: "0.5rem",
              overflowX: "auto",
              marginTop: "1.5rem",
              marginBottom: "1.5rem",
            },
            "pre code": {
              backgroundColor: "transparent",
              padding: "0",
              borderRadius: "0",
              fontSize: "inherit",
              fontWeight: "inherit",
            },
            table: {
              width: "100%",
              borderCollapse: "collapse",
              marginTop: "1.5rem",
              marginBottom: "1.5rem",
            },
            th: {
              borderBottomWidth: "2px",
              borderBottomColor: "var(--border)",
              padding: "0.5rem",
              textAlign: "left",
              fontWeight: "600",
            },
            td: {
              borderBottomWidth: "1px",
              borderBottomColor: "var(--border)",
              padding: "0.5rem",
            },
            img: {
              marginTop: "1.5rem",
              marginBottom: "1.5rem",
              borderRadius: "0.5rem",
            },
            hr: {
              borderTopWidth: "1px",
              borderTopColor: "var(--border)",
              marginTop: "2rem",
              marginBottom: "2rem",
            },
          },
        },
        sm: {
          css: {
            fontSize: "0.875rem",
            lineHeight: "1.5rem",
            h1: {
              fontSize: "1.875rem",
              lineHeight: "2.25rem",
            },
            h2: {
              fontSize: "1.5rem",
              lineHeight: "2rem",
            },
            h3: {
              fontSize: "1.25rem",
              lineHeight: "1.75rem",
            },
            h4: {
              fontSize: "1.125rem",
              lineHeight: "1.5rem",
            },
          },
        },
        lg: {
          css: {
            fontSize: "1.125rem",
            lineHeight: "1.875rem",
            h1: {
              fontSize: "2.5rem",
              lineHeight: "3rem",
            },
            h2: {
              fontSize: "2rem",
              lineHeight: "2.5rem",
            },
            h3: {
              fontSize: "1.75rem",
              lineHeight: "2.25rem",
            },
            h4: {
              fontSize: "1.5rem",
              lineHeight: "2rem",
            },
          },
        },
        xl: {
          css: {
            fontSize: "1.25rem",
            lineHeight: "2rem",
            h1: {
              fontSize: "3rem",
              lineHeight: "3.5rem",
            },
            h2: {
              fontSize: "2.25rem",
              lineHeight: "2.75rem",
            },
            h3: {
              fontSize: "2rem",
              lineHeight: "2.5rem",
            },
            h4: {
              fontSize: "1.75rem",
              lineHeight: "2.25rem",
            },
          },
        },
      },
    },
  },
  plugins: [typography],
};

export default config;
