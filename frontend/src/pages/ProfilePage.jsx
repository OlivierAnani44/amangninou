import { PageIntro } from "../components/PageIntro";
import { ProfileSection } from "../components/sections/ProfileSection";

export function ProfilePage({ content }) {
  return (
    <>
      <PageIntro intro={content.pageIntros.profil} />
      <ProfileSection
        contactChannels={content.contactChannels}
        copy={content.profileSection}
        locale={content.locale}
        messages={content.profileMessages}
        notifications={content.notifications}
        profileFeatures={content.profileFeatures}
        securityItems={content.securityItems}
      />
    </>
  );
}
