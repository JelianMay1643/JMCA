import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

type Props = { image: string; children: ReactNode };

function AuthShell({ image, children }: Props) {
  return (
    <div className="grid min-h-screen bg-[#e070c8] text-white md:grid-cols-2">
      
      <div className="relative hidden md:block">
        <img
          src={image}
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-top"
        />
        
        <div className="absolute inset-0 bg-[#e070c8]/35" />
      </div>

    
      <div className="flex flex-col px-6 py-8 md:px-16">
        <Link
          to="/"
          className="mb-6 flex items-center gap-2 text-sm hover:underline"
        >
          <ArrowLeft size={18} />
          Home
        </Link>

        <div className="mx-auto w-full max-w-lg flex-1 pt-4 md:pt-10">
          {children}
        </div>
      </div>
    </div>
  );
}

export default AuthShell;