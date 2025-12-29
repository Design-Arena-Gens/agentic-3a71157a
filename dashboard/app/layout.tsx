import "./globals.css";
import { ReactNode } from "react";
import { Toaster } from "react-hot-toast";

export const metadata = {
  title: "Attedly Dashboard",
  description: "Live analytics for Attedly attendance platform",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-50">
        <div className="min-h-screen bg-slate-950">{children}</div>
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
