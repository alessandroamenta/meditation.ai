"use client";

import { useState } from "react";

import { Icons } from "@/components/shared/icons";
import { Modal } from "@/components/shared/modal";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { useFeedbackModal } from "@/hooks/use-feedback-modal";

export const FeedbackModal = () => {
  const feedbackModal = useFeedbackModal();
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [feedback, setFeedback] = useState("");

  const handleSubmitFeedback = async () => {
    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ feedback }),
      });

      if (response.ok) {
        setFeedbackSubmitted(true);
        setTimeout(() => {
          feedbackModal.onClose();
        }, 1000);
      } else {
        const error = await response.json();
        console.error("Failed to submit feedback:", error);
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
    }
  };

  return (
    <Modal
      showModal={feedbackModal.isOpen}
      setShowModal={feedbackModal.onClose}
    >
      <div className="w-full">
        <div className="flex flex-col items-center justify-center space-y-3 border-b bg-background px-4 py-6 pt-8 text-center md:px-16">
          <a href={siteConfig.url} className="text-6xl">
            🙌
          </a>
          <h3 className="font-urban text-2xl font-bold">Feedback</h3>
          <p className="text-lg">
            Tell us why you use the app and what we can do to improve it.
          </p>
        </div>

        {!feedbackSubmitted ? (
          <div className="flex flex-col space-y-4 bg-secondary/50 px-4 py-8 md:px-16">
            <textarea
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
              placeholder="Leave your thoughts here..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
            />

            <Button
              variant="default"
              disabled={feedback.trim() === ""}
              onClick={handleSubmitFeedback}
            >
              {feedbackSubmitted ? (
                <Icons.spinner className="mr-2 size-4 animate-spin" />
              ) : (
                <Icons.send className="mr-2 size-4" />
              )}{" "}
              Submit Feedback
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-3 bg-secondary/50 px-4 py-8 md:px-16">
            <p className="text-lg">Thank you for your feedback! 🎉</p>
          </div>
        )}
      </div>
    </Modal>
  );
};
