import { ShieldCheck } from 'lucide-react';
import { SITE } from '@/config/site';

export type AdVariant = 'leaderboard' | 'sticky' | 'display';

interface AdSlotProps {
  variant: AdVariant;
  className?: string;
}

const STYLES: Record<AdVariant, { label: string; className: string }> = {
  leaderboard: {
    label: 'Ad Slot · Leaderboard 728×90',
    className: 'hidden md:flex h-[90px]',
  },
  sticky: {
    label: 'Ad Slot · 300×600',
    className: 'flex h-[600px]',
  },
  display: {
    label: 'Ad Slot · Display',
    className: 'flex min-h-[90px] w-full',
  },
};

/**
 * AdSense placement. When PUBLIC_ADSENSE_CLIENT is set, renders a real
 * <ins class="adsbygoogle"> slot; otherwise a discreet dashed placeholder so
 * the layout never breaks while ads are unconfigured.
 */
export default function AdSlot({ variant, className = '' }: AdSlotProps) {
  if (!SITE.showAds) return null;

  const client = import.meta.env.PUBLIC_ADSENSE_CLIENT as string | undefined;
  const slot = import.meta.env.PUBLIC_ADSENSE_SLOT?.[variant] as string | undefined;

  const style = STYLES[variant];
  const classes = `${style.className} ${className}`;

  if (client && slot) {
    return (
      <>
        <ins
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client={client}
          data-ad-slot={slot}
          data-ad-format={variant === 'leaderboard' ? 'horizontal' : 'auto'}
          data-full-width-responsive={variant !== 'sticky' ? 'true' : 'false'}
        />
        <script>{`(adsbygoogle = window.adsbygoogle || []).push({});`}</script>
      </>
    );
  }

  return (
    <div
      aria-hidden="true"
      className={`${classes} items-center justify-center rounded-md border border-dashed border-hairline bg-elevated/40`}
    >
      <span className="inline-flex items-center gap-1.5 font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-faint">
        <ShieldCheck className="h-3.5 w-3.5" />
        {style.label}
      </span>
    </div>
  );
}
