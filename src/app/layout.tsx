import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter"
});

export const metadata: Metadata = {
  title: "Story Image Generator",
  description: "Generate beautiful images for your stories - perfect for kids aged 10-12!",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 font-inter antialiased">
        <div className="min-h-screen flex flex-col">
          <header className="bg-white/80 backdrop-blur-sm border-b border-purple-200 shadow-sm">
            <div className="container mx-auto px-4 py-4">
              <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                ✨ Story Image Generator ✨
              </h1>
              <p className="text-center text-gray-600 mt-2 font-medium">
                Turn your stories into magical pictures!
              </p>
            </div>
          </header>
          
          <main className="flex-1 container mx-auto px-4 py-8">
            {children}
          </main>
          
          <footer className="bg-white/60 backdrop-blur-sm border-t border-purple-200 py-6">
            <div className="container mx-auto px-4 text-center text-gray-600">
              <p className="font-medium">Made with ❤️ for young storytellers</p>
              <p className="text-sm mt-1">Perfect for ages 10-12 years</p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}