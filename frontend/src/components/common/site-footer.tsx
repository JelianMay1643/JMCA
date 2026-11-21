import { Link } from "react-router-dom";
import { MapPin, Phone } from "lucide-react";
import footerImg from "../../assets/footer1.webp";

function SiteFooter() {
  return (
    <footer
      className="relative bg-blush bg-cover bg-[center_26%] px-8 pb-3 pt-16"
      style={{ backgroundImage: `url(${footerImg})` }}
    >
    
      <div className="absolute inset-0 bg-[#e070c8]/45" />

      <div className="relative">
        <div className="flex flex-wrap gap-12">
          <div>
            <div className="text-4xl font-bold text-magenta">JMCA</div>
            <p className="my-1">
              Highlighted that natural beauty emerges from
              <br />
              balancing mind, body, and spirit.
            </p>
          </div>

          <div>
            <h4 className="mb-2 font-bold">Categories</h4>
            <p className="my-1"><Link to="/shop?category=clothing">Clothing</Link></p>
            <p className="my-1"><Link to="/shop?category=beauty">Beauty</Link></p>
            <p className="my-1"><Link to="/shop?category=shoes">Shoes</Link></p>
          </div>

          <div>
            <h4 className="mb-2 font-bold">
              <Link to="/contact" className="hover:underline">Contact Us</Link>
            </h4>
            <p className="my-1 flex items-center gap-1.5">
              <MapPin size={14} /> Cebu City, Philippines 6000
            </p>
            <p className="my-1 flex items-center gap-1.5">
              <Phone size={14} /> +63 985 232 0409
            </p>
            <p className="my-1">Jmcabeauty@gmail.com</p>
          </div>

          <div>
            <h4 className="mb-2 font-bold">Legal</h4>
            <p className="my-1"><Link to="/terms" className="hover:underline">Terms & Conditions</Link></p>
            <p className="my-1"><Link to="/refund-policy" className="hover:underline">Refund Policy</Link></p>
            <p className="my-1"><Link to="/rules" className="hover:underline">Shop Rules</Link></p>
          </div>
        </div>

        <div className="mt-4 border-t border-neutral-600 pt-2 text-sm">
          ©2026 JMCA - All Rights Reserved.
        </div>
      </div>
    </footer>
  );
}

export default SiteFooter;