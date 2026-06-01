import { StaffMemberDetailPage } from "@/features/circulation/components/StaffMemberDetailPage";

type StaffMemberDetailRouteProps = {
  params: Promise<{
    memberId: string;
  }>;
};

export default async function StaffMemberDetailRoute({ params }: StaffMemberDetailRouteProps) {
  const { memberId } = await params;

  return <StaffMemberDetailPage memberId={memberId} />;
}
