import { Hero } from '@/components/home/Hero';
import { RecentTracks } from '@/components/home/RecentTracks';
import { NewsPreview } from '@/components/news/NewsPreview';

export default function Home() {
  return (
    <div className="space-y-8">
      <Hero />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 order-2 md:order-1">
          <NewsPreview />
        </div>

        <div className="md:col-span-1 order-1 md:order-2">
          <RecentTracks />
        </div>
      </div>
    </div>
  );
}
