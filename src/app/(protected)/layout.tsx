"use client";

import React, { PropsWithChildren } from "react";

import Footer from "@/components/layout/footer";
import Loading from "@/components/layout/loading";
import Navigation from "@/components/layout/navigation";
import useAuthRedirect from "@/hooks/useAuthRedirect";

export default function ProtectedLayout({ children }: PropsWithChildren) {
  const { isLoading, layoutStyle } = useAuthRedirect();

  if (isLoading) {
    return <Loading />;
  }

  return (
    <>
      <Navigation authenticated light={layoutStyle.light} />
      {children}
      <Footer
        extendFooter={layoutStyle.extendFooter}
        light={layoutStyle.light}
      />
    </>
  );
}
