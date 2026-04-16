import React from 'react';
import { motion } from 'motion/react';

export const ConfigGuide: React.FC = () => {
  const steps = [
    {
      title: "Khởi tạo Workflow",
      description: "Trong n8n, tạo một workflow mới và thêm node 'Webhook'. Thiết kế luồng xử lý của bạn.",
    },
    {
      title: "Cấu hình Webhook",
      description: "Cài đặt HTTP Method là 'POST'. Đây là địa chỉ URL bạn sẽ dùng để kết nối với Chat IU.",
    },
    {
      title: "Định dạng dữ liệu",
      description: "Chat IU gửi dữ liệu theo cấu trúc JSON: { message, history }. Hãy cấu hình AI Agent của bạn để nhận tin nhắn này.",
    },
    {
      title: "Kết quả trả về",
      description: "n8n nên trả về văn bản hoặc JSON. Hệ thống sẽ tự động tìm kiếm nội dung trong các trường như 'output', 'text' hoặc 'answer'.",
    },
    {
      title: "Dán URL & Key",
      description: "Mở Settings, dán Webhook URL và cấu hình Header/Token nếu có. Mọi dữ liệu chỉ lưu tại trình duyệt.",
    },
    {
      title: "Bắt đầu",
      description: "Hệ thống tự động parse mọi định dạng dữ liệu từ backend và hiển thị nội dung chuẩn cho bạn.",
    },
  ];

  return (
    <div className="max-w-3xl mx-auto px-6 py-32 space-y-32">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="space-y-4"
      >
        <h2 className="text-2xl font-serif italic text-text/80 tracking-tight">Chi tiết thiết lập</h2>
        <div className="h-px w-12 bg-brand/20"></div>
      </motion.div>

      <div className="space-y-24">
        {steps.map((step, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: index * 0.05 }}
            className="group grid grid-cols-1 md:grid-cols-[60px_1fr] gap-4 md:gap-8"
          >
            <div className="text-[10px] uppercase tracking-[0.3em] text-brand/30 font-semibold pt-1.5 tabular-nums">
              0{index + 1}
            </div>
            <div className="space-y-3">
              <h3 className="text-lg font-serif italic text-text/90 group-hover:text-brand transition-colors duration-500">{step.title}</h3>
              <p className="text-text-muted text-sm leading-relaxed font-light max-w-xl opacity-70 group-hover:opacity-100 transition-opacity duration-500">
                {step.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="pt-24 opacity-30 text-[9px] uppercase tracking-[0.4em] text-center"
      >
        Privacy & Transparency First
      </motion.div>
    </div>
  );
};
