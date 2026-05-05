import { Clock, Award, Users, MapPin } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import Image from "next/image";

export function About() {
  const features = [
    {
      icon: Award,
      title: "Kualitas Terbaik",
      description:
        "Menggunakan bahan-bahan premium pilihan untuk hasil sempurna",
    },
    {
      icon: Clock,
      title: "Selalu Segar",
      description: "Diproduksi fresh setiap hari untuk kesegaran maksimal",
    },
    {
      icon: Users,
      title: "Dipercaya Ribuan Pelanggan",
      description: "Lebih dari 5000+ pelanggan puas di seluruh Indonesia",
    },
    {
      icon: MapPin,
      title: "Pengiriman Cepat",
      description: "Layanan delivery ke berbagai area dengan packaging aman",
    },
  ];

  return (
    <section id="about" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
          {/* Image */}
          <div className="relative order-2 md:order-1">
            <div className="aspect-[4/3]">
              <Image
                src="/about.png"
                alt="dapoergytra bakery"
                fill
                className="w-full h-full object-cover rounded-2xl overflow-hidden shadow-xl"
              />
            </div>
          </div>

          {/* Content */}
          <div className="order-1 md:order-2 space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Tentang dapoergytra
            </h2>
            <p className="text-gray-600 leading-relaxed">
              dapoergytra adalah toko kue yang berdedikasi untuk menghadirkan
              kelezatan dalam setiap gigitan. Sejak didirikan, kami telah
              berkomitmen untuk membuat kue-kue berkualitas tinggi dengan
              bahan-bahan pilihan dan resep yang telah teruji.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Dari kue tradisional yang mengingatkan masa kecil hingga cake
              modern yang Instagram-worthy, kami terus berinovasi untuk memenuhi
              selera Anda. Setiap produk dibuat dengan penuh cinta dan perhatian
              terhadap detail.
            </p>
            <div className="pt-4">
              <h3 className="font-semibold text-lg mb-2">Jam Operasional:</h3>
              <p className="text-gray-600">Senin - Sabtu: 08.00 - 20.00 WIB</p>
              <p className="text-gray-600">Minggu: 09.00 - 18.00 WIB</p>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="text-center">
              <CardContent className="pt-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
                  <feature.icon className="h-8 w-8 text-red-700" />
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
