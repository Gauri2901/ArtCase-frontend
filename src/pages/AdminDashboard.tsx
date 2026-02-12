// /ArtCase-frontend/src/pages/AdminDashboard.tsx

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Upload, Plus, Trash2, ImageIcon } from 'lucide-react';

const AdminDashboard = () => {
    const { user } = useAuth();
    const [uploading, setUploading] = useState(false);
    const [pendingArtworks, setPendingArtworks] = useState<any[]>([]);

    // Handle multiple file selection
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            const newArtworks = files.map(file => ({
                file,
                preview: URL.createObjectURL(file),
                title: "",
                price: "",
                category: "Oil",
                description: ""
            }));
            setPendingArtworks([...pendingArtworks, ...newArtworks]);
        }
    };

    // Update specific field for a specific index
    const updateArtworkDetails = (index: number, field: string, value: string) => {
        const updated = [...pendingArtworks];
        updated[index] = { ...updated[index], [field]: value };
        setPendingArtworks(updated);
    };

    const removePending = (index: number) => {
        setPendingArtworks(pendingArtworks.filter((_, i) => i !== index));
    };

    const handleBulkSubmit = async () => {
        if (pendingArtworks.length === 0) return;
        
        setUploading(true);
        try {
            // 1. Upload all images to Cloudinary in one request
            const formData = new FormData();
            pendingArtworks.forEach(art => formData.append('images', art.file));

            const uploadRes = await fetch('https://art-case-backend.vercel.app/api/upload/bulk', {
                method: 'POST',
                headers: { Authorization: `Bearer ${user.token}` },
                body: formData,
            });

            if (!uploadRes.ok) throw new Error("Bulk image upload failed");
            
            const { imageUrls } = await uploadRes.json();

            // 2. Loop through and create each product in the database
            const creationPromises = pendingArtworks.map((art, index) => {
                return fetch('https://art-case-backend.vercel.app/api/products', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${user.token}`,
                    },
                    body: JSON.stringify({
                        title: art.title,
                        price: Number(art.price),
                        description: art.description,
                        category: art.category,
                        image: imageUrls[index] // Map the Cloudinary URL back
                    }),
                });
            });

            await Promise.all(creationPromises);
            
            toast.success(`${pendingArtworks.length} masterpieces published!`);
            setPendingArtworks([]); // Clear the list
        } catch (error: any) {
            toast.error(error.message || 'Bulk upload failed');
        } finally {
            setUploading(false);
        }
    };

    if (!user?.isAdmin) return <div className="p-20 text-center">Access Denied. Artists Only.</div>;

    return (
        <div className="min-h-screen pt-32 pb-20 container mx-auto px-4">
            <h1 className="text-4xl font-serif mb-8">Studio Dashboard</h1>

            {/* Step 1: File Selection Area */}
            <div className="mb-12 p-10 border-2 border-dashed border-border rounded-3xl bg-secondary/5 text-center">
                <input 
                    type="file" 
                    id="bulk-upload" 
                    multiple 
                    className="hidden" 
                    onChange={handleFileChange} 
                    accept="image/*"
                />
                <label htmlFor="bulk-upload" className="cursor-pointer flex flex-col items-center gap-4">
                    <div className="bg-primary/10 p-4 rounded-full">
                        <Upload className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                        <p className="text-xl font-medium">Select multiple paintings to upload</p>
                        <p className="text-sm text-muted-foreground">JPG, PNG or WebP</p>
                    </div>
                </label>
            </div>

            {/* Step 2: Details Filling Area */}
            {pendingArtworks.length > 0 && (
                <div className="space-y-8">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-serif">Pending Collection ({pendingArtworks.length})</h2>
                        <Button variant="destructive" onClick={() => setPendingArtworks([])} size="sm">
                            Clear All
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                        {pendingArtworks.map((art, index) => (
                            <div key={index} className="bg-white p-6 rounded-3xl shadow-sm border border-border flex flex-col md:flex-row gap-6">
                                {/* Image Preview */}
                                <div className="w-full md:w-48 h-48 shrink-0 rounded-2xl overflow-hidden bg-secondary">
                                    <img src={art.preview} className="w-full h-full object-cover" alt="Preview" />
                                </div>

                                {/* Inputs */}
                                <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-4">
                                        <Input 
                                            placeholder="Title" 
                                            value={art.title} 
                                            onChange={(e) => updateArtworkDetails(index, 'title', e.target.value)} 
                                        />
                                        <div className="grid grid-cols-2 gap-4">
                                            <Input 
                                                type="number" 
                                                placeholder="Price ($)" 
                                                value={art.price} 
                                                onChange={(e) => updateArtworkDetails(index, 'price', e.target.value)} 
                                            />
                                            <select 
                                                value={art.category} 
                                                onChange={(e) => updateArtworkDetails(index, 'category', e.target.value)}
                                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                                            >
                                                <option value="Oil">Oil</option>
                                                <option value="Acrylic">Acrylic</option>
                                                <option value="Watercolor">Watercolor</option>
                                                <option value="Mixed Media">Mixed Media</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="relative">
                                        <textarea 
                                            placeholder="Description..." 
                                            value={art.description}
                                            onChange={(e) => updateArtworkDetails(index, 'description', e.target.value)}
                                            className="w-full h-full min-h-[100px] rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
                                        />
                                        <button 
                                            onClick={() => removePending(index)}
                                            className="absolute -top-2 -right-2 bg-destructive text-white p-1 rounded-full hover:scale-110 transition-transform"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-center pt-8">
                        <Button 
                            size="lg" 
                            className="rounded-full px-12 h-14 text-lg" 
                            disabled={uploading}
                            onClick={handleBulkSubmit}
                        >
                            {uploading ? 'Publishing Collection...' : 'Publish All to Gallery'}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;