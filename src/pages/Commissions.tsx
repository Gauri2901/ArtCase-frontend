import { useEffect, useMemo, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Brush, ImagePlus, Loader2, Mail, Ruler, Wallet } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { apiRequest } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

const artworkSuggestions = ['Oil', 'Acrylic', 'Watercolor', 'Mixed Media', 'Portrait', 'Abstract', 'Landscape'];

const Commissions = () => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingReferences, setUploadingReferences] = useState(false);
  const [form, setForm] = useState({
    customerName: '',
    artworkType: 'Oil',
    customArtworkType: '',
    description: '',
    budget: '',
    sizeDetails: '',
    email: '',
  });
  const [referenceFiles, setReferenceFiles] = useState<File[]>([]);

  useEffect(() => {
    setForm((current) => ({
      ...current,
      customerName: current.customerName || user?.name || '',
      email: current.email || user?.email || '',
    }));
  }, [user]);

  const effectiveArtworkType = useMemo(
    () => (form.artworkType === 'Other' ? form.customArtworkType.trim() : form.artworkType),
    [form.artworkType, form.customArtworkType]
  );

  const updateField = (key: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleReferenceChange = (event: ChangeEvent<HTMLInputElement>) => {
    setReferenceFiles(Array.from(event.target.files ?? []));
  };

  const uploadReferences = async () => {
    if (referenceFiles.length === 0) {
      return [];
    }

    setUploadingReferences(true);
    try {
      const payload = new FormData();
      referenceFiles.forEach((file) => payload.append('references', file));
      const response = await apiRequest<{ referenceImages: string[] }>('/commissions/upload-references', {
        method: 'POST',
        body: payload,
      });

      return response.referenceImages;
    } finally {
      setUploadingReferences(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.customerName.trim() || !effectiveArtworkType || !form.description.trim() || !form.sizeDetails.trim() || !form.email.trim() || !form.budget.trim()) {
      toast.error('Please fill in all required commission details.');
      return;
    }

    setIsSubmitting(true);
    try {
      const referenceImages = await uploadReferences();
      await apiRequest('/commissions', {
        method: 'POST',
        body: JSON.stringify({
          customerName: form.customerName,
          artworkType: effectiveArtworkType,
          description: form.description,
          budget: Number(form.budget),
          sizeDetails: form.sizeDetails,
          email: form.email,
          referenceImages,
        }),
      });

      toast.success('Custom order request submitted successfully.');
      setForm({
        customerName: user?.name || '',
        artworkType: 'Oil',
        customArtworkType: '',
        description: '',
        budget: '',
        sizeDetails: '',
        email: user?.email || '',
      });
      setReferenceFiles([]);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to submit your custom order.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pt-28 pb-20 relative overflow-hidden">
      <div className="absolute left-[-8rem] top-24 h-[24rem] w-[24rem] rounded-full bg-primary/10 blur-[120px]" />
      <div className="absolute right-[-8rem] bottom-0 h-[28rem] w-[28rem] rounded-full bg-orange-100/40 blur-[140px]" />

      <div className="container mx-auto px-4">
        <div className="mb-10 max-w-3xl">
          <motion.span
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white/50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-primary backdrop-blur-xl"
          >
            <Brush className="h-4 w-4" />
            Commission Request
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mt-6 text-5xl md:text-6xl font-serif leading-tight"
          >
            Tell us the artwork you want us to create for you.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-6 max-w-2xl text-lg text-muted-foreground"
          >
            Share your idea, your budget, and any reference images. We will review it from the studio side and respond with the right next step.
          </motion.p>
        </div>

        <div className="grid gap-8 xl:grid-cols-[minmax(0,1.25fr)_420px]">
          <motion.form
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleSubmit}
            className="rounded-[2rem] border border-white/50 bg-white/70 p-6 md:p-8 shadow-xl backdrop-blur-2xl"
          >
            <div className="grid gap-5 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium">Your name</label>
                <Input required value={form.customerName} onChange={(event) => updateField('customerName', event.target.value)} className="h-12 rounded-2xl bg-background/80" />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Artwork type</label>
                <select
                  value={form.artworkType}
                  onChange={(event) => updateField('artworkType', event.target.value)}
                  required
                  className="h-12 w-full rounded-2xl border border-input bg-background/80 px-4 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
                >
                  {artworkSuggestions.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Budget limit</label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  value={form.budget}
                  onChange={(event) => updateField('budget', event.target.value)}
                  placeholder="25000"
                  className="h-12 rounded-2xl bg-background/80"
                />
              </div>

              {form.artworkType === 'Other' ? (
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium">Custom artwork type</label>
                  <Input
                    value={form.customArtworkType}
                    onChange={(event) => updateField('customArtworkType', event.target.value)}
                    required
                    placeholder="Tell us what kind of artwork you want"
                    className="h-12 rounded-2xl bg-background/80"
                  />
                </div>
              ) : null}

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium">Description or idea</label>
                <textarea
                  value={form.description}
                  onChange={(event) => updateField('description', event.target.value)}
                  required
                  placeholder="Describe the subject, mood, palette, inspiration, or where the artwork will be displayed."
                  className="min-h-40 w-full rounded-[1.5rem] border border-input bg-background/80 px-4 py-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium">Size details</label>
                <Input
                  value={form.sizeDetails}
                  onChange={(event) => updateField('sizeDetails', event.target.value)}
                  required
                  placeholder='For example: 24" x 36", vertical, for living room wall'
                  className="h-12 rounded-2xl bg-background/80"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium">Reference images</label>
                <div className="rounded-[1.5rem] border border-dashed border-border bg-background/60 p-5">
                  <Input type="file" accept="image/*" multiple onChange={handleReferenceChange} className="h-12 rounded-2xl bg-background/90" />
                  <p className="mt-3 text-sm text-muted-foreground">
                    Upload mood boards, room shots, sketches, or any images that help explain the vision.
                  </p>
                  {referenceFiles.length > 0 ? (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {referenceFiles.map((file) => (
                        <span key={`${file.name}-${file.lastModified}`} className="rounded-full bg-secondary px-3 py-1 text-xs text-muted-foreground">
                          {file.name}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium">Contact email</label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(event) => updateField('email', event.target.value)}
                  required
                  placeholder="you@example.com"
                  className="h-12 rounded-2xl bg-background/80"
                />
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                We’ll review your request and send the next update to your email.
              </p>
              <Button type="submit" className="rounded-full px-8 h-12" disabled={isSubmitting || uploadingReferences}>
                {isSubmitting || uploadingReferences ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                Submit Custom Order
              </Button>
            </div>
          </motion.form>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="space-y-6"
          >
            <div className="rounded-[2rem] border border-white/50 bg-white/70 p-6 shadow-xl backdrop-blur-2xl">
              <h2 className="text-2xl font-serif">What we need from you</h2>
              <div className="mt-6 space-y-5">
                <div className="flex gap-4">
                  <div className="rounded-2xl bg-primary/10 p-3 text-primary"><Brush className="h-5 w-5" /></div>
                  <div>
                    <p className="font-medium">Artwork direction</p>
                    <p className="text-sm text-muted-foreground">Pick a suggestion like oil or acrylic, or enter your own style request.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="rounded-2xl bg-primary/10 p-3 text-primary"><Wallet className="h-5 w-5" /></div>
                  <div>
                    <p className="font-medium">Budget clarity</p>
                    <p className="text-sm text-muted-foreground">Your budget helps the studio propose something realistic and aligned.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="rounded-2xl bg-primary/10 p-3 text-primary"><Ruler className="h-5 w-5" /></div>
                  <div>
                    <p className="font-medium">Size and placement</p>
                    <p className="text-sm text-muted-foreground">Tell us the dimensions or the wall/space where the piece will live.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="rounded-2xl bg-primary/10 p-3 text-primary"><ImagePlus className="h-5 w-5" /></div>
                  <div>
                    <p className="font-medium">Reference images</p>
                    <p className="text-sm text-muted-foreground">Room photos, Pinterest boards, sketches, and artworks you love are all useful.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/50 bg-foreground p-6 text-background shadow-xl">
              <p className="text-xs uppercase tracking-[0.25em] text-background/60">Commission Guide</p>
              <h3 className="mt-3 text-3xl font-serif">How pricing is handled</h3>
              <p className="mt-4 text-sm text-background/70">
                Your budget is used as a ceiling for the request. Once the studio reviews your brief, the admin can approve it with a final quoted price and email you the details.
              </p>
              <div className="mt-6 rounded-[1.5rem] bg-white/10 p-4">
                <p className="text-sm text-background/80">Example quote</p>
                <p className="mt-2 text-2xl font-serif">{formatPrice(35000)}</p>
              </div>
              <div className="mt-6 flex items-center gap-3 text-sm text-background/80">
                <Mail className="h-4 w-4" />
                Approval updates are sent to the email you provide.
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/50 bg-white/70 p-6 shadow-xl backdrop-blur-2xl">
              <h3 className="text-2xl font-serif">Want to talk more?</h3>
              <p className="mt-3 text-sm text-muted-foreground">
                If you want to discuss your idea in more detail, you can reach out directly here:
              </p>
              <a
                href="mailto:gauriborle1002@gmail.com"
                className="mt-5 inline-flex rounded-full border border-primary/15 bg-primary/5 px-5 py-3 text-sm font-medium text-foreground transition-colors hover:bg-primary/10"
              >
                gauriborle1002@gmail.com
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Commissions;
