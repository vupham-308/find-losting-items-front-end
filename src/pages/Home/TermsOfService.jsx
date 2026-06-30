import React from 'react';

export default function TermsOfService() {
  return (
    <main className="max-w-[1000px] mx-auto px-6 py-12 min-h-screen">
      <div className="bg-surface-container-lowest rounded-2xl p-8 md:p-12 border border-outline-variant/30 shadow-sm space-y-8">
        
        {/* Title */}
        <div className="text-center space-y-2 border-b border-outline-variant/30 pb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-primary">Điều khoản sử dụng</h1>
          <p className="text-on-surface-variant font-body-lg text-sm">
            Cập nhật lần cuối: 29 tháng 6, 2026
          </p>
        </div>

        {/* Content sections */}
        <div className="space-y-6 text-left font-body-md text-on-surface-variant leading-relaxed">
          <p className="text-on-surface font-semibold">
            Chào mừng bạn đến với Sài Gòn Tìm Đồ. Trước khi sử dụng các dịch vụ đăng tin, tìm kiếm, 
            hoặc liên hệ trên nền tảng của chúng tôi, vui lòng đọc kỹ các Điều khoản sử dụng dưới đây. 
            Việc tiếp tục truy cập và sử dụng dịch vụ đồng nghĩa với việc bạn chấp thuận các điều khoản này.
          </p>

          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-primary flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">info</span>
              1. Giới thiệu dịch vụ
            </h2>
            <p className="text-sm">
              Sài Gòn Tìm Đồ là một ứng dụng phi lợi nhuận hướng tới cộng đồng tại khu vực Thành phố Hồ Chí Minh. Nền tảng hỗ trợ người dùng đăng tin báo mất đồ (Lost) và báo nhặt được đồ (Found), từ đó kết nối và gia tăng cơ hội nhận lại tài sản bị thất lạc thông qua thuật toán so khớp thông minh.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-primary flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">person</span>
              2. Quyền và trách nhiệm của người dùng
            </h2>
            <ul className="list-disc pl-5 text-sm space-y-2">
              <li>
                <strong>Cung cấp thông tin chính xác:</strong> Người dùng cam kết mọi thông tin về hình ảnh, mô tả vật phẩm, địa điểm và thời gian thất lạc là hoàn toàn đúng sự thật.
              </li>
              <li>
                <strong>Không lợi dụng nền tảng:</strong> Nghiêm cấm mọi hành vi đăng tin giả mạo, lừa đảo, đe dọa chuộc tài sản trái phép hoặc quấy rối các chủ tin đăng khác.
              </li>
              <li>
                <strong>Bảo mật tài khoản:</strong> Bạn tự chịu trách nhiệm quản lý thông tin đăng nhập và mọi hoạt động diễn ra dưới tài khoản của mình.
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-primary flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">fact_check</span>
              3. Quy chế Đăng tin và Xác minh
            </h2>
            <p className="text-sm">
              Nền tảng hỗ trợ thiết lập <strong>Câu hỏi xác minh thông tin (Verification Questions)</strong> bằng AI cho các bài viết nhặt được đồ. Người dùng báo mất phải vượt qua các câu hỏi này để liên hệ với người nhặt. Chúng tôi yêu cầu:
            </p>
            <ul className="list-disc pl-5 text-sm space-y-1">
              <li>Người nhặt thiết lập câu hỏi mang tính trung thực, liên quan trực tiếp đến đặc điểm nhận dạng của vật phẩm.</li>
              <li>Không đặt câu hỏi chứa thông tin nhạy cảm cá nhân, mật mã, thông tin tài chính cá nhân.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-primary flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">gavel</span>
              4. Giới hạn trách nhiệm pháp lý
            </h2>
            <ul className="list-disc pl-5 text-sm space-y-2">
              <li>
                Sài Gòn Tìm Đồ đóng vai trò là cầu nối thông tin trung gian và <strong>không chịu trách nhiệm trực tiếp</strong> về bất kỳ tổn thất, hư hỏng vật chất, hoặc giao dịch chuộc đồ phát sinh ngoài đời thực giữa các bên.
              </li>
              <li>
                Chúng tôi khuyên khích các bên tiến hành giao nhận tại các địa điểm công cộng an toàn (đồn công an, siêu thị, trung tâm thương mại) và luôn đi cùng người thân khi gặp gỡ.
              </li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-primary flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">delete_forever</span>
              5. Quyền chấm dứt dịch vụ
            </h2>
            <p className="text-sm">
              Chúng tôi có quyền tạm khóa hoặc xóa vĩnh viễn tài khoản cũng như bài đăng của bất kỳ cá nhân nào vi phạm các điều khoản trên mà không cần thông báo trước.
            </p>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-primary flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">contact_support</span>
              6. Liên hệ khiếu nại
            </h2>
            <p className="text-sm">
              Mọi ý kiến đóng góp hoặc phản ánh tin đăng giả mạo xin vui lòng liên hệ Ban quản trị qua email: <a href="mailto:support@saigontimdo.vn" className="text-primary underline font-semibold">support@saigontimdo.vn</a>.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
