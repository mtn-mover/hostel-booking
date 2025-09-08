import { formatDate } from '@/lib/utils'

interface ReviewSectionProps {
  reviews: Array<{
    id: string
    rating: number
    title: string | null
    comment: string
    createdAt: Date
    user: {
      name: string | null
      image: string | null
    } | null
  }>
  averageRating: number | null
  apartmentId: string
}

export function ReviewSection({ reviews, averageRating, apartmentId }: ReviewSectionProps) {
  if (reviews.length === 0) {
    return (
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Reviews
        </h2>
        <p className="text-gray-500 italic">
          No reviews yet. Be the first to review this apartment!
        </p>
      </div>
    )
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < rating ? 'text-yellow-500' : 'text-gray-300'}>
        ★
      </span>
    ))
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Reviews
        </h2>
        {averageRating && (
          <div className="flex items-center gap-2">
            <div className="flex">
              {renderStars(Math.round(averageRating))}
            </div>
            <span className="font-medium">
              {averageRating.toFixed(1)} ({reviews.length} review{reviews.length !== 1 ? 's' : ''})
            </span>
          </div>
        )}
      </div>

      <div className="space-y-6">
        {reviews.slice(0, 6).map((review) => (
          <div key={review.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-start gap-4">
              {/* User Avatar */}
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-semibold text-lg">
                  {review.user?.name?.charAt(0).toUpperCase() || 'A'}
                </span>
              </div>

              <div className="flex-1">
                {/* Header */}
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-semibold text-gray-900">
                    {review.user?.name || 'Anonymous'}
                  </span>
                  <div className="flex">
                    {renderStars(review.rating)}
                  </div>
                  <span className="text-sm text-gray-500">
                    {formatDate(review.createdAt)}
                  </span>
                </div>

                {/* Review Title */}
                {review.title && (
                  <h4 className="font-medium text-gray-900 mb-2">
                    {review.title}
                  </h4>
                )}

                {/* Review Comment */}
                <p className="text-gray-700 leading-relaxed">
                  {review.comment}
                </p>
              </div>
            </div>
          </div>
        ))}

        {reviews.length > 6 && (
          <button className="w-full py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition">
            Show all {reviews.length} reviews
          </button>
        )}
      </div>
    </div>
  )
}