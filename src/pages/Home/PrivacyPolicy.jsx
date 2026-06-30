import React from 'react';

export default function PrivacyPolicy() {
  return (
    <main className="max-w-[1000px] mx-auto px-6 py-12 min-h-screen">
      <div className="bg-surface-container-lowest rounded-2xl p-8 md:p-12 border border-outline-variant/30 shadow-sm space-y-8">
        
        {/* Title */}
        <div className="text-center space-y-2 border-b border-outline-variant/30 pb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-primary">Chính sách bảo mật</h1>
          <p className="text-on-surface-variant font-body-lg text-sm">
            Cập nhật lần cuối: 29 tháng 6, 2026
          </p>
        </div>

        {/* Content sections */}
        <div className="space-y-6 text-left font-body-md text-on-surface-variant leading-relaxed">
          <p className="text-on-surface font-semibold">
            Sài Gòn Tìm Đồ cam kết tôn trọng và bảo vệ quyền riêng tư cũng như thông tin cá nhân của bạn. 
            Chính sách bảo mật này giải thích cách chúng tôi thu thập, sử dụng, bảo mật và chia sẻ thông tin 
            của bạn khi sử dụng ứng dụng.
          </p>

          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-primary flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">troubleshoot</span>
              1. Thông tin chúng tôi thu thập
            </h2>
            <ul className="list-disc pl-5 text-sm space-y-2">
              <li>
                <strong>Thông tin cá nhân cơ bản:</strong> Khi đăng ký tài khoản hoặc đăng tin, chúng tôi có thể thu thập Họ và tên, Email, Số điện thoại và hình ảnh đại diện (nếu có).
              </li>
              <li>
                <strong>Thông tin tin đăng:</strong> Hình ảnh đồ vật, mô tả chi tiết, khu vực Quận/Huyện, Phường/Xã và tọa độ địa lý (Kinh độ/Vĩ độ) nơi thất lạc hoặc tìm thấy vật phẩm.
              </li>
              <li>
                <strong>Dữ liệu thiết bị & IP:</strong> Thông tin trình duyệt và hệ điều hành phục vụ việc tối ưu hóa giao diện.
              </li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-primary flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">security</span>
              2. Cách chúng tôi sử dụng thông tin
            </h2>
            <ul className="list-disc pl-5 text-sm space-y-2">
              <li>Đăng tải công khai tin đăng báo mất đồ hoặc báo tìm thấy đồ lên bảng tin cộng đồng.</li>
              <li>Sử dụng hình ảnh và mô tả để AI sinh câu hỏi xác minh và đối khớp độ trùng khớp giữa các tin đăng.</li>
              <li>Kết nối người mất và người nhặt đồ để trao đổi nhận lại vật phẩm.</li>
              <li>Cải thiện chất lượng và trải nghiệm ứng dụng.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-primary flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">visibility_off</span>
              3. Quyền kiểm soát hiển thị thông tin liên hệ
            </h2>
            <p className="text-sm">
              Chúng tôi cung cấp tùy chọn quyền riêng tư linh hoạt khi bạn báo tìm thấy đồ (Found):
            </p>
            <ul className="list-disc pl-5 text-sm space-y-2">
              <li>
                <strong>Công khai (Public):</strong> Số điện thoại và thông tin liên hệ của bạn hiển thị công khai trên bài đăng để mọi người chủ động liên hệ.
              </li>
              <li>
                <strong>Công khai khi có người xác nhận (Match / WHEN_MATCH):</strong> Số điện thoại của bạn sẽ hoàn toàn được ẩn đi. Thông tin liên hệ chỉ hiển thị với người báo mất sau khi họ trả lời đúng câu hỏi xác minh và được bạn phê duyệt xác nhận khớp (Match).
              </li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-primary flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">share</span>
              4. Chia sẻ thông tin với bên thứ ba
            </h2>
            <p className="text-sm">
              Sài Gòn Tìm Đồ cam kết <strong>không bán, trao đổi hoặc thương mại hóa</strong> thông tin cá nhân của bạn cho bất kỳ bên thứ ba nào. Chúng tôi chỉ chia sẻ dữ liệu không định danh (như tọa độ bản đồ) với các dịch vụ bản đồ nguồn mở (như OpenStreetMap Nominatim) để phục vụ tính năng tìm kiếm vị trí.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-primary flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">edit_document</span>
              5. Quyền của bạn đối với dữ liệu
            </h2>
            <p className="text-sm">
              Bạn có toàn quyền chỉnh sửa thông tin cá nhân, cập nhật tin đăng hoặc xóa vĩnh viễn tin đăng của mình khỏi hệ thống thông qua trang cá nhân hoặc bằng cách gửi yêu cầu trực tiếp đến ban quản trị.
            </p>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-primary flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">admin_panel_settings</span>
              6. Thay đổi chính sách bảo mật
            </h2>
            <p className="text-sm">
              Chúng tôi có thể cập nhật chính sách bảo mật này theo thời gian để phù hợp với các nâng cấp tính năng mới. Các thay đổi sẽ được công bố chính thức trên ứng dụng cùng ngày cập nhật mới nhất.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
