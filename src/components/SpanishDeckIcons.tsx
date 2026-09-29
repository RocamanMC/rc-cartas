import React from 'react';
import { AvatarSuit } from '../types';

interface IconProps {
  className?: string;
  size?: number;
}

// OROS: Traditional golden Spanish coin with sunburst and beaded royal rim
export const OrosIcon: React.FC<IconProps> = ({ className = 'w-6 h-6', size }) => (
  <svg
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={size ? { width: size, height: size } : undefined}
    aria-label="Palo de Oros"
  >
    <defs>
      <radialGradient id="orosGold" cx="35%" cy="35%" r="65%">
        <stop offset="0%" stopColor="#FFF2A3" />
        <stop offset="35%" stopColor="#F5BE2C" />
        <stop offset="75%" stopColor="#C98B12" />
        <stop offset="100%" stopColor="#8A5805" />
      </radialGradient>
      <radialGradient id="orosCenter" cx="40%" cy="40%" r="60%">
        <stop offset="0%" stopColor="#FFFBE6" />
        <stop offset="60%" stopColor="#E5A61E" />
        <stop offset="100%" stopColor="#9C6207" />
      </radialGradient>
    </defs>
    {/* Outer Coin */}
    <circle cx="32" cy="32" r="30" fill="url(#orosGold)" stroke="#683F02" strokeWidth="2.5" />
    <circle cx="32" cy="32" r="26" stroke="#9C6207" strokeWidth="1.5" strokeDasharray="2.5 2" />
    {/* Inner Coin */}
    <circle cx="32" cy="32" r="21" fill="url(#orosCenter)" stroke="#683F02" strokeWidth="1.5" />
    {/* Sunburst rays */}
    <g stroke="#8A5805" strokeWidth="1.5" strokeLinecap="round">
      <line x1="32" y1="13" x2="32" y2="18" />
      <line x1="32" y1="46" x2="32" y2="51" />
      <line x1="13" y1="32" x2="18" y2="32" />
      <line x1="46" y1="32" x2="51" y2="32" />
      <line x1="18.5" y1="18.5" x2="22.5" y2="22.5" />
      <line x1="41.5" y1="41.5" x2="45.5" y2="45.5" />
      <line x1="45.5" y1="18.5" x2="41.5" y2="22.5" />
      <line x1="22.5" y1="41.5" x2="18.5" y2="45.5" />
    </g>
    {/* Stylized Sun Face / Fleur-de-lis core */}
    <circle cx="32" cy="32" r="7.5" fill="#FFEAA0" stroke="#683F02" strokeWidth="1.5" />
    <circle cx="29.5" cy="30.5" r="1.2" fill="#583401" />
    <circle cx="34.5" cy="30.5" r="1.2" fill="#583401" />
    <path d="M29.5 35 C31 37, 33 37, 34.5 35" stroke="#583401" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

// COPAS: Baroque golden chalice with ruby accents
export const CopasIcon: React.FC<IconProps> = ({ className = 'w-6 h-6', size }) => (
  <svg
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={size ? { width: size, height: size } : undefined}
    aria-label="Palo de Copas"
  >
    <defs>
      <linearGradient id="copasGold" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#C98B12" />
        <stop offset="30%" stopColor="#FFF2A3" />
        <stop offset="70%" stopColor="#F5BE2C" />
        <stop offset="100%" stopColor="#8A5805" />
      </linearGradient>
    </defs>
    {/* Chalice Cup */}
    <path
      d="M16 12 C16 32, 24 37, 30 38 L30 46 C24 47, 18 51, 18 56 L46 56 C46 51, 40 47, 34 46 L34 38 C40 37, 48 32, 48 12 L16 12 Z"
      fill="url(#copasGold)"
      stroke="#583401"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    {/* Cup Lid / Rim */}
    <ellipse cx="32" cy="12" rx="16" ry="4" fill="#FFE785" stroke="#583401" strokeWidth="1.8" />
    {/* Chalice Pedestal Node */}
    <circle cx="32" cy="42" r="3.5" fill="#FFEAA0" stroke="#583401" strokeWidth="1.5" />
    {/* Base Rim */}
    <ellipse cx="32" cy="56" rx="14" ry="3.5" fill="#C98B12" stroke="#583401" strokeWidth="1.5" />
    {/* Red gem on the chalice body */}
    <path d="M32 20 L35 25 L32 30 L29 25 Z" fill="#DC2626" stroke="#991B1B" strokeWidth="1" />
  </svg>
);

// ESPADAS: Toledo rapier curved Spanish sword
export const EspadasIcon: React.FC<IconProps> = ({ className = 'w-6 h-6', size }) => (
  <svg
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={size ? { width: size, height: size } : undefined}
    aria-label="Palo de Espadas"
  >
    <defs>
      <linearGradient id="bladeGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#FFFFFF" />
        <stop offset="45%" stopColor="#CBD5E1" />
        <stop offset="85%" stopColor="#64748B" />
        <stop offset="100%" stopColor="#334155" />
      </linearGradient>
    </defs>
    {/* Sword Blade (curved sabre/rapier style) */}
    <path
      d="M30 46 L32 6 C32 6, 36 22, 34 46 Z"
      fill="url(#bladeGrad)"
      stroke="#1E293B"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    {/* Fuller Line (middle groove) */}
    <line x1="32" y1="10" x2="32" y2="44" stroke="#475569" strokeWidth="1" />
    {/* Crossguard with Spanish ornate curves */}
    <path
      d="M17 46 C21 44, 26 47, 32 47 C38 47, 43 44, 47 46 C45 49, 39 49, 32 49 C25 49, 19 49, 17 46 Z"
      fill="#F5BE2C"
      stroke="#854D0E"
      strokeWidth="1.5"
    />
    {/* Hilt / Grip */}
    <rect x="30" y="49" width="4" height="8" rx="1.5" fill="#854D0E" stroke="#451A03" strokeWidth="1.2" />
    {/* Pommel */}
    <circle cx="32" cy="59.5" r="3" fill="#F5BE2C" stroke="#854D0E" strokeWidth="1.5" />
  </svg>
);

// BASTOS: Traditional knotted rustic club with leafy green sprouts
export const BastosIcon: React.FC<IconProps> = ({ className = 'w-6 h-6', size }) => (
  <svg
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={size ? { width: size, height: size } : undefined}
    aria-label="Palo de Bastos"
  >
    <defs>
      <linearGradient id="woodGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#9A5826" />
        <stop offset="50%" stopColor="#6C3911" />
        <stop offset="100%" stopColor="#452309" />
      </linearGradient>
    </defs>
    {/* Knotted Cudgel / Club */}
    <path
      d="M33 8 C37 9, 39 12, 38 16 C41 18, 42 22, 39 25 C41 29, 39 34, 37 38 C38 43, 36 49, 34 57 C31 58, 29 57, 28 55 C28 47, 27 41, 29 35 C26 31, 25 26, 27 21 C25 16, 26 11, 31 8 Z"
      fill="url(#woodGrad)"
      stroke="#271406"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    {/* Bark Rings / Knots */}
    <ellipse cx="33" cy="18" rx="3.5" ry="2" fill="#50280B" stroke="#271406" strokeWidth="1" />
    <ellipse cx="31" cy="31" rx="4" ry="2" fill="#50280B" stroke="#271406" strokeWidth="1" />
    <ellipse cx="32" cy="45" rx="3" ry="1.5" fill="#50280B" stroke="#271406" strokeWidth="1" />
    {/* Green sprout leaves */}
    <path d="M38 21 C44 20, 47 16, 45 14 C42 16, 39 18, 38 21 Z" fill="#22C55E" stroke="#15803D" strokeWidth="1" />
    <path d="M26 33 C20 32, 17 28, 19 26 C22 28, 25 30, 26 33 Z" fill="#22C55E" stroke="#15803D" strokeWidth="1" />
  </svg>
);

// PICAS (Spades ♠️) - French / Poker Deck
export const PicasIcon: React.FC<IconProps> = ({ className = 'w-6 h-6', size }) => (
  <svg
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={size ? { width: size, height: size } : undefined}
    aria-label="Palo de Picas"
  >
    <defs>
      <linearGradient id="picasGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#64748B" />
        <stop offset="35%" stopColor="#1E293B" />
        <stop offset="85%" stopColor="#0F172A" />
        <stop offset="100%" stopColor="#020617" />
      </linearGradient>
    </defs>
    {/* Spade blade */}
    <path
      d="M32 7 C28 17, 12 30, 12 40 C12 47, 18 52, 25 52 C29 52, 31 49, 32 46 C33 49, 35 52, 39 52 C46 52, 52 47, 52 40 C52 30, 36 17, 32 7 Z"
      fill="url(#picasGrad)"
      stroke="#CBD5E1"
      strokeWidth="1.5"
    />
    {/* Stem */}
    <path
      d="M30 46 C29 51, 25 57, 20 58 L44 58 C39 57, 35 51, 34 46 Z"
      fill="url(#picasGrad)"
      stroke="#CBD5E1"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    {/* Highlight curve */}
    <path d="M32 14 C30 20, 20 28, 18 36" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
  </svg>
);

// CORAZONES (Hearts ♥️) - French / Poker Deck
export const CorazonesIcon: React.FC<IconProps> = ({ className = 'w-6 h-6', size }) => (
  <svg
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={size ? { width: size, height: size } : undefined}
    aria-label="Palo de Corazones"
  >
    <defs>
      <radialGradient id="heartGrad" cx="35%" cy="30%" r="70%">
        <stop offset="0%" stopColor="#F87171" />
        <stop offset="30%" stopColor="#EF4444" />
        <stop offset="75%" stopColor="#B91C1C" />
        <stop offset="100%" stopColor="#7F1D1D" />
      </radialGradient>
    </defs>
    <path
      d="M32 56 C28 52, 10 37, 10 23 C10 14, 17 8, 25 8 C29.5 8, 31.5 11, 32 13 C32.5 11, 34.5 8, 39 8 C47 8, 54 14, 54 23 C54 37, 36 52, 32 56 Z"
      fill="url(#heartGrad)"
      stroke="#450A0A"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    <path
      d="M17 19 C18 14, 22 12, 25 12"
      stroke="#FECACA"
      strokeWidth="2"
      strokeLinecap="round"
      opacity="0.8"
    />
  </svg>
);

// TREBOLES (Clubs ♣️) - French / Poker Deck
export const TrebolesIcon: React.FC<IconProps> = ({ className = 'w-6 h-6', size }) => (
  <svg
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={size ? { width: size, height: size } : undefined}
    aria-label="Palo de Tréboles"
  >
    <defs>
      <linearGradient id="trebolGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#475569" />
        <stop offset="40%" stopColor="#1E293B" />
        <stop offset="85%" stopColor="#0F172A" />
        <stop offset="100%" stopColor="#020617" />
      </linearGradient>
    </defs>
    {/* Top leaf */}
    <circle cx="32" cy="20" r="11" fill="url(#trebolGrad)" stroke="#CBD5E1" strokeWidth="1.5" />
    {/* Left leaf */}
    <circle cx="21" cy="35" r="11" fill="url(#trebolGrad)" stroke="#CBD5E1" strokeWidth="1.5" />
    {/* Right leaf */}
    <circle cx="43" cy="35" r="11" fill="url(#trebolGrad)" stroke="#CBD5E1" strokeWidth="1.5" />
    {/* Center */}
    <circle cx="32" cy="33" r="8" fill="url(#trebolGrad)" />
    {/* Stem */}
    <path
      d="M30 35 C29 45, 23 54, 18 57 L46 57 C41 54, 35 45, 34 35 Z"
      fill="url(#trebolGrad)"
      stroke="#CBD5E1"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
  </svg>
);

// DIAMANTES (Diamonds ♦️) - French / Poker Deck
export const DiamantesIcon: React.FC<IconProps> = ({ className = 'w-6 h-6', size }) => (
  <svg
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={size ? { width: size, height: size } : undefined}
    aria-label="Palo de Diamantes"
  >
    <defs>
      <radialGradient id="diamanteGrad" cx="40%" cy="35%" r="65%">
        <stop offset="0%" stopColor="#F87171" />
        <stop offset="35%" stopColor="#EF4444" />
        <stop offset="75%" stopColor="#B91C1C" />
        <stop offset="100%" stopColor="#7F1D1D" />
      </radialGradient>
    </defs>
    <path
      d="M32 7 L51 32 L32 57 L13 32 Z"
      fill="url(#diamanteGrad)"
      stroke="#450A0A"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <path d="M32 13 L45 32 L32 51 L19 32 Z" stroke="#FCA5A5" strokeWidth="1" opacity="0.6" />
  </svg>
);

// CORONA / REY 👑
export const CoronaIcon: React.FC<IconProps> = ({ className = 'w-6 h-6', size }) => (
  <svg
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={size ? { width: size, height: size } : undefined}
    aria-label="Rey / Corona"
  >
    <defs>
      <linearGradient id="coronaGold" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#FEF08A" />
        <stop offset="40%" stopColor="#EAB308" />
        <stop offset="85%" stopColor="#CA8A04" />
        <stop offset="100%" stopColor="#854D0E" />
      </linearGradient>
    </defs>
    <path
      d="M12 48 L52 48 L48 54 L16 54 Z"
      fill="#CA8A04"
      stroke="#713F12"
      strokeWidth="1.5"
    />
    <path
      d="M12 48 L10 24 L24 35 L32 16 L40 35 L54 24 L52 48 Z"
      fill="url(#coronaGold)"
      stroke="#713F12"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <circle cx="10" cy="22" r="3" fill="#EF4444" stroke="#713F12" strokeWidth="1" />
    <circle cx="32" cy="14" r="3.5" fill="#3B82F6" stroke="#713F12" strokeWidth="1" />
    <circle cx="54" cy="22" r="3" fill="#EF4444" stroke="#713F12" strokeWidth="1" />
    <path d="M32 36 L36 41 L32 46 L28 41 Z" fill="#22C55E" stroke="#14532D" strokeWidth="1" />
  </svg>
);

// CABALLO / CORCEL 🐴
export const CaballoIcon: React.FC<IconProps> = ({ className = 'w-6 h-6', size }) => (
  <svg
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={size ? { width: size, height: size } : undefined}
    aria-label="Caballo / Corcel"
  >
    <defs>
      <linearGradient id="caballoGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#F5D0FE" />
        <stop offset="30%" stopColor="#C084FC" />
        <stop offset="70%" stopColor="#7E22CE" />
        <stop offset="100%" stopColor="#4A044E" />
      </linearGradient>
    </defs>
    <path
      d="M20 54 L44 54 C44 50, 42 45, 41 40 C46 38, 51 32, 50 26 C49 20, 44 18, 41 18 C41 14, 38 10, 34 8 C30 8, 29 11, 28 13 C26 11, 23 11, 21 13 C18 16, 17 21, 19 25 C15 27, 14 31, 15 35 C17 40, 24 40, 27 38 C26 42, 23 48, 20 54 Z"
      fill="url(#caballoGrad)"
      stroke="#581C87"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <circle cx="27" cy="20" r="2" fill="#FAF5FF" stroke="#3B0764" strokeWidth="1" />
  </svg>
);

// COMODÍN / JOKER 🃏
export const ComodinIcon: React.FC<IconProps> = ({ className = 'w-6 h-6', size }) => (
  <svg
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={size ? { width: size, height: size } : undefined}
    aria-label="Comodín / Joker"
  >
    <path
      d="M32 30 C25 24, 14 20, 8 28 C8 32, 13 36, 20 34 Z"
      fill="#EF4444"
      stroke="#7F1D1D"
      strokeWidth="1.5"
    />
    <path
      d="M22 34 C26 20, 32 10, 32 8 C32 10, 38 20, 42 34 Z"
      fill="#F59E0B"
      stroke="#78350F"
      strokeWidth="1.5"
    />
    <path
      d="M32 30 C39 24, 50 20, 56 28 C56 32, 51 36, 44 34 Z"
      fill="#8B5CF6"
      stroke="#4C1D95"
      strokeWidth="1.5"
    />
    <circle cx="8" cy="28" r="3" fill="#FBBF24" stroke="#78350F" strokeWidth="1" />
    <circle cx="32" cy="8" r="3" fill="#FBBF24" stroke="#78350F" strokeWidth="1" />
    <circle cx="56" cy="28" r="3" fill="#FBBF24" stroke="#78350F" strokeWidth="1" />
    <ellipse cx="32" cy="42" rx="14" ry="12" fill="#FEF08A" stroke="#78350F" strokeWidth="1.5" />
    <ellipse cx="27" cy="40" rx="3" ry="2" fill="#1E293B" />
    <ellipse cx="37" cy="40" rx="3" ry="2" fill="#1E293B" />
    <path d="M26 47 C29 51, 35 51, 38 47" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

// ESTRELLA / AS 🌟
export const EstrellaIcon: React.FC<IconProps> = ({ className = 'w-6 h-6', size }) => (
  <svg
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={size ? { width: size, height: size } : undefined}
    aria-label="Estrella / As"
  >
    <defs>
      <radialGradient id="starGrad" cx="45%" cy="40%" r="60%">
        <stop offset="0%" stopColor="#FEF08A" />
        <stop offset="35%" stopColor="#FACC15" />
        <stop offset="75%" stopColor="#CA8A04" />
        <stop offset="100%" stopColor="#713F12" />
      </radialGradient>
    </defs>
    <path
      d="M32 6 L38 22 L55 24 L42 36 L46 53 L32 44 L18 53 L22 36 L9 24 L26 22 Z"
      fill="url(#starGrad)"
      stroke="#713F12"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <circle cx="32" cy="32" r="5" fill="#FEF9C3" stroke="#854D0E" strokeWidth="1" />
  </svg>
);

// FUEGO / RACHA 🔥
export const FuegoIcon: React.FC<IconProps> = ({ className = 'w-6 h-6', size }) => (
  <svg
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={size ? { width: size, height: size } : undefined}
    aria-label="Fuego / Racha"
  >
    <defs>
      <linearGradient id="flameGrad" x1="0" y1="1" x2="0" y2="0">
        <stop offset="0%" stopColor="#DC2626" />
        <stop offset="45%" stopColor="#EA580C" />
        <stop offset="75%" stopColor="#F59E0B" />
        <stop offset="100%" stopColor="#FEF08A" />
      </linearGradient>
    </defs>
    <path
      d="M32 6 C34 16, 42 22, 44 30 C46 36, 45 42, 41 47 C37 52, 30 55, 25 53 C18 50, 15 42, 17 35 C18 31, 21 27, 23 24 C23 30, 26 33, 29 34 C28 26, 31 16, 32 6 Z"
      fill="url(#flameGrad)"
      stroke="#7C2D12"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    <path
      d="M30 36 C32 40, 36 42, 36 46 C36 49, 33 51, 30 51 C27 51, 24 48, 25 45 C25 43, 27 41, 28 39 C28 41, 29 42, 30 42 C30 39, 30 37, 30 36 Z"
      fill="#FEF08A"
    />
  </svg>
);

// Catalog of all avatar suits grouped for UI selection
export const AVATAR_SUIT_OPTIONS: { id: AvatarSuit; label: string; group: string }[] = [
  // Baraja Española
  { id: 'oros', label: 'Oros', group: 'Baraja Española' },
  { id: 'copas', label: 'Copas', group: 'Baraja Española' },
  { id: 'espadas', label: 'Espadas', group: 'Baraja Española' },
  { id: 'bastos', label: 'Bastos', group: 'Baraja Española' },
  // Baraja Francesa / Poker
  { id: 'picas', label: 'Picas ♠', group: 'Póker / Francesa' },
  { id: 'corazones', label: 'Corazones ♥', group: 'Póker / Francesa' },
  { id: 'treboles', label: 'Tréboles ♣', group: 'Póker / Francesa' },
  { id: 'diamantes', label: 'Diamantes ♦', group: 'Póker / Francesa' },
  // Emblemas y Figuras
  { id: 'corona', label: 'Rey / Corona 👑', group: 'Figuras y Especiales' },
  { id: 'caballo', label: 'Caballo 🐴', group: 'Figuras y Especiales' },
  { id: 'comodin', label: 'Comodín 🃏', group: 'Figuras y Especiales' },
  { id: 'estrella', label: 'Estrella 🌟', group: 'Figuras y Especiales' },
  { id: 'fuego', label: 'Fuego 🔥', group: 'Figuras y Especiales' },
];

// Suit helper dispatcher supporting all AvatarSuit options
export const SpanishSuitIcon: React.FC<{ suit: AvatarSuit; className?: string; size?: number }> = ({
  suit,
  className,
  size,
}) => {
  switch (suit) {
    case 'oros':
      return <OrosIcon className={className} size={size} />;
    case 'copas':
      return <CopasIcon className={className} size={size} />;
    case 'espadas':
      return <EspadasIcon className={className} size={size} />;
    case 'bastos':
      return <BastosIcon className={className} size={size} />;
    case 'picas':
      return <PicasIcon className={className} size={size} />;
    case 'corazones':
      return <CorazonesIcon className={className} size={size} />;
    case 'treboles':
      return <TrebolesIcon className={className} size={size} />;
    case 'diamantes':
      return <DiamantesIcon className={className} size={size} />;
    case 'corona':
      return <CoronaIcon className={className} size={size} />;
    case 'caballo':
      return <CaballoIcon className={className} size={size} />;
    case 'comodin':
      return <ComodinIcon className={className} size={size} />;
    case 'estrella':
      return <EstrellaIcon className={className} size={size} />;
    case 'fuego':
      return <FuegoIcon className={className} size={size} />;
    default:
      return <OrosIcon className={className} size={size} />;
  }
};

// Amarraco / Garbanzo bean or bone token for Mus
export const AmarracoStone: React.FC<{
  type?: 'piedra' | 'amarraco'; // piedra = 1 tanto, amarraco = 5 tantos
  selected?: boolean;
  onClick?: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg';
}> = ({ type = 'piedra', selected, onClick, title, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
  }[size];

  if (type === 'amarraco') {
    return (
      <button
        type="button"
        onClick={onClick}
        title={title || 'Amarraco (5 piedras)'}
        className={`${sizeClasses} relative rounded-full flex items-center justify-center transition-all duration-150 cursor-pointer ${
          selected ? 'scale-110 shadow-lg ring-2 ring-amber-300' : 'hover:scale-105 active:scale-95'
        }`}
        style={{
          background: 'radial-gradient(circle at 35% 35%, #ffd700, #b8860b 70%, #5c4308 100%)',
          boxShadow: 'inset 1px 1px 2px rgba(255,255,255,0.6), inset -1px -1px 3px rgba(0,0,0,0.6), 0 3px 6px rgba(0,0,0,0.4)',
          border: '1px solid #785205',
        }}
      >
        <span className="text-[10px] font-bold text-amber-950 font-serif leading-none select-none">
          5
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      title={title || 'Piedra (1 tanto)'}
      className={`${sizeClasses} relative rounded-full flex items-center justify-center transition-all duration-150 cursor-pointer ${
        selected ? 'scale-110 shadow-lg ring-2 ring-amber-300' : 'hover:scale-105 active:scale-95'
      }`}
      style={{
        background: 'radial-gradient(circle at 40% 30%, #fffdf5 0%, #ebd7b2 60%, #a88457 100%)',
        boxShadow: 'inset 1px 1px 3px rgba(255,255,255,0.8), inset -1px -1px 3px rgba(0,0,0,0.4), 0 3px 6px rgba(0,0,0,0.35)',
        border: '1px solid #8c6a41',
      }}
    >
      <div className="w-1.5 h-1.5 rounded-full bg-amber-900/20" />
    </button>
  );
};
