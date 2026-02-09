import { Hero } from '@/components/home/Hero';
import { RecentTracks } from '@/components/home/RecentTracks';
import { NewsPreview } from '@/components/news/NewsPreview';
import { dataService } from '@/services/dataService';

// Revalidate data every 60 seconds
export const revalidate = 60;

export default async function Home() {
  const news = await dataService.getNews();

  return (
    <div className="space-y-8">
      <Hero />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <NewsPreview news={news} />
        </div>

        <div className="md:col-span-1">
          <RecentTracks />
        </div>
      </div>
    </div>
  );
}
