import {useState} from "react";
import {useParams} from "react-router-dom";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";

// Dữ liệu bài đăng (có thể thay thế bằng API call sau)
const postsData = [
    {
        id: 1,
        title: "Ví tiền màu nâu",
        district: "Quận 1",
        time: "Mới mất 2 giờ trước",
        badge: "LOST",
        images: [
            "https://lh3.googleusercontent.com/aida-public/AB6AXuAOPASj3FPIov4un4PWtwzmLaLOREFt8p_cUk12vQxBqKzFEFAFf39cZAPazbm7k1iOrPmOJOf2ChK6J-DkPP-S1aNVWKnjCMxKyG16Yq5_gbQvY6Hgu5K4zoAmDrQzXYtEZu5fFq6y39nc6iE72ykIVBcPevv133MiS3KLvhm5SH02g5gz3GyOBN9JjOyIpmi--jl42T3VkAg-85I5-qXhBwLhHHio73qEI5_1yD8acgMGZ8e-N6DfjplOhCr16iWVJCVmtqqElgA",
            "https://lh3.googleusercontent.com/aida-public/AB6AXuAd7jYdsV6YRHzhk0jQds_mzOnFLIhr3w90amMJC5VyAuMqQEtVW36BM3po9AeLxl3T7m994KVaGHXqQU8b6yEgbYRX6fEFy0ssecBbPEcHb_f9YWgeNDq-6K5IdoEN2kZDFDCBhFuScg86GgzEILpQLm_cV-4iPXGgNyZf4LxI_WpCoPfejak-lSRMjjB6UVML7Nm4gjB1V5HquyL-Cyf1GyxbhVk9WqNrqJ9z6DBYbQn6A4vyNzxMgr6i-yUlK9uQ615fLjn1c_Q",
            "https://lh3.googleusercontent.com/aida-public/AB6AXuA8V3wVqxpIoAeN9lrROxj9JyqMMF8zpL4YlEZsXPnR_U1r9pxUv4fFBDg7zZihd8pGAKDzRQgle1xGp_NMkSkJSqI6BqqD4v1NTxtnPYOeS7ow9KJreJUqvwd7fdrkuGLI18A5EXgLUeJ1sKBa5HUc334a7FAcgrA324eWCjk2xnGizPJt6CfI-0OW0Al7ernA4XizxzIIC84cdcH83v4CnLwg_mN08B8XRGaSUJKu2gTQcp-wDLS__EXPweHIz4fp7oBKhbWQKew",
        ],
        description: "Tôi vừa mất chiếc ví tiền màu nâu tại khu vực Quận 1. Ví chứa tiền mặt và các thẻ quan trọng. Bất cứ ai tìm thấy vui lòng liên hệ ngay.",
        userName: "Nguyễn Văn A",
        userInitial: "N",
        userJoinDate: "2023",
        publicContactInfo: true,
        phone: "0901234567"
    },
    {
        id: 2,
        title: "Chùm chìa khóa Honda",
        district: "Quận 3",
        time: "Tìm thấy sáng nay",
        badge: "FOUND",
        images: [
            "https://lh3.googleusercontent.com/aida-public/AB6AXuAd7jYdsV6YRHzhk0jQds_mzOnFLIhr3w90amMJC5VyAuMqQEtVW36BM3po9AeLxl3T7m994KVaGHXqQU8b6yEgbYRX6fEFy0ssecBbPEcHb_f9YWgeNDq-6K5IdoEN2kZDFDCBhFuScg86GgzEILpQLm_cV-4iPXGgNyZf4LxI_WpCoPfejak-lSRMjjB6UVML7Nm4gjB1V5HquyL-Cyf1GyxbhVk9WqNrqJ9z6DBYbQn6A4vyNzxMgr6i-yUlK9uQ615fLjn1c_Q",
        ],
        description: "Tôi nhặt được một chùm chìa khóa Honda tại khu vực Quận 3 sáng nay. Chìa khóa được giữ lại an toàn. Ai là chủ nhân vui lòng liên hệ để nhận lại.",
        userName: "Trần Thị B",
        userInitial: "T",
        userJoinDate: "2023",
        publicContactInfo: false,
        phone: "0901234567"
    },
    {
        id: 3,
        title: "Điện thoại iPhone 13",
        district: "Quận 10",
        time: "Mới mất hôm qua",
        badge: "LOST",
        images: [
            "https://lh3.googleusercontent.com/aida-public/AB6AXuA8V3wVqxpIoAeN9lrROxj9JyqMMF8zpL4YlEZsXPnR_U1r9pxUv4fFBDg7zZihd8pGAKDzRQgle1xGp_NMkSkJSqI6BqqD4v1NTxtnPYOeS7ow9KJreJUqvwd7fdrkuGLI18A5EXgLUeJ1sKBa5HUc334a7FAcgrA324eWCjk2xnGizPJt6CfI-0OW0Al7ernA4XizxzIIC84cdcH83v4CnLwg_mN08B8XRGaSUJKu2gTQcp-wDLS__EXPweHIz4fp7oBKhbWQKew",
        ],
        description: "Điện thoại iPhone 13 màu đen mất tại khu vực Quận 10. Điện thoại có gắn ốp lưng và miếng dán kính cường lực. Vui lòng liên hệ nếu có thông tin.",
        userName: "Lê Văn C",
        userInitial: "L",
        userJoinDate: "2023",
        verified: false,
    },
    {
        id: 4,
        title: "Mèo tam thể đi lạc",
        district: "Quận 7",
        time: "Tìm thấy 1 ngày trước",
        badge: "FOUND",
        images: [
            "https://lh3.googleusercontent.com/aida-public/AB6AXuCKg2LxUjBpCadepRSi4oB532peeSXq7sM7o8HmMuuMV0SWYIyV-xDeJ9ZdZbSzRoOJUxPV4ZlGCyNwVNL1ihK3WmFfVbDgG4wA4xoLZ5sH4i-s97iV1xSM2sLl83kK60Bozm_9skuXf74fEs464Mp84W7nuhvpvYYUkQMeGIC28K7IjBh8O1ocnEcWR-LCHrMxEiez9_MHcxA-Hb3onxriMo1GsgcTsMghnw5aUcksksQUumviugfbsKWyky6e3FEB6AlSGvHxrEc",
        ],
        description: "Tôi nhặt được một chú mèo tam thể tại khu vực Quận 7 hôm qua. Chú mèo khỏe mạnh và hiền lành. Chủ nhân vui lòng liên hệ soonest để nhận lại bé cưng.",
        userName: "Phạm Thị D",
        userInitial: "P",
        userJoinDate: "2023",
        verified: true,
    },
    {
        id: 5,
        title: "Balo laptop đen",
        district: "TP. Thủ Đức",
        time: "Mới mất 3 giờ trước",
        badge: "LOST",
        images: [
            "https://lh3.googleusercontent.com/aida-public/AB6AXuATUaEmBfOveQ-rLc1Aujs_bYfblZBcmce9PVg2K0aMWc1WiR0kiZ9wqsMDBPW4UyzrN8ppbBBcJ91trAmTLyOvmbyg7KvEKg1FBr003Y_QSWn4XLZacDg0-OZ9oqgVx2hJSOlHExyrGICx6WVJ80f4K9CZtSmyBXBK5CrJEOclYwGC1H3y37Z9afGSM3kTUEK0ltAJUF2ubd68scPXwp4G2N9qWUPwgQhJp67msvQrRtZLryFiH8_9jMfBDszKVDri5yVLsJZ09KY",
        ],
        description: "Balo laptop đen của tôi bị mất tại TP. Thủ Đức. Bên trong chứa laptop và các vật dụng cá nhân. Ai tìm thấy vui lòng liên hệ.",
        userName: "Võ Văn E",
        userInitial: "V",
        userJoinDate: "2023",
        verified: true,
    },
    {
        id: 6,
        title: "Tai nghe Airpods",
        district: "Bình Thạnh",
        time: "Tìm thấy 5 giờ trước",
        badge: "FOUND",
        images: [
            "https://lh3.googleusercontent.com/aida-public/AB6AXuCnyx52TOJ0aplA31NBt7mK8zQvSG5O1Y4CZkXFKAaqasQ9FJBQ3TPJWKtLMDUyuOtTnQfDH09ldODPGkmL_9CSHuTPIXyVV-kh-zpLJubkLnXcwSG4OeWWQrMJ8gNrCPHAFlpSXRDdZScMwmtbASzyuHaIhB1Rc5gto-RINtVNtLS8iZKFpXS-B81Asw235mBKKgX7Q3gKLumc1Hq1Wf0emO0wzrSl6ksLaDywoFNf08M72JzxfEkGy5XUSnA0fKqhcZYCEMzLN4",
        ],
        description: "Tôi nhặt được một cặp tai nghe Airpods tại Bình Thạnh. Tai nghe còn pin tốt. Chủ nhân vui lòng liên hệ để nhận lại.",
        userName: "Hoàng Văn F",
        userInitial: "H",
        userJoinDate: "2023",
        verified: true,
    },
];

export default function PostDetail() {
    const {id} = useParams();
    const post = postsData.find((p) => p.id === parseInt(id));

    const [selectedImage, setSelectedImage] = useState(post?.images[0] || "");

    if (!post) {
        return (
            <div className="min-h-screen bg-slate-50">
                <Header/>
                <main className="max-w-7xl mx-auto px-4 py-6">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold">Bài đăng không tồn tại</h2>
                    </div>
                </main>
                <Footer/>
            </div>
        );
    }

    const similarPosts = postsData.filter((p) => p.id !== post.id).slice(0, 4);

    return (
        <div className="min-h-screen bg-slate-50">
            {/* MAIN */}
            <main className="max-w-7xl mx-auto px-4 py-6">
                <div className="grid lg:grid-cols-10 gap-8">
                    {/* LEFT */}
                    <div className="lg:col-span-7 space-y-6">
                        {/* Gallery */}
                        <section className="bg-white rounded-xl overflow-hidden shadow">
                            <div className="relative aspect-[4/3]">
                                <img
                                    src={selectedImage}
                                    alt={post.title}
                                    className="w-full h-full object-cover"
                                />

                                <span
                                    className={`absolute top-4 right-4 px-4 py-1 rounded-full font-semibold ${
                                        post.badge === "LOST"
                                            ? "lost-badge"
                                            : "found-badge"
                                    }`}
                                >
                                    {post.badge === "LOST"
                                        ? "LOST"
                                        : "FOUND"}
                                </span>
                            </div>

                            <div className="grid grid-cols-4 gap-2 p-3">
                                {post.images.map((img, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setSelectedImage(img)}
                                        className={`aspect-square rounded-lg overflow-hidden border-2 ${
                                            selectedImage === img
                                                ? "border-blue-500"
                                                : "border-transparent"
                                        }`}
                                    >
                                        <img
                                            src={img}
                                            alt={`${post.title} ${index + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        </section>

                        {/* Detail */}
                        <section className="bg-white p-6 rounded-xl shadow">
                            <h2 className="text-3xl font-bold mb-4">{post.title}</h2>

                            <div className="flex gap-6 text-gray-500 border-b pb-4">
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined">location_on</span>
                                    <span>{post.district}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined">schedule</span>
                                    <span>{post.time}</span>
                                </div>
                            </div>

                            <div className="mt-5">
                                <h3 className="font-bold text-blue-600 uppercase mb-3">
                                    Mô tả chi tiết
                                </h3>

                                <p className="leading-7 text-gray-600">
                                    {post.description}
                                </p>
                            </div>
                        </section>
                    </div>

                    {/* RIGHT */}
                    <aside className="lg:col-span-3 space-y-6">
                        {/* User */}
                        <div className="bg-white p-6 rounded-xl shadow">
                            <h3 className="font-semibold text-gray-500 mb-4">
                                Người đăng tin
                            </h3>

                            {post.publicContactInfo ? (
                                <>
                                    <div className="flex gap-3 items-center mb-6">
                                        <div
                                            className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600">
                                            {post.userInitial}
                                        </div>

                                        <div>
                                            <p className="font-semibold">
                                                {post.userName}
                                            </p>

                                            <p className="text-sm text-gray-500">
                                                Thành viên từ {post.userJoinDate}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-3 mb-6">
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <span className="material-symbols-outlined">
                                                call
                                            </span>
                                            <span>{post.phone}</span>
                                        </div>

                                    </div>
                                </>
                            ) : (
                                <div className="bg-slate-50 border rounded-xl p-4 mb-6">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="material-symbols-outlined text-gray-500">
                                            lock
                                        </span>
                                        <span className="font-medium">
                                            Thông tin đang được bảo mật
                                        </span>
                                    </div>

                                    <p className="text-sm text-gray-500">
                                        Người đăng đã chọn không công khai
                                        thông tin cá nhân.
                                    </p>
                                </div>
                            )}

                            <button
                                className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition"
                                onClick={() =>
                                    alert("Yêu cầu xác minh đã được gửi")
                                }
                            >
                                Bắt đầu xác minh đồ vật
                            </button>
                        </div>

                        {/* Safety */}
                        <div className="bg-yellow-50 border border-yellow-300 p-5 rounded-xl">
                            <h4 className="font-bold mb-2">🛡️ Mẹo an toàn</h4>

                            <p className="text-sm leading-6">
                                Khi nhận lại đồ, hãy hẹn gặp ở nơi công cộng
                                đông người. Không chuyển khoản bất kỳ khoản
                                phí chuộc đồ nào trước khi nhận được vật phẩm.
                            </p>
                        </div>
                    </aside>
                </div>

                {/* Similar Posts */}
                <section className="mt-10">
                    <div className="flex justify-between mb-5">
                        <h3 className="text-2xl font-bold">Tin đăng tương tự</h3>

                        <button className="text-blue-600">Xem tất cả →</button>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
                        {similarPosts.map((p) => (
                            <div
                                key={p.id}
                                className="bg-white rounded-xl overflow-hidden shadow hover:shadow-lg transition"
                            >
                                <div className="relative aspect-[4/3]">
                                    <img
                                        src={p.images[0]}
                                        alt={p.title}
                                        className="w-full h-full object-cover"
                                    />

                                    <span
                                        className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-bold ${
                                            p.badge === "FOUND"
                                                ? "found-badge"
                                                : "lost-badge"
                                        }`}
                                    >
                                        {p.badge === "FOUND"
                                            ? "FOUND"
                                            : "LOST"}
                                    </span>
                                </div>

                                <div className="p-stack-md">
                                    <h3 className="text-[20px] font-semibold mb-2">{p.title}</h3>
                                    <div className="flex items-center gap-2 text-[14px] text-outline mb-1">
                                        <span className="material-symbols-outlined text-[18px]">location_on</span>
                                        <span>{p.district}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-[14px] text-outline">
                                        <span className="material-symbols-outlined text-[18px]">schedule</span>
                                        <span>{p.time}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </main>

        </div>
    );
}