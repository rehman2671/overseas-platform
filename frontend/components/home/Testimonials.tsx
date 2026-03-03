'use client';

import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'Rahul Sharma',
    role: 'Software Engineer',
    location: 'Now working in Germany',
    image: '/avatars/rahul.jpg',
    content: 'OverseasJob.in helped me land my dream job in Germany. The AI resume optimization increased my match score by 30%!',
    rating: 5,
  },
  {
    name: 'Priya Patel',
    role: 'Data Scientist',
    location: 'Now working in Canada',
    image: '/avatars/priya.jpg',
    content: 'The ATS score feature is a game-changer. I finally understood why my resumes were being rejected. Highly recommended!',
    rating: 5,
  },
  {
    name: 'Amit Kumar',
    role: 'Project Manager',
    location: 'Now working in UAE',
    image: '/avatars/amit.jpg',
    content: 'Found a job with visa sponsorship within 2 months. The job matching is incredibly accurate.',
    rating: 5,
  },
];

export function Testimonials() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Success Stories
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Join thousands of professionals who found their dream jobs abroad.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="card p-6 relative">
              <Quote className="absolute top-4 right-4 h-8 w-8 text-primary-200" />
              
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-primary-600 font-bold">
                    {testimonial.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </div>

              <div className="flex mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>

              <p className="text-gray-600 mb-4">{testimonial.content}</p>

              <div className="flex items-center text-sm text-primary-600">
                <span className="bg-primary-50 px-3 py-1 rounded-full">
                  {testimonial.location}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
