'use client';

export default function ProtectedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Đơn giản render children, không force authentication
    return <>{children}</>;
}
