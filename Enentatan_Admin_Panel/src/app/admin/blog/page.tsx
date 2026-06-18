"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  FileText,
  Edit,
  Trash2,
  RefreshCw,
  Eye,
  Star,
  StarOff,
  Clock,
  Image as ImageIcon,
  CheckCircle,
} from "lucide-react";
import Table from "@/components/admin/Table";
import ConfirmModal from "@/components/admin/ConfirmModal";
import Pagination from "@/components/admin/Pagination";
import Button from "@/components/admin/Button";
import StatsCard from "@/components/admin/StatsCard";
import { Column } from "@/lib/types";
import toast from "react-hot-toast";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface BlogPost {
  id: string;
  sr_no: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image: string;
  category: string;
  tags: string[];
  status: "draft" | "published" | "archived";
  is_featured: boolean;
  author_name: string;
  author_avatar: string;
  author_bio: string;
  meta_title: string;
  meta_description: string;
  og_image: string;
  published_at: string;
  read_time: number;
  created_at: string;
  updated_at: string;
  related_services: string[];
  related_packages: string[];
}

const samplePosts: BlogPost[] = [
  {
    id: "1",
    sr_no: 1,
    title: "10 Tips for Planning the Perfect Wedding",
    slug: "10-tips-for-planning-the-perfect-wedding",
    excerpt:
      "Discover essential tips to make your wedding day unforgettable...",
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit...",
    cover_image: "https://images.unsplash.com/photo-1519741497674-611481863552",
    category: "Tips & Advice",
    tags: ["Wedding", "Planning", "Tips"],
    status: "published",
    is_featured: true,
    author_name: "Sarah Johnson",
    author_avatar: "https://randomuser.me/api/portraits/women/1.jpg",
    author_bio: "Wedding planner with 10+ years of experience",
    meta_title: "10 Wedding Planning Tips",
    meta_description: "Essential tips for planning your perfect wedding day",
    og_image: "https://images.unsplash.com/photo-1519741497674-611481863552",
    published_at: "2024-03-15T10:00:00",
    read_time: 5,
    created_at: "2024-03-10T08:00:00",
    updated_at: "2024-03-15T09:00:00",
    related_services: ["1", "2"],
    related_packages: ["1"],
  },
  {
    id: "2",
    sr_no: 2,
    title: "Top Wedding Venues in 2024",
    slug: "top-wedding-venues-in-2024",
    excerpt: "Explore the most stunning wedding venues for your special day...",
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit...",
    cover_image: "https://images.unsplash.com/photo-1519741497674-611481863552",
    category: "Venues",
    tags: ["Venues", "Destination Wedding", "Luxury"],
    status: "published",
    is_featured: true,
    author_name: "Michael Chen",
    author_avatar: "https://randomuser.me/api/portraits/men/1.jpg",
    author_bio: "Luxury wedding venue specialist",
    meta_title: "Best Wedding Venues 2024",
    meta_description: "Top wedding venues for your dream celebration",
    og_image: "https://images.unsplash.com/photo-1464366400600-7168b6af0bc1",
    published_at: "2024-03-20T14:30:00",
    read_time: 7,
    created_at: "2024-03-18T10:00:00",
    updated_at: "2024-03-20T12:00:00",
    related_services: ["5"],
    related_packages: ["1", "2"],
  },
];

export default function BlogPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<BlogPost[]>(samplePosts);
  const [loading, setLoading] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  const ITEMS_PER_PAGE = 10;
  const [currentPage, setCurrentPage] = useState(1);

  const deletePost = (postId: string) => {
    setPosts(posts.filter((post) => post.id !== postId));
    toast.success("Blog post deleted successfully!");
  };

  const toggleFeatured = (post: BlogPost) => {
    const updatedPosts = posts.map((p) =>
      p.id === post.id ? { ...p, is_featured: !p.is_featured } : p,
    );
    setPosts(updatedPosts);
    toast.success(
      `${post.is_featured ? "Removed from" : "Added to"} featured posts`,
    );
  };

  const updateStatus = (post: BlogPost, newStatus: string) => {
    const updatedPosts = posts.map((p) =>
      p.id === post.id
        ? { ...p, status: newStatus as "draft" | "published" | "archived" }
        : p,
    );
    setPosts(updatedPosts);
    toast.success(`Post status updated to ${newStatus}`);
  };

  const openDelete = (post: BlogPost) => {
    setSelectedPost(post);
    setIsDeleteOpen(true);
  };

  // Stats
  const published = posts.filter((p) => p.status === "published").length;
  const drafts = posts.filter((p) => p.status === "draft").length;
  const archived = posts.filter((p) => p.status === "archived").length;
  const featured = posts.filter((p) => p.is_featured).length;

  const columns: Column[] = [
    {
      key: "cover_image",
      label: "Image",
      render: (v: string) =>
        v ? (
          <img
            src={v}
            alt="Cover"
            className="w-12 h-12 rounded-lg object-cover"
          />
        ) : (
          <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
            <ImageIcon size={20} className="text-gray-400" />
          </div>
        ),
    },
    {
      key: "title",
      label: "Title",
      render: (v: string) => <span className="font-medium">{v}</span>,
    },
    {
      key: "category",
      label: "Category",
      render: (v: string) => (
        <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">{v}</span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (v: string, row: BlogPost) => (
        <select
          value={v}
          onChange={(e) => updateStatus(row, e.target.value)}
          className={`px-2 py-1 rounded-full text-xs font-medium border-0 cursor-pointer ${
            v === "published"
              ? "bg-green-100 text-green-700"
              : v === "draft"
                ? "bg-yellow-100 text-yellow-700"
                : "bg-gray-100 text-gray-700"
          }`}
        >
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </select>
      ),
    },
    {
      key: "is_featured",
      label: "Featured",
      render: (v: boolean, row: BlogPost) => (
        <button
          onClick={() => toggleFeatured(row)}
          className={`p-1.5 rounded-lg transition-all ${
            v
              ? "text-yellow-500 bg-yellow-50"
              : "text-gray-400 hover:text-yellow-500 hover:bg-yellow-50"
          }`}
          title={v ? "Remove from featured" : "Add to featured"}
        >
          {v ? <Star size={16} fill="currentColor" /> : <StarOff size={16} />}
        </button>
      ),
    },
    {
      key: "read_time",
      label: "Read Time",
      render: (v: number) => (
        <span className="flex items-center gap-1">
          <Clock size={12} />
          {v} min
        </span>
      ),
    },
    {
      key: "published_at",
      label: "Published",
      render: (v: string) => (v ? new Date(v).toLocaleDateString() : "-"),
    },
    {
      key: "actions",
      label: "Actions",
      render: (_: any, row: BlogPost) => (
        <div className="flex items-center gap-1">
          <Link href={`/admin/blog/view/${row.id}`}>
            <button
              className="p-1.5 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-all"
              title="Preview"
            >
              <Eye size={14} />
            </button>
          </Link>
          <Link href={`/admin/blog/edit/${row.id}`}>
            <button
              className="p-1.5 rounded-lg text-gray-400 hover:text-orange-500 hover:bg-orange-50 transition-all"
              title="Edit"
            >
              <Edit size={14} />
            </button>
          </Link>
          <button
            onClick={() => openDelete(row)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
            title="Delete"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  const refreshData = () => {
    setLoading(true);
    setTimeout(() => {
      setPosts([...samplePosts]);
      setLoading(false);
      toast.success("Data refreshed!");
    }, 500);
  };

  const totalPages = Math.ceil(posts.length / ITEMS_PER_PAGE);
  const paginatedData = posts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-orange-500 mx-auto mb-4" />
          <p className="text-gray-500">Loading blog posts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Blog Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {posts.length} total posts
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={refreshData}>
            <RefreshCw size={15} />
            Refresh
          </Button>
          <Link href="/admin/blog/add">
            <Button>
              <Plus size={15} />
              Write New Post
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Posts"
          value={posts.length}
          icon={<FileText size={18} />}
          color="blue"
        />
        <StatsCard
          title="Published"
          value={published}
          icon={<CheckCircle size={18} />}
          color="green"
        />
        <StatsCard
          title="Drafts"
          value={drafts}
          icon={<FileText size={18} />}
          color="yellow"
        />
        <StatsCard
          title="Featured"
          value={featured}
          icon={<Star size={18} />}
          color="purple"
        />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
        <Table columns={columns} data={paginatedData} />
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={posts.length}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={(page) => setCurrentPage(page)}
        />
      </div>

      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={() => {
          if (selectedPost && selectedPost.id) {
            deletePost(selectedPost.id);
          }
          setIsDeleteOpen(false);
        }}
        title="Delete Post"
        message={`Are you sure you want to delete "${selectedPost?.title}"? This action cannot be undone.`}
      />
    </div>
  );
}
