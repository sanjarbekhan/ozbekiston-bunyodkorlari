const cities = [
  { name: "Nukus", left: "15%", top: "20%" },
  { name: "Xiva", left: "28%", top: "28%" },
  { name: "Navoiy", left: "47%", top: "40%" },
  { name: "Buxoro", left: "56%", top: "51%" },
  { name: "Samarqand", left: "68%", top: "62%" },
  { name: "Qarshi", left: "65%", top: "72%" },
  { name: "Termiz", left: "78%", top: "84%" },
  { name: "Toshkent", left: "76%", top: "43%", featured: true },
  { name: "Jizzax", left: "71%", top: "54%" },
  { name: "Guliston", left: "72%", top: "31%" },
  { name: "Namangan", left: "91%", top: "35%" },
  { name: "Andijon", left: "95%", top: "45%" },
  { name: "Farg‘ona", left: "93%", top: "54%" },
] as const;

export default function UzbekistanHeroMap() {
  return (
    <div className="pointer-events-none absolute inset-0 z-[2] overflow-visible" aria-hidden="true">
      <div
        className="hero-landmark-layer absolute inset-0 bg-contain bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/bunyodkor-hero.webp?v=2')" }}
      />

      <svg
        viewBox="0 0 760 560"
        className="absolute left-[3%] top-[10%] h-[74%] w-[94%] overflow-visible"
        fill="none"
      >
        <defs>
          <linearGradient id="uzMapFill" x1="80" y1="90" x2="690" y2="430" gradientUnits="userSpaceOnUse">
            <stop stopColor="#D7E8FF" stopOpacity=".86" />
            <stop offset=".52" stopColor="#C9DFFF" stopOpacity=".72" />
            <stop offset="1" stopColor="#E7E1FF" stopOpacity=".70" />
          </linearGradient>
          <linearGradient id="uzMapStroke" x1="100" y1="130" x2="710" y2="350" gradientUnits="userSpaceOnUse">
            <stop stopColor="#9FCBFF" />
            <stop offset=".55" stopColor="#81A7FF" />
            <stop offset="1" stopColor="#9F8DFF" />
          </linearGradient>
          <filter id="softGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="13" />
          </filter>
        </defs>

        <ellipse cx="420" cy="278" rx="270" ry="205" fill="#8DBBFF" opacity=".09" filter="url(#softGlow)" />

        <path
          className="uz-map-shape"
          d="M72 128L111 97L151 101L180 125L210 119L234 143L274 145L302 159L337 151L371 172L405 159L449 178L481 175L510 191L548 188L568 204L595 200L612 213L637 203L665 210L691 229L722 224L737 244L714 262L688 258L670 278L642 276L624 289L607 282L590 303L566 300L548 319L528 313L507 337L477 331L461 347L420 352L397 342L371 358L340 351L315 367L279 358L252 369L220 350L194 357L168 337L144 341L123 318L104 317L94 293L77 280L83 252L66 229L76 205L61 184L73 159Z"
          fill="url(#uzMapFill)"
          stroke="url(#uzMapStroke)"
          strokeWidth="1.4"
          strokeDasharray="4 7"
        />

        <g className="uz-region-lines" opacity=".42" stroke="#91B4F9" strokeWidth="1">
          <path d="M159 105C183 170 184 220 164 335" />
          <path d="M234 143C250 213 251 276 220 350" />
          <path d="M337 151C329 217 338 287 315 367" />
          <path d="M405 159C390 226 408 288 397 342" />
          <path d="M481 175C466 232 486 284 477 331" />
          <path d="M548 188C528 246 548 280 548 319" />
          <path d="M612 213C588 244 593 270 590 303" />
          <path d="M666 210C645 233 644 255 642 276" />
          <path d="M94 293C205 278 322 289 420 352" />
          <path d="M123 318C264 258 416 250 566 300" />
          <path d="M180 125C305 220 447 220 595 200" />
        </g>

        <g className="hero-route-network" stroke="#5D95FF" strokeWidth="1.5" strokeDasharray="6 8" opacity=".72">
          <path d="M580 247C505 170 375 115 158 113" />
          <path d="M580 247C520 235 420 232 246 164" />
          <path d="M580 247C520 282 446 320 356 343" />
          <path d="M580 247C568 312 554 365 499 431" />
          <path d="M580 247C631 216 667 201 704 194" />
          <path d="M580 247C632 255 674 270 721 295" />
        </g>

        <g fill="#2B78FF">
          <circle className="map-pulse-dot" cx="158" cy="113" r="5.5" />
          <circle className="map-pulse-dot" cx="246" cy="164" r="5.5" />
          <circle className="map-pulse-dot" cx="356" cy="343" r="5.5" />
          <circle className="map-pulse-dot" cx="499" cy="431" r="5.5" />
          <circle className="map-pulse-dot" cx="580" cy="247" r="7" />
          <circle className="map-pulse-dot" cx="704" cy="194" r="5.5" />
          <circle className="map-pulse-dot" cx="721" cy="295" r="5.5" />
        </g>
      </svg>

      <div className="absolute inset-0">
        {cities.map((city) => (
          <div
            key={city.name}
            className={"hero-city " + (city.featured ? "hero-city-featured" : "")}
            style={{ left: city.left, top: city.top }}
          >
            <span className="hero-city-dot" />
            <span>{city.name}</span>
          </div>
        ))}
      </div>

      <div className="hero-landmark-title absolute right-[13%] top-[9%] text-[10px] font-black uppercase tracking-[.34em] text-[#7ba2db]/45">
        O‘zbekiston
      </div>
    </div>
  );
}
