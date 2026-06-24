import fs from "fs";
import path from "path";

export const revalidate = 0;

export default function SahifasiPage() {
  const folderPath = path.join(process.cwd(), "public", "iqtiboslar");

  let images: string[] = [];

  if (fs.existsSync(folderPath)) {
    images = fs
      .readdirSync(folderPath)
      .filter((file) => /\.(png|jpg|jpeg|webp)$/i.test(file))
      .map((file) => `/iqtiboslar/${file}`);
  }

  return (
    <main className="min-h-screen bg-[#f2f2f2] px-4 py-12 text-[#111827]">
      <section className="mx-auto max-w-7xl">
        <div className="mb-10 text-center">
          <h1 className="text-[38px] font-black leading-tight tracking-[-0.04em] text-[#0043a4] md:text-[72px]">
            Bunyodkorlardan iqtiboslar
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-base font-bold leading-7 text-gray-700 md:text-lg">
            Bu sahifada O‘zbekiston Bunyodkor Yoshlari vakillarining iqtiboslari
            va ilhomlantiruvchi fikrlari jamlanadi.
          </p>
        </div>

        {images.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6">
            {images.map((src, index) => (
              <div
                key={src}
                className={index === 0 ? "col-span-2 md:col-span-2" : ""}
              >
                <img
                  src={src}
                  alt={`Iqtibos ${index + 1}`}
                  className="h-auto w-full rounded-[24px] bg-white object-cover shadow-lg"
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-[28px] bg-white px-6 py-16 text-center shadow-lg">
            <h2 className="text-2xl font-black text-[#0043a4]">
              Hali rasm qo‘shilmagan
            </h2>
            <p className="mt-3 text-gray-600">
              Rasmlar `public/iqtiboslar` papkasiga qo‘shilganda shu yerda
              avtomatik chiqadi.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}