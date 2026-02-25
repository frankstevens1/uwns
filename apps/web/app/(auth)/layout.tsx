export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="bg-(--ui-bg) text-(--ui-fg) w-full min-h-0">
      <div
        className="fixed inset-0 flex items-center justify-center w-full"
        style={{ zIndex: 0 }}
      >
        <div className="max-w-5xl w-full px-6 py-12 mx-auto flex justify-center">
          {children}
        </div>
      </div>
    </main>
  );
}
