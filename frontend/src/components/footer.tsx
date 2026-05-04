import { MailIcon } from "./icons/lucide-mail";
import { InstagramIcon } from "./icons/lucide-instagram";
import { FacebookIcon } from "./icons/lucide-facebook";
import { MapPinIcon } from "./icons/lucide-map-pin";
import { WhatsappFillIcon } from "./icons/akar-icons-whatsapp-fill";
import { PhoneIcon } from "./icons/lucide-phone";

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-xl font-bold text-white mb-4">dapoergytra</h3>
            <p className="text-sm">
              Toko kue terpercaya dengan kualitas terbaik dan rasa yang
              autentik.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Menu</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button
                  onClick={() =>
                    document
                      .getElementById("home")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="hover:text-red-400 transition"
                >
                  Beranda
                </button>
              </li>
              <li>
                <button
                  onClick={() =>
                    document
                      .getElementById("best-products")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="hover:text-red-400 transition"
                >
                  Produk Terbaik
                </button>
              </li>
              <li>
                <button
                  onClick={() =>
                    document
                      .getElementById("catalog")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="hover:text-red-400 transition"
                >
                  Katalog
                </button>
              </li>
              <li>
                <button
                  onClick={() =>
                    document
                      .getElementById("about")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="hover:text-red-400 transition"
                >
                  Profil
                </button>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-white mb-4">Kontak</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <PhoneIcon className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>+62 878-5580-8136</span>
              </li>
              <li className="flex items-start gap-2">
                <MailIcon className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>hello@dapoergytra.com</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPinIcon className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>Jl. Kue Lezat No. 123, Jakarta</span>
              </li>
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h4 className="font-semibold text-white mb-4">Ikuti Kami</h4>
            <div className="flex gap-4">
              <a
                href="https://www.instagram.com/dapoergytra/"
                className="hover:text-red-400 transition"
              >
                <InstagramIcon className="h-6 w-6" />
              </a>
              <a href="#" className="hover:text-red-400 transition">
                <FacebookIcon className="h-6 w-6" />
              </a>
              <a
                href="https://wa.me/087855808136"
                className="hover:text-red-400 transition"
              >
                <WhatsappFillIcon className="h-6 w-6" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-sm text-center">
          <p>&copy; 2026 dapoergytra. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
