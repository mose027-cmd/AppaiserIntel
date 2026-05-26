import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
<body style={{ backgroundColor: "#f1f5f9", fontFamily: "Arial, sans-serif" }}>
  {children}
</body>
    </html>
  );
}
