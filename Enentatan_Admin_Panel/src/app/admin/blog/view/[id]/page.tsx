"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Calendar,
  Clock,
  User,
  Tag,
  ArrowLeft,
  Edit,
  Trash2,
  Star,
  Layers,
  Hash,
  Share2,
  Copy,
  Check,
  ExternalLink,
} from "lucide-react";
import Button from "@/components/admin/Button";
import ConfirmModal from "@/components/admin/ConfirmModal";
import toast from "react-hot-toast";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image: string;
  category: string;
  tags: string[];
  hashtags?: string[];
  status: string;
  is_featured: boolean;
  author_name: string;
  author_avatar: string;
  author_bio: string;
  published_at: string;
  read_time: number;
  created_at: string;
  updated_at: string;
  related_services?: string[];
  related_packages?: string[];
}

interface Service {
  id: string;
  name: string;
  description?: string;
}

interface Package {
  id: string;
  name: string;
  price?: string;
}

const sampleServices: Service[] = [
  { id: "1", name: "Wedding Photography", description: "Professional photography coverage" },
  { id: "2", name: "Catering Services", description: "Exquisite culinary experiences" },
  { id: "3", name: "DJ & Music", description: "Entertainment and music" },
  { id: "4", name: "Decoration", description: "Beautiful floral and decor" },
  { id: "5", name: "Venue", description: "Stunning locations" },
  { id: "6", name: "Makeup & Beauty", description: "Bridal makeup and beauty services" },
];

const samplePackages: Package[] = [
  { id: "1", name: "Basic Wedding Package", price: "$5,000" },
  { id: "2", name: "Premium Wedding Package", price: "$10,000" },
  { id: "3", name: "Luxury Wedding Package", price: "$20,000" },
  { id: "4", name: "Engagement Package", price: "$2,500" },
];

const samplePosts: BlogPost[] = [
  {
    id: "1",
    title: "Top 10 Wedding Venue Trends for 2025",
    slug: "top-10-wedding-venue-trends-for-2025",
    excerpt: "From intimate garden settings to industrial chic warehouses, discover the venue styles taking over 2025 weddings.",
    content: `The wedding industry is constantly evolving, and 2025 is shaping up to be a year of bold choices and deeply personal spaces. Here are the top venue trends we're seeing.

1. Micro-Wedding Estates
Small is the new big. Intimate gatherings of 20–50 guests in private estates are on the rise, allowing couples to invest more in quality over quantity.

2. Industrial Chic Warehouses
Converted warehouses with exposed brick, steel beams, and dramatic lighting continue to captivate couples who want an edgy, artistic backdrop.

3. Lush Garden & Botanical Venues
Greenery-filled spaces — think conservatories, botanical gardens, and forest clearings — are perfect for couples embracing the biophilic design movement.

4. Destination Vineyards
Winery venues offer rolling landscapes, rustic charm, and in-house catering that's hard to beat.

5. Rooftop Celebrations
Skyline views provide a dramatic backdrop for evening ceremonies, and rooftop venues in urban centers are becoming more accessible.

6. Cultural & Heritage Sites
Historic buildings, museums, and cultural landmarks bring a sense of grandeur and storytelling to the big day.

7. Beach & Coastal Venues
The allure of the ocean never fades. Beachfront venues with natural light and open skies remain perennial favourites.

8. Farm-to-Table Farm Venues
Rustic barns paired with farm-fresh catering create an authentic, wholesome experience.

9. Private Yachts & Boats
For a truly unique experience, floating venues offer exclusivity and stunning water views.

10. Art Galleries & Museums
Unique artistic spaces that provide instant character and conversation starters for your guests.`,
    cover_image: "https://images.unsplash.com/photo-1519741497674-611481863552",
    category: "Venues",
    tags: ["Wedding", "Venues", "Trends", "2025"],
    hashtags: ["wedding", "venues", "trends", "2025"],
    status: "published",
    is_featured: true,
    author_name: "Sarah Johnson",
    author_avatar: "https://randomuser.me/api/portraits/women/1.jpg",
    author_bio: "Wedding planner with 10+ years of experience",
    published_at: "2024-03-15T10:00:00",
    read_time: 6,
    created_at: "2024-03-10T08:00:00",
    updated_at: "2024-03-15T09:00:00",
    related_services: ["1", "2", "4"],
    related_packages: ["1", "2"],
  },
  {
    id: "2",
    title: "Top Wedding Venues in 2024",
    slug: "top-wedding-venues-in-2024",
    excerpt: "Explore the most stunning wedding venues for your special day...",
    content: "## Beautiful Venues\n\n- Beachfront Resorts\n- Rustic Barns\n- Historic Mansions\n- Modern Ballrooms\n\nEach venue offers unique amenities and stunning backdrops for your special day.",
    cover_image: "https://images.unsplash.com/photo-1464366400600-7168b6af0bc1",
    category: "Venues",
    tags: ["Venues", "Destination Wedding", "Luxury"],
    hashtags: ["weddingvenues", "destinationwedding", "luxurywedding"],
    status: "published",
    is_featured: true,
    author_name: "Michael Chen",
    author_avatar: "https://randomuser.me/api/portraits/men/1.jpg",
    author_bio: "Luxury wedding venue specialist",
    published_at: "2024-03-20T14:30:00",
    read_time: 7,
    created_at: "2024-03-18T10:00:00",
    updated_at: "2024-03-20T12:00:00",
    related_services: ["5"],
    related_packages: ["1", "2"],
  },
];

const MarkdownContent = ({ content }: { content: string }) => {
  const renderContent = () => {
    let html = content;
    
    html = html.replace(/```(\w*)\n([\s\S]*?)```/g, '<pre class="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto my-4"><code>$2</code></pre>');
    
    html = html.replace(/### (.*?)\n/g, '<h3 class="text-lg font-semibold mt-6 mb-3 text-gray-800">$1</h3>');
    html = html.replace(/## (.*?)\n/g, '<h2 class="text-2xl font-bold mt-8 mb-4 text-gray-800 border-b pb-2">$1</h2>');
    html = html.replace(/# (.*?)\n/g, '<h1 class="text-3xl font-bold mt-8 mb-4 text-gray-900">$1</h1>');
    
    html = html.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>');
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');
    
    html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-orange-500 hover:text-orange-600 underline" target="_blank" rel="noopener noreferrer">$1</a>');
    
    const numberedListRegex = /(\d+\.\s[^\n]+(?:\n[^\d][^\n]*)*)/g;
    html = html.replace(numberedListRegex, (match) => {
      const lines = match.split('\n');
      let items = [];
      let currentItem = { title: '', desc: '' };
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.match(/^\d+\.\s/)) {
          if (currentItem.title) {
            items.push({ ...currentItem });
          }
          currentItem = {
            title: line.replace(/^\d+\.\s/, ''),
            desc: ''
          };
        } else if (line.trim() && currentItem.title) {
          currentItem.desc += (currentItem.desc ? ' ' : '') + line.trim();
        }
      }
      if (currentItem.title) {
        items.push(currentItem);
      }
      
      const listItems = items.map(item => {
        return `<div class="mb-5">
          <div class="font-bold text-gray-800 text-base">${item.title}</div>
          <div class="text-gray-600 text-sm mt-1 leading-relaxed">${item.desc}</div>
        </div>`;
      }).join('');
      
      return `<div class="my-4 space-y-0">${listItems}</div>`;
    });
    
    html = html.replace(/\n- (.*?)(\n|$)/g, '<li class="ml-4 mb-1">• $1</li>');
    html = html.replace(/<li/g, '\n<ul class="my-3 space-y-1"><li');
    html = html.replace(/(<\/li>\n)+/g, '</li></ul>\n');
    
    html = html.replace(/\n&gt; (.*?)(\n|$)/g, '<blockquote class="border-l-4 border-orange-400 bg-orange-50 p-4 my-4 italic text-gray-700">$1</blockquote>');
    
    html = html.replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" class="rounded-lg my-4 max-w-full h-auto shadow-md" />');
    
    const firstParagraph = html.match(/^[^<]+/);
    if (firstParagraph && firstParagraph[0].trim() && !html.includes('<div') && !html.includes('<ul')) {
      html = `<p class="mb-4 text-gray-700 leading-relaxed">${firstParagraph[0].trim()}</p>${html.substring(firstParagraph[0].length)}`;
    }
    
    return <div dangerouslySetInnerHTML={{ __html: html }} />;
  };

  return <div className="prose max-w-none">{renderContent()}</div>;
};

export default function ViewBlogPost() {
  const router = useRouter();
  const params = useParams();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  useEffect(() => {
    const found = samplePosts.find((p) => p.id === params.id);
    if (found) {
      setPost(found);
    } else {
      toast.error("Post not found");
      router.push("/admin/blog");
    }
    setLoading(false);
  }, [params.id, router]);

  const handleEdit = () => {
    router.push(`/admin/blog/edit/${post?.id}`);
  };

  const handleDelete = () => {
    toast.success("Post deleted successfully!");
    setIsDeleteModalOpen(false);
    router.push("/admin/blog");
  };

  const handleCopyLink = async () => {
    const url = `${window.location.origin}/blog/${post?.slug}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = (platform: string) => {
    const url = `${window.location.origin}/blog/${post?.slug}`;
    const text = post?.title || "";
    
    const shareUrls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent(text)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`,
    };
    
    if (shareUrls[platform]) {
      window.open(shareUrls[platform], "_blank", "width=600,height=400");
    }
    setShowShareMenu(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-green-100 text-green-700 border-green-200";
      case "draft":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="text-gray-500 mt-4">Loading post...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-gray-500">Post not found</p>
          <Button onClick={() => router.push("/admin/blog")} className="mt-4 bg-orange-500 hover:bg-orange-600">
            Back to Blog
          </Button>
        </div>
      </div>
    );
  }

  const relatedServicesList = sampleServices.filter(s => post.related_services?.includes(s.id));
  const relatedPackagesList = samplePackages.filter(p => post.related_packages?.includes(p.id));

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">View Post</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Viewing blog post details
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Button variant="secondary" onClick={() => setShowShareMenu(!showShareMenu)} className="!border-gray-300">
              <Share2 size={15} className="mr-1" />
              Share
            </Button>
            {showShareMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowShareMenu(false)} />
                <div className="absolute right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-200 z-20 overflow-hidden">
                  <div className="flex items-center gap-1 p-2">
                    <button
                      onClick={() => handleShare("twitter")}
                      className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-lg transition-colors"
                      title="Twitter"
                    >
                      <svg className="w-5 h-5" fill="#1DA1F2" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                      </svg>
                    </button>
                    <button
                      onClick={() => handleShare("facebook")}
                      className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-lg transition-colors"
                      title="Facebook"
                    >
                      <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                    </button>
                    <button
                      onClick={() => handleShare("linkedin")}
                      className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-lg transition-colors"
                      title="LinkedIn"
                    >
                      <svg className="w-5 h-5" fill="#0A66C2" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451c.979 0 1.771-.773 1.771-1.729V1.729C24 .774 23.227 0 22.225 0z"/>
                      </svg>
                    </button>
                    <button
                      onClick={() => handleShare("whatsapp")}
                      className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-lg transition-colors"
                      title="WhatsApp"
                    >
                      <svg className="w-5 h-5" fill="#25D366" viewBox="0 0 24 24">
                        <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.576 2.052.882 3.149.882 3.18 0 5.767-2.587 5.768-5.766.001-3.18-2.586-5.767-5.768-5.767zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.068-.252-.08-.586-.232-1.002-.454-.543-.29-1.134-.756-1.624-1.288-.688-.745-1.246-1.556-1.408-1.956-.155-.381-.148-.699.042-.982.144-.214.368-.353.573-.446.133-.06.285-.08.422-.08.13 0 .195.008.28.128.141.201.422.605.542.78.12.175.182.29.26.47.08.18.043.316-.042.46-.06.1-.123.18-.195.27-.06.075-.13.162-.064.304.11.24.363.552.692.876.459.451.915.725 1.142.856.125.072.282.049.38-.04.12-.11.25-.3.38-.48.122-.176.24-.239.396-.167.189.095.648.306.742.358.186.101.315.16.364.252.049.092.049.264-.019.46z"/>
                      </svg>
                    </button>
                    <div className="w-px h-6 bg-gray-200 mx-1"></div>
                    <button
                      onClick={handleCopyLink}
                      className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-lg transition-colors"
                      title="Copy Link"
                    >
                      {copied ? <Check size={18} className="text-green-600" /> : <Copy size={18} className="text-gray-600" />}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
          <Button variant="secondary" onClick={handleEdit} className="!border-gray-300">
            <Edit size={15} className="mr-1" />
            Edit
          </Button>
          <Button
            variant="secondary"
            onClick={() => setIsDeleteModalOpen(true)}
            className="!border-red-300 !text-red-600 hover:!bg-red-50"
          >
            <Trash2 size={15} className="mr-1" />
            Delete
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 md:p-8">
          <div className="flex items-center gap-3 text-sm mb-4">
            <span className="px-3 py-1.5 bg-gradient-to-r from-orange-100 to-orange-50 text-orange-700 rounded-full text-xs font-semibold">
              {post.category}
            </span>
            <div className="flex items-center gap-2 text-gray-500">
              <User size={14} />
              <span className="text-sm">{post.author_name}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-500">
              <Clock size={14} />
              <span className="text-sm">{post.read_time} min read</span>
            </div>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">{post.title}</h1>
          
          <p className="text-gray-600 text-base md:text-lg mb-6 leading-relaxed">{post.excerpt}</p>
          
          {post.cover_image && (
            <div className="relative w-full h-64 md:h-96 mb-8 rounded-xl overflow-hidden">
              <img
                src={post.cover_image}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="mb-8 text-sm md:text-base" id="post-content">
            <MarkdownContent content={post.content} />
          </div>

          {post.hashtags && post.hashtags.length > 0 && (
            <div className="pt-4">
              <div className="flex flex-wrap gap-2">
                {post.hashtags.map((hashtag) => (
                  <span
                    key={hashtag}
                    className="text-purple-600 text-sm hover:text-purple-700 cursor-pointer"
                  >
                    #{hashtag}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Explore Venue Services</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {sampleServices.map(service => (
                <div key={service.id} className="bg-gray-50 rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer">
                  <h4 className="font-medium text-gray-800 text-sm">{service.name}</h4>
                  {service.description && (
                    <p className="text-xs text-gray-500 mt-1">{service.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {(relatedServicesList.length > 0 || relatedPackagesList.length > 0) && (
            <div className="pt-6 mt-6 border-t border-gray-200">
              <h3 className="text-base font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Layers size={16} /> Related
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {relatedServicesList.length > 0 && (
                  <div className="bg-blue-50 rounded-lg p-3">
                    <h4 className="text-xs font-semibold text-blue-800 mb-2">Services</h4>
                    <div className="space-y-1">
                      {relatedServicesList.map(service => (
                        <div key={service.id} className="flex items-center justify-between">
                          <span className="text-blue-700 text-xs">{service.name}</span>
                          {service.description && (
                            <span className="text-xs text-blue-500">{service.description}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {relatedPackagesList.length > 0 && (
                  <div className="bg-green-50 rounded-lg p-3">
                    <h4 className="text-xs font-semibold text-green-800 mb-2">Packages</h4>
                    <div className="space-y-1">
                      {relatedPackagesList.map(pkg => (
                        <div key={pkg.id} className="flex items-center justify-between">
                          <span className="text-green-700 text-xs">{pkg.name}</span>
                          {pkg.price && (
                            <span className="text-xs text-green-600 font-semibold">{pkg.price}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-gray-200 text-xs text-gray-400 flex flex-wrap justify-between gap-2">
            <p>📅 Created: {new Date(post.created_at).toLocaleString()}</p>
            <p>✏️ Last updated: {new Date(post.updated_at).toLocaleString()}</p>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Post"
        message={`Are you sure you want to delete "${post.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
}