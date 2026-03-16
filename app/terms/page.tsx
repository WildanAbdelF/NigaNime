import { Navbar, Footer } from "@/components/layout";

export const metadata = {
  title: "Terms of Service - NigaNime",
  description: "Terms of Service for NigaNime",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#0f1729] text-white">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 pt-24 pb-16">
        <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
        <div className="space-y-4 text-gray-300 leading-relaxed">
          <p>
            By using NigaNime, you agree to use this website in accordance with applicable laws and these terms.
          </p>
          <p>
            NigaNime does not host media files. Content is provided by third-party sources and may change or become unavailable at any time.
          </p>
          <p>
            If you are a copyright owner and need content removed, please contact us at
            {" "}
            <a className="text-[#f5c518] hover:underline" href="mailto:legal@niganime.com?subject=DMCA">
              legal@niganime.com
            </a>
            .
          </p>
          <p>
            We may update these terms without prior notice. Continued use of the website indicates acceptance of the latest version.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
