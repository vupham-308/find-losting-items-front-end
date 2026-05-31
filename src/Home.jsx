const items = [
    { id: 1, title: "Ví tiền màu nâu", district: "Quận 1", time: "Mới mất 2 giờ trước", badge: "LOST", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAOPASj3FPIov4un4PWtwzmLaLOREFt8p_cUk12vQxBqKzFEFAFf39cZAPazbm7k1iOrPmOJOf2ChK6J-DkPP-S1aNVWKnjCMxKyG16Yq5_gbQvY6Hgu5K4zoAmDrQzXYtEZu5fFq6y39nc6iE72ykIVBcPevv133MiS3KLvhm5SH02g5gz3GyOBN9JjOyIpmi--jl42T3VkAg-85I5-qXhBwLhHHio73qEI5_1yD8acgMGZ8e-N6DfjplOhCr16iWVJCVmtqqElgA" },
    { id: 2, title: "Chùm chìa khóa Honda", district: "Quận 3", time: "Tìm thấy sáng nay", badge: "FOUND", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAd7jYdsV6YRHzhk0jQds_mzOnFLIhr3w90amMJC5VyAuMqQEtVW36BM3po9AeLxl3T7m994KVaGHXqQU8b6yEgbYRX6fEFy0ssecBbPEcHb_f9YWgeNDq-6K5IdoEN2kZDFDCBhFuScg86GgzEILpQLm_cV-4iPXGgNyZf4LxI_WpCoPfejak-lSRMjjB6UVML7Nm4gjB1V5HquyL-Cyf1GyxbhVk9WqNrqJ9z6DBYbQn6A4vyNzxMgr6i-yUlK9uQ615fLjn1c_Q" },
    { id: 3, title: "Điện thoại iPhone 13", district: "Quận 10", time: "Mới mất hôm qua", badge: "LOST", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuA8V3wVqxpIoAeN9lrROxj9JyqMMF8zpL4YlEZsXPnR_U1r9pxUv4fFBDg7zZihd8pGAKDzRQgle1xGp_NMkSkJSqI6BqqD4v1NTxtnPYOeS7ow9KJreJUqvwd7fdrkuGLI18A5EXgLUeJ1sKBa5HUc334a7FAcgrA324eWCjk2xnGizPJt6CfI-0OW0Al7ernA4XizxzIIC84cdcH83v4CnLwg_mN08B8XRGaSUJKu2gTQcp-wDLS__EXPweHIz4fp7oBKhbWQKew" },
    { id: 4, title: "Mèo tam thể đi lạc", district: "Quận 7", time: "Tìm thấy 1 ngày trước", badge: "FOUND", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCKg2LxUjBpCadepRSi4oB532peeSXq7sM7o8HmMuuMV0SWYIyV-xDeJ9ZdZbSzRoOJUxPV4ZlGCyNwVNL1ihK3WmFfVbDgG4wA4xoLZ5sH4i-s97iV1xSM2sLl83kK60Bozm_9skuXf74fEs464Mp84W7nuhvpvYYUkQMeGIC28K7IjBh8O1ocnEcWR-LCHrMxEiez9_MHcxA-Hb3onxriMo1GsgcTsMghnw5aUcksksQUumviugfbsKWyky6e3FEB6AlSGvHxrEc" },
    { id: 5, title: "Balo laptop đen", district: "TP. Thủ Đức", time: "Mới mất 3 giờ trước", badge: "LOST", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuATUaEmBfOveQ-rLc1Aujs_bYfblZBcmce9PVg2K0aMWc1WiR0kiZ9wqsMDBPW4UyzrN8ppbBBcJ91trAmTLyOvmbyg7KvEKg1FBr003Y_QSWn4XLZacDg0-OZ9oqgVx2hJSOlHExyrGICx6WVJ80f4K9CZtSmyBXBK5CrJEOclYwGC1H3y37Z9afGSM3kTUEK0ltAJUF2ubd68scPXwp4G2N9qWUPwgQhJp67msvQrRtZLryFiH8_9jMfBDszKVDri5yVLsJZ09KY" },
    { id: 6, title: "Tai nghe Airpods", district: "Bình Thạnh", time: "Tìm thấy 5 giờ trước", badge: "FOUND", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCnyx52TOJ0aplA31NBt7mK8zQvSG5O1Y4CZkXFKAaqasQ9FJBQ3TPJWKtLMDUyuOtTnQfDH09ldODPGkmL_9CSHuTPIXyVV-kh-zpLVKubkLnXcwSG4OeWWQrMJ8gNrCPHAFlpSXRDdZScMwmtbASzyuHaIhB1Rc5gto-RINtVNtLS8iZKFpXS-B81Asw235mBKKgX7Q3gKLumc1Hq1Wf0emO0wzrSl6ksLaDywoFNf08M72JzxfEkGy5XUSnA0fKqhcZYCEMzLN4" },
]

const districts = ["Tất cả khu vực", "Quận 1", "Quận 3", "Quận 7", "TP. Thủ Đức"]

function ItemCard({ item }) {
    return (
        <div className="bg-surface-container-lowest rounded-xl overflow-hidden card-shadow transition-all group">
            <div className="aspect-[4/3] relative overflow-hidden">
                <img
                    src={item.img}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className={`absolute top-3 right-3 px-3 py-1 rounded-full text-[12px] font-bold tracking-widest ${item.badge === "LOST" ? "lost-badge" : "found-badge"}`}>
          {item.badge}
        </span>
            </div>
            <div className="p-stack-md">
                <h3 className="text-[20px] font-semibold mb-2">{item.title}</h3>
                <div className="flex items-center gap-2 text-[14px] text-outline mb-1">
                    <span className="material-symbols-outlined text-[18px]">location_on</span>
                    <span>{item.district}</span>
                </div>
                <div className="flex items-center gap-2 text-[14px] text-outline">
                    <span className="material-symbols-outlined text-[18px]">schedule</span>
                    <span>{item.time}</span>
                </div>
            </div>
        </div>
    )
}

export default function Home() {
    return (
        <main className="max-w-[1200px] mx-auto px-gutter-desktop">
            {/* Hero */}
            <section className="relative py-stack-lg my-stack-md rounded-xl overflow-hidden min-h-[400px] flex items-center bg-gradient-to-br from-primary-container to-on-primary-fixed-variant">
                <div className="relative z-10 px-gutter-desktop max-w-2xl text-on-primary-container">
                    <h1 className="text-[32px] font-bold leading-tight tracking-tight mb-stack-sm">
                        Tìm lại đồ thất lạc tại Sài Gòn chưa bao giờ dễ dàng hơn.
                    </h1>
                    <p className="text-[16px] mb-stack-md opacity-90">
                        Kết nối cộng đồng, sẻ chia thông tin, tìm lại vật phẩm quý giá của bạn trong lòng thành phố năng động.
                    </p>
                    <div className="flex flex-wrap gap-stack-md">
                        <button className="px-8 py-3 bg-secondary-container text-on-secondary-container font-bold rounded-lg shadow-lg hover:scale-105 transition-transform flex items-center gap-2">
                            <span className="material-symbols-outlined">report_gmailerrorred</span>
                            Báo mất đồ
                        </button>
                        <button className="px-8 py-3 bg-surface-container-lowest text-primary font-bold rounded-lg shadow-lg hover:scale-105 transition-transform flex items-center gap-2">
                            <span className="material-symbols-outlined">search_check</span>
                            Tìm thấy đồ
                        </button>
                    </div>
                </div>
                <div className="absolute right-0 bottom-0 top-0 w-1/2 hidden md:block opacity-30">
                    <img
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuBHA7xSVEmJRliRZSXwxvkSWWXqvDInORnYKKwK_sbq6gJ89ljb8qNjV4mUoMdOxlG2VK-S2pGgh9_DNLulD8K9b36_xQg61NiL72JVZ66HLElp3ywfL7BsLMYMpPnAeBre9lFxaDHr2I1yY1c5n97CrekkaQIwY3Z4Wy9n7hJ77mIcthlKk241j6_ygYsexqAKnb02CxDs-7zJ67FsNMTx-XHO2ziiXJIFNP2Yr7DwZq6X2AXm-6ymeDEbPROnk0Zi5CkqiJG3CBE"
                        alt="Ho Chi Minh City Skyline"
                        className="w-full h-full object-cover rounded-l-3xl"
                    />
                </div>
            </section>

            {/* Main layout */}
            <div className="flex flex-col lg:flex-row gap-stack-lg items-start">
                {/* Sidebar */}
                <aside className="hidden lg:flex flex-col w-64 gap-stack-md sticky top-24 shrink-0">
                    <div className="p-stack-md bg-surface-container-low rounded-xl">
                        <div className="mb-stack-md">
                            <h2 className="text-[20px] font-semibold text-primary">Khu vực</h2>
                            <p className="text-[14px] text-on-surface-variant">Lọc theo quận huyện</p>
                        </div>
                        <nav className="flex flex-col gap-1">
                            {districts.map((d, i) => (
                                <a
                                    key={d}
                                    href="#"
                                    className={`flex items-center gap-stack-sm rounded-lg px-4 py-2 text-[12px] font-bold tracking-widest transition-colors ${
                                        i === 0
                                            ? "bg-secondary-container text-on-secondary-container"
                                            : "text-on-surface-variant hover:bg-surface-container-highest"
                                    }`}
                                >
        <span className="material-symbols-outlined">
            {i === 0 ? "map" : "location_on"}
        </span>
                                    {d}
                                </a>
                            ))}
                    </nav>
            </div>
        </aside>

    {/* Content */}
    <section className="flex-grow">
        <div className="flex justify-between items-end mb-stack-md">
            <h2 className="text-[32px] font-bold text-on-surface">Tin đăng mới nhất</h2>
            <div className="flex gap-2">
                <button className="p-2 bg-surface-container rounded-lg text-on-surface-variant hover:text-primary">
                    <span className="material-symbols-outlined">grid_view</span>
                </button>
                <button className="p-2 bg-surface-container rounded-lg text-on-surface-variant hover:text-primary">
                    <span className="material-symbols-outlined">list</span>
                </button>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-stack-md">
            {items.map(item => <ItemCard key={item.id} item={item} />)}
        </div>

        {/* CTA */}
        <div className="mt-stack-lg p-stack-lg bg-surface-container-high rounded-2xl text-center border-2 border-dashed border-outline-variant">
            <h3 className="text-[20px] font-semibold mb-stack-sm">Bạn không thấy đồ vật của mình?</h3>
            <button className="px-10 py-4 bg-primary text-on-primary rounded-full font-bold shadow-lg transition-all text-[12px] tracking-widest">
                Đăng bài tìm đồ ngay!
            </button>
        </div>
    </section>
</div>
</main>
)
}