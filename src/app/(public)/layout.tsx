import Header from '@/components/layout/Header'


export default function PublicLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen flex flex-col transition-colors duration-300">
            <Header />
            <div className="flex-grow">
                {children}
            </div>
        </div>
    )
}
