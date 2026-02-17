import { Cpu, BarChart3, ShieldCheck } from "lucide-react";
import type { Translation } from "@/app/types";

export const vi: Translation = {
  nav: { features: "Tính năng", pricing: "Bảng giá", trust: "Độ tin cậy" },
  ctaTop: "Lấy API Key",
  badge: "Hạ tầng Codex API",
  heroTitleA: "Một endpoint.",
  heroTitleB: "Kiểm soát thật sự.",
  heroDesc:
    "Codexible giúp cậu ship nhanh hơn với lớp gateway cho coding agents: route thông minh, meter realtime, và khóa chi phí theo policy.",
  heroStart: "Dùng thử",
  heroExplore: "Xem tính năng",
  snapshot: "Snapshot realtime",
  statusTitle: "Trạng thái",
  statusBody: "Guardrails đang hoạt động • Không phát hiện overspend",
  coreLabel: "Năng lực cốt lõi",
  coreTitle: "Xây cho team ship sản phẩm mỗi ngày",
  pricingLabel: "Bảng giá",
  pricingTitle: "Bảng giá đơn giản, minh bạch",
  pricingSubtitle:
    "Chọn gói phù hợp nhu cầu mỗi ngày. Có thể nâng cấp bất cứ lúc nào.",
  pricingNotesTitle: "Lưu ý",
  pricingNotes: [
    "Credit được làm mới mỗi ngày.",
    "Có thể nâng/hạ gói hoặc hủy bất cứ lúc nào.",
    "Không phí ẩn.",
  ],
  mostPopular: "Phổ biến nhất",
  period: "/tháng",
  plans: [
    {
      name: "Starter",
      price: "10$",
      description: "Dành cho nhu cầu cơ bản",
      points: [
        "75 credit/ngày",
        "Tạo nội dung nhanh",
        "Hàng chờ tiêu chuẩn",
        "Hỗ trợ cộng đồng",
      ],
      cta: "Bắt đầu với Starter",
      highlight: false,
    },
    {
      name: "Pro",
      price: "30$",
      description: "Dành cho ngườiiii dùng thường xuyên và team nhỏ",
      points: [
        "250 credit/ngày",
        "Xử lý nhanh hơn",
        "Hàng chờ ưu tiên",
        "Hỗ trợ ưu tiên",
      ],
      cta: "Chọn Pro",
      highlight: true,
    },
    {
      name: "Business",
      price: "50$",
      description: "Dành cho power user và team",
      points: [
        "500 credit/ngày",
        "Tốc độ cao nhất",
        "Ưu tiên cao nhất",
        "Hỗ trợ premium",
      ],
      cta: "Dùng Business",
      highlight: false,
    },
  ],
  install: '$ curl -fsSL "https://codexible.me/install.sh?key=YOUR_KEY" | sh',
  trustLabels: [
    "Uptime mục tiêu",
    "Độ trễ route trung bình",
    "Guardrails & cảnh báo 24/7",
  ],
  features: [
    {
      icon: Cpu,
      title: "Smart Routing Engine",
      body: "Tự động route prompt theo policy để cân bằng quality và cost theo thờii gian thực.",
    },
    {
      icon: BarChart3,
      title: "Live Cost Control",
      body: "Theo dõii token, request, burn-rate theo user/team với cảnh báo vượt ngân sách.",
    },
    {
      icon: ShieldCheck,
      title: "Margin Guardrails",
      body: "Rate limit, quota và hard cap để không bị lỗ khi workload tăng đột biến.",
    },
  ],
};
