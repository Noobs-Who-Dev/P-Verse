'use client';

export default function ProtectedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // UserStatusProvider is already in root layout
    return <>{children}</>;
}
