import { PageIntro } from "../components/PageIntro";
import { ProfileSection } from "../components/sections/ProfileSection";
import { notifications, pageIntros, profileFeatures, securityItems } from "../data/siteContent";

export function ProfilePage() {
  return (
    <>
      <PageIntro intro={pageIntros.profil} />
      <ProfileSection
        notifications={notifications}
        profileFeatures={profileFeatures}
        securityItems={securityItems}
      />
    </>
  );
}
