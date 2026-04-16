import React from 'react';

export const CoffeePopover: React.FC = () => {
  return (
    <div className="flex flex-col items-center gap-4 text-gray-600">
      <div className="text-center space-y-1 mb-2">
        <h3 className="text-lg font-medium text-text">Mời Cafe</h3>
        <p className="text-xs text-text-muted">Cảm ơn bạn đã ủng hộ!</p>
      </div>

      <div className="w-full aspect-square bg-white rounded-xl p-2 shadow-inner group overflow-hidden border border-border/50">
        <img 
          src="https://img.vietqr.io/image/VCCB-9021820830261-compact.png?addInfo=Mời bạn ly Cafe!" 
          alt="VietQR Code" 
          className="w-full h-full object-contain"
          loading="lazy"
        />
      </div>

      <div className="w-full space-y-2 pt-2 border-t border-border mt-2">
        <div className="flex justify-between items-center text-xs">
          <span className="text-text-muted">Ngân hàng:</span>
          <span className="font-medium text-text">Timo by Bản Việt</span>
        </div>
        <div className="flex justify-between items-center text-xs">
          <span className="text-text-muted">Số tài khoản:</span>
          <span className="font-mono font-medium text-text tracking-wide">9021820830261</span>
        </div>
      </div>

      <p className="text-[10px] text-center italic opacity-40 mt-1">
        Scan QR bằng bất kỳ ứng dụng ngân hàng nào
      </p>
    </div>
  );
};
