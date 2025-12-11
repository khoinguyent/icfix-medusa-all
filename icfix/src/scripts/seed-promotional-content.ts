import { ExecArgs } from "@medusajs/framework/types";
import {
  ContainerRegistrationKeys,
} from "@medusajs/framework/utils";
import { PROMOTIONAL_CONTENT_MODULE } from "../modules/promotional-content";
import PromotionalContentService from "../modules/promotional-content/service";

/**
 * Seed Promotional Content Data
 * 
 * Creates sample data for:
 * - Hero banners (carousel banners)
 * - Service features
 * - Testimonials
 * - Homepage sections
 * 
 * Usage:
 *   npx medusa exec ./src/scripts/seed-promotional-content.ts
 * 
 * Or with Docker:
 *   docker exec -it medusa-backend-local npx medusa exec ./src/scripts/seed-promotional-content.ts
 */

export default async function seedPromotionalContent({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const promotionalContentService = container.resolve(
    PROMOTIONAL_CONTENT_MODULE
  ) as PromotionalContentService;

  try {
    logger.info("🌱 Seeding promotional content data...");

    // 1. Create Hero Banners
    logger.info("Creating hero banners...");
    const existingBanners = await promotionalContentService.listBanners({
      position: "hero",
    });

    if (existingBanners.length === 0) {
      const heroBanners = [
        {
          title: "iPhone 17 Pro Max",
          subtitle: "Pro đỉnh cao",
          description: "Trải nghiệm công nghệ tiên tiến nhất",
          image_url: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=1920&h=1080&fit=crop",
          mobile_image_url: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&h=1200&fit=crop",
          position: "hero" as const,
          display_order: 1,
          is_active: true,
          link_type: "product" as const,
          link_value: null, // Will be set if product exists
          button_text: "Đặt hàng ngay",
        },
        {
          title: "MacBook Air M3",
          subtitle: "Hiệu năng vượt trội",
          description: "Làm việc mọi lúc, mọi nơi",
          image_url: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=1920&h=1080&fit=crop",
          mobile_image_url: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800&h=1200&fit=crop",
          position: "hero" as const,
          display_order: 2,
          is_active: true,
          link_type: "category" as const,
          link_value: "laptops",
          button_text: "Xem sản phẩm",
        },
        {
          title: "Phụ kiện công nghệ",
          subtitle: "Nâng cấp thiết bị của bạn",
          description: "Sạc nhanh, ốp lưng, tai nghe và nhiều hơn nữa",
          image_url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1920&h=1080&fit=crop",
          mobile_image_url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=1200&fit=crop",
          position: "hero" as const,
          display_order: 3,
          is_active: true,
          link_type: "category" as const,
          link_value: "accessories",
          button_text: "Khám phá",
        },
      ];

      for (const banner of heroBanners) {
        await promotionalContentService.createPromotionalBanners(banner as any);
      }
      logger.info(`✓ Created ${heroBanners.length} hero banners`);
    } else {
      logger.info(`✓ Hero banners already exist (${existingBanners.length} found)`);
    }

    // 2. Create Service Features
    logger.info("Creating service features...");
    const existingFeatures = await promotionalContentService.listActiveServiceFeatures();

    if (existingFeatures.length === 0) {
      const serviceFeatures = [
        {
          title: "Miễn phí vận chuyển",
          description: "Cho đơn hàng trên 500.000đ",
          icon_url: "https://cdn-icons-png.flaticon.com/512/2830/2830284.png",
          display_order: 1,
          is_active: true,
        },
        {
          title: "Đổi trả dễ dàng",
          description: "Trong vòng 7 ngày",
          icon_url: "https://cdn-icons-png.flaticon.com/512/2830/2830285.png",
          display_order: 2,
          is_active: true,
        },
        {
          title: "Bảo hành chính hãng",
          description: "12 tháng cho tất cả sản phẩm",
          icon_url: "https://cdn-icons-png.flaticon.com/512/2830/2830286.png",
          display_order: 3,
          is_active: true,
        },
        {
          title: "Hỗ trợ 24/7",
          description: "Luôn sẵn sàng phục vụ",
          icon_url: "https://cdn-icons-png.flaticon.com/512/2830/2830287.png",
          display_order: 4,
          is_active: true,
        },
      ];

      for (const feature of serviceFeatures) {
        await promotionalContentService.createServiceFeatures(feature as any);
      }
      logger.info(`✓ Created ${serviceFeatures.length} service features`);
    } else {
      logger.info(`✓ Service features already exist (${existingFeatures.length} found)`);
    }

    // 3. Create Testimonials
    logger.info("Creating testimonials...");
    const existingTestimonials = await promotionalContentService.listActiveTestimonials();

    if (existingTestimonials.length === 0) {
      const testimonials = [
        {
          customer_name: "Nguyễn Văn A",
          customer_title: "Khách hàng thân thiết",
          customer_avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop",
          rating: 5,
          comment: "Sản phẩm chất lượng tốt, giao hàng nhanh. Rất hài lòng với dịch vụ!",
          display_order: 1,
          is_active: true,
        },
        {
          customer_name: "Trần Thị B",
          customer_title: "Khách hàng VIP",
          customer_avatar_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
          rating: 5,
          comment: "Đổi trả dễ dàng, nhân viên tư vấn nhiệt tình. Sẽ quay lại mua tiếp!",
          display_order: 2,
          is_active: true,
        },
        {
          customer_name: "Lê Văn C",
          customer_title: "Khách hàng mới",
          customer_avatar_url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop",
          rating: 4,
          comment: "Giá cả hợp lý, sản phẩm đúng như mô tả. Đáng để mua!",
          display_order: 3,
          is_active: true,
        },
        {
          customer_name: "Phạm Thị D",
          customer_title: "Khách hàng thân thiết",
          customer_avatar_url: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop",
          rating: 5,
          comment: "Bảo hành tốt, hỗ trợ nhanh chóng. Cảm ơn shop rất nhiều!",
          display_order: 4,
          is_active: true,
        },
      ];

      for (const testimonial of testimonials) {
        await promotionalContentService.createTestimonials(testimonial as any);
      }
      logger.info(`✓ Created ${testimonials.length} testimonials`);
    } else {
      logger.info(`✓ Testimonials already exist (${existingTestimonials.length} found)`);
    }

    // 4. Create Homepage Sections
    logger.info("Creating homepage sections...");
    const existingSections = await promotionalContentService.listActiveHomepageSections();

    if (existingSections.length === 0) {
      const homepageSections = [
        {
          section_type: "categories" as const,
          title: "Shop by Category",
          subtitle: "Browse our products by category",
          display_order: 1,
          is_active: true,
          show_category_images: false,
        },
        {
          section_type: "featured_products" as const,
          title: "Featured Products",
          subtitle: "Our best picks for you",
          display_order: 2,
          is_active: true,
          collection_id: null, // Will be set if collection exists
          product_limit: 8,
        },
        {
          section_type: "testimonials" as const,
          title: "What Our Customers Say",
          subtitle: "Real reviews from real customers",
          display_order: 3,
          is_active: true,
        },
      ];

      for (const section of homepageSections) {
        await promotionalContentService.createHomepageSections(section as any);
      }
      logger.info(`✓ Created ${homepageSections.length} homepage sections`);
    } else {
      logger.info(`✓ Homepage sections already exist (${existingSections.length} found)`);
    }

    logger.info("✅ Promotional content seeding completed successfully!");
  } catch (error) {
    logger.error("❌ Error seeding promotional content:", error);
    throw error;
  }
}
