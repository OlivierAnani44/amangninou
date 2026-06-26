import {
  BadgeCheck,
  BellRing,
  BookOpenText,
  CalendarClock,
  ChevronRight,
  CirclePlay,
  CircleEllipsis,
  Compass,
  Cross,
  Droplets,
  FileCheck2,
  FileText,
  Flame,
  HeartHandshake,
  Home,
  Infinity,
  Languages,
  Leaf,
  LockKeyhole,
  LogIn,
  LogOut,
  Mail,
  Megaphone,
  Menu,
  MessageCircle,
  MessagesSquare,
  Moon,
  Mountain,
  Phone,
  Rows3,
  Save,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Sun,
  Trash2,
  UserPlus,
  UserRound,
  X,
} from "lucide-react";

function BrandWhatsapp({ size = 20, className }) {
  return (
    <svg aria-hidden="true" className={className} width={size} height={size} viewBox="0 0 24 24">
      <path
        fill="#25D366"
        d="M12.04 2C6.54 2 2.08 6.41 2.08 11.84c0 1.73.46 3.42 1.34 4.9L2 22l5.42-1.39a10.08 10.08 0 0 0 4.62 1.12c5.5 0 9.96-4.41 9.96-9.84S17.54 2 12.04 2Z"
      />
      <path
        fill="#fff"
        d="M17.79 14.73c-.24-.12-1.43-.7-1.65-.78-.22-.08-.38-.12-.55.12-.16.24-.63.78-.77.94-.14.16-.28.18-.52.06-.24-.12-1.01-.37-1.93-1.18-.71-.63-1.19-1.41-1.33-1.65-.14-.24-.01-.37.11-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.55-1.31-.75-1.8-.2-.47-.4-.41-.55-.42h-.47c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2s.86 2.32.98 2.48c.12.16 1.69 2.56 4.1 3.59.57.25 1.02.4 1.37.51.58.18 1.1.15 1.51.09.46-.07 1.43-.58 1.63-1.14.2-.56.2-1.04.14-1.14-.06-.1-.22-.16-.46-.28Z"
      />
    </svg>
  );
}

function BrandYoutube({ size = 20, className }) {
  return (
    <svg aria-hidden="true" className={className} width={size} height={size} viewBox="0 0 24 24">
      <path
        fill="#FF0000"
        d="M21.58 7.19a2.76 2.76 0 0 0-1.94-1.95C17.92 4.78 12 4.78 12 4.78s-5.92 0-7.64.46a2.76 2.76 0 0 0-1.94 1.95A28.8 28.8 0 0 0 1.96 12c0 1.62.15 3.25.46 4.81a2.76 2.76 0 0 0 1.94 1.95c1.72.46 7.64.46 7.64.46s5.92 0 7.64-.46a2.76 2.76 0 0 0 1.94-1.95c.31-1.56.46-3.19.46-4.81s-.15-3.25-.46-4.81Z"
      />
      <path fill="#fff" d="M10.02 15.27 15.2 12l-5.18-3.27v6.54Z" />
    </svg>
  );
}

function BrandTikTok({ size = 20, className }) {
  const notePath =
    "M15.74 2.5c.28 2.11 1.45 3.44 3.5 3.58v3.1a6.65 6.65 0 0 1-3.43-1.02v5.98c0 3.02-1.9 5.36-4.8 5.36-2.63 0-4.75-1.73-4.75-4.39 0-3 2.58-4.83 5.5-4.2v3.26c-1.14-.35-2.15.26-2.15 1.36 0 .83.67 1.41 1.43 1.41.96 0 1.55-.66 1.55-1.86V2.5h3.15Z";

  return (
    <svg aria-hidden="true" className={className} width={size} height={size} viewBox="0 0 24 24">
      <path fill="#25F4EE" d={notePath} transform="translate(-0.7 0.45)" />
      <path fill="#FE2C55" d={notePath} transform="translate(0.7 -0.35)" />
      <path fill="#111111" d={notePath} />
    </svg>
  );
}

const ICONS = {
  BadgeCheck,
  BellRing,
  BrandTikTok,
  BrandWhatsapp,
  BrandYoutube,
  BookOpenText,
  CalendarClock,
  ChevronRight,
  CirclePlay,
  CircleEllipsis,
  Compass,
  Cross,
  Droplets,
  FileCheck2,
  FileText,
  Flame,
  HeartHandshake,
  Home,
  Infinity,
  Languages,
  Leaf,
  LockKeyhole,
  LogIn,
  LogOut,
  Mail,
  Megaphone,
  Menu,
  MessageCircle,
  MessagesSquare,
  Moon,
  Mountain,
  Phone,
  Rows3,
  Save,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Sun,
  Trash2,
  UserPlus,
  UserRound,
  X,
};

export function AppIcon({ name, size = 20, className, strokeWidth = 2 }) {
  const Icon = ICONS[name] ?? Sparkles;

  return <Icon aria-hidden="true" className={className} size={size} strokeWidth={strokeWidth} />;
}
