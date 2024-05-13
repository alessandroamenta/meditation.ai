"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/shared/modal";
import { Button } from "@/components/ui/button";

export const SubscriptionModal = () => {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<"upgrade" | "downgrade" | null>(
    null,
  );
  const [previousSubscriptionStatus, setPreviousSubscriptionStatus] = useState<
    "active" | "trialing" | "inactive"
  >("inactive");

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const sessionId = searchParams.get("session_id");
    const cancellation = searchParams.get("cancellation");

    const checkSubscriptionStatus = async () => {
      try {
        const response = await fetch("/api/subscription-status");
        const data = await response.json();
        const currentSubscriptionStatus = data.subscriptionStatus;

        if (
          sessionId &&
          (currentSubscriptionStatus === "active" ||
            currentSubscriptionStatus === "trialing")
        ) {
          setModalType("upgrade");
          setShowModal(true);
        } else if (cancellation && currentSubscriptionStatus === "inactive") {
          setModalType("downgrade");
          setShowModal(true);
        }

        setPreviousSubscriptionStatus(currentSubscriptionStatus);
      } catch (error) {
        console.error("Error fetching subscription status:", error);
      }
    };

    checkSubscriptionStatus();
  }, [previousSubscriptionStatus]);

  const closeModal = () => {
    setShowModal(false);
    router.push("/dashboard");
  };

  return (
    <Modal showModal={showModal} setShowModal={closeModal}>
      <div className="w-full">
        <div className="flex flex-col items-center justify-center space-y-3 border-b bg-background px-4 py-6 pt-8 text-center md:px-16">
          <h3 className="font-urban text-2xl font-bold">
            {modalType === "upgrade" ? "Thank You!" : "Sorry to See You Go"}
          </h3>
          <p className="text-lg">
            {modalType === "upgrade"
              ? "Yay! 🎉 Thanks a ton for upgrading to the Pro Plan! 🙌 As a solo maker your support means everything to me. I hope you enjoy the extra credits! If you need anything, just hit that feedback button. Thanks again! 😊"
              : "Aw, sorry to see you go. 😢 But hey, I'm still super grateful you gave the app a shot! 🙏 Keep using the free version as long as you like, and if there's anything I can do to improve your experience, just hit that feedback button. Cheers! 😊"}
          </p>
        </div>
        <div className="flex justify-end bg-secondary/50 p-4 md:px-16">
          <Button variant="default" onClick={closeModal}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};
