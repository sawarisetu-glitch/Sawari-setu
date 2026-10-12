import React, { useState } from 'react';
import {
  X,
  Star,
  CheckCircle2,
  ThumbsUp,
  MessageSquare,
  ShieldCheck,
  Send,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface RatingFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  tripId: string;
  tripTitle: string;
  tripType: 'ride' | 'logistics';
  onRatingSubmitted?: (ratingData: any) => void;
}

export const RatingFeedbackModal: React.FC<RatingFeedbackModalProps> = ({
  isOpen,
  onClose,
  tripId,
  tripTitle,
  tripType,
  onRatingSubmitted,
}) => {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedTags, setSelectedTags] = useState<string[]>(['समय पर पहुंचे', 'विनम्र चालक']);
  const [comment, setComment] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const quickTags = [
    'समय पर पहुंचे',
    'साफ-सुथरी गाड़ी',
    'विनम्र व्यवहार',
    'सुरक्षित ड्राइविंग',
    'किफायती किराया',
    'माल की सुरक्षा',
    'सही रूट का पालन',
  ];

  const handleToggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
    });

    const payload = {
      tripId,
      tripTitle,
      tripType,
      rating,
      selectedTags,
      comment,
      submittedAt: new Date().toISOString(),
    };

    // Save to localStorage
    try {
      const existing = JSON.parse(localStorage.getItem('sawari_ratings') || '[]');
      existing.push(payload);
      localStorage.setItem('sawari_ratings', JSON.stringify(existing));
    } catch {}

    if (onRatingSubmitted) onRatingSubmitted(payload);

    setTimeout(() => {
      setIsSubmitted(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl p-5 sm:p-6 overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        {isSubmitted ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-black text-white">फीडबैक प्राप्त हुआ!</h3>
            <p className="text-xs text-zinc-400">
              सवारी सेतु सेवा को बेहतर बनाने में आपका अनुभव हमारे लिए बहुत महत्वपूर्ण है। धन्यवाद!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Header */}
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-[#FF8C00] bg-[#FF8C00]/10 px-2.5 py-0.5 rounded-full border border-[#FF8C00]/30 inline-block mb-1.5">
                {tripType === 'ride' ? 'सवारी अनुभव' : 'माल ढुलाई अनुभव'}
              </span>
              <h3 className="text-base font-black text-white">
                चालक व सेवा को रेटिंग दें (Rate Experience)
              </h3>
              <p className="text-xs text-zinc-400 truncate mt-0.5">{tripTitle}</p>
            </div>

            {/* Star Rating Selector */}
            <div className="py-2 flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  className="p-1 transition-transform hover:scale-125 focus:outline-none"
                >
                  <Star
                    className={`w-8 h-8 sm:w-9 sm:h-9 transition-colors ${
                      (hoverRating || rating) >= star
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-zinc-700'
                    }`}
                  />
                </button>
              ))}
            </div>

            <div className="text-center font-bold text-xs text-amber-400">
              {rating === 5 && 'शानदार अनुभव (Excellent)!'}
              {rating === 4 && 'बहुत अच्छा सफर (Very Good)'}
              {rating === 3 && 'सामान्य अनुभव (Average)'}
              {rating <= 2 && 'सुधार की आवश्यकता (Needs Improvement)'}
            </div>

            {/* Quick Experience Tags */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300 block">
                आपको क्या सबसे अच्छा लगा?
              </label>
              <div className="flex flex-wrap gap-1.5">
                {quickTags.map((tag) => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleToggleTag(tag)}
                      className={`text-xs px-2.5 py-1 rounded-xl font-medium border transition-all ${
                        isSelected
                          ? 'bg-[#FF8C00] text-black border-amber-300 font-bold shadow-sm'
                          : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white'
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Comment Box */}
            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">
                अतिरिक्त सुझाव या टिप्पणी (Optional)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="चालक या गाड़ी के बारे में कुछ और बताना चाहते हैं?..."
                rows={3}
                className="w-full bg-zinc-900 border border-zinc-800 focus:border-[#FF8C00] rounded-xl p-3 text-xs text-white placeholder-zinc-500 focus:outline-none resize-none"
              />
            </div>

            {/* Submit Button */}
            <button
              type="button"
              onClick={handleSubmit}
              className="w-full py-3 rounded-2xl bg-[#FF8C00] hover:bg-orange-600 text-black font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/20 active:scale-98"
            >
              <Send className="w-4 h-4 text-black" />
              <span>रेटिंग सबमिट करें (Submit Rating)</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
