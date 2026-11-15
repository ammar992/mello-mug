import { MediaLibrary } from "./MediaLibrary";
import { PageHeader } from "@/components/admin/ui";

export const metadata = { title: "Media library" };

export default function MediaPage() {
  return (
    <>
      <PageHeader title="Media library" description="Images stored in Cloudinary. Upload here, then pick them in any page editor." />
      <MediaLibrary />
    </>
  );
}
