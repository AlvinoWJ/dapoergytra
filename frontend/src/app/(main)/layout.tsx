import { AppWrapper } from "@/components/app_wrapper";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppWrapper>{children}</AppWrapper>;
}
