import { redirect } from "next/navigation";
import { routing } from "@/intl/routing";

export default function RootPage() {
  redirect(`/${routing.defaultLocale}`);
}
