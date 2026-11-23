// Logo LPK BYE (file SVG di client/public)
const SRC = {
  horizontal: '/logo-horizontal.svg',
  stacked: '/logo-lpk-bye.svg',
  mark: '/logo-mark.svg',
};

export default function Logo({ variant = 'horizontal', light = false, className = 'h-9' }) {
  return <img src={SRC[variant]} alt="LPK BYE" className={`w-auto ${light ? 'brightness-0 invert' : ''} ${className}`} />;
}
