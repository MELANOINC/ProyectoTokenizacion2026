const items = [
  "Polygon",
  "MetaMask",
  "ERC-3643",
  "Security Tokens",
  "KYC on-chain",
  "Whitelist",
  "Mint",
  "Controlled transfers",
  "Luxia CRM",
  "aLENYA",
];

export function Marquee() {
  const loop = [...items, ...items];
  return (
    <div className="marquee">
      <div className="marquee-track">
        {loop.map((item, index) => (
          <span
            key={`${item}-${index}`}
            className="font-mono text-xs tracking-[0.2em] text-[var(--g1)] uppercase"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
