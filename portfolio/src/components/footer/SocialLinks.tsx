import { IconType } from "react-icons";
import { FaGithub, FaInstagram, FaLinkedin } from "react-icons/fa";

type Social = {
  href: string;
  label: string;
  Icon: IconType;
};

const socials: Social[] = [
  { href: "https://www.linkedin.com/in/zach-pawelek-60a2033a1/", label: "LinkedIn", Icon: FaLinkedin },
  { href: "https://www.instagram.com/notzachh", label: "Instagram", Icon: FaInstagram },
  { href: "https://github.com/zachpawelek", label: "GitHub", Icon: FaGithub },
];

export default function SocialLinks({ className = "" }: { className?: string }) {
  return (
    <div className={`mt-6 flex justify-center gap-5 ${className}`}>
      {socials.map(({ href, label, Icon }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          title={label}
          className="inline-flex items-center justify-center rounded-full p-2 text-white/45 transition
                     hover:text-white/80 hover:bg-white/5
                     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
        >
          <Icon size={22} />
        </a>
      ))}
    </div>
  );
}
