import "./globals.css";
import { ThemeProvider } from "./components/DarkModeToggle";

export const metadata = {
  title: "AdviseAlberta — AI-Powered Course Search for Alberta Colleges & Universities",
  description:
    "Search programs across all 26 Alberta post-secondary institutions with AI. Get real-time fees, semester details, and direct source links.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
