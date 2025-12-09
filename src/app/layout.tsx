import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/layout/navigation";
import { AuthProvider } from "@/components/auth/auth-provider";
import { LocaleProvider } from "@/components/providers/locale-provider";
import { ChatWidget } from "@/components/chat/ChatWidget";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HOSTLOPIA - Your Premium Hostel Booking Platform",
  description: "Book comfortable apartments and hostels worldwide with HOSTLOPIA - Your trusted accommodation partner",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <AuthProvider>
          <LocaleProvider>
            <Navigation />
            {children}
            <ChatWidget />
          </LocaleProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
