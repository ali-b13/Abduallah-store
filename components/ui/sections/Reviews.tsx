import { Rating } from '@mui/material'
import { Review } from '@prisma/client'
import React from 'react'
 interface ReviewsProps extends Review {
    user:{name:string}
 }
const Reviews = ({reviews}:{reviews:ReviewsProps[]}) => {
  return (
    <section className="mt-20 border-t border-gray-100 pt-12">
    <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-10">
      آراء المستخدمين
    </h2>
    <div className="grid gap-6 md:grid-cols-2">
      {reviews.map((review, index) => (
        <div
          key={index}
          className="p-6 bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100"
        >
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-xl">
                {review.user.name[0]}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  {review.user.name}
                </h3>
                <p className="text-gray-500 text-sm">
                  {new Date(review.createdAt).toLocaleDateString('ar-EG')}
                </p>
              </div>
            </div>
            <Rating 
              value={review.rating} 
              precision={0.5} 
              readOnly 
              size="medium"
              className="[&>.MuiRating-icon]:text-xl"
            />
          </div>
          <p className="mt-4 text-gray-600 pl-4 border-l-2 border-primary-200">
            {review.comment}
          </p>
        </div>
      ))}
    </div>
  </section>
  )
}

export default Reviews