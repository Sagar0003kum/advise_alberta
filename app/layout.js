import "./globals.css";
import { ThemeProvider } from "./components/DarkModeToggle";
import { AuthProvider } from "./components/AuthProvider";

export const metadata = {
  title: "AdviseAlberta — AI-Powered Course Search for Alberta Colleges & Universities",
  description:
    "Search programs across all 26 Alberta post-secondary institutions with AI. Get real-time fees, semester details, and direct source links.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
