import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Shield, Lock, Database, Globe, Info } from 'lucide-react';

interface InfoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const InfoModal: React.FC<InfoModalProps> = ({ open, onOpenChange }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] bg-surface text-text border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Info className="text-brand" size={24} />
            Thông tin Bảo mật & Quyền riêng tư
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-brand font-semibold">
              <Shield size={20} />
              <h3>Cơ chế Kết nối Trực tiếp (Direct Connection)</h3>
            </div>
            <p className="text-sm leading-relaxed opacity-90">
              Đây là tính năng bảo mật cao nhất. Khi bạn chọn <b>Direct</b> trong phần cài đặt Agent, trình duyệt của bạn sẽ gửi yêu cầu trực tiếp đến n8n của bạn.
            </p>
            <ul className="text-sm space-y-2 list-disc pl-5 opacity-80">
              <li>Dữ liệu <b>không bao giờ</b> đi qua máy chủ của trang web này.</li>
              <li>Chủ sở hữu trang web hoàn toàn không thể xem nội dung tin nhắn hay thông tin xác thực của bạn.</li>
              <li>Yêu cầu n8n của bạn phải được cấu hình cho phép CORS.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <div className="flex items-center gap-2 text-brand font-semibold">
              <Database size={20} />
              <h3>Lưu trữ tại chỗ (Local Storage)</h3>
            </div>
            <p className="text-sm leading-relaxed opacity-90">
              Mọi cấu hình Agent, lịch sử chat và tùy chọn cá nhân đều được lưu trữ <b>duy nhất</b> trên trình duyệt của bạn.
            </p>
            <ul className="text-sm space-y-2 list-disc pl-5 opacity-80">
              <li>Chúng tôi không sử dụng cơ sở dữ liệu phía máy chủ để lưu trữ thông tin cá nhân của bạn.</li>
              <li>Dữ liệu của bạn thuộc về bạn và nằm trong tầm kiểm soát của bạn.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <div className="flex items-center gap-2 text-brand font-semibold">
              <Lock size={20} />
              <h3>Mã hóa & An toàn</h3>
            </div>
            <p className="text-sm leading-relaxed opacity-90">
              Trang web sử dụng giao thức HTTPS để đảm bảo dữ liệu truyền tải giữa trình duyệt và n8n (hoặc proxy) luôn được mã hóa.
            </p>
          </section>

          <div className="p-4 bg-brand-light/10 rounded-2xl border border-brand/10">
            <p className="text-xs text-center italic opacity-70">
              "Sự riêng tư của bạn là ưu tiên hàng đầu của chúng tôi. Hệ thống được thiết kế để hoạt động mà không cần biết bạn là ai hay bạn đang làm gì."
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
