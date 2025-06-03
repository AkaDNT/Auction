import type { Metadata } from "next";
import "./globals.css";
import NavBar from "./nav/NavBar";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "Cars Auction",
  description: "An auction platform for cars",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Toaster></Toaster>
        <NavBar></NavBar>
        <main className="container mx-auto px-5 pt-10">{children}</main>
      </body>
    </html>
  );
}
