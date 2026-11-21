import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import ProductCollection from "../../../components/features/product/product-collection";
import { btn } from "../../../lib/styles";
import heroImg from "../../../assets/hero.jpg";
import about1 from "../../../assets/about1.webp";
import about2 from "../../../assets/about2.jpg";
import readyImg from "../../../assets/ready1.jpg";

const chips = [
  { label: "New in", icon: "New", to: "/shop?tag=new" },
  { label: "On sale", icon: "Sale", to: "/shop?tag=sale" },
  { label: "Clothes", icon: "👗", to: "/shop?category=clothing" },
  { label: "Beauty", icon: "💄", to: "/shop?category=beauty" },
  { label: "Shoes", icon: "👠", to: "/shop?category=shoes" },
];

function HomePage() {
  return (
    <main>
      {/* Hero */}
      <section
        className="relative flex min-h-[460px] flex-col bg-blush bg-cover bg-top md:min-h-[680px]"
        style={{ backgroundImage: `url(${heroImg})` }}
      >
        
        <div className="absolute inset-0 bg-[#e070c8]/40" />

       
        <div
          id="categories"
          className="relative flex flex-wrap justify-center gap-5 bg-[#e070c8]/50 px-4 py-2 md:gap-8"
        >
          {chips.map((c) => (
            <Link
              key={c.label}
              to={c.to}
              className="text-center text-[10px] text-white"
            >
              <div className="mx-auto mb-0.5 flex h-11 w-11 items-center justify-center rounded-full bg-brand text-sm font-bold text-white md:h-12 md:w-12">
                {c.icon}
              </div>
              {c.label}
            </Link>
          ))}
        </div>

        
        <div className="relative flex flex-1 flex-col items-center justify-center px-4 py-10 text-center">
          <h1 className="mb-3 text-3xl font-bold tracking-wide md:text-5xl">
            THE FACE OF MODERN NATURE
          </h1>
          <p className="mb-6 text-xl md:text-2xl">
            True beauty is reflected in the soul
          </p>
          <Link to="/shop" className={btn}>
            Shop now <ChevronRight size={20} />
          </Link>
        </div>
      </section>

      {/* Why JMCA */}
      <section id="why" className="px-4 py-10 text-white">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-8 md:flex-row">
          <div className="flex-1 text-lg leading-relaxed">
            <h2 className="mb-4 text-4xl font-bold">Why JMCA?</h2>
            <p className="mb-4">
              At <b>JMCA</b>, we believe that everyone deserves to feel
              beautiful, confident, and stylish without spending too much.
              That's why we aim to provide quality products, affordable prices,
              and styles that match your personality.
            </p>
            <p className="mb-4">
              Whether you're looking for a new outfit, beauty essentials, or
              the perfect pair of shoes, <b>JMCA</b> is here to help you find
              what you love.
            </p>
            <p>
              <b>JMCA</b> – Your <b>Style,</b> Your <b>Beauty,</b> Your{" "}
              <b>Confidence.</b>
            </p>
          </div>

          <div className="flex w-full flex-col gap-4 md:w-[300px] md:flex-none">
            <img
              src={about1}
              alt="Women with beauty products"
              className="h-[200px] w-full rounded-[100px] bg-[#e5c3dc] object-cover object-top"
            />
            <img
              src={about2}
              alt="Women in matching bodysuits"
              className="h-[200px] w-full rounded-[100px] bg-[#e5c3dc] object-cover object-top"
            />
          </div>
        </div>
      </section>

      {/* Featured products */}
      <section className="bg-[#c660ae] px-4 py-10 text-white">
        <h2 className="mb-6 text-center text-3xl font-bold">
          Featured Products
        </h2>
        <div className="mx-auto max-w-5xl px-4 py-2">
          <ProductCollection filters={{ featured: true }} />
        </div>
        <div className="mt-4 text-center">
          <Link to="/shop" className={btn}>
            View More <ChevronRight size={20} />
          </Link>
        </div>
      </section>

      {/* Call to action */}
      <section
        className="relative bg-blush bg-cover bg-[center_35%] px-4 py-20 text-center md:py-28"
        style={{ backgroundImage: `url(${readyImg})` }}
      >
        
        <div className="absolute inset-0 bg-[#e070c8]/45" />

        <div className="relative">
          <h2 className="mb-6 text-3xl font-bold italic text-magenta md:text-4xl">
            READY TO START SHOPPING?
          </h2>
          <Link to="/shop" className={btn}>
            Shop now <ChevronRight size={20} />
          </Link>
        </div>
      </section>
    </main>
  );
}

export default HomePage;