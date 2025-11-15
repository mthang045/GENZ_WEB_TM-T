import { Shield, Zap, Award, Truck } from 'lucide-react';
import { Card, CardContent } from './ui/card';

const features = [
    {
        icon: Shield,
        title: "An Toàn Tuyệt Đối",
        description: "Đạt tiêu chuẩn ECE 22.06, đảm bảo bảo vệ tối ưu cho người sử dụng trong mọi tình huống."
    },
    {
        icon: Zap,
        title: "Công Nghệ Hiện Đại",
        description: "Tích hợp công nghệ thông gió tiên tiến và lớp lót kháng khuẩn cho trải nghiệm thoải mái."
    },
    {
        icon: Award,
        title: "Chất Lượng Premium",
        description: "Sử dụng vật liệu cao cấp với quy trình sản xuất nghiêm ngặt, đảm bảo độ bền lâu dài."
    },
    {
        icon: Truck,
        title: "Giao Hàng Miễn Phí",
        description: "Miễn phí giao hàng toàn quốc cho đơn hàng trên 1 triệu đồng, hỗ trợ đổi trả trong 30 ngày."
    }
];

export function Features() {
    return (
        <section className="py-20 bg-white">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold text-gray-900 mb-4">Tại Sao Chọn GENZ?</h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Chúng tôi cam kết mang đến những sản phẩm chất lượng cao với dịch vụ tốt nhất
                    </p>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((feature) => (
                        <Card key={feature.title} className="group hover:shadow-lg transition-all duration-300 text-center border-0 shadow-md">
                            <CardContent className="p-8">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-pink-100 rounded-full mb-6 group-hover:bg-pink-500 transition-colors">
                                    {/* Dùng component động trong JSX */}
                                    <feature.icon className="h-8 w-8 text-pink-600 group-hover:text-white transition-colors" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
                                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}