"use client";

import dynamic from "next/dynamic";

const StatusQuickEdit = dynamic(() => import("@/components/StatusQuickEdit"), { ssr: false });

type Props = {
  id: string;
  status: string;
  updatedAt: string;
};

export default function StatusQuickEditWrapper({ id, status, updatedAt }: Props) {
  return <StatusQuickEdit id={id} status={status} updatedAt={updatedAt} />;
}
