import { useState } from "react";
import { Button } from "./ui/button";
import Image from "next/image";

export function Hero() {
  const mainImage =
    "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&h=800&fit=crop";

  const fallbackImage = "/cake_hero.jpg";

  const [imgSrc, setImgSrc] = useState(mainImage);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section
      id="home"
      className="relative bg-gradient-to-br from-red-50 to-pink-50 py-20"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900">
              Kue Lezat dari
              <span className="block text-red-700">dapoergytra</span>
            </h1>
            <p className="text-lg text-gray-600">
              Nikmati berbagai kue berkualitas tinggi yang dibuat dengan
              bahan-bahan pilihan dan cinta. Dari kue tradisional hingga modern,
              kami punya semuanya!
            </p>
            <div className="flex gap-4">
              <Button
                onClick={() => scrollToSection("catalog")}
                size="lg"
                className="bg-red-600 hover:bg-red-700"
              >
                Lihat Katalog
              </Button>
              <Button
                onClick={() => scrollToSection("about")}
                variant="outline"
                size="lg"
              >
                Tentang Kami
              </Button>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative">
            <div className="aspect-square">
              <Image
                src={imgSrc}
                alt="Kue dapoergytra"
                fill
                priority
                // sizes="(max-width: 768px) 100vw, 50vw"
                className="w-full h-full object-cover rounded-2xl shadow-2xl overflow-hidden"
                onError={() => setImgSrc(fallbackImage)}
              />
            </div>
            {/* Decorative Elements */}
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-red-300 rounded-full opacity-50 blur-2xl"></div>
            <div className="absolute -top-6 -left-6 w-40 h-40 bg-pink-300 rounded-full opacity-50 blur-2xl"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
