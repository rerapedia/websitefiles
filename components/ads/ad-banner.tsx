export function AdBanner() {
  return (
    <div
      className="mx-auto hidden w-full max-w-[728px] items-center justify-center rounded-lg bg-gray-100/80 text-xs text-gray-400 md:flex"
      style={{ height: 90 }}
      data-ad-slot="header-banner"
      data-ad-format="728x90"
    >
      Ad — 728x90
    </div>
  );
}
