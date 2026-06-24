import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AlertCircle, CheckCircle, ImagePlus, Send, Info } from 'lucide-react';

export default function CreateItemPage() {
  const [mode, setMode] = useState('lost');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    dateTime: '',
    name: '',
    phone: '',
    visibility: 'public',
  });
  const [images, setImages] = useState([]);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Đọc query parameter từ URL khi component được mount
    const modeParam = searchParams.get('mode');
    if (modeParam === 'found' || modeParam === 'lost') {
      setMode(modeParam);
    }
  }, [searchParams]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (images.length + files.length > 5) {
      alert('Tối đa chỉ có thể tải 5 ảnh');
      return;
    }
    setImages(prev => [...prev, ...files]);
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({
      mode,
      ...formData,
      images,
    });
    // TODO: Gửi dữ liệu tới API
  };

  return (
    <main className="max-w-[800px] mx-auto px-4 md:px-0 py-8 min-h-screen">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="font-headline-lg text-headline-lg-mobile mb-2 text-primary">Đăng tin mới</h1>
        <p className="text-on-surface-variant font-body-lg">
          Chia sẻ thông tin để cộng đồng cùng hỗ trợ bạn.
        </p>
      </div>

      {/* Form Card */}
      <div className="form-card bg-surface-container-lowest rounded-xl p-8 border border-outline-variant/30 shadow-sm">

        {/* Toggle Selector */}
        <div className="flex p-1 bg-surface-container rounded-xl mb-6">
          <button
            onClick={() => setMode('lost')}
            className={`toggle-btn flex-1 py-3 rounded-lg font-headline-md text-center transition-all duration-300 flex items-center justify-center gap-2 ${
              mode === 'lost' 
                ? 'active bg-primary text-white' 
                : 'text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            <AlertCircle size={20} />
            Báo mất đồ
          </button>
          <button
            onClick={() => setMode('found')}
            className={`toggle-btn flex-1 py-3 rounded-lg font-headline-md text-center transition-all duration-300 flex items-center justify-center gap-2 ${
              mode === 'found' 
                ? 'active bg-primary text-white' 
                : 'text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            <CheckCircle size={20} />
            Báo tìm thấy đồ
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Title */}
          <div className="space-y-1">
            <label className="font-label-bold text-label-bold text-on-surface-variant uppercase tracking-wider">
              Tiêu đề
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full px-4 py-3 rounded-lg border border-outline-variant bg-surface font-body-lg transition-all focus:border-primary focus:ring-2 focus:ring-primary/10"
              placeholder="Ví dụ: Mất ví màu nâu tại Quận 1"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="font-label-bold text-label-bold text-on-surface-variant uppercase tracking-wider">
              Mô tả chi tiết
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="w-full px-4 py-3 rounded-lg border border-outline-variant bg-surface font-body-lg transition-all focus:border-primary focus:ring-2 focus:ring-primary/10"
              placeholder="Mô tả đặc điểm nhận dạng, nhãn hiệu, các giấy tờ bên trong..."
              rows="4"
              required
            />
          </div>

          {/* Image Upload */}
          <div className="space-y-1">
            <label className="font-label-bold text-label-bold text-on-surface-variant uppercase tracking-wider">
              Hình ảnh
            </label>
            <label className="border-2 border-dashed border-outline-variant rounded-xl p-8 flex flex-col items-center justify-center bg-surface-container-low hover:bg-surface-container-high transition-colors cursor-pointer group">
              <ImagePlus size={48} className="text-primary mb-2 group-hover:scale-110 transition-transform" />
              <p className="font-body-lg font-semibold">Tải ảnh lên hoặc kéo thả vào đây</p>
              <p className="font-body-sm text-on-surface-variant">
                Tối đa 5 ảnh, dung lượng mỗi ảnh không quá 5MB
              </p>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>

            {/* Image Preview */}
            {images.length > 0 && (
              <div className="grid grid-cols-3 md:grid-cols-5 gap-2 mt-4">
                {images.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={URL.createObjectURL(image)}
                      alt={`Preview ${index}`}
                      className="w-full h-20 object-cover rounded-lg border border-outline-variant"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 -translate-y-1/2 translate-x-1/2 hover:bg-red-600 transition-all"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Grid for Location & Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Location */}
            <div className="space-y-1">
              <label className="font-label-bold text-label-bold text-on-surface-variant uppercase tracking-wider">
                Vị trí (Quận/Huyện)
              </label>
              <select
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-lg border border-outline-variant bg-surface font-body-lg appearance-none cursor-pointer transition-all focus:border-primary focus:ring-2 focus:ring-primary/10"
              >
                <option value="">Chọn Quận/Huyện</option>
                <option value="q1">Quận 1</option>
                <option value="q3">Quận 3</option>
                <option value="q4">Quận 4</option>
                <option value="q5">Quận 5</option>
                <option value="q7">Quận 7</option>
                <option value="q10">Quận 10</option>
                <option value="bt">Quận Bình Thạnh</option>
                <option value="gv">Quận Gò Vấp</option>
                <option value="tb">Quận Tân Bình</option>
                <option value="td">Thành phố Thủ Đức</option>
              </select>
            </div>

            {/* Time */}
            <div className="space-y-1">
              <label className="font-label-bold text-label-bold text-on-surface-variant uppercase tracking-wider">
                Thời gian
              </label>
              <input
                type="datetime-local"
                name="dateTime"
                value={formData.dateTime}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-lg border border-outline-variant bg-surface font-body-lg cursor-pointer transition-all focus:border-primary focus:ring-2 focus:ring-primary/10"
              />
            </div>
          </div>

          {/* Contact Information Section */}
          <div className="pt-6 border-t border-outline-variant/30 mt-6">
            <label className="font-label-bold text-label-bold text-on-surface-variant uppercase tracking-wider block mb-4">
              Thông tin liên hệ
            </label>

            {/* Lost Mode Contact Info */}
            {mode === 'lost' && (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="font-label-bold text-label-bold text-on-surface-variant uppercase tracking-wider">
                      Họ và tên
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg border border-outline-variant bg-surface font-body-lg transition-all focus:border-primary focus:ring-2 focus:ring-primary/10"
                      placeholder="Ví dụ: Nguyễn Văn A"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-label-bold text-label-bold text-on-surface-variant uppercase tracking-wider">
                      Số điện thoại
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg border border-outline-variant bg-surface font-body-lg transition-all focus:border-primary focus:ring-2 focus:ring-primary/10"
                      placeholder="Ví dụ: 090xxxxxxx"
                      required
                    />
                  </div>
                </div>
                <div className="mt-4 flex items-start gap-3">
                  <Info size={20} className="text-secondary flex-shrink-0 mt-0.5" />
                  <p className="font-body-sm text-on-secondary-fixed-variant">
                    Để người nhặt được có thể chủ động liên hệ với bạn nhanh nhất, thông tin liên hệ của bạn sẽ được hiển thị công khai trên tin đăng này.
                  </p>
                </div>
              </div>
            )}

            {/* Found Mode Contact Info */}
            {mode === 'found' && (
              <div className="space-y-3">
                <div className="flex flex-col gap-3">
                  <label className="flex items-center gap-3 p-4 rounded-xl border border-outline-variant bg-surface cursor-pointer hover:border-primary transition-all">
                    <input
                      type="radio"
                      name="visibility"
                      value="public"
                      checked={formData.visibility === 'public'}
                      onChange={handleInputChange}
                      className="w-5 h-5 text-primary"
                    />
                    <div>
                      <span className="font-body-lg font-bold block">Công khai</span>
                      <p className="font-body-sm text-on-surface-variant">
                        Ai cũng có thể thấy thông tin liên hệ của bạn.
                      </p>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 p-4 rounded-xl border border-outline-variant bg-surface cursor-pointer hover:border-primary transition-all">
                    <input
                      type="radio"
                      name="visibility"
                      value="match"
                      checked={formData.visibility === 'match'}
                      onChange={handleInputChange}
                      className="w-5 h-5 text-primary"
                    />
                    <div>
                      <span className="font-body-lg font-bold block">Công khai khi có người xác nhận (Match)</span>
                      <p className="font-body-sm text-on-surface-variant">
                        Chỉ hiển thị thông tin khi bạn xác nhận yêu cầu nhận lại đồ là chính xác.
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Action Button */}
          <div className="pt-6">
            <button
              type="submit"
              className="w-full bg-primary text-on-primary-container py-4 rounded-xl font-headline-md shadow-lg shadow-primary/20 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              Đăng tin ngay
              <Send size={20} />
            </button>
            <p className="text-center font-body-sm text-on-surface-variant mt-4 px-8">
              Bằng cách đăng tin, bạn đồng ý với{' '}
              <a href="#" className="text-primary underline hover:no-underline">
                Điều khoản sử dụng
              </a>{' '}
              và{' '}
              <a href="#" className="text-primary underline hover:no-underline">
                Hướng dẫn cộng đồng
              </a>{' '}
              của Sài Gòn Tìm Đồ.
            </p>
          </div>
        </form>
      </div>
    </main>
  );
}
