export default function Footer() {
    return (
        <footer className="w-full py-stack-lg px-gutter-desktop mt-stack-lg flex flex-col items-center gap-stack-md bg-surface-container-highest border-t border-outline-variant">
            <div className="flex flex-col md:flex-row justify-between w-full max-w-[1200px] gap-stack-md">
                <div className="flex flex-col gap-2">
                    <span className="text-[20px] font-bold text-on-surface">Sài Gòn Tìm Đồ</span>
                    <p className="text-[14px] text-on-surface-variant max-w-xs">
                        Nền tảng kết nối người mất và người nhặt được đồ tại TP. Hồ Chí Minh, vì một cộng đồng tử tế và gắn kết.
                    </p>
                </div>
                <div className="flex flex-wrap gap-x-stack-lg gap-y-stack-sm">
                    <div className="flex flex-col gap-2">
                        <span className="text-[12px] font-bold tracking-widest text-on-surface">Khám phá</span>
                        <a href="#" className="text-[14px] text-on-surface-variant hover:text-primary hover:underline transition-all">Hướng dẫn sử dụng</a>
                        <a href="#" className="text-[14px] text-on-surface-variant hover:text-primary hover:underline transition-all">Liên hệ hỗ trợ</a>
                    </div>
                    <div className="flex flex-col gap-2">
                        <span className="text-[12px] font-bold tracking-widest text-on-surface">Pháp lý</span>
                        <a href="#" className="text-[14px] text-on-surface-variant hover:text-primary hover:underline transition-all">Điều khoản sử dụng</a>
                        <a href="#" className="text-[14px] text-on-surface-variant hover:text-primary hover:underline transition-all">Chính sách bảo mật</a>
                    </div>
                </div>
            </div>

            <div className="w-full max-w-[1200px] pt-stack-md border-t border-outline-variant flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-[14px] text-on-surface-variant">© 2026 Sài Gòn Tìm Đồ. Vì một cộng đồng TP.HCM gắn kết.</p>

            </div>
        </footer>
    )
}