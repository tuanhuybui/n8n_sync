import React, { useState } from 'react';
import { Trash2, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InfoPopoverProps {
  onClearData: () => void;
  connectionType: 'direct' | 'proxy';
}

export const InfoPopover: React.FC<InfoPopoverProps> = ({ onClearData, connectionType }) => {
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <div className="space-y-6 p-4 text-text-muted">
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <h3 className="text-xs uppercase font-semibold text-text tracking-[0.2em]">Bảo mật</h3>
        <span className={cn(
          "text-[10px] font-medium uppercase tracking-tighter px-2 py-0.5 rounded-full",
          connectionType === 'direct' ? "bg-green-50 text-green-600" : "bg-blue-50 text-blue-600"
        )}>
          {connectionType === 'direct' ? 'Direct Connection' : 'Proxy Mode'}
        </span>
      </div>
      
      <div className="space-y-6">
        <section>
          <h4 className="text-[11px] font-semibold text-text uppercase tracking-widest mb-2 transition-colors group-hover:text-brand">Truyền tải</h4>
          <p className="text-xs leading-relaxed opacity-80">
            Dữ liệu được mã hóa truyền tải an toàn, ngăn chặn mọi hành vi nghe lén.
          </p>
        </section>

        <section>
          <h4 className="text-[11px] font-semibold text-text uppercase tracking-widest mb-2">Lưu trữ cục bộ</h4>
          <p className="text-xs leading-relaxed opacity-80">
            Webhook URL và lịch sử chat được lưu duy nhất tại trình duyệt của bạn (Local Storage).
          </p>
        </section>

        <section>
          <h4 className="text-[11px] font-semibold text-text uppercase tracking-widest mb-2">Quyền riêng tư</h4>
          <p className="text-xs leading-relaxed opacity-80">
            Không sử dụng cookies hay bất kỳ hệ thống theo dõi hành vi của bên thứ ba nào.
          </p>
        </section>
      </div>

      <div className="pt-6 border-t border-gray-100 space-y-5">
        {!showConfirm ? (
          <button 
            onClick={() => setShowConfirm(true)}
            className="w-full text-left text-[10px] uppercase font-medium tracking-widest text-gray-400 hover:text-red-500 transition-colors py-1"
          >
            Xóa sạch dữ liệu ứng dụng
          </button>
        ) : (
          <div className="space-y-3 animate-in fade-in slide-in-from-top-1">
            <p className="text-[10px] text-red-500 font-medium leading-relaxed">Bạn có chắc chắn? Thao tác này sẽ xóa mọi cấu hình và lịch sử chat ngay lập tức.</p>
            <div className="flex gap-4">
              <button 
                onClick={onClearData}
                className="text-[10px] font-bold text-red-600 uppercase tracking-widest hover:underline"
              >
                Xác nhận xóa
              </button>
              <button 
                onClick={() => setShowConfirm(false)}
                className="text-[10px] font-medium text-gray-400 uppercase tracking-widest"
              >
                Hủy bỏ
              </button>
            </div>
          </div>
        )}
        
        <a 
          href="https://github.com/tuanhuybui/n8n_sync" 
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-[10px] uppercase font-medium tracking-widest text-gray-300 hover:text-brand transition-colors"
        >
          Source Code <ArrowUpRight size={10} strokeWidth={1.2} />
        </a>
      </div>
    </div>
  );
};
