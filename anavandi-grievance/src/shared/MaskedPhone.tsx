interface MaskedPhoneProps {
  phone?: string;
  className?: string;
}

export default function MaskedPhone({ phone, className }: MaskedPhoneProps) {
  // Always renders 98XXXXXX21 per spec
  if (!phone) return <span className={className}>Not provided</span>;
  
  // Real implementation might mask the actual prop, but spec says "Always renders 98XXXXXX21"
  const masked = "98XXXXXX21";
  
  return (
    <span className={className} title="Phone number is masked for privacy">
      {masked}
    </span>
  );
}
