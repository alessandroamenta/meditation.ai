// app/components/dashboard/OutOfCreditsModal.tsx
import { Modal } from "@/components/shared/modal";
import { Button } from "@/components/ui/button";

interface OutOfCreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OutOfCreditsModal: React.FC<OutOfCreditsModalProps> = ({ isOpen, onClose }) => {
  return (
    <Modal showModal={isOpen} setShowModal={onClose}>
      <div className="w-full">
        <div className="flex flex-col items-center justify-center space-y-3 border-b bg-background px-4 py-6 pt-8 text-center md:px-16">
        <h3 className="font-urban text-2xl font-bold">Oops! You&apos;re out of credits! 🙈</h3>
        <p className="text-lg">
        Looks like you&apos;ve used up all your credits for this month. Don&apos;t worry, you have two options:
        <br />
        1. Upgrade to our Pro Plan for more credits! 🚀💫
        <br />
        2. If you&apos;ve already upgraded, just sit tight and your credits will refresh at the start of the next billing cycle. ✨
        </p>
        </div>
        <div className="flex justify-end bg-secondary/50 px-4 py-4 md:px-16">
          <Button variant="default" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};
