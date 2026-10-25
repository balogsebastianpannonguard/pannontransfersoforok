import DriverLoginForm from "./components/DriverLoginForm";
import DirectLoginRedirect from "./components/DirectLoginRedirect";
import { findStaffUserByDirectLoginToken } from "@/lib/staff-direct-login";

export const dynamic = "force-dynamic";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const rawToken = typeof params?.token === "string" ? params.token : undefined;

  if (rawToken) {
    const staffUser = await findStaffUserByDirectLoginToken(rawToken);
    if (staffUser && (staffUser.role === "driver" || staffUser.role === "admin")) {
      return <DirectLoginRedirect token={rawToken} />;
    }
  }

  return <DriverLoginForm />;
}
