import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about NJ Realty Bot and how we use AI to help you find your perfect home in New Jersey.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-bold text-navy">About NJ Realty Bot</h1>

      <p className="mt-6 leading-relaxed text-gray-600">
        NJ Realty Bot is an AI-powered real estate platform designed to make
        finding your next home in New Jersey faster, smarter, and easier. We
        combine cutting-edge artificial intelligence with comprehensive MLS data
        to deliver the most relevant property matches instantly.
      </p>

      <div className="mt-10 rounded-xl bg-white p-8 shadow-md">
        <h2 className="text-xl font-bold text-navy">Your Agent: Julio</h2>
        <p className="mt-3 leading-relaxed text-gray-600">
          Julio is a licensed New Jersey real estate agent with deep knowledge
          of the local market. Whether you&apos;re buying your first home,
          investing in property, or selling, Julio and the NJ Realty Bot team
          provide personalized guidance every step of the way.
        </p>
      </div>

      <div className="mt-10 rounded-xl bg-white p-8 shadow-md">
        <h2 className="text-xl font-bold text-navy">
          Realty One Group Legend
        </h2>
        <p className="mt-3 leading-relaxed text-gray-600">
          NJ Realty Bot is proudly brokered by Realty One Group Legend, one of
          the fastest-growing real estate brands in the country. With a
          commitment to innovation and client success, Realty One Group Legend
          provides the support and resources needed to deliver an exceptional
          real estate experience.
        </p>
      </div>

      <div className="mt-10 text-center">
        <Link
          href="/contact"
          className="inline-block rounded-lg bg-gold px-8 py-3 font-semibold text-navy transition hover:bg-yellow-500"
        >
          Get in Touch
        </Link>
      </div>
    </div>
  );
}
