import { ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';

interface HelpSupportProps {
  onBack: () => void;
}

export function HelpSupport({ onBack }: HelpSupportProps) {
  return (
    <div className="h-full overflow-auto bg-gradient-to-br from-[#FFFBF0] to-[#FFF4E6] p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl p-6 shadow-lg border border-[#8B4513]/10">
        <div className="flex items-center gap-4 mb-4">
          <button onClick={onBack} className="p-2 rounded-full hover:bg-[#FFF4E6]"><ArrowLeft size={20} /></button>
          <h2 className="text-primary text-2xl">Help & Support</h2>
        </div>

        <div className="space-y-4">
          <section>
            <h3 className="text-lg font-semibold">Frequently Asked Questions</h3>
            <div className="mt-2 text-muted-foreground">
              <p className="mb-2"><strong>How do I retake the video survey?</strong> Go to your Profile and tap "Retake Survey". If a cooldown is active you'll see the time remaining.</p>
              <p className="mb-2"><strong>How do I change my pictures?</strong> In Profile {'>'} Pictures you can upload or replace photos.</p>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-semibold">Report a Problem or Ask a Question</h3>
            <p className="mt-2 text-muted-foreground">For support, email us at <a className="text-[#DC143C]" href="mailto:support@mate.com">support@mate.com</a>. Please include screenshots and a description of the issue.</p>
          </section>

          <div className="mt-6">
            <Button onClick={onBack} className="bg-[#FFF4E6] text-primary">Back to Profile</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
