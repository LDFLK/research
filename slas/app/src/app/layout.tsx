import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { Users, Building2, LayoutDashboard, Route, FlaskConical } from "lucide-react";

export const metadata: Metadata = {
  title: "SLAS Officer Tracker",
  description:
    "Track Sri Lanka Administrative Service officers across years, grades, and institutions",
};

function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded-md transition-colors"
    >
      {children}
    </Link>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 min-h-screen">
        {/* Alpha Banner */}
        <div className="bg-amber-50 border-b border-amber-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-start gap-2 text-sm text-amber-800">
            <FlaskConical className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <p>
              <strong>Alpha Research</strong> — This tool uses AI-extracted data from official PDF seniority lists.
              Officer records, geographic locations, and career analytics may contain inaccuracies.
              Do not treat any data as authoritative without verifying against{" "}
              <a
                href="https://pubad.gov.lk/web/index.php?option=com_content&view=article&id=31&Itemid=136&lang=en"
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-medium hover:text-amber-900"
              >
                official sources
              </a>.
            </p>
          </div>
        </div>

        <nav className="bg-gray-900 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center h-14 gap-4">
              <Link href="/" className="font-bold text-lg tracking-tight mr-6">
                SLAS Tracker
              </Link>
              <NavLink href="/">
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </NavLink>
              <NavLink href="/officers">
                <Users className="h-4 w-4" />
                Officers
              </NavLink>
              <NavLink href="/institutions">
                <Building2 className="h-4 w-4" />
                Institutions
              </NavLink>
              <NavLink href="/mobility">
                <Route className="h-4 w-4" />
                Mobility
              </NavLink>
            </div>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
