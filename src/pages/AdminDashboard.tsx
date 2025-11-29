import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Upload, Plus } from 'lucide-react';

const AdminDashboard = () => {
    const { user } = useAuth();
    const [uploading, setUploading] = useState(false);
    const { register, handleSubmit, reset } = useForm();

    const onSubmit = async (data: any) => {
        if (!user) return;

        // 1. Upload Image
        const formData = new FormData();
        formData.append('image', data.image[0]);

        try {
            setUploading(true);

            const uploadRes = await fetch('http://localhost:5000/api/upload', {
                method: 'POST',
                headers: { Authorization: `Bearer ${user.token}` },
                body: formData,
            });

            // STOP: Check if upload worked before proceeding
            if (!uploadRes.ok) {
                const errorText = await uploadRes.text();
                throw new Error(`Upload failed: ${errorText}`);
            }

            // Parse JSON (not text)
            const uploadData = await uploadRes.json();
            const imageUrl = uploadData.imageUrl; // This is now a real Cloudinary URL

            // 2. Create Product
            const productRes = await fetch('http://localhost:5000/api/products', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.token}`,
                },
                body: JSON.stringify({
                    title: data.title,
                    price: data.price,
                    description: data.description,
                    category: data.category,
                    // Use the clean URL directly (no need for localhost prefix)
                    image: imageUrl,
                }),
            });

            if (productRes.ok) {
                toast.success('Masterpiece added to gallery!');
                reset();
            } else {
                const errorData = await productRes.json();
                toast.error(errorData.message || 'Failed to create product');
            }

        } catch (error: any) {
            console.error(error);
            // Show the actual error message so you know if it's "File too large" or "Invalid Key"
            toast.error(error.message || 'Something went wrong');
        } finally {
            setUploading(false);
        }
    };

    if (!user?.isAdmin) return <div className="p-20 text-center">Access Denied. Artists Only.</div>;

    return (
        <div className="min-h-screen pt-32 pb-20 container mx-auto px-4">
            <h1 className="text-4xl font-serif mb-8">Studio Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-border">
                    <h2 className="text-2xl font-serif mb-6 flex items-center gap-2">
                        <Plus className="w-6 h-6" /> Add New Artwork
                    </h2>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Title</label>
                            <Input {...register('title', { required: true })} placeholder="e.g. Midnight Blue" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Price ($)</label>
                                <Input type="number" {...register('price', { required: true })} placeholder="150.00" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Category</label>
                                <select {...register('category')} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors">
                                    <option value="Oil">Oil</option>
                                    <option value="Acrylic">Acrylic</option>
                                    <option value="Watercolor">Watercolor</option>
                                    <option value="Mixed Media">Mixed Media</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Description</label>
                            <textarea {...register('description')} className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm" placeholder="Tell the story..." />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Upload Image</label>
                            <div className="flex items-center gap-2">
                                <Input type="file" {...register('image', { required: true })} className="cursor-pointer" />
                                <Upload className="w-4 h-4 text-muted-foreground" />
                            </div>
                        </div>

                        <Button disabled={uploading} className="w-full">
                            {uploading ? 'Uploading...' : 'Publish to Gallery'}
                        </Button>
                    </form>
                </div>

                {/* Right side could be a list of existing products to edit/delete */}
                <div className="bg-secondary/20 p-8 rounded-3xl border border-border/50 flex items-center justify-center text-muted-foreground">
                    Manage Inventory (Coming Soon)
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;