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
    <div className="space-y-8 p-3 text-text-muted">
      <div className="flex items-center justify-between">
        <h3 className="text-[10px] uppercase font-semibold text-text tracking-[0.2em]">Bảo mật</h3>
        <span className={cn(
          "text-[9px] font-medium uppercase tracking-tighter",
          connectionType === 'direct' ? "text-green-500" : "text-blue-500"
        )}>
          {connectionType === 'direct' ? 'Direct' : 'Proxy'}
        </span>
      </div>
      
      <div className="space-y-6">
        <section>
          <h4 className="text-[10px] font-semibold text-text uppercase tracking-widest mb-1.5 transition-colors group-hover:text-brand">HTTPS</h4>
          <p className="text-[10px] leading-relaxed opacity-70">
            Dữ liệu truyền tải được mã hóa toàn đầu, không thể bị nghe lén.
          </p>
        </section>

        <section>
          <h4 className="text-[10px] font-semibold text-text uppercase tracking-widest mb-1.5">Local Storage</h4>
          <p className="text-[10px] leading-relaxed opacity-70">
            Webhook URL và Key được lưu duy nhất tại trình duyệt của bạn.
          </p>
        </section>

        <section>
          <h4 className="text-[10px] font-semibold text-text uppercase tracking-widest mb-1.5">No Tracking</h4>
          <p className="text-[10px] leading-relaxed opacity-70">
            Không sử dụng cookies hay bất kỳ hệ thống theo dõi bên thứ ba nào.
          </p>
        </section>
      </div>

      <div className="pt-6 border-t border-gray-50 space-y-4">
        {!showConfirm ? (
          <button 
            onClick={() => setShowConfirm(true)}
            className="w-full text-left text-[9px] uppercase tracking-widest text-gray-400 hover:text-red-500 transition-colors py-1"
          >
            Xóa sạch dữ liệu
          </button>
        ) : (
          <div className="space-y-3 animate-in fade-in slide-in-from-top-1">
            <p className="text-[9px] text-red-500 font-medium">Bạn có chắc chắn? Thao tác này sẽ xóa mọi thứ ngay lập tức.</p>
            <div className="flex gap-4">
              <button 
                onClick={onClearData}
                className="text-[9px] font-bold text-red-600 uppercase tracking-widest hover:underline"
              >
                Xác nhận
              </button>
              <button 
                onClick={() => setShowConfirm(false)}
                className="text-[9px] font-medium text-gray-400 uppercase tracking-widest"
              >
                Hủy
              </button>
            </div>
          </div>
        )}
        
        <a 
          href="https://github.com/tuanhuybui/n8n_sync" 
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-[9px] uppercase tracking-widest text-gray-300 hover:text-brand transition-colors"
        >
          Source Code <ArrowUpRight size={8} />
        </a>
      </div>
    </div>
  );
};
